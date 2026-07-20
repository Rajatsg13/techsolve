'use client';
import { useState, useRef, useEffect } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';
import { debounce } from '../utils/debounce';

const fmt  = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmt2 = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const LTCG_EXEMPTION = 125000;
const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;

// MFapi returns dates as "DD-MM-YYYY" — Date.parse won't touch that format.
function parseApiDate(s) {
  const [d, m, y] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
// <input type="date"> gives "YYYY-MM-DD".
function parseInputDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
function toISO(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}
// Local calendar date, not UTC — the date input works in the user's timezone,
// and toISOString() would roll back a day for anyone east of Greenwich.
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function displayDate(ts) {
  const dt = new Date(ts);
  return `${String(dt.getUTCDate()).padStart(2, '0')}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${dt.getUTCFullYear()}`;
}

// Most recent NAV on or before `target`. Funds don't publish NAV on weekends and
// holidays, so an exact-date hit is the exception rather than the rule.
// `navs` is sorted oldest-first.
function navOnOrBefore(navs, target) {
  if (!navs.length || target < navs[0].t) return null;
  let lo = 0, hi = navs.length - 1, ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (navs[mid].t <= target) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return navs[ans];
}

// Bisection rather than Newton-Raphson: slower, but it cannot diverge on the
// irregular cashflow series a stopped SIP produces.
function xirr(flows) {
  if (flows.length < 2) return null;
  const t0 = flows[0].t;
  const npv = (r) => flows.reduce((s, f) => s + f.amt / Math.pow(1 + r, (f.t - t0) / MS_PER_YEAR), 0);
  let lo = -0.9999, hi = 100;
  const nLo = npv(lo), nHi = npv(hi);
  if (!isFinite(nLo) || !isFinite(nHi) || nLo * nHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

// MFapi's scheme_category string is the only asset-class signal available, and the
// holding period that separates LTCG from STCG differs by asset class — so guess
// from it and let the user correct the guess.
function guessAssetClass(category = '') {
  const c = category.toLowerCase();
  if (c.includes('equity') || c.includes('elss')) return 'equity';
  if (c.includes('debt') || c.includes('gilt') || c.includes('liquid') ||
      c.includes('money market') || c.includes('overnight') || c.includes('duration') ||
      c.includes('corporate bond') || c.includes('credit risk') || c.includes('banking and psu')) return 'debt';
  return 'equity';
}

// MFapi's /search endpoint caps at 15 unranked rows, so "HDFC" comes back as
// Balanced Fund and a wall of FMPs while HDFC Flexi Cap never surfaces. The full
// /mf list (~37k schemes, ~470 KB gzipped) is fetched once in the background and
// searched locally instead; /search is only the stopgap until it arrives.
const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function rankSchemes(list, query) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  // The catalogue spells the same thing both ways — 25 schemes say "bluechip",
  // 8 say "blue chip" — so match on the punctuation-stripped form too.
  const squashedTokens = tokens.map(squash).filter(Boolean);
  const scored = [];
  for (const s of list) {
    const name = s.schemeName.toLowerCase();
    const flat = squash(s.schemeName);
    if (!tokens.every((t, i) => name.includes(t) || flat.includes(squashedTokens[i]))) continue;
    // Prefer whole-phrase hits, then early matches, then shorter names — which
    // favours "HDFC Flexi Cap Fund - Growth" over a dated FMP with the same words.
    let score = 0;
    const phrase = tokens.join(' ');
    if (name.includes(phrase)) score -= 1000;
    score += name.indexOf(tokens[0]);
    score += name.length / 100;
    if (/direct plan/.test(name)) score -= 5;
    if (/growth/.test(name)) score -= 3;
    scored.push({ s, score });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, 40).map(x => x.s);
}

function monthsBetween(a, b) {
  const d1 = new Date(a), d2 = new Date(b);
  let m = (d2.getUTCFullYear() - d1.getUTCFullYear()) * 12 + (d2.getUTCMonth() - d1.getUTCMonth());
  if (d2.getUTCDate() < d1.getUTCDate()) m--;
  return m;
}

function holdingLabel(buyTs, sellTs) {
  const m = monthsBetween(buyTs, sellTs);
  const y = Math.floor(m / 12), rem = m % 12;
  const days = Math.round((sellTs - buyTs) / 86400000);
  if (m < 1) return `${days} day${days === 1 ? '' : 's'}`;
  const parts = [];
  if (y) parts.push(`${y} year${y === 1 ? '' : 's'}`);
  if (rem) parts.push(`${rem} month${rem === 1 ? '' : 's'}`);
  return parts.join(' ');
}

export default function MFProfitCalculator() {
  const [mode, setMode] = useState('lumpsum');

  // Scheme search
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [showList, setShowList] = useState(false);
  const [searching, setSearching] = useState(false);
  const [scheme, setScheme]     = useState(null);   // { schemeCode, schemeName }
  const [navs, setNavs]         = useState([]);     // oldest-first [{ t, nav }]
  const [meta, setMeta]         = useState(null);
  const [loadingNav, setLoadingNav] = useState(false);
  const [apiError, setApiError] = useState('');

  // Inputs
  const [amount, setAmount]       = useState('100000');
  const [buyDate, setBuyDate]     = useState('');
  const [sellDate, setSellDate]   = useState('');
  const [sipAmount, setSipAmount] = useState('5000');
  const [assetClass, setAssetClass] = useState('equity');
  const [slabRate, setSlabRate]   = useState('30');

  const [result, setResult] = useState(null);
  const [calcError, setCalcError] = useState('');

  const boxRef = useRef(null);
  const allSchemes = useRef(null);      // full catalogue once loaded
  const catalogueReq = useRef(null);    // in-flight catalogue promise
  const searchSeq = useRef(0);          // guards against out-of-order responses
  const [searchedFor, setSearchedFor] = useState('');
  const [catalogueLoaded, setCatalogueLoaded] = useState(false);

  // Kicked off on first interaction, not page load — no reason to pull 470 KB
  // for a visitor who never touches the search box.
  function loadCatalogue() {
    if (catalogueReq.current) return catalogueReq.current;
    catalogueReq.current = fetch('https://api.mfapi.in/mf')
      .then(r => { if (!r.ok) throw new Error('catalogue failed'); return r.json(); })
      .then(d => { if (Array.isArray(d)) { allSchemes.current = d; setCatalogueLoaded(true); } return d; })
      .catch(() => { catalogueReq.current = null; });  // allow a retry
    return catalogueReq.current;
  }

  const runSearch = useRef(debounce(async (q) => {
    const query = q.trim();
    const seq = ++searchSeq.current;
    if (query.length < 3) { setResults([]); setSearching(false); setSearchedFor(''); return; }

    // Local search once the catalogue is in — instant, and actually complete.
    if (allSchemes.current) {
      setResults(rankSchemes(allSchemes.current, query));
      setSearchedFor(query);
      setSearching(false);
      setApiError('');
      return;
    }

    try {
      const r = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`);
      if (!r.ok) throw new Error('search failed');
      const data = await r.json();
      if (seq !== searchSeq.current) return;   // a newer keystroke superseded this
      // Re-rank even the API's 15 rows so the closest match is not buried.
      setResults(Array.isArray(data) ? rankSchemes(data, query) : []);
      setSearchedFor(query);
      setApiError('');
    } catch {
      if (seq !== searchSeq.current) return;
      setResults([]);
      setSearchedFor(query);
      setApiError('Could not reach the mutual fund database. Check your connection and try again.');
    } finally {
      if (seq === searchSeq.current) setSearching(false);
    }
  }, 300)).current;

  // Re-run the search against the full catalogue the moment it lands, so results
  // upgrade underneath the user without them having to type anything again.
  useEffect(() => {
    if (!catalogueLoaded || query.trim().length < 3) return;
    setResults(rankSchemes(allSchemes.current || [], query.trim()));
    setSearchedFor(query.trim());
    setSearching(false);
  }, [catalogueLoaded, query]);

  // Close the suggestion dropdown on any outside click.
  useEffect(() => {
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setShowList(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  async function selectScheme(s) {
    setScheme(s);
    setQuery(s.schemeName);
    setShowList(false);
    setResults([]);
    setResult(null);
    setCalcError('');
    setLoadingNav(true);
    setApiError('');
    try {
      const r = await fetch(`https://api.mfapi.in/mf/${s.schemeCode}`);
      if (!r.ok) throw new Error('nav fetch failed');
      const data = await r.json();
      const series = (data.data || [])
        .map(d => ({ t: parseApiDate(d.date), nav: parseFloat(d.nav) }))
        .filter(d => isFinite(d.t) && isFinite(d.nav) && d.nav > 0)
        .sort((a, b) => a.t - b.t);
      if (!series.length) throw new Error('empty series');
      setNavs(series);
      setMeta(data.meta || null);
      setAssetClass(guessAssetClass(data.meta && data.meta.scheme_category));
      // Seed the range: earliest available NAV → today. Where today has no NAV
      // yet (weekend, holiday, or before the evening publish), the calculation
      // falls back to the most recent one and says so in the results.
      setBuyDate(toISO(series[0].t));
      setSellDate(todayISO());
    } catch {
      setNavs([]);
      setMeta(null);
      setApiError('Could not load NAV history for this scheme. Try another scheme or retry in a moment.');
    } finally {
      setLoadingNav(false);
    }
  }

  function calculate() {
    setCalcError('');
    setResult(null);
    if (!navs.length) { setCalcError('Select a mutual fund scheme first.'); return; }
    if (!buyDate || !sellDate) { setCalcError('Enter both a buy date and a sell date.'); return; }

    const buyTs = parseInputDate(buyDate);
    const sellTs = parseInputDate(sellDate);
    if (sellTs <= buyTs) { setCalcError('The sell date must be after the buy date.'); return; }

    const first = navs[0], last = navs[navs.length - 1];
    if (buyTs < first.t) {
      setCalcError(`This scheme has no NAV before ${displayDate(first.t)}. Pick a later buy date.`);
      return;
    }
    const sellNav = navOnOrBefore(navs, sellTs);
    if (!sellNav) { setCalcError('No NAV available on or before the sell date.'); return; }

    const flows = [];
    let invested = 0, units = 0, sipMissed = 0, entryNav = null;

    if (mode === 'lumpsum') {
      const amt = parseFloat(amount);
      if (!isFinite(amt) || amt <= 0) { setCalcError('Enter a valid investment amount.'); return; }
      const buyNav = navOnOrBefore(navs, buyTs);
      if (!buyNav) { setCalcError('No NAV available on or before the buy date.'); return; }
      invested = amt;
      units = amt / buyNav.nav;
      flows.push({ t: buyNav.t, amt: -amt });
      entryNav = buyNav;
    } else {
      const amt = parseFloat(sipAmount);
      if (!isFinite(amt) || amt <= 0) { setCalcError('Enter a valid monthly SIP amount.'); return; }
      // One instalment per month on the buy date's day-of-month, up to the sell date.
      const start = new Date(buyTs);
      const day = start.getUTCDate();
      let y = start.getUTCFullYear(), m = start.getUTCMonth();
      let guard = 0;
      while (guard++ < 1200) {
        // Clamps to the last day of short months, so a 31st SIP still runs in February.
        const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
        const ts = Date.UTC(y, m, Math.min(day, dim));
        if (ts > sellTs) break;
        if (ts >= first.t) {
          const n = navOnOrBefore(navs, ts);
          if (n) {
            invested += amt;
            units += amt / n.nav;
            flows.push({ t: n.t, amt: -amt });
          } else sipMissed++;
        } else sipMissed++;
        m++;
        if (m > 11) { m = 0; y++; }
      }
      if (!flows.length) { setCalcError('No SIP instalments fall inside this scheme’s NAV history. Widen the date range.'); return; }
      entryNav = navOnOrBefore(navs, flows[0].t);
    }

    const sellValue = units * sellNav.nav;
    flows.push({ t: sellNav.t, amt: sellValue });

    const gain = sellValue - invested;
    const gainPct = (gain / invested) * 100;
    const r = xirr(flows);
    const months = monthsBetween(buyTs, sellNav.t);

    // Long-term threshold: 12 months for equity, 24 for debt.
    // (Finance Act 2024 cut the debt/non-equity holding period from 36 to 24 months
    // for units transferred on or after 23 July 2024.)
    const ltThreshold = assetClass === 'equity' ? 12 : 24;
    const isLongTerm = months >= ltThreshold;

    let tax = 0, taxLabel = '', taxNote = '';
    if (gain > 0) {
      if (isLongTerm) {
        const taxable = Math.max(0, gain - LTCG_EXEMPTION);
        tax = taxable * 0.125;
        taxLabel = 'LTCG @ 12.5%';
        taxNote = `First ${fmt(LTCG_EXEMPTION)} of long-term gains is exempt each financial year.`;
      } else if (assetClass === 'equity') {
        tax = gain * 0.20;
        taxLabel = 'STCG @ 20%';
        taxNote = 'Equity short-term gains are taxed at a flat 20%.';
      } else {
        const slab = Math.max(0, Math.min(45, parseFloat(slabRate) || 0));
        tax = gain * (slab / 100);
        taxLabel = `STCG @ ${slab}% (your slab)`;
        taxNote = 'Debt short-term gains are added to your income and taxed at your slab rate.';
      }
    } else {
      taxNote = 'No tax on a loss. Capital losses can usually be carried forward — ask your CA.';
    }

    setResult({
      invested, units, sellValue, gain, gainPct, xirrPct: r === null ? null : r * 100,
      buyNavUsed: entryNav, sellNavUsed: sellNav, months, isLongTerm,
      tax, taxLabel, taxNote, postTax: gain - tax,
      requestedSell: sellTs, sipCount: mode === 'sip' ? flows.length - 1 : 0, sipMissed,
    });
  }

  const positive = result && result.gain >= 0;

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Mutual Fund Profit Calculator</h1>
      <p className="text-slate-500 mb-6 text-sm">
        Search any Indian mutual fund, pick your buy and sell dates, and see the actual profit, XIRR and capital gains tax based on real historical NAV.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-900 leading-relaxed">
          <strong>Disclaimer:</strong> This calculator is for informational and educational purposes only. We are not
          SEBI-registered financial advisors. NAV data is sourced from publicly available feeds — pinpoint accuracy is
          not guaranteed. Tax rules are simplified approximations; consult a qualified CA/tax advisor for actual tax
          liability. Do not make investment decisions based solely on this tool.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex bg-slate-100 rounded-xl p-1 mb-6">
        {[['lumpsum', 'Lump Sum'], ['sip', 'SIP']].map(([k, label]) => (
          <button key={k} onClick={() => { setMode(k); setResult(null); setCalcError(''); }}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
              mode === k ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          {/* Scheme search */}
          <div ref={boxRef} className="relative">
            <label htmlFor="scheme-search" className="block text-sm font-semibold text-slate-700 mb-1">Mutual Fund Scheme</label>
            <input
              id="scheme-search" type="text" value={query} autoComplete="off"
              placeholder="Type at least 3 letters, e.g. Parag Parikh Flexi Cap"
              onChange={e => {
                const v = e.target.value;
                setQuery(v); setShowList(true);
                loadCatalogue();
                if (v.trim().length >= 3) setSearching(true); else { setSearching(false); setSearchedFor(''); }
                runSearch(v);
              }}
              onFocus={() => { setShowList(true); loadCatalogue(); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            {searching && <p className="text-xs text-slate-400 mt-1">Searching…</p>}
            {!searching && !catalogueLoaded && query.trim().length >= 3 && (
              <p className="text-xs text-slate-400 mt-1">Showing partial matches — loading the full scheme list for better results…</p>
            )}

            {showList && results.length > 0 && (
              <div className="absolute z-40 mt-1 w-full max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
                {results.map(s => (
                  <button key={s.schemeCode} onClick={() => selectScheme(s)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-brand-700 transition-colors border-b border-slate-50 last:border-0">
                    {s.schemeName}
                  </button>
                ))}
              </div>
            )}
            {/* Only after a search for *this exact query* has finished — otherwise
                this flashes "no schemes" while the first request is still in flight. */}
            {showList && !searching && results.length === 0 && !apiError &&
             searchedFor && searchedFor === query.trim() && (
              <p className="text-xs text-slate-400 mt-1">
                No schemes matched that name{!catalogueLoaded && ' yet — still loading the full list'}.
              </p>
            )}
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{apiError}</div>
          )}
          {loadingNav && <p className="text-sm text-slate-500">Loading NAV history…</p>}

          {meta && !loadingNav && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700 text-sm">{meta.scheme_name}</p>
              <p>{meta.fund_house}</p>
              <p>{meta.scheme_category}</p>
              <p className="text-slate-400">
                NAV history available {displayDate(navs[0].t)} → {displayDate(navs[navs.length - 1].t)}
              </p>
            </div>
          )}

          {mode === 'lumpsum' ? (
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="invest-amount" className="text-sm font-semibold text-slate-700">Investment Amount</label>
                <span className="text-sm font-bold text-brand-700">{fmt(Math.max(0, parseFloat(amount) || 0))}</span>
              </div>
              <input type="range" min="1000" max="10000000" step="1000" aria-label="Investment amount slider"
                value={Math.min(10000000, Math.max(1000, parseFloat(amount) || 1000))}
                onChange={e => setAmount(e.target.value)} />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>₹1K</span><span>₹1Cr</span>
              </div>
              <input id="invest-amount" type="text" inputMode="numeric" value={amount}
                onChange={e => {
                  const parsed = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                  setAmount(isNaN(parsed) ? '' : String(Math.min(10000000, parsed)));
                }}
                className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <p className="text-xs text-slate-400 mt-1">One-time amount invested on the buy date</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="sip-amount" className="text-sm font-semibold text-slate-700">Monthly SIP Amount</label>
                <span className="text-sm font-bold text-brand-700">{fmt(Math.max(0, parseFloat(sipAmount) || 0))}</span>
              </div>
              <input type="range" min="500" max="200000" step="500" aria-label="Monthly SIP amount slider"
                value={Math.min(200000, Math.max(500, parseFloat(sipAmount) || 500))}
                onChange={e => setSipAmount(e.target.value)} />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>₹500</span><span>₹2L</span>
              </div>
              <input id="sip-amount" type="text" inputMode="numeric" value={sipAmount}
                onChange={e => {
                  const parsed = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                  setSipAmount(isNaN(parsed) ? '' : String(Math.min(200000, parsed)));
                }}
                className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <p className="text-xs text-slate-400 mt-1">Invested every month on the same date as the start date</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="buy-date" className="block text-sm font-semibold text-slate-700 mb-1">
                {mode === 'lumpsum' ? 'Buy Date' : 'SIP Start Date'}
              </label>
              <input id="buy-date" type="date" max={todayISO()} value={buyDate} onChange={e => setBuyDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label htmlFor="sell-date" className="block text-sm font-semibold text-slate-700 mb-1">
                {mode === 'lumpsum' ? 'Sell Date' : 'SIP End / Redeem Date'}
              </label>
              <input id="sell-date" type="date" max={todayISO()} value={sellDate} onChange={e => setSellDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fund Type</label>
            <div className="flex gap-2">
              {[['equity', 'Equity fund'], ['debt', 'Debt fund']].map(([k, label]) => (
                <button key={k} onClick={() => setAssetClass(k)}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                    assetClass === k
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {meta ? 'Auto-detected from the scheme category — change it if it looks wrong.' : 'Decides the long-term holding period: 12 months for equity, 24 for debt.'}
            </p>
          </div>

          {assetClass === 'debt' && (
            <div>
              <label htmlFor="slab-rate" className="block text-sm font-semibold text-slate-700 mb-1">Your Income Tax Slab (%)</label>
              <input id="slab-rate" type="number" min="0" max="45" value={slabRate} onChange={e => setSlabRate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <p className="text-xs text-slate-400 mt-1">Used only for short-term debt gains, which are taxed at slab</p>
            </div>
          )}

          <button onClick={calculate} disabled={!navs.length || loadingNav}
            className="w-full bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 text-sm transition-colors">
            Calculate Profit
          </button>

          {calcError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{calcError}</div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result ? (
            <div className="result-card flex items-center justify-center min-h-[160px]">
              <p className="text-brand-200 text-sm text-center px-6">
                Search for a fund, pick your dates, then hit Calculate.
              </p>
            </div>
          ) : (
            <>
              <div className={`rounded-2xl p-6 text-white ${
                positive ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-red-600 to-red-800'}`}>
                <p className="text-sm font-medium mb-1 opacity-80">
                  {positive ? 'Total Gain' : 'Total Loss'} (before tax)
                </p>
                <p className="text-4xl font-black">{fmt(Math.abs(result.gain))}</p>
                <p className="text-sm mt-2 opacity-90">
                  {result.gainPct >= 0 ? '+' : '−'}{fmt2(Math.abs(result.gainPct))}% absolute
                  {result.xirrPct !== null && <> · {result.xirrPct >= 0 ? '+' : '−'}{fmt2(Math.abs(result.xirrPct))}% XIRR</>}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="space-y-2 text-sm">
                  {[
                    ['Amount Invested', fmt(result.invested)],
                    ['Value on Sell Date', fmt(result.sellValue)],
                    ['Units Held', fmt2(result.units)],
                    ['Buy NAV', `₹${fmt2(result.buyNavUsed.nav)} on ${displayDate(result.buyNavUsed.t)}`],
                    ['Sell NAV', `₹${fmt2(result.sellNavUsed.nav)} on ${displayDate(result.sellNavUsed.t)}`],
                    ['Holding Period', holdingLabel(result.buyNavUsed.t, result.sellNavUsed.t)],
                    ['Gain Type', result.isLongTerm ? 'Long-term (LTCG)' : 'Short-term (STCG)'],
                    ...(result.sipCount ? [['SIP Instalments', `${result.sipCount}`]] : []),
                  ].map(([label, val], i, arr) => (
                    <div key={label} className={`flex justify-between gap-4 py-1.5 ${i < arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                      <span className="text-slate-500 flex-shrink-0">{label}</span>
                      <span className="font-semibold text-slate-800 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Estimated Tax</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Profit before tax</span>
                    <span className="font-semibold text-slate-800">{fmt(result.gain)}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{result.taxLabel || 'Tax'}</span>
                    <span className="font-semibold text-red-600">− {fmt(result.tax)}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-1.5">
                    <span className="text-slate-700 font-semibold">Profit after tax</span>
                    <span className={`font-bold ${result.postTax >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {fmt(result.postTax)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{result.taxNote}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Surcharge and 4% health &amp; education cess are not included.
                </p>
              </div>

              {result.sellNavUsed.t < result.requestedSell && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-900">
                  No NAV was published on your sell date, so the most recent NAV before it
                  ({displayDate(result.sellNavUsed.t)}) was used.
                </div>
              )}
              {result.sipMissed > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-900">
                  {result.sipMissed} instalment{result.sipMissed === 1 ? '' : 's'} fell outside this scheme&rsquo;s
                  NAV history and {result.sipMissed === 1 ? 'was' : 'were'} skipped.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CrossBrandCard pageSlug="mf-profit-calculator" />

      <p className="mt-10 text-xs text-slate-400 leading-relaxed border-t border-slate-200 pt-5">
        Data sourced from publicly available NAV feeds. Results are approximate and may differ from actual broker
        statements. Tax calculations are simplified and do not account for surcharge, cess, or individual slab
        variations. TechSolve44 is not a financial advisor, broker, or tax consultant. Use at your own discretion.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: 'Where does the NAV data come from?', a: 'NAV history is fetched live from MFapi.in, a free public API that mirrors AMFI’s official daily NAV files. It covers virtually every Indian mutual fund scheme, including direct and regular plans. Because it is a third-party mirror, occasional gaps or lags are possible — always cross-check against your fund statement before acting on a number.' },
            { q: 'What happens if there was no NAV on my chosen date?', a: 'Mutual funds do not publish NAV on weekends, exchange holidays, or before a scheme launched. The calculator falls back to the most recent NAV published on or before your chosen date, which is how an actual redemption would be priced. The exact NAV date used is always shown in the results.' },
            { q: 'What is XIRR and why does it differ from the absolute return?', a: 'Absolute return simply compares the final value to the amount invested, ignoring time. XIRR annualises the return and accounts for when each rupee went in — so a 50% absolute gain over 10 years is a modest XIRR, while the same gain over 1 year is excellent. For SIPs, where money is invested in instalments, XIRR is the only meaningful measure.' },
            { q: 'How is mutual fund capital gains tax calculated?', a: 'For equity funds, units held over 12 months attract LTCG at 12.5% on gains above the ₹1.25 lakh annual exemption; units held 12 months or less attract STCG at a flat 20%. For debt funds, the long-term threshold is 24 months with LTCG at 12.5% and no indexation benefit, while short-term gains are added to your income and taxed at your slab rate.' },
            { q: 'Does the SIP mode account for the exact date of each instalment?', a: 'Yes. Each instalment is placed on the same day of the month as your start date, and the NAV applied is the most recent one on or before that day. Where a month is too short for the chosen date — a 31st SIP in February, say — the instalment is clamped to the last day of that month, matching how AMCs handle it.' },
            { q: 'Is my data sent anywhere?', a: 'The only network calls this page makes are to MFapi.in to look up scheme names and NAV history. Your investment amounts, dates and results are computed entirely in your browser and are never uploaded, logged, or stored.' },
          ].map(({ q, a }) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center gap-4">
                {q}<span className="text-brand-600 text-lg faq-icon flex-shrink-0"></span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
