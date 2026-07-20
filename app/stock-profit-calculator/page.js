'use client';
import { useState } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';

const fmt  = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmt2 = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct2 = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

// Zerodha equity delivery, as published on their charges page.
const ZERODHA = {
  brokerageBuy:  '0',
  brokerageSell: '0',
  stt:           '0.1',      // % of turnover, both legs for delivery
  exchange:      '0.00307',  // % of turnover, NSE
  sebiPerCrore:  '10',       // ₹ per crore of turnover
  stamp:         '0.015',    // % of buy value only
  dp:            '15.34',    // ₹ flat, once on the sell leg
};
const GST_RATE = 0.18;       // on brokerage + SEBI + exchange charges
const LTCG_RATE = 12.5;
const STCG_RATE = 20;

export default function StockProfitCalculator() {
  const [buyPrice, setBuyPrice]   = useState('1000');
  const [sellPrice, setSellPrice] = useState('1200');
  const [qty, setQty]             = useState('100');

  const [useDefaults, setUseDefaults] = useState(true);
  const [charges, setCharges]         = useState(ZERODHA);
  const [showCharges, setShowCharges] = useState(false);

  const [showTax, setShowTax]     = useState(false);
  const [term, setTerm]           = useState('short');
  const [stcgRate, setStcgRate]   = useState(String(STCG_RATE));
  const [ltcgRate, setLtcgRate]   = useState(String(LTCG_RATE));
  const [exemption, setExemption] = useState('125000');

  function toggleDefaults(on) {
    setUseDefaults(on);
    // Unchecking hands the user a blank slate for a non-Zerodha broker;
    // rechecking restores the published Zerodha numbers.
    setCharges(on ? ZERODHA : {
      brokerageBuy: '', brokerageSell: '', stt: '', exchange: '',
      sebiPerCrore: '', stamp: '', dp: '',
    });
  }

  const setCharge = (k) => (e) => setCharges(c => ({ ...c, [k]: e.target.value }));

  const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };

  const bp = parseFloat(buyPrice), sp = parseFloat(sellPrice), q = parseFloat(qty);
  const valid = isFinite(bp) && isFinite(sp) && isFinite(q) && bp > 0 && sp >= 0 && q > 0;

  let r = null;
  if (valid) {
    const buyValue  = bp * q;
    const sellValue = sp * q;
    const turnover  = buyValue + sellValue;

    const stt       = (num(charges.stt) / 100) * turnover;
    const exchange  = (num(charges.exchange) / 100) * turnover;
    const sebi      = (turnover / 10000000) * num(charges.sebiPerCrore);
    const stamp     = (num(charges.stamp) / 100) * buyValue;
    const brokerage = num(charges.brokerageBuy) + num(charges.brokerageSell);
    const gst       = GST_RATE * (brokerage + sebi + exchange);
    const dp        = num(charges.dp);

    const totalCharges = stt + exchange + sebi + stamp + brokerage + gst + dp;
    const grossProfit  = sellValue - buyValue;
    const preTax       = grossProfit - totalCharges;

    let tax = 0, taxLabel = '';
    if (preTax > 0) {
      if (term === 'long') {
        const taxable = Math.max(0, preTax - num(exemption));
        tax = taxable * (num(ltcgRate) / 100);
        taxLabel = `LTCG @ ${num(ltcgRate)}% above ${fmt(num(exemption))}`;
      } else {
        tax = preTax * (num(stcgRate) / 100);
        taxLabel = `STCG @ ${num(stcgRate)}%`;
      }
    }

    const postTax = preTax - tax;
    r = {
      buyValue, sellValue, turnover, stt, exchange, sebi, stamp, brokerage, gst, dp,
      totalCharges, grossProfit, preTax, tax, taxLabel, postTax,
      effReturn: (postTax / buyValue) * 100,
    };
  }

  const positive = r && r.postTax >= 0;
  const inputCls = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 ${
    useDefaults ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-200'}`;

  const chargeFields = [
    { k: 'brokerageBuy',  label: 'Brokerage — Buy (₹)',      hint: 'Zerodha: ₹0 on delivery',            step: '0.01' },
    { k: 'brokerageSell', label: 'Brokerage — Sell (₹)',     hint: 'Zerodha: ₹0 on delivery',            step: '0.01' },
    { k: 'stt',           label: 'STT (%)',                  hint: '0.1% on both buy and sell',          step: '0.001' },
    { k: 'exchange',      label: 'Exchange Txn Charges (%)', hint: 'NSE 0.00307%, BSE 0.00375%',         step: '0.00001' },
    { k: 'sebiPerCrore',  label: 'SEBI Charges (₹/crore)',   hint: '₹10 per crore of turnover',          step: '0.01' },
    { k: 'stamp',         label: 'Stamp Duty (%)',           hint: '0.015% on the buy side only',        step: '0.001' },
    { k: 'dp',            label: 'DP Charges (₹)',           hint: 'Flat, charged once on the sell leg', step: '0.01' },
  ];

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Stock Profit Calculator</h1>
      <p className="text-slate-500 mb-6 text-sm">
        Work out what you actually keep from a share trade — after brokerage, STT, GST, SEBI charges, stamp duty, DP charges and capital gains tax.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-900 leading-relaxed">
          <strong>Disclaimer:</strong> This calculator is for informational and educational purposes only. We are not
          SEBI-registered financial advisors. Charge rates change from time to time and vary by broker and exchange —
          pinpoint accuracy is not guaranteed. Tax rules are simplified approximations; consult a qualified CA/tax
          advisor for actual tax liability. Do not make investment decisions based solely on this tool.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Buy Price per Share (₹)</label>
              <input type="number" min="0" step="0.01" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sell Price per Share (₹)</label>
              <input type="number" min="0" step="0.01" value={sellPrice} onChange={e => setSellPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity (shares)</label>
              <input type="number" min="1" step="1" value={qty} onChange={e => setQty(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            {!valid && (
              <p className="text-xs text-slate-400">Enter a buy price, sell price and quantity to see your net profit.</p>
            )}
          </div>

          {/* Charges */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button onClick={() => setShowCharges(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Brokerage &amp; Charges
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${showCharges ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCharges && (
              <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={useDefaults} onChange={e => toggleDefaults(e.target.checked)}
                    className="w-4 h-4 accent-brand-700 cursor-pointer" />
                  <span className="text-sm font-semibold text-slate-700">Use Zerodha defaults</span>
                </label>
                <p className="text-xs text-slate-400 -mt-2">
                  Equity delivery rates. Fields stay editable — change any of them for a different broker or segment.
                </p>

                {chargeFields.map(({ k, label, hint, step }) => (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                    <input type="number" min="0" step={step} value={charges[k]} onChange={setCharge(k)}
                      className={inputCls} />
                    <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
                  </div>
                ))}

                <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-600">GST — 18% (fixed)</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Charged on brokerage + SEBI charges + exchange transaction charges. Not editable.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tax */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button onClick={() => setShowTax(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Capital Gains Tax
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${showTax ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTax && (
              <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Holding Period</label>
                  <div className="flex gap-2">
                    {[['short', 'Short-term (≤ 12 mo)'], ['long', 'Long-term (> 12 mo)']].map(([k, label]) => (
                      <button key={k} onClick={() => setTerm(k)}
                        className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                          term === k
                            ? 'bg-brand-50 border-brand-300 text-brand-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {term === 'short' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">STCG Tax Rate (%)</label>
                    <input type="number" min="0" step="0.1" value={stcgRate} onChange={e => setStcgRate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <p className="text-xs text-slate-400 mt-0.5">20% on listed equity since 23 July 2024</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">LTCG Tax Rate (%)</label>
                      <input type="number" min="0" step="0.1" value={ltcgRate} onChange={e => setLtcgRate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                      <p className="text-xs text-slate-400 mt-0.5">12.5% without indexation since 23 July 2024</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">LTCG Exemption (₹ per year)</label>
                      <input type="number" min="0" step="1000" value={exemption} onChange={e => setExemption(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                      <p className="text-xs text-slate-400 mt-0.5">
                        ₹1.25 lakh per financial year, shared across all your equity LTCG
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!valid ? (
            <div className="result-card flex items-center justify-center min-h-[160px]">
              <p className="text-brand-200 text-sm text-center px-6">Enter your trade details to see the breakdown.</p>
            </div>
          ) : (
            <>
              <div className={`rounded-2xl p-6 text-white ${
                positive ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-red-600 to-red-800'}`}>
                <p className="text-sm font-medium mb-1 opacity-80">
                  Net {positive ? 'Profit' : 'Loss'} after charges &amp; tax
                </p>
                <p className="text-4xl font-black">{fmt(Math.abs(r.postTax))}</p>
                <p className="text-sm mt-2 opacity-90">
                  {r.effReturn >= 0 ? '+' : '−'}{pct2(Math.abs(r.effReturn))} effective return on {fmt(r.buyValue)} invested
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="space-y-2 text-sm">
                  {[
                    ['Buy Value',  fmt2(r.buyValue)],
                    ['Sell Value', fmt2(r.sellValue)],
                    ['Turnover',   fmt2(r.turnover)],
                    ['Gross Profit / Loss', fmt2(r.grossProfit)],
                  ].map(([label, val], i, arr) => (
                    <div key={label} className={`flex justify-between gap-4 py-1.5 ${i < arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Charges Breakdown</p>
                <div className="space-y-2 text-sm">
                  {[
                    ['Brokerage',                r.brokerage],
                    ['STT',                      r.stt],
                    ['Exchange Txn Charges',     r.exchange],
                    ['SEBI Charges',             r.sebi],
                    ['Stamp Duty',               r.stamp],
                    ['GST (18%)',                r.gst],
                    ['DP Charges',               r.dp],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium text-slate-700">{fmt2(val)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 pt-2">
                    <span className="text-slate-700 font-semibold">Total Charges</span>
                    <span className="font-bold text-red-600">{fmt2(r.totalCharges)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Net Result</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Gross profit</span>
                    <span className="font-semibold text-slate-800">{fmt2(r.grossProfit)}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Less: total charges</span>
                    <span className="font-semibold text-red-600">− {fmt2(r.totalCharges)}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Profit before tax</span>
                    <span className="font-semibold text-slate-800">{fmt2(r.preTax)}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{r.taxLabel || (term === 'long' ? 'LTCG' : 'STCG')}</span>
                    <span className="font-semibold text-red-600">− {fmt2(r.tax)}</span>
                  </div>
                  <div className="flex justify-between gap-4 pt-2">
                    <span className="text-slate-700 font-semibold">Net profit after tax</span>
                    <span className={`font-bold ${positive ? 'text-green-700' : 'text-red-700'}`}>{fmt2(r.postTax)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Tax applies only to a profit. Surcharge and 4% health &amp; education cess are not included.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <CrossBrandCard pageSlug="stock-profit-calculator" />

      <p className="mt-10 text-xs text-slate-400 leading-relaxed border-t border-slate-200 pt-5">
        Results are approximate and may differ from actual broker contract notes. Charge rates vary by broker, exchange
        and segment, and change over time. Tax calculations are simplified and do not account for surcharge, cess, or
        individual slab variations. TechSolve44 is not a financial advisor, broker, or tax consultant. Use at your own
        discretion.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: 'Which charges apply to an equity delivery trade?', a: 'Seven of them: brokerage (₹0 at Zerodha for delivery), STT at 0.1% on both the buy and sell legs, exchange transaction charges around 0.00307% on NSE, SEBI turnover fees of ₹10 per crore, stamp duty of 0.015% on the buy side only, 18% GST on brokerage plus SEBI and exchange charges, and a flat DP charge of about ₹15.34 levied once when you sell.' },
            { q: 'Why is my net profit lower than sell price minus buy price?', a: 'Because that simple difference ignores every statutory charge and the capital gains tax. STT alone takes 0.1% of both legs. On small trades the fixed DP charge can dominate — selling ₹2,000 of stock still costs ₹15.34 in DP charges, which is roughly 0.77% of the trade before anything else.' },
            { q: 'What are the current capital gains tax rates on shares?', a: 'Since 23 July 2024, short-term capital gains on listed equity — held 12 months or less — are taxed at a flat 20%. Long-term gains, held over 12 months, are taxed at 12.5% without indexation, on the amount above the ₹1.25 lakh exemption available each financial year. Surcharge and cess apply on top and are not included here.' },
            { q: 'Can I use this for a different broker?', a: 'Yes. Open the Brokerage & Charges section and untick "Use Zerodha defaults" to clear every field, then enter your own broker\'s rates. Even with the box ticked the fields stay editable, so you can change just one rate — swapping NSE\'s 0.00307% for BSE\'s 0.00375%, say — and leave the rest alone.' },
            { q: 'Does this work for intraday or F&O trades?', a: 'Not out of the box. The defaults are equity delivery rates. Intraday attracts STT on the sell side only at 0.025%, brokerage is typically 0.03% or ₹20 per order rather than free, and there is no DP charge. You can enter those numbers manually, but intraday profits are business income rather than capital gains, so the tax section will not reflect your real liability.' },
            { q: 'Is the ₹1.25 lakh LTCG exemption per trade?', a: 'No — it is a single annual limit across all your listed equity and equity mutual fund long-term gains in a financial year. This calculator applies the full exemption to whichever trade you enter, so if you have already used part of it elsewhere, reduce the exemption field accordingly for a realistic figure.' },
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
