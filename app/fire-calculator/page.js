'use client';
import { useState, useRef, useMemo } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';
import { debounce } from '../utils/debounce';

function fmtShort(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function FireCalculator() {
  const [curAge,     setCurAge]     = useState('');
  const [retAge,     setRetAge]     = useState('');
  const [curSav,     setCurSav]     = useState('');
  const [monthlySav, setMonthlySav] = useState('');
  const [annRet,     setAnnRet]     = useState(12);
  const [monthlyExp, setMonthlyExp] = useState('');
  const [inflation,  setInflation]  = useState(6);

  // calc mirrors the inputs above but only updates 80ms after the user pauses
  // sliding/typing — this loop runs up to 600 iterations per recalculation.
  const [calc, setCalc] = useState({ curAge: '', retAge: '', curSav: '', monthlySav: '', annRet: 12, monthlyExp: '', inflation: 6 });
  const recalc = useRef(debounce(setCalc, 80)).current;
  const snapshot = (overrides) => ({ curAge, retAge, curSav, monthlySav, annRet, monthlyExp, inflation, ...overrides });

  const result = useMemo(() => {
    const curAgeN     = parseFloat(calc.curAge);
    const retAgeN     = parseFloat(calc.retAge);
    const curSavN     = parseFloat(calc.curSav) || 0;
    const monthlySavN = parseFloat(calc.monthlySav) || 0;
    const monthlyExpN = parseFloat(calc.monthlyExp);

    const valid = !isNaN(curAgeN) && !isNaN(retAgeN) && !isNaN(monthlyExpN) && retAgeN > curAgeN;
    if (!valid) return null;

    const years      = retAgeN - curAgeN;
    const monthlyRet = calc.annRet / 100 / 12;
    const adjMonthly = monthlyExpN * Math.pow(1 + calc.inflation / 100, years);
    const fireNum    = adjMonthly * 12 * 25;

    let corpusAtTarget = curSavN * Math.pow(1 + calc.annRet / 100, years);
    if (monthlySavN > 0 && monthlyRet > 0) {
      corpusAtTarget += monthlySavN * ((Math.pow(1 + monthlyRet, years * 12) - 1) / monthlyRet) * (1 + monthlyRet);
    } else {
      corpusAtTarget += monthlySavN * years * 12;
    }

    let yearsToFire = null;
    let corpus = curSavN;
    for (let m = 1; m <= 600; m++) {
      corpus = corpus * (1 + monthlyRet) + monthlySavN;
      if (corpus >= fireNum) { yearsToFire = m / 12; break; }
    }

    const pct = Math.min((curSavN / fireNum) * 100, 100);
    return { fireNum, adjMonthly, corpusAtTarget, yearsToFire, pct };
  }, [calc]);

  const curAgeN = parseFloat(curAge);
  const curSavN = parseFloat(curSav) || 0;

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">FIRE Calculator</h1>
      <p className="text-slate-500 mb-8 text-sm">
        Calculate your Financial Independence number and find out exactly when you can retire early — based on the 4% safe withdrawal rule.
      </p>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Current Age</label>
              <input type="number" min="18" max="70" placeholder="e.g. 28" value={curAge}
                onChange={e => { const v = e.target.value; setCurAge(v); recalc(snapshot({ curAge: v })); }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Retire Age</label>
              <input type="number" min="25" max="80" placeholder="e.g. 45" value={retAge}
                onChange={e => { const v = e.target.value; setRetAge(v); recalc(snapshot({ retAge: v })); }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Current Savings / Investments (₹)</label>
            <input type="number" min="0" step="1000" placeholder="e.g. 15,00,000" value={curSav}
              onChange={e => { const v = e.target.value; setCurSav(v); recalc(snapshot({ curSav: v })); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Savings / Investment (₹)</label>
            <input type="number" min="0" step="500" placeholder="e.g. 50,000" value={monthlySav}
              onChange={e => { const v = e.target.value; setMonthlySav(v); recalc(snapshot({ monthlySav: v })); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-semibold text-slate-700">Expected Annual Return</label>
              <span className="text-sm font-bold text-brand-700">{annRet}%</span>
            </div>
            <input type="range" min="4" max="20" step="0.5" value={annRet}
              onChange={e => { const v = parseFloat(e.target.value); setAnnRet(v); recalc(snapshot({ annRet: v })); }} className="w-full" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>4%</span><span>20%</span></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Monthly Expenses in Retirement (₹) <span className="text-slate-400 font-normal">today&apos;s value</span>
            </label>
            <input type="number" min="0" step="1000" placeholder="e.g. 80,000" value={monthlyExp}
              onChange={e => { const v = e.target.value; setMonthlyExp(v); recalc(snapshot({ monthlyExp: v })); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-semibold text-slate-700">Inflation Rate</label>
              <span className="text-sm font-bold text-brand-700">{inflation}%</span>
            </div>
            <input type="range" min="3" max="10" step="0.5" value={inflation}
              onChange={e => { const v = parseFloat(e.target.value); setInflation(v); recalc(snapshot({ inflation: v })); }} className="w-full" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>3%</span><span>10%</span></div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result ? (
            <div className="result-card flex items-center justify-center min-h-[120px]">
              <p className="text-brand-200 text-sm">Enter your details to calculate</p>
            </div>
          ) : (
            <>
              <div className="result-card">
                <p className="text-brand-200 text-sm font-medium mb-1">Your FIRE Number</p>
                <p className="text-4xl font-black">{fmtShort(result.fireNum)}</p>
                <p className="text-brand-300 text-xs mt-2">Target corpus needed to retire (inflation-adjusted)</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Years to FIRE</p>
                    <p className="text-2xl font-extrabold text-brand-700">
                      {result.yearsToFire ? result.yearsToFire.toFixed(1) + ' yrs' : '50+ yrs'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Retire at Age</p>
                    <p className="text-2xl font-extrabold text-brand-700">
                      {result.yearsToFire ? Math.round(curAgeN + result.yearsToFire) : '—'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Corpus at Target Age</p>
                    <p className="text-lg font-bold text-slate-700">{fmtShort(result.corpusAtTarget)}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Monthly Withdrawal</p>
                    <p className="text-lg font-bold text-slate-700">{fmtShort(result.adjMonthly)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-700">FIRE Progress</span>
                  <span className="font-bold text-brand-700">{result.pct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-3">
                  <div className="h-3 rounded-full bg-brand-700 transition-all duration-700"
                    style={{ width: `${result.pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Current: <span className="font-medium text-slate-600">{fmtShort(curSavN)}</span></span>
                  <span>Target: <span className="font-medium text-slate-600">{fmtShort(result.fireNum)}</span></span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <CrossBrandCard pageSlug="fire-calculator" />
      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: 'What is FIRE?', a: 'FIRE stands for Financial Independence, Retire Early. The core idea is building a corpus large enough that returns from investments can sustain your lifestyle indefinitely without employment income.' },
            { q: 'What is the 4% rule?', a: 'The 4% rule (Trinity Study) states you can safely withdraw 4% of your corpus every year without running out of money for 30+ years. This means FIRE Number = Annual Expenses × 25. For example, if you need ₹10L/year, your target corpus is ₹2.5 crore.' },
            { q: 'How is inflation factored in?', a: "This calculator adjusts your monthly expenses to the retirement date using the inflation rate you set. Your FIRE number is calculated on those inflation-adjusted expenses — giving you a realistic target that accounts for the rising cost of living." },
            { q: 'What return rate should I assume for India?', a: 'Indian equity markets (Nifty 50) have historically delivered 12–14% CAGR over the long term. A balanced portfolio (70% equity, 30% debt) might return 10–12%. For conservative planning, use 10–11%.' },
            { q: 'What are the types of FIRE?', a: 'Lean FIRE: retire with a frugal lifestyle. Fat FIRE: retire with high expenses. Barista FIRE: semi-retire with part-time work. Coast FIRE: invest enough early that it grows to your FIRE number without adding more savings.' },
          ].map(({ q, a }) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center">
                {q}<span className="text-brand-600 text-lg faq-icon"></span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
}
