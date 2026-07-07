'use client';
import { useState, useRef } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';
import { debounce } from '../utils/debounce';

export default function SharpeRatioCalculator() {
  const [portRet, setPortRet] = useState('');
  const [rfRate,  setRfRate]  = useState('6.8');
  const [stdDev,  setStdDev]  = useState('');

  // calc mirrors the inputs above but only updates 80ms after the user pauses typing.
  const [calc, setCalc] = useState({ portRet: '', rfRate: '6.8', stdDev: '' });
  const recalc = useRef(debounce(setCalc, 80)).current;
  const snapshot = (overrides) => ({ portRet, rfRate, stdDev, ...overrides });

  const pr  = parseFloat(calc.portRet);
  const rf  = parseFloat(calc.rfRate);
  const sd  = parseFloat(calc.stdDev);
  const valid = !isNaN(pr) && !isNaN(rf) && !isNaN(sd) && sd > 0;
  const sharpe = valid ? (pr - rf) / sd : null;

  const verdictInfo = sharpe === null ? null
    : sharpe < 0  ? { cls: 'bg-red-100 text-red-700',      text: '❌ Negative — Underperforming risk-free assets' }
    : sharpe < 1  ? { cls: 'bg-orange-100 text-orange-700', text: '⚠️ Below 1.0 — Poor risk-adjusted return' }
    : sharpe < 2  ? { cls: 'bg-yellow-100 text-yellow-700', text: '✅ Good — Acceptable risk-adjusted return' }
    : sharpe < 3  ? { cls: 'bg-green-100 text-green-700',   text: '🌟 Very Good — Strong risk-adjusted performance' }
    :               { cls: 'bg-brand-100 text-brand-800',   text: '🏆 Excellent — Exceptional risk-adjusted returns' };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Sharpe Ratio Calculator</h1>
      <p className="text-slate-500 mb-8 text-sm">
        Measure how much return your portfolio earns per unit of risk. A higher Sharpe Ratio means better risk-adjusted performance.
      </p>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Portfolio Annual Return (%)</label>
            <input type="number" step="0.1" placeholder="e.g. 18.5" value={portRet}
              onChange={e => { const v = e.target.value; setPortRet(v); recalc(snapshot({ portRet: v })); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <p className="text-xs text-slate-400 mt-1">Annualised return of your portfolio over the period</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Risk-Free Rate (%) <span className="text-slate-400 font-normal">India 10-yr G-Sec ≈ 6.8%</span>
            </label>
            <input type="number" step="0.1" value={rfRate}
              onChange={e => { const v = e.target.value; setRfRate(v); recalc(snapshot({ rfRate: v })); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <p className="text-xs text-slate-400 mt-1">Return from a risk-free asset like government bonds</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Portfolio Standard Deviation (%)</label>
            <input type="number" step="0.1" placeholder="e.g. 14.2" value={stdDev}
              onChange={e => { const v = e.target.value; setStdDev(v); recalc(snapshot({ stdDev: v })); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <p className="text-xs text-slate-400 mt-1">Annualised volatility (find this on your fund/broker dashboard)</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Sharpe Ratio Formula</p>
            <p className="text-sm font-mono text-slate-700">Sharpe = (Rp − Rf) ÷ σp</p>
            <div className="mt-2 space-y-0.5 text-xs text-slate-400">
              <p>Rp = Portfolio Return &nbsp; Rf = Risk-Free Rate &nbsp; σp = Std Dev</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!valid ? (
            <div className="result-card flex items-center justify-center min-h-[120px]">
              <p className="text-brand-200 text-sm">Enter values to calculate Sharpe Ratio</p>
            </div>
          ) : (
            <>
              <div className="result-card">
                <p className="text-brand-200 text-sm font-medium mb-1">Sharpe Ratio</p>
                <p className="text-5xl font-black">{sharpe.toFixed(2)}</p>
                <p className="text-brand-300 text-xs mt-2">Higher is better — rewards per unit of risk</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${verdictInfo.cls}`}>
                  {verdictInfo.text}
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ['Excess Return over Risk-Free', `${(pr - rf).toFixed(2)}%`],
                    ['Portfolio Return',             `${pr.toFixed(2)}%`],
                    ['Risk-Free Rate',               `${rf.toFixed(2)}%`],
                    ['Standard Deviation',           `${sd.toFixed(2)}%`],
                  ].map(([label, val], i, arr) => (
                    <div key={label} className={`flex justify-between py-1.5 ${i < arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Interpretation Scale</p>
                <div className="space-y-2">
                  {[
                    { dot: 'bg-red-400',    text: 'Below 1.0 — Poor. Not adequately compensated for risk.' },
                    { dot: 'bg-yellow-400', text: '1.0 – 2.0 — Good. Acceptable risk-adjusted return.' },
                    { dot: 'bg-green-400',  text: '2.0 – 3.0 — Very Good. Strong risk management.' },
                    { dot: 'bg-brand-700',  text: 'Above 3.0 — Excellent. Exceptional risk-adjusted returns.' },
                  ].map(({ dot, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
                      <p className="text-xs text-slate-600">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <CrossBrandCard pageSlug="sharpe-ratio-calculator" />
      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: 'What is the Sharpe Ratio?', a: 'The Sharpe Ratio, developed by Nobel laureate William Sharpe, measures how much excess return you receive for each unit of risk you take. A higher ratio means better risk-adjusted performance.' },
            { q: 'What is a good Sharpe Ratio in India?', a: 'For Indian equity mutual funds, above 1.0 is acceptable, above 1.5 is good, and above 2.0 is excellent. Large-cap funds typically show ratios between 0.8–1.5.' },
            { q: 'What risk-free rate should I use for India?', a: 'The 10-year Government Security (G-Sec) yield is the standard risk-free rate. As of 2025–26, this is approximately 6.8–7.0%. You can find the current rate on the RBI website or NSE.' },
            { q: "Where do I find my portfolio's standard deviation?", a: 'For mutual funds, the standard deviation is published in fund factsheets (usually rolling 3-year annualised). For custom portfolios, calculate it from historical monthly returns using STDEV in Excel and multiply by √12 to annualise.' },
            { q: "What's the difference between Sharpe and Sortino Ratio?", a: 'The Sharpe Ratio uses total standard deviation. The Sortino Ratio only uses downside deviation, arguing that upward volatility should not be penalised. Sortino is generally better for asymmetric return distributions.' },
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
