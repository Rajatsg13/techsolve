'use client';
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate]       = useState(12);
  const [years, setYears]     = useState(10);

  const { maturity, invested, returns, chartData } = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    const maturity = monthly * (Math.pow(1 + r, n) - 1) / r * (1 + r);
    const invested = monthly * n;
    const chartData = Array.from({ length: years }, (_, i) => {
      const m = (i + 1) * 12;
      const val = monthly * (Math.pow(1 + r, m) - 1) / r * (1 + r);
      return { year: `Yr ${i + 1}`, value: Math.round(val), invested: monthly * m };
    });
    return { maturity, invested, returns: maturity - invested, chartData };
  }, [monthly, rate, years]);

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">SIP Calculator</h1>
      <p className="text-slate-500 mb-8 text-sm">Calculate the future value of your Systematic Investment Plan (SIP) in mutual funds.</p>

      <div className="ad-slot h-20 mb-8">[ AdSense — Leaderboard ]</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          {[
            { label: 'Monthly Investment', value: monthly, set: setMonthly, min: 500, max: 100000, step: 500, fmt: fmt, unit: '' },
            { label: 'Expected Annual Return', value: rate, set: setRate, min: 1, max: 30, step: 0.5, fmt: v => v + '%', unit: '%' },
            { label: 'Investment Period', value: years, set: setYears, min: 1, max: 40, step: 1, fmt: v => v + ' yrs', unit: 'years' },
          ].map(f => (
            <div key={f.label}>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                <span className="text-sm font-bold text-brand-700">{f.fmt(f.value)}</span>
              </div>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={f.value} onChange={e => f.set(+e.target.value)} />
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
                {q}<span className="text-brand-600 text-lg">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </section>
      <div className="ad-slot h-24 mt-10">[ AdSense — Rectangle ]</div>
    </div>
  );
}
