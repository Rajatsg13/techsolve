'use client';
import { useState, useMemo, useRef } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';
import { debounce } from '../utils/debounce';

const fmt = (n) => '₹' + Math.round(Math.max(0, n)).toLocaleString('en-IN');

// ── FY 2025-26 New Regime Slabs (Budget 2025) ─────────────────────────────
const NEW_SLABS = [
  { min: 0,        max: 400000,   rate: 0  },
  { min: 400000,   max: 800000,   rate: 5  },
  { min: 800000,   max: 1200000,  rate: 10 },
  { min: 1200000,  max: 1600000,  rate: 15 },
  { min: 1600000,  max: 2000000,  rate: 20 },
  { min: 2000000,  max: 2400000,  rate: 25 },
  { min: 2400000,  max: Infinity, rate: 30 },
];

// ── Old Regime Slabs (unchanged) ──────────────────────────────────────────
const OLD_SLABS = [
  { min: 0,        max: 250000,   rate: 0  },
  { min: 250000,   max: 500000,   rate: 5  },
  { min: 500000,   max: 1000000,  rate: 20 },
  { min: 1000000,  max: Infinity, rate: 30 },
];

function calcBaseTax(income, slabs) {
  let tax = 0;
  for (const s of slabs) {
    if (income <= s.min) break;
    tax += (Math.min(income, s.max) - s.min) * s.rate / 100;
  }
  return tax;
}

function getSlabBreakup(taxableIncome, slabs) {
  return slabs.map(s => {
    if (taxableIncome <= s.min || s.rate === 0) return null;
    const amt = Math.min(taxableIncome, s.max) - s.min;
    return { label: `${fmt(s.min)} – ${s.max === Infinity ? 'above' : fmt(s.max)}`, rate: s.rate, tax: amt * s.rate / 100 };
  }).filter(Boolean);
}

function computeTax({ gross, regime, basic, hraRcvd, isMetro, d80C, d80D, rentPaid, otherDed }) {
  let taxable, baseTax;
  if (regime === 'new') {
    taxable  = Math.max(0, gross - 75000);
    baseTax  = calcBaseTax(taxable, NEW_SLABS);
    if (taxable <= 1200000) baseTax = 0; // 87A rebate
  } else {
    const hraEx = rentPaid > 0
      ? Math.max(0, Math.min(hraRcvd, rentPaid - basic * 0.1, basic * (isMetro ? 0.5 : 0.4)))
      : 0;
    const totalDed = 50000 + Math.min(d80C, 150000) + Math.min(d80D, 100000) + hraEx + otherDed;
    taxable  = Math.max(0, gross - totalDed);
    baseTax  = calcBaseTax(taxable, OLD_SLABS);
    if (taxable <= 500000) baseTax = 0; // 87A rebate
  }
  const cess     = baseTax * 0.04;
  const total    = baseTax + cess;
  const effRate  = gross > 0 ? (total / gross * 100).toFixed(2) : '0.00';
  const breakup  = getSlabBreakup(taxable, regime === 'new' ? NEW_SLABS : OLD_SLABS);
  return { taxable, baseTax, cess, total, effRate, breakup, monthly: total / 12 };
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${value ? 'bg-brand-700' : 'bg-slate-200'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-0.5'}`} />
    </button>
  );
}

function RegimeComparison({ gross, basic, hraRcvd, isMetro, d80C, d80D, rentPaid, otherDed }) {
  const newTax = useMemo(() => {
    const t = Math.max(0, gross - 75000);
    let b = calcBaseTax(t, NEW_SLABS);
    if (t <= 1200000) b = 0;
    return b * 1.04;
  }, [gross]);

  const oldTax = useMemo(() => {
    const hraEx = rentPaid > 0 ? Math.max(0, Math.min(hraRcvd, rentPaid - basic * 0.1, basic * (isMetro ? 0.5 : 0.4))) : 0;
    const ded = 50000 + Math.min(d80C, 150000) + Math.min(d80D, 100000) + hraEx + otherDed;
    const t = Math.max(0, gross - ded);
    let b = calcBaseTax(t, OLD_SLABS);
    if (t <= 500000) b = 0;
    return b * 1.04;
  }, [gross, basic, hraRcvd, isMetro, d80C, d80D, rentPaid, otherDed]);

  const saving = oldTax - newTax;
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-3">
        {[{ label: 'New Regime', tax: newTax, better: saving >= 0 }, { label: 'Old Regime', tax: oldTax, better: saving < 0 }].map(r => (
          <div key={r.label} className={`rounded-xl border-2 p-4 text-center ${r.better ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-white'}`}>
            {r.better && <div className="text-xs text-green-700 font-bold mb-1">✓ Better for you</div>}
            <div className="text-sm font-semibold text-slate-600">{r.label}</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{fmt(r.tax)}</div>
            <div className="text-xs text-slate-400 mt-1">total tax / year</div>
          </div>
        ))}
      </div>
      {Math.abs(saving) > 100 && (
        <p className="text-center text-xs text-slate-500">
          {saving > 0
            ? `New Regime saves you ${fmt(saving)} per year`
            : `Old Regime saves you ${fmt(-saving)} per year`}
        </p>
      )}
    </div>
  );
}

