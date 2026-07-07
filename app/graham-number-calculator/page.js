'use client';
import { useState, useRef, useMemo } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';
import { debounce } from '../utils/debounce';

function fmt(n) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export default function GrahamNumberCalculator() {
  const [eps,  setEps]  = useState('');
  const [bvps, setBvps] = useState('');
  const [cmp,  setCmp]  = useState('');

  // calc mirrors the inputs above but only updates 80ms after the user pauses typing.
  const [calc, setCalc] = useState({ eps: '', bvps: '', cmp: '' });
  const recalc = useRef(debounce(setCalc, 80)).current;
  const snapshot = (overrides) => ({ eps, bvps, cmp, ...overrides });

  const epsN  = parseFloat(calc.eps);
  const bvpsN = parseFloat(calc.bvps);
  const cmpN  = parseFloat(calc.cmp);

  const valid = !isNaN(epsN) && !isNaN(bvpsN) && epsN > 0 && bvpsN > 0;
  const gn    = useMemo(() => (valid ? Math.sqrt(22.5 * epsN * bvpsN) : null), [valid, epsN, bvpsN]);
  const hasCmp = gn && !isNaN(cmpN) && cmpN > 0;
  const mos    = hasCmp ? ((gn - cmpN) / gn) * 100 : null;

  const verdictColor = mos === null ? '' : mos >= 30 ? 'bg-green-100 text-green-700' : mos > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  const verdictText  = mos === null ? '' : mos >= 30 ? '✅ Undervalued — Good margin of safety' : mos > 0 ? '⚠️ Slightly undervalued — Thin margin' : '❌ Overvalued — Trading above intrinsic value';
  const barColor     = mos === null ? '' : mos >= 30 ? 'bg-green-500' : mos > 0 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Graham Number Calculator</h1>
      <p className="text-slate-500 mb-8 text-sm">
        Find a stock&apos;s intrinsic value using Benjamin Graham&apos;s formula. Compare it to the current market price to spot undervalued opportunities.
      </p>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Earnings Per Share — EPS (₹) <span className="text-slate-400 font-normal">TTM</span>
            </label>
            <input type="number" min="0" step="0.01" placeholder="e.g. 45.50" value={eps}
              onChange={e => { const v = e.target.value; setEps(v); recalc(snapshot({ eps: v })); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <p className="text-xs text-slate-400 mt-1">Net profit divided by total shares outstanding</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Book Value Per Share — BVPS (₹)</label>
            <input type="number" min="0" step="0.01" placeholder="e.g. 320.00" value={bvps}
              onChange={e => { const v = e.target.value; setBvps(v); recalc(snapshot({ bvps: v })); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <p className="text-xs text-slate-400 mt-1">Total equity divided by total shares outstanding</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Current Market Price (₹) <span className="text-slate-400 font-normal">optional</span>
            </label>
            <input type="number" min="0" step="0.01" placeholder="e.g. 750.00" value={cmp}
              onChange={e => { const v = e.target.value; setCmp(v); recalc(snapshot({ cmp: v })); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <p className="text-xs text-slate-400 mt-1">For margin of safety calculation</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Benjamin Graham&apos;s Formula</p>
            <p className="text-sm font-mono text-slate-700">Graham Number = √(22.5 × EPS × BVPS)</p>
            <p className="text-xs text-slate-400 mt-1">22.5 = max P/E of 15 × max P/B of 1.5</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!valid ? (
            <div className="result-card flex items-center justify-center min-h-[120px]">
              <p className="text-brand-200 text-sm">Enter EPS and BVPS to calculate</p>
            </div>
          ) : (
            <>
              <div className="result-card">
                <p className="text-brand-200 text-sm font-medium mb-1">Graham Number</p>
                <p className="text-4xl font-black">{fmt(gn)}</p>
                <p className="text-brand-300 text-xs mt-2">Estimated intrinsic value per share</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">Valuation Metrics</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Implied P/E (Graham)</span>
                    <span className="font-semibold text-slate-800">{(gn / epsN).toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Implied P/B (Graham)</span>
                    <span className="font-semibold text-slate-800">{(gn / bvpsN).toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">EPS × BVPS</span>
                    <span className="font-semibold text-slate-800">{fmt(epsN * bvpsN)}</span>
                  </div>
                </div>
              </div>

              {hasCmp && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">Margin of Safety</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Graham Number</p>
                      <p className="text-lg font-bold text-slate-800">{fmt(gn)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Market Price</p>
                      <p className="text-lg font-bold text-slate-800">{fmt(cmpN)}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Margin of Safety</span>
                      <span className="font-bold">{mos.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(Math.max(mos, 0), 100)}%` }} />
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${verdictColor}`}>
                    {verdictText}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CrossBrandCard pageSlug="graham-number-calculator" />
      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: 'What is the Graham Number?', a: "The Graham Number is a figure that measures a stock's fundamental value by combining its earnings per share (EPS) and book value per share (BVPS). Developed by Benjamin Graham, the \"father of value investing,\" it represents the maximum price a defensive investor should pay for a stock." },
            { q: 'What does 22.5 in the formula mean?', a: "22.5 comes from Graham's rule that a stock's P/E ratio should not exceed 15 and its P/B ratio should not exceed 1.5. Multiplied together: 15 × 1.5 = 22.5. This ensures you're not overpaying relative to earnings or assets." },
            { q: 'What is Margin of Safety?', a: 'Margin of Safety is the percentage discount between the Graham Number (intrinsic value) and the current market price. If the Graham Number is ₹500 and the stock trades at ₹400, the margin of safety is 20%. Graham recommended buying only when there\'s at least a 30–50% margin of safety.' },
            { q: 'Does the Graham Number work for all stocks?', a: 'The formula works best for stable, profitable companies. It is not suitable for loss-making companies (negative EPS), high-growth tech companies, or financial sector stocks. Use it as one input in a broader analysis.' },
            { q: 'Where do I find EPS and Book Value?', a: 'For Indian stocks, you can find EPS and Book Value Per Share on screener.in, tickertape.in, or moneycontrol.com. Use Trailing Twelve Months (TTM) EPS for the most current picture.' },
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
