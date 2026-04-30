'use client';
import { useState, useMemo } from 'react';

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// FY 2024-25 slabs
const NEW_SLABS = [
  { min: 0,       max: 300000,  rate: 0   },
  { min: 300000,  max: 700000,  rate: 5   },
  { min: 700000,  max: 1000000, rate: 10  },
  { min: 1000000, max: 1200000, rate: 15  },
  { min: 1200000, max: 1500000, rate: 20  },
  { min: 1500000, max: Infinity, rate: 30 },
];

const OLD_SLABS = [
  { min: 0,       max: 250000,  rate: 0   },
  { min: 250000,  max: 500000,  rate: 5   },
  { min: 500000,  max: 1000000, rate: 20  },
  { min: 1000000, max: Infinity, rate: 30 },
];

function calcTax(income, slabs) {
  let tax = 0;
  for (const s of slabs) {
    if (income <= s.min) break;
    tax += (Math.min(income, s.max) - s.min) * s.rate / 100;
  }
  return tax;
}

export default function IncomeTaxCalculator() {
  const [income, setIncome]       = useState(800000);
  const [deductions, setDeductions] = useState(150000);
  const [regime, setRegime]       = useState('new');
  const [age, setAge]             = useState('below60');

  const { taxableIncome, basicTax, cess, totalTax, effectiveRate, slabBreakup } = useMemo(() => {
    const taxableIncome = regime === 'new' ? income : Math.max(0, income - deductions);
    const slabs = regime === 'new' ? NEW_SLABS : OLD_SLABS;
    let basicTax = calcTax(taxableIncome, slabs);

    // 87A rebate (new regime: up to ₹7L → zero tax)
    if (regime === 'new' && taxableIncome <= 700000) basicTax = 0;
    if (regime === 'old' && taxableIncome <= 500000) basicTax = 0;

    const cess = basicTax * 0.04;
    const totalTax = basicTax + cess;
    const effectiveRate = income > 0 ? (totalTax / income * 100).toFixed(2) : 0;

    const slabBreakup = slabs.map(s => {
      if (taxableIncome <= s.min || s.rate === 0) return null;
      const taxable = Math.min(taxableIncome, s.max) - s.min;
      return { label: `${fmt(s.min)} – ${s.max === Infinity ? 'above' : fmt(s.max)}`, rate: s.rate, tax: taxable * s.rate / 100 };
    }).filter(Boolean);

    return { taxableIncome, basicTax, cess, totalTax, effectiveRate, slabBreakup };
  }, [income, deductions, regime, age]);

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Income Tax Calculator</h1>
      <p className="text-slate-500 mb-2 text-sm">Calculate your income tax for FY 2024-25 (AY 2025-26) under New or Old tax regime.</p>
      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
        FY 2024-25 | AY 2025-26
      </div>

      <div className="ad-slot h-20 mb-8">[ AdSense — Leaderboard ]</div>

      {/* Regime Toggle */}
      <div className="flex gap-3 mb-8">
        {['new', 'old'].map(r => (
          <button key={r} onClick={() => setRegime(r)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all
              ${regime === r ? 'bg-brand-700 text-white border-brand-700' : 'text-slate-600 border-slate-200 hover:border-brand-300'}`}>
            {r === 'new' ? '🆕 New Tax Regime' : '📋 Old Tax Regime'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Annual Income (Gross)</label>
            <input type="number" value={income} onChange={e => setIncome(+e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <input type="range" min="100000" max="5000000" step="10000" value={income}
              onChange={e => setIncome(+e.target.value)} className="mt-2" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>₹1L</span><span>₹50L</span></div>
          </div>

          {regime === 'old' && (
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Total Deductions (80C, HRA, etc.)</label>
              <input type="number" value={deductions} onChange={e => setDeductions(+e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <p className="text-xs text-slate-400 mt-1">80C max: ₹1,50,000 | 80D, HRA, LTA etc. also applicable</p>
            </div>
          )}

          {regime === 'new' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs text-green-800">
              <strong>Note:</strong> Under the New Regime, standard deduction of ₹75,000 is available for salaried employees. If your gross income ≤ ₹7 lakh, your tax is zero (87A rebate).
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="result-card">
            <p className="text-brand-200 text-sm mb-1">Total Tax Payable</p>
            <p className="text-4xl font-black">{fmt(totalTax)}</p>
            <p className="text-brand-300 text-xs mt-2">Effective rate: {effectiveRate}% of gross income</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Taxable Income', value: fmt(taxableIncome), color: 'text-slate-800' },
              { label: 'Income Tax', value: fmt(basicTax), color: 'text-red-600' },
              { label: 'Health & Ed. Cess (4%)', value: fmt(cess), color: 'text-orange-600' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl border p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">{c.label}</p>
                <p className={`font-bold text-sm ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Slab Breakup */}
          {slabBreakup.length > 0 && (
            <div className="bg-white rounded-2xl border p-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">Tax Slab Breakup</p>
              <div className="space-y-2">
                {slabBreakup.map(s => (
                  <div key={s.label} className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">{s.label} <span className="text-slate-400">@ {s.rate}%</span></span>
                    <span className="font-semibold text-slate-800">{fmt(s.tax)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['New Regime vs Old Regime — which is better?', 'New regime has lower rates but no deductions. Old regime allows 80C, HRA, etc. If your deductions are > ₹3.75 lakh, old regime may save more tax. Otherwise, new regime is usually better.'],
            ['What is the standard deduction for salaried employees?', 'Under the new regime (FY 2024-25), salaried employees get a standard deduction of ₹75,000. Under the old regime, it was ₹50,000.'],
            ['When is the last date to file ITR?', 'The last date to file ITR without penalty is typically July 31 of the assessment year. For FY 2024-25, that would be July 31, 2025.'],
            ['Is this calculator 100% accurate?', 'This calculator covers basic income tax on salary income using official FY 2024-25 slabs. For complex scenarios (capital gains, business income, surcharge on income > ₹50L), consult a CA.'],
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
