'use client';
import { useState, useMemo, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CrossBrandCard from '../components/CrossBrandCard';
import { debounce } from '../utils/debounce';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate]       = useState(12);
  const [years, setYears]     = useState(10);

  // calc mirrors the sliders above but only updates 80ms after the user pauses dragging.
  const [calc, setCalc] = useState({ monthly: 5000, rate: 12, years: 10 });
  const recalc = useRef(debounce(setCalc, 80)).current;

  const { maturity, invested, returns, chartData } = useMemo(() => {
    const r = calc.rate / 100 / 12;
    const n = calc.years * 12;
    const maturity = calc.monthly * (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const invested = calc.monthly * n;
    const chartData = Array.from({ length: calc.years }, (_, i) => {
      const m = (i + 1) * 12;
      const val = calc.monthly * (Math.pow(1 + r, m) - 1) / r * (1 + r);
      return { year: `Yr ${i + 1}`, value: Math.round(val), invested: calc.monthly * m };
    });
    return { maturity, invested, returns: maturity - invested, chartData };
  }, [calc]);

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">SIP Calculator</h1>
      <p className="text-slate-500 mb-8 text-sm">Calculate the future value of your Systematic Investment Plan (SIP) in mutual funds.</p>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          {[
            { key: 'monthly', label: 'Monthly Investment', value: monthly, set: setMonthly, min: 500, max: 100000, step: 500, fmt: fmt, unit: '' },
            { key: 'rate', label: 'Expected Annual Return', value: rate, set: setRate, min: 1, max: 30, step: 0.5, fmt: v => v + '%', unit: '%' },
            { key: 'years', label: 'Investment Period', value: years, set: setYears, min: 1, max: 40, step: 1, fmt: v => v + ' yrs', unit: 'years' },
          ].map(f => (
            <div key={f.label}>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                <span className="text-sm font-bold text-brand-700">{f.fmt(f.value)}</span>
              </div>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={f.value} onChange={e => { const v = +e.target.value; f.set(v); recalc({ monthly, rate, years, [f.key]: v }); }} />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="result-card">
            <p className="text-brand-200 text-sm font-medium mb-1">Maturity Value</p>
            <p className="text-4xl font-black">{fmt(maturity)}</p>
            <p className="text-brand-300 text-xs mt-2">in {years} years @ {rate}% p.a.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-500 mb-1">Total Invested</p>
              <p className="text-xl font-bold text-slate-800">{fmt(invested)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-500 mb-1">Est. Returns</p>
              <p className="text-xl font-bold text-green-600">{fmt(returns)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Growth Over Time</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => '₹' + (v / 100000).toFixed(0) + 'L'} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Area type="monotone" dataKey="value" stroke="#1e46e8" fill="#eef4ff" name="Maturity Value" />
                <Area type="monotone" dataKey="invested" stroke="#94a3b8" fill="#f1f5f9" name="Invested" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compound Interest Formula Section */}
      <section className="mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">How SIP Returns Are Calculated</h2>
        <div className="bg-white border border-blue-100 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">SIP Formula (Compound Interest)</p>
          <code className="block text-base font-mono text-brand-700 bg-blue-50 px-4 py-3 rounded-lg">
            M = P × {'{'} [(1 + r)ⁿ − 1] / r {'}'} × (1 + r)
          </code>
          <ul className="mt-3 text-sm text-slate-600 space-y-1 pl-1">
            <li><strong>M</strong> = Maturity value</li>
            <li><strong>P</strong> = Monthly SIP amount</li>
            <li><strong>r</strong> = Monthly interest rate = Annual rate ÷ 12 ÷ 100</li>
            <li><strong>n</strong> = Number of months (years × 12)</li>
          </ul>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          SIP works on the principle of <strong>compounding</strong> — each month's investment earns returns, and those returns earn further returns over time. This compounding effect accelerates wealth creation significantly in the later years of your investment.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="font-semibold text-brand-700 mb-1">📈 Power of compounding</p>
            <p className="text-slate-600">A ₹5,000/month SIP at 12% for 10 years gives ₹11.6 L invested but ₹11.5 L in returns — nearly doubling your money. At 20 years, returns are 3× the amount invested.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="font-semibold text-brand-700 mb-1">⏱ Time matters most</p>
            <p className="text-slate-600">Starting 5 years earlier can double your final corpus. A ₹5,000/month SIP for 25 years at 12% gives ₹94 L — vs ₹49 L for just 20 years. Start early, stay invested.</p>
          </div>
        </div>
      </section>

      <CrossBrandCard pageSlug="sip-calculator" />
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['What is SIP?', 'SIP (Systematic Investment Plan) is a method of investing a fixed amount regularly in a mutual fund scheme, typically monthly.'],
            ['Is SIP better than lumpsum?', 'SIP benefits from rupee-cost averaging — you buy more units when markets are low and fewer when high. It reduces timing risk compared to a lumpsum investment.'],
            ['What is a good SIP return rate to assume?', 'Historically, Indian equity mutual funds have delivered 12-15% CAGR over long periods. For conservative estimates, use 10-12%.'],
            ['Can I increase my SIP amount?', 'Yes, most mutual funds offer a Step-Up SIP option where you can increase your SIP amount by a fixed percentage each year.'],
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
