'use client';
import { useState, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CrossBrandCard from '../components/CrossBrandCard';
import { debounce } from '../utils/debounce';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const PPF_RATE = 7.1;

export default function PPFCalculator() {
  const [yearly, setYearly] = useState(150000);
  const [years, setYears]   = useState(15);

  // calc mirrors the sliders above but only updates 80ms after the user pauses dragging.
  const [calc, setCalc] = useState({ yearly: 150000, years: 15 });
  const recalc = useRef(debounce(setCalc, 80)).current;

  const { maturity, totalInvested, totalInterest, chartData } = useMemo(() => {
    const r = PPF_RATE / 100;
    let balance = 0;
    const chartData = [];
    for (let y = 1; y <= calc.years; y++) {
      balance = (balance + calc.yearly) * (1 + r);
      chartData.push({ year: `Yr ${y}`, balance: Math.round(balance), invested: calc.yearly * y });
    }
    const totalInvested = calc.yearly * calc.years;
    return { maturity: balance, totalInvested, totalInterest: balance - totalInvested, chartData };
  }, [calc]);

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">PPF Calculator</h1>
      <p className="text-slate-500 mb-2 text-sm">Calculate your Public Provident Fund maturity amount and interest earned.</p>
      <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
        Current PPF Rate: {PPF_RATE}% p.a. (Q1 FY2024-25)
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Yearly Investment</label>
              <span className="text-sm font-bold text-brand-700">{fmt(yearly)}</span>
            </div>
            <input type="range" min={500} max={150000} step={500}
              value={yearly} onChange={e => { const v = +e.target.value; setYearly(v); recalc({ yearly: v, years }); }} />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>₹500 (min)</span><span>₹1,50,000 (max)</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Investment Period</label>
              <span className="text-sm font-bold text-brand-700">{years} years</span>
            </div>
            <input type="range" min={15} max={50} step={1}
              value={years} onChange={e => { const v = +e.target.value; setYears(v); recalc({ yearly, years: v }); }} />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>15 yrs (min lock-in)</span><span>50 yrs</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
            <strong>Tax Benefit:</strong> PPF contributions up to ₹1.5 lakh per year qualify for deduction under Section 80C. Interest and maturity amount are fully tax-free (EEE status).
          </div>
        </div>

        <div className="space-y-4">
          <div className="result-card">
            <p className="text-brand-200 text-sm mb-1">Maturity Amount</p>
            <p className="text-4xl font-black">{fmt(maturity)}</p>
            <p className="text-brand-300 text-xs mt-2">After {years} years @ {PPF_RATE}%</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Total Invested</p>
              <p className="text-xl font-bold text-slate-800">{fmt(totalInvested)}</p>
            </div>
            <div className="bg-white rounded-2xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Total Interest</p>
              <p className="text-xl font-bold text-green-600">{fmt(totalInterest)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Balance Growth</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={Math.floor(years / 5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => '₹' + (v / 100000).toFixed(0) + 'L'} />
                <Tooltip formatter={fmt} />
                <Line type="monotone" dataKey="balance" stroke="#1e46e8" dot={false} strokeWidth={2} name="PPF Balance" />
                <Line type="monotone" dataKey="invested" stroke="#94a3b8" dot={false} strokeWidth={1.5} name="Invested" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <CrossBrandCard pageSlug="ppf-calculator" />
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['What is PPF?', 'PPF (Public Provident Fund) is a government-backed long-term savings scheme with a 15-year lock-in. It offers guaranteed returns and is EEE tax-exempt.'],
            ['Can I withdraw PPF before 15 years?', 'Partial withdrawal is allowed from the 7th year. Full premature closure is allowed after 5 years under specific conditions (medical, education).'],
            ['What is the maximum PPF investment per year?', 'The maximum is ₹1,50,000 per financial year. The minimum is ₹500 per year.'],
            ['Is PPF interest taxable?', 'No — PPF is EEE (Exempt-Exempt-Exempt). Contributions qualify for 80C deduction, interest earned is tax-free, and the maturity amount is also tax-free.'],
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
