'use client';
import { useState, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import CrossBrandCard from '../components/CrossBrandCard';
import { debounce } from '../utils/debounce';


const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function EMICalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate]           = useState(8.5);
  const [tenure, setTenure]       = useState(20);
  const [tenureType, setTenureType] = useState('years');

  // calc mirrors the inputs above but only updates 80ms after the user pauses,
  // so dragging a slider doesn't re-run the EMI math on every pixel of movement.
  const [calc, setCalc] = useState({ principal: 1000000, rate: 8.5, tenure: 20, tenureType: 'years' });
  const recalc = useRef(debounce(setCalc, 80)).current;

  const months = calc.tenureType === 'years' ? calc.tenure * 12 : calc.tenure;

  const { emi, totalPayment, totalInterest } = useMemo(() => {
    const r = calc.rate / 100 / 12;
    if (r === 0) return { emi: calc.principal / months, totalPayment: calc.principal, totalInterest: 0 };
    const emi = calc.principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    const totalPayment = emi * months;
    return { emi, totalPayment, totalInterest: totalPayment - calc.principal };
  }, [calc, months]);

  const pieData = [
    { name: 'Principal', value: Math.round(principal) },
    { name: 'Interest', value: Math.round(totalInterest) },
  ];

  return (
    <div className="tool-container">
      {/* SEO heading */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">EMI Calculator</h1>
      <p className="text-slate-500 mb-8 text-sm">Calculate your Equated Monthly Instalment for home loan, car loan or personal loan.</p>

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
              value={principal} onChange={e => { const v = +e.target.value; setPrincipal(v); recalc({ principal: v, rate, tenure, tenureType }); }} />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>₹50K</span><span>₹1Cr</span>
            </div>
            <input type="text" inputMode="numeric" value={principal}
              onChange={e => { const parsed = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10); if (!isNaN(parsed)) { const v = Math.min(10000000, parsed); setPrincipal(v); recalc({ principal: v, rate, tenure, tenureType }); } }}
              className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Annual Interest Rate</label>
              <span className="text-sm font-bold text-brand-700">{rate}%</span>
            </div>
            <input type="range" min="1" max="24" step="0.1"
              value={rate} onChange={e => { const v = +e.target.value; setRate(v); recalc({ principal, rate: v, tenure, tenureType }); }} />
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
              value={tenure} onChange={e => { const v = +e.target.value; setTenure(v); recalc({ principal, rate, tenure: v, tenureType }); }} />
            <div className="flex gap-2 mt-2">
              {['years', 'months'].map(t => (
                <button key={t} onClick={() => { const nextTenure = t === 'years' ? 20 : 240; setTenureType(t); setTenure(nextTenure); setCalc({ principal, rate, tenure: nextTenure, tenureType: t }); }}
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

      {/* How EMI Is Calculated — server-rendered for SEO */}
      <section id="ts44-deep" className="mt-10" style={{ maxWidth: '900px', margin: '2.5rem auto 0', padding: '0 1.25rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>How EMI Is Calculated</h2>

        {/* Formula card */}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '.5rem', textTransform: 'uppercase' }}>Formula</p>
          <code style={{ display: 'block', fontSize: '1rem', fontFamily: 'monospace', color: '#1e3a8a', background: '#e0f2fe', padding: '.75rem 1rem', borderRadius: '8px' }}>
            EMI = P × r × (1 + r)ⁿ / [(1 + r)ⁿ − 1]
          </code>
          <ul style={{ marginTop: '.75rem', fontSize: '.875rem', color: '#374151', paddingLeft: '1.2rem', lineHeight: 1.9 }}>
            <li><strong>P</strong> = Principal &nbsp;|&nbsp; <strong>r</strong> = Monthly rate = Annual ÷ 12 ÷ 100</li>
            <li><strong>n</strong> = Tenure in months</li>
          </ul>
        </div>

        {/* Scenarios */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '.75rem' }}>Real-World Scenarios</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
            <p style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: '.4rem' }}>🏠 Home Loan Tenure</p>
            <p style={{ fontSize: '.875rem', color: '#475569', lineHeight: 1.7 }}>₹50 L at 8.5%: 20-yr EMI ₹43,391 (total interest ₹54 L). 15-yr EMI ₹49,238 (total interest ₹39 L). Shorter tenure saves ₹15 L.</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
            <p style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: '.4rem' }}>🚗 Car Loan Comparison</p>
            <p style={{ fontSize: '.875rem', color: '#475569', lineHeight: 1.7 }}>₹8 L at 9%: 3-yr EMI ₹25,450 (interest ₹1.16 L) vs 5-yr EMI ₹16,600 (interest ₹1.96 L). Extra 2 years costs ₹80,000 more.</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
            <p style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: '.4rem' }}>💰 Prepayment Impact</p>
            <p style={{ fontSize: '.875rem', color: '#475569', lineHeight: 1.7 }}>A ₹2 L prepayment in Year 3 of a ₹30 L, 20-yr home loan at 8.5% can save ₹5–7 L in interest and cut tenure by ~3 years.</p>
          </div>
        </div>

        {/* Extra FAQs */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <details style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer', color: '#1e293b' }}>What EMI can I afford?</summary>
            <p style={{ marginTop: '.5rem', fontSize: '.875rem', color: '#475569' }}>Financial advisors recommend keeping total EMIs under 40% of monthly take-home salary.</p>
          </details>
          <details style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer', color: '#1e293b' }}>Does EMI change with floating rate?</summary>
            <p style={{ marginTop: '.5rem', fontSize: '.875rem', color: '#475569' }}>Yes. With floating-rate loans, your EMI or tenure adjusts whenever the bank revises the rate based on RBI repo changes.</p>
          </details>
          <details style={{ padding: '1rem' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer', color: '#1e293b' }}>Is my data safe here?</summary>
            <p style={{ marginTop: '.5rem', fontSize: '.875rem', color: '#475569' }}>100% client-side. All calculations run in your browser. Your data never leaves your computer.</p>
          </details>
        </div>
      </section>

      <CrossBrandCard pageSlug="emi-calculator" />

      {/* Main FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['What is EMI?', 'EMI (Equated Monthly Instalment) is the fixed monthly amount you pay to repay a loan. It includes both principal and interest components.'],
            ['How is EMI calculated?', 'EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly interest rate, and n is number of months.'],
            ['Does prepayment reduce EMI?', "Yes — making a partial prepayment reduces either your outstanding principal (reducing tenure) or your monthly EMI, depending on your bank's policy."],
            ['What is the best tenure for a home loan?', 'Shorter tenure means higher EMI but lower total interest. Longer tenure means lower EMI but more interest paid. Choose based on your monthly budget.'],
          ].map(([q, a]) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center">
                {q}
                <span className="text-brand-600 text-lg faq-icon"></span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
}