export default function SalaryTaxCalculator() {
  // Mode
  const [mode, setMode]         = useState('ctc');

  // Salary inputs
  const [ctc, setCtc]           = useState(1200000);
  const [basicPct, setBasicPct] = useState(40);
  const [isMetro, setIsMetro]   = useState(true);
  const [pfInCtc, setPfInCtc]   = useState(true);
  const [profTax, setProfTax]   = useState(2400);

  // Tax inputs
  const [regime, setRegime]     = useState('new');
  const [manualIncome, setManualIncome] = useState(1200000);
  const [d80C, setD80C]         = useState(150000);
  const [d80D, setD80D]         = useState(25000);
  const [rentPaid, setRentPaid] = useState(0);
  const [otherDed, setOtherDed] = useState(0);

  // calc mirrors the inputs above but only updates 80ms after the user pauses
  // sliding/typing — this is the expensive page (salary breakdown + slab tax math).
  const [calc, setCalc] = useState({
    ctc: 1200000, basicPct: 40, isMetro: true, pfInCtc: true, profTax: 2400,
    regime: 'new', manualIncome: 1200000, d80C: 150000, d80D: 25000, rentPaid: 0, otherDed: 0,
  });
  const recalc = useRef(debounce(setCalc, 80)).current;
  const snapshot = (overrides) => ({
    ctc, basicPct, isMetro, pfInCtc, profTax, regime, manualIncome, d80C, d80D, rentPaid, otherDed, ...overrides,
  });

  // Salary calcs
  const sal = useMemo(() => {
    const basic    = calc.ctc * calc.basicPct / 100;
    const empPF    = basic * 0.12;
    const gratuity = basic * 0.0481;
    const gross    = calc.pfInCtc ? Math.max(0, calc.ctc - empPF - gratuity) : calc.ctc;
    const hra      = basic * (calc.isMetro ? 0.5 : 0.4);
    const special  = Math.max(0, gross - basic - hra);
    const eePF     = basic * 0.12;
    return { basic, empPF, gratuity, gross, hra, special, eePF };
  }, [calc.ctc, calc.basicPct, calc.isMetro, calc.pfInCtc]);

  const grossForTax = mode === 'ctc' ? sal.gross : calc.manualIncome;

  const tax = useMemo(() => computeTax({
    gross: grossForTax, regime: calc.regime,
    basic: sal.basic, hraRcvd: sal.hra, isMetro: calc.isMetro,
    d80C: calc.d80C, d80D: calc.d80D, rentPaid: calc.rentPaid, otherDed: calc.otherDed,
  }), [grossForTax, calc.regime, sal, calc.isMetro, calc.d80C, calc.d80D, calc.rentPaid, calc.otherDed]);

  const takeHome = useMemo(() => {
    if (mode !== 'ctc') return null;
    const net = sal.gross - sal.eePF - calc.profTax - tax.total;
    return { monthly: net / 12, annual: net };
  }, [sal, tax, calc.profTax, mode]);

  const ni = (val, set, key, max = 100000000) => ({
    type: 'text', inputMode: 'numeric', value: val === 0 ? '' : val,
    onChange: e => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      const v = raw === '' ? 0 : Math.min(max, parseInt(raw, 10) || 0);
      set(v);
      recalc(snapshot({ [key]: v }));
    },
    className: 'w-full border border-slate-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400',
  });

  return (
    <div className="tool-container">

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Salary &amp; Income Tax Calculator</h1>
      <p className="text-slate-500 mb-4 text-sm">Calculate your take-home salary and income tax for FY 2025-26 (AY 2026-27).</p>
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">📅 FY 2025-26 | AY 2026-27</span>
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">🎉 Budget 2025: Zero tax up to ₹12 Lakh (New Regime)</span>
      </div>


      {/* Mode toggle */}
      <div className="flex gap-3 mb-10">
        {[
          { id: 'ctc',    label: '💼 I know my CTC',          sub: 'Full salary breakdown + tax' },
          { id: 'income', label: '💰 I know my Gross Salary',  sub: 'Calculate income tax only'   },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm border-2 transition-all text-left ${mode === m.id ? 'bg-brand-700 text-white border-brand-700' : 'text-slate-600 border-slate-200 hover:border-brand-300'}`}>
            <div>{m.label}</div>
            <div className={`text-xs mt-0.5 font-normal ${mode === m.id ? 'text-blue-200' : 'text-slate-400'}`}>{m.sub}</div>
          </button>
        ))}
      </div>

      {/* ── SECTION 1: SALARY BREAKDOWN ── */}
      {mode === 'ctc' && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-brand-700 text-white text-xs font-black flex items-center justify-center">1</span>
            Salary Breakdown
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Inputs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Annual CTC</label>
                <input {...ni(ctc, setCtc, 'ctc')} />
                <input type="range" min="300000" max="10000000" step="50000" value={ctc} onChange={e => { const v = +e.target.value; setCtc(v); recalc(snapshot({ ctc: v })); }} className="mt-2 w-full" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>₹3L</span><span className="font-semibold text-slate-600">{fmt(ctc)}/yr</span><span>₹1Cr</span></div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Basic Salary — <span className="text-brand-700">{basicPct}% of CTC</span> <span className="text-slate-400 font-normal">({fmt(sal.basic)}/yr)</span>
                </label>
                <input type="range" min="30" max="60" step="5" value={basicPct} onChange={e => { const v = +e.target.value; setBasicPct(v); recalc(snapshot({ basicPct: v })); }} className="w-full" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>30%</span><span>60%</span></div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">City Type</p>
                  <p className="text-xs text-slate-400">Affects HRA &amp; exemption</p>
                </div>
                <div className="flex gap-1.5">
                  {['Metro', 'Non-metro'].map(c => (
                    <button key={c} onClick={() => { const v = c === 'Metro'; setIsMetro(v); setCalc(snapshot({ isMetro: v })); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${isMetro === (c === 'Metro') ? 'bg-brand-700 text-white border-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Employer PF included in CTC?</p>
                  <p className="text-xs text-slate-400">12% of Basic + Gratuity (4.81%) deducted from CTC</p>
                </div>
                <Toggle value={pfInCtc} onChange={v => { setPfInCtc(v); setCalc(snapshot({ pfInCtc: v })); }} />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Professional Tax (annual)</label>
                <input {...ni(profTax, setProfTax, 'profTax', 5000)} />
                <p className="text-xs text-slate-400 mt-1">₹2,400/yr in most states. Set to 0 if not applicable.</p>
              </div>
            </div>

            {/* Payslip output */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monthly Pay Slip</p>
                  <p className="text-xs text-slate-400">{fmt(sal.gross / 12)} gross/mo</p>
                </div>
                <div className="p-5 space-y-2 text-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Earnings</p>
                  {[['Basic Salary', sal.basic / 12], ['HRA', sal.hra / 12], ['Special Allowance', sal.special / 12]].map(([l, v]) => (
                    <div key={l} className="flex justify-between"><span className="text-slate-600">{l}</span><span className="font-medium">{fmt(v)}</span></div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-slate-100 pt-2 mt-2">
                    <span className="text-slate-700">Gross Monthly</span><span className="text-brand-700">{fmt(sal.gross / 12)}</span>
                  </div>

                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-4 mb-2">Deductions</p>
                  {[['Employee PF (12% of Basic)', sal.eePF / 12], ['Professional Tax', profTax / 12], ['TDS (Monthly)', tax.monthly]].map(([l, v]) => (
                    <div key={l} className="flex justify-between"><span className="text-slate-600">{l}</span><span className="font-medium text-red-500">− {fmt(v)}</span></div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-slate-100 pt-2 mt-2">
                    <span className="text-slate-700">Total Deductions</span>
                    <span className="text-red-500">− {fmt((sal.eePF + profTax + tax.total) / 12)}</span>
                  </div>
                </div>
              </div>

              <div className="result-card">
                <p className="text-blue-200 text-sm mb-1">Monthly In-Hand Salary</p>
                <p className="text-4xl font-black">{takeHome ? fmt(takeHome.monthly) : '—'}</p>
                <p className="text-blue-200 text-xs mt-2">Annual in-hand: {takeHome ? fmt(takeHome.annual) : '—'}</p>
              </div>

              {pfInCtc && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
                  <strong>CTC Note:</strong> Employer PF ({fmt(sal.empPF / 12)}/mo) and Gratuity ({fmt(sal.gratuity / 12)}/mo) are part of your CTC but not paid to you directly.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: INCOME TAX ── */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-brand-700 text-white text-xs font-black flex items-center justify-center">{mode === 'ctc' ? '2' : '1'}</span>
          Income Tax Calculator
          {mode === 'ctc' && <span className="text-xs text-slate-400 font-normal ml-1">(auto-filled from salary above)</span>}
        </h2>

        {mode === 'income' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Annual Gross Salary / Income</label>
            <input {...ni(manualIncome, setManualIncome, 'manualIncome')} />
            <input type="range" min="100000" max="10000000" step="10000" value={manualIncome} onChange={e => { const v = +e.target.value; setManualIncome(v); recalc(snapshot({ manualIncome: v })); }} className="mt-2 w-full" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>₹1L</span><span className="font-semibold text-slate-600">{fmt(manualIncome)}/yr</span><span>₹1Cr</span></div>
          </div>
        )}

        {mode === 'ctc' && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 flex justify-between items-center text-sm">
            <span className="text-blue-700">Using Gross Salary from above</span>
            <span className="font-bold text-blue-800">{fmt(sal.gross)}/yr</span>
          </div>
        )}

        {/* Regime toggle */}
        <div className="flex gap-3 mb-6">
          {[
            { id: 'new', label: '🆕 New Tax Regime', sub: 'FY 2025-26 · Zero tax up to ₹12L' },
            { id: 'old', label: '📋 Old Tax Regime',  sub: 'With deductions (80C, HRA, 80D…)'  },
          ].map(r => (
            <button key={r.id} onClick={() => { setRegime(r.id); setCalc(snapshot({ regime: r.id })); }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm border-2 transition-all text-left ${regime === r.id ? 'bg-brand-700 text-white border-brand-700' : 'text-slate-600 border-slate-200 hover:border-brand-300'}`}>
              <div>{r.label}</div>
              <div className={`text-xs mt-0.5 font-normal ${regime === r.id ? 'text-blue-200' : 'text-slate-400'}`}>{r.sub}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deductions panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{regime === 'new' ? 'Auto-Applied Deductions' : 'Your Deductions'}</p>
            </div>
            <div className="p-6 space-y-5">
              {regime === 'new' ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-600">Standard Deduction</span>
                    <span className="font-bold text-green-700">₹75,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-600">Taxable Income</span>
                    <span className="font-bold text-slate-800">{fmt(tax.taxable)}</span>
                  </div>
                  {tax.taxable <= 1200000 ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs text-green-800 leading-relaxed">
                      🎉 <strong>Section 87A Rebate applies!</strong><br />Taxable income ≤ ₹12 lakh — your income tax is <strong>₹0</strong>.
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                      No other deductions permitted under the New Regime.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-600">Standard Deduction (auto)</span>
                    <span className="font-bold text-green-700">₹50,000</span>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">80C Investments <span className="text-slate-400 font-normal">(max ₹1,50,000)</span></label>
                    <input {...ni(d80C, setD80C, 'd80C', 150000)} />
                    <p className="text-xs text-slate-400 mt-1">PF, PPF, ELSS, LIC, home loan principal, etc.</p>
                  </div>
                  {mode === 'ctc' && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1">Monthly Rent Paid <span className="text-slate-400 font-normal">(for HRA exemption)</span></label>
                      <input {...ni(rentPaid, setRentPaid, 'rentPaid', 200000)} />
                      <p className="text-xs text-slate-400 mt-1">Exemption = least of actual HRA, rent − 10% of basic, {isMetro ? '50' : '40'}% of basic.</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">80D — Health Insurance <span className="text-slate-400 font-normal">(max ₹25,000)</span></label>
                    <input {...ni(d80D, setD80D, 'd80D', 100000)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Other Deductions</label>
                    <input {...ni(otherDed, setOtherDed, 'otherDed')} />
                    <p className="text-xs text-slate-400 mt-1">NPS 80CCD(1B), 24(b) home loan interest, etc.</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 flex justify-between text-sm">
                    <span className="text-slate-600">Taxable Income</span>
                    <span className="font-bold text-slate-800">{fmt(tax.taxable)}</span>
                  </div>
                  {tax.taxable <= 500000 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">
                      🎉 <strong>87A Rebate applies!</strong> Taxable income ≤ ₹5 lakh — tax is <strong>₹0</strong>.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tax output */}
          <div className="space-y-4">
            <div className="result-card">
              <p className="text-blue-200 text-sm mb-1">Total Tax Payable</p>
              <p className="text-4xl font-black">{fmt(tax.total)}</p>
              <p className="text-blue-200 text-xs mt-2">Effective rate: {tax.effRate}% · Monthly TDS: {fmt(tax.monthly)}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Taxable Income', value: fmt(tax.taxable), color: 'text-slate-800'  },
                { label: 'Income Tax',     value: fmt(tax.baseTax), color: 'text-red-600'    },
                { label: 'Cess (4%)',      value: fmt(tax.cess),    color: 'text-orange-500' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-100 p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">{c.label}</p>
                  <p className={`font-bold text-sm ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>
            {tax.breakup.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">Tax Slab Breakup</p>
                <div className="space-y-2">
                  {tax.breakup.map(s => (
                    <div key={s.label} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">{s.label} <span className="text-slate-400">@ {s.rate}%</span></span>
                      <span className="font-semibold text-slate-800">{fmt(s.tax)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2 mt-2">
                    <span className="text-slate-600">Health &amp; Education Cess <span className="text-slate-400">@ 4%</span></span>
                    <span className="font-semibold text-slate-800">{fmt(tax.cess)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: REGIME COMPARISON ── */}
      {mode === 'ctc' && (
        <div className="mb-12 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-brand-700 text-white text-xs font-black flex items-center justify-center">3</span>
            New vs Old Regime — Which saves more?
          </h2>
          <RegimeComparison gross={sal.gross} basic={sal.basic} hraRcvd={sal.hra} isMetro={calc.isMetro} d80C={calc.d80C} d80D={calc.d80D} rentPaid={calc.rentPaid} otherDed={calc.otherDed} />
        </div>
      )}

      <CrossBrandCard pageSlug="income-tax-calculator" />
      {/* FAQ */}
      <section className="mt-4">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['What changed in the New Regime for FY 2025-26?', 'Budget 2025 overhauled the new regime: basic exemption raised to ₹4 lakh, new 25% slab added, and the 87A rebate now covers taxable income up to ₹12 lakh (was ₹7L). Anyone earning up to ₹12.75 lakh gross salary pays zero tax under the new regime after standard deduction.'],
            ['New Regime vs Old Regime — which is better?', 'For most salaried employees in FY 2025-26, the New Regime is better. The Old Regime only wins if your total deductions (80C + HRA + 80D + others) are very high. Use the comparison in Section 3 to see your specific savings.'],
            ['What is CTC and how does it differ from take-home?', 'CTC (Cost to Company) is the total annual amount your employer spends on you — including gross salary, employer PF (12% of basic), and gratuity (4.81% of basic). Your take-home is what actually hits your bank account after employee PF, professional tax, and TDS are deducted.'],
            ['What is the standard deduction for FY 2025-26?', '₹75,000 under the New Regime and ₹50,000 under the Old Regime. It is automatically applied to your gross salary before computing taxable income — no proof required.'],
            ['When is the last date to file ITR for FY 2025-26?', 'July 31, 2026 for salaried individuals (AY 2026-27) without audit requirement. Filing before this date avoids late fees under Section 234F.'],
          ].map(([q, a]) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center">
                {q}<span className="text-brand-600 text-lg flex-shrink-0 ml-3">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
}
