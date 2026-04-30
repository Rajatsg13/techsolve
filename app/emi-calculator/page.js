'use client';
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export const metadata = undefined; // client component

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function EMICalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate]           = useState(8.5);
  const [tenure, setTenure]       = useState(20);
  const [tenureType, setTenureType] = useState('years');

  const months = tenureType === 'years' ? tenure * 12 : tenure;

  const { emi, totalPayment, totalInterest } = useMemo(() => {
    const r = rate / 100 / 12;
    if (r === 0) return { emi: principal / months, totalPayment: principal, totalInterest: 0 };
    const emi = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    const totalPayment = emi * months;
    return { emi, totalPayment, totalInterest: totalPayment - principal };
  }, [principal, rate, months]);

  const pieData = [
    { name: 'Principal', value: Math.round(principal) },
    { name: 'Interest', value: Math.round(totalInterest) },
  ];

  return (
    <div className="tool-container">
      {/* SEO heading */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">EMI Calculator</h1>
      <p className="text-slate-500 mb-8 text-sm">Calculate your Equated Monthly Instalment for home loan, car loan or personal loan.</p>

      {/* Ad slot */}
      <div className="ad-slot h-20 mb-8">[ AdSense — Leaderboard ]</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Loan Amount</label>
              <span className="text-sm font-bold text-brand-700">{fmt(principal)}</span>
            </div>
            <input type="range" min="50000" max="10000000" step="50000"
              value={principal} onChange={e => setPrincipal(+e.target.value)} />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>₹50K</span><span>₹1Cr</span>
            </div>
            <input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Annual Interest Rate</label>
              <span className="text-sm font-bold text-brand-700">{rate}%</span>
            </div>
            <input type="range" min="1" max="24" step="0.1"
              value={rate} onChange={e => setRate(+e.target.value)} />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1%</span><span>24%</span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Loan Tenure</label>
              <span className="text-sm font-bold text-brand-700">{tenure} {tenureType}</span>
            </div>
            <input type="range" min="1" max={tenureType === 'years' ? 30 : 360} step="1"
              value={tenure} onChange={e => setTenure(+e.target.value)} />
            <div className="flex gap-2 mt-2">
              {['years', 'months'].map(t => (
                <button key={t} onClick={() => { setTenureType(t); setTenure(t === 'years' ? 20 : 240); }}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors
                    ${tenureType === t ? 'bg-brand-700 text-white border-brand-700' : 'text-slate-600 border-slate-200 hover:border-brand-300'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="result-card">
            <p className="text-brand-200 text-sm font-medium mb-1">Monthly EMI</p>
            <p className="text-4xl font-black">{fmt(emi)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-500 mb-1">Total Interest</p>
              <p className="text-xl font-bold text-red-600">{fmt(totalInterest)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-500 mb-1">Total Payment</p>
              <p className="text-xl font-bold text-slate-800">{fmt(totalPayment)}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Breakup</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  <Cell fill="#1e46e8" />
                  <Cell fill="#f87171" />
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 justify-center text-xs mt-2">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-700 inline-block"></span>Principal</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>Interest</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['What is EMI?', 'EMI (Equated Monthly Instalment) is the fixed monthly amount you pay to repay a loan. It includes both principal and interest components.'],
            ['How is EMI calculated?', 'EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly interest rate, and n is number of months.'],
            ['Does prepayment reduce EMI?', 'Yes — making a partial prepayment reduces either your outstanding principal (reducing tenure) or your monthly EMI, depending on your bank\'s policy.'],
            ['What is the best tenure for a home loan?', 'Shorter tenure means higher EMI but lower total interest. Longer tenure means lower EMI but more interest paid. Choose based on your monthly budget.'],
          ].map(([q, a]) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center">
                {q}
                <span className="text-brand-600 text-lg">+</span>
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
