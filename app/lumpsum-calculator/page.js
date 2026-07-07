'use client';
import { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import CrossBrandCard from '../components/CrossBrandCard';
import { debounce } from '../utils/debounce';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function LumpsumCalculator() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate]     = useState(12);
  const [years, setYears]   = useState(10);

  // calc mirrors the sliders above but only updates 80ms after the user pauses dragging.
  const [calc, setCalc] = useState({ amount: 100000, rate: 12, years: 10 });
  const recalc = useRef(debounce(setCalc, 80)).current;

  const { maturity, returns, chartData } = useMemo(() => {
    const maturity = calc.amount * Math.pow(1 + calc.rate / 100, calc.years);
    const chartData = Array.from({ length: Math.min(calc.years, 20) }, (_, i) => ({
      year: `Yr ${i + 1}`,
      invested: calc.amount,
      returns: Math.round(calc.amount * Math.pow(1 + calc.rate / 100, i + 1) - calc.amount),
    }));
    return { maturity, returns: maturity - calc.amount, chartData };
  }, [calc]);

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Lumpsum Calculator</h1>
      <p className="text-slate-500 mb-8 text-sm">Calculate returns on a one-time (lumpsum) mutual fund investment using CAGR.</p>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          {[
            { key: 'amount', label: 'Investment Amount', value: amount, set: setAmount, min: 1000, max: 10000000, step: 1000, display: fmt(amount) },
            { key: 'rate', label: 'Expected Annual Return', value: rate, set: setRate, min: 1, max: 30, step: 0.5, display: rate + '%' },
            { key: 'years', label: 'Investment Period', value: years, set: setYears, min: 1, max: 30, step: 1, display: years + ' years' },
          ].map(f => (
            <div key={f.label}>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                <span className="text-sm font-bold text-brand-700">{f.display}</span>
              </div>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={f.value} onChange={e => { const v = +e.target.value; f.set(v); recalc({ amount, rate, years, [f.key]: v }); }} />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="result-card">
            <p className="text-brand-200 text-sm mb-1">Maturity Value</p>
            <p className="text-4xl font-black">{fmt(maturity)}</p>
            <p className="text-brand-300 text-xs mt-2">{years} years @ {rate}% CAGR</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Amount Invested</p>
              <p className="text-xl font-bold text-slate-800">{fmt(amount)}</p>
            </div>
            <div className="bg-white rounded-2xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Est. Returns</p>
              <p className="text-xl font-bold text-green-600">{fmt(returns)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Wealth Growth</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={16}>
                <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={v => '₹' + (v / 100000).toFixed(0) + 'L'} />
                <Tooltip formatter={fmt} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="invested" fill="#cbd5e1" name="Principal" radius={[3, 3, 0, 0]} />
                <Bar dataKey="returns" fill="#1e46e8" name="Returns" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compound Interest Formula Section */}
      <section className="mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">How Lumpsum Returns Are Calculated (CAGR)</h2>
        <div className="bg-white border border-blue-100 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Compound Interest Formula</p>
          <code className="block text-base font-mono text-brand-700 bg-blue-50 px-4 py-3 rounded-lg">
            A = P × (1 + r)ⁿ
          </code>
          <ul className="mt-3 text-sm text-slate-600 space-y-1 pl-1">
            <li><strong>A</strong> = Maturity value (future value)</li>
            <li><strong>P</strong> = Principal (initial investment)</li>
            <li><strong>r</strong> = Annual rate of return ÷ 100 (e.g., 12% → 0.12)</li>
            <li><strong>n</strong> = Number of years</li>
          </ul>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          Lumpsum investments grow through <strong>annual compounding</strong> — each year's gains are added to the principal and earn returns in subsequent years. This is the same formula as CAGR (Compound Annual Growth Rate), which mutual funds use to report long-term performance.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="font-semibold text-brand-700 mb-1">💡 CAGR example</p>
            <p className="text-slate-600">₹1 lakh invested at 12% CAGR for 10 years becomes ₹3.1 lakh. At 15% CAGR it becomes ₹4.05 lakh. Even a 3% higher return nearly doubles the final amount.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="font-semibold text-brand-700 mb-1">📊 Lumpsum vs SIP</p>
            <p className="text-slate-600">Lumpsum works best when markets are low (you deploy all capital at a good price). SIP works better for regular income earners — it averages out entry cost via rupee-cost averaging.</p>
          </div>
        </div>
      </section>

      <CrossBrandCard pageSlug="lumpsum-calculator" />
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['What is lumpsum investment?', 'A lumpsum investment means investing a large amount all at once, as opposed to SIP which spreads it over time.'],
            ['SIP vs Lumpsum — which is better?', 'SIP is better for salaried individuals with regular income. Lumpsum suits investors who have a large amount ready and want to invest when markets are down.'],
            ['What is CAGR?', 'CAGR (Compound Annual Growth Rate) is the rate at which your investment grows year over year, assuming profits are reinvested.'],
          ].map(([q, a]) => (
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
