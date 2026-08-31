'use client';
import { useState } from 'react';
import ToolShell, { ToolNotice } from '../components/tool-ui/ToolShell';
import { NumberField, ModeTabs } from '../components/tool-ui/Field';
import { ResultPanel, ResultRows, FormulaNote, CalculatorLayout } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { gst } from '../lib/calc';
import { parseNum, formatINR } from '../lib/format';

const content = getToolContent('gst-calculator');
const RATES = [5, 12, 18, 28];

export default function GstCalculator() {
  const [amount, setAmount] = useState('10000');
  const [rate, setRate] = useState('18');
  const [mode, setMode] = useState('add');

  const amt = parseNum(amount), rt = parseNum(rate);
  const r = gst(amt, rt, mode);

  return (
    <ToolShell
      slug="gst-calculator"
      title="GST Calculator"
      outcome="Add GST to a price, or work backwards from a GST-inclusive amount to the base value and tax."
      notice={<ToolNotice>This calculates the arithmetic only. Which rate applies to your goods or services, and whether the supply is intra-state or inter-state, is a matter for your accountant — this is not tax advice.</ToolNotice>}
      content={content}
    >
      <CalculatorLayout
        inputs={
          <>
            <div>
              <p className="text-sm font-semibold text-ink-800 mb-1.5">What is your amount?</p>
              <ModeTabs label="GST direction" value={mode} onChange={setMode} options={[
                { value: 'add', label: 'Excluding GST' },
                { value: 'remove', label: 'Including GST' },
              ]} />
              <p className="text-xs text-ink-400 mt-1.5">
                {mode === 'add'
                  ? 'GST will be added on top of the amount you enter.'
                  : 'The amount you enter already contains GST; it will be worked backwards.'}
              </p>
            </div>
            <NumberField id="gst-amount" label={mode === 'add' ? 'Amount before GST' : 'Amount including GST'}
              value={amount} onChange={setAmount} prefix="₹" min={0} />
            <div>
              <label htmlFor="gst-rate" className="block text-sm font-semibold text-ink-800 mb-1.5">GST rate</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {RATES.map(x => (
                  <button key={x} type="button" onClick={() => setRate(String(x))}
                    aria-pressed={String(x) === rate}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                      String(x) === rate ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300'}`}>
                    {x}%
                  </button>
                ))}
              </div>
              <NumberField id="gst-rate" label="Or enter a rate" value={rate} onChange={setRate} suffix="%" min={0} />
            </div>
          </>
        }
        results={
          !r ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
              Enter an amount and a rate.
            </div>
          ) : (
            <>
              <ResultPanel label="Total including GST" value={formatINR(r.total)}
                sub={`${formatINR(r.base)} base + ${formatINR(r.tax)} GST at ${rt}%`} />
              <ResultRows rows={[
                { label: 'Base amount', value: formatINR(r.base), hint: 'Taxable value' },
                { label: `GST at ${rt}%`, value: formatINR(r.tax), strong: true },
                { label: 'Total', value: formatINR(r.total), strong: true },
              ]} />
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-ink-100 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500 mb-2">Within a state</p>
                  <ResultRows rows={[
                    { label: `CGST ${rt / 2}%`, value: formatINR(r.cgst) },
                    { label: `SGST ${rt / 2}%`, value: formatINR(r.sgst) },
                  ]} />
                </div>
                <div className="rounded-2xl border border-ink-100 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500 mb-2">Between states</p>
                  <ResultRows rows={[{ label: `IGST ${rt}%`, value: formatINR(r.igst) }]} />
                </div>
              </div>
              <FormulaNote>
                {mode === 'add'
                  ? `GST = ${formatINR(r.base)} × ${rt} ÷ 100`
                  : `Base = ${formatINR(r.total)} ÷ (1 + ${rt} ÷ 100), then GST = total − base`}
              </FormulaNote>
            </>
          )
        }
      />
    </ToolShell>
  );
}
