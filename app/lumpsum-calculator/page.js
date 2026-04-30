'use client';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function LumpsumCalculator() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate]     = useState(12);
  const [years, setYears]   = useState(10);

  const { maturity, returns, chartData } = useMemo(() => {
    const maturity = amount * Math.pow(1 + rate / 100, years);
    const chartData = Array.from({ length: Math.min(years, 20) }, (_, i) => ({
      year: `Yr ${i + 1}`,
      invested: amount,
      returns: Math.round(amount * Math.pow(1 + rate / 100, i + 1) - amount),
    }));
    return { maturity, returns: maturity - amount, chartData };
  }, [amount, rate, years]);

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Lumpsum Calculator</h1>
      <p className="text-slate-500 mb-8 text-sm">Calculate returns on a one-time (lumpsum) mutual fund investment using CAGR.</p>

      <div className="ad-slot h-20 mb-8">[ AdSense — Leaderboard ]</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          {[
            { label: 'Investment Amount', value: amount, set: setAmount, min: 1000, max: 10000000, step: 1000, display: fmt(amount) },
            { label: 'Expected Annual Return', value: rate, set: setRate, min: 1, max: 30, step: 0.5, display: rate + '%' },
            { label: 'Investment Period', value: years, set: setYears, min: 1, max: 30, step: 1, display: years + ' years' },
          ].map(f => (
            <div key={f.label}>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                <span className="text-sm font-bold text-brand-700">{f.display}</span>
              </div>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={f.value} onChange={e => f.set(+e.target.value)} />
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
