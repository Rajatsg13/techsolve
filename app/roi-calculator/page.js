'use client';
import { useState } from 'react';
import ToolShell, { ToolNotice } from '../components/tool-ui/ToolShell';
import { NumberField } from '../components/tool-ui/Field';
import { ResultPanel, ResultRows, FormulaNote, CalculatorLayout } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { roi } from '../lib/calc';
import { parseNum, formatINR, formatNum } from '../lib/format';

const content = getToolContent('roi-calculator');

export default function RoiCalculator() {
  const [invested, setInvested] = useState('250000');
  const [returned, setReturned] = useState('340000');
  const [years, setYears] = useState('2');

  const i = parseNum(invested), f = parseNum(returned), y = parseNum(years);
  const r = roi(i, f, y);

  return (
    <ToolShell
      slug="roi-calculator"
      title="ROI Calculator"
      outcome="Measure the return on a business spend — a campaign, a hire, a piece of equipment — and see it annualised."
      notice={<ToolNotice>This measures a return you have already defined. It is arithmetic for business decisions, not investment advice.</ToolNotice>}
      content={content}
    >
      <CalculatorLayout
        inputs={
          <>
            <NumberField id="roi-in" label="Amount invested" value={invested} onChange={setInvested} prefix="₹"
              hint="Total cost, including setup and time if you can price it." />
            <NumberField id="roi-out" label="Value returned" value={returned} onChange={setReturned} prefix="₹"
              hint="Revenue, savings or value attributable to the spend." />
            <NumberField id="roi-years" label="Over how long (years, optional)" value={years} onChange={setYears}
              suffix="yrs" hint="Add this to compare against returns over different periods." min={0} />
          </>
        }
        results={
          !r ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
              Enter the amount invested and the value returned. The investment cannot be zero.
            </div>
          ) : (
            <>
              <ResultPanel label="Return on investment"
                value={`${r.roiPercent > 0 ? '+' : ''}${formatNum(r.roiPercent)}%`}
                sub={r.gain >= 0
                  ? `A gain of ${formatINR(r.gain)} on ${formatINR(i)} invested.`
                  : `A loss of ${formatINR(Math.abs(r.gain))} on ${formatINR(i)} invested.`}
                tone={r.gain < 0 ? 'ink' : 'brand'} />
              <ResultRows rows={[
                { label: 'Invested', value: formatINR(i) },
                { label: 'Returned', value: formatINR(f) },
                { label: r.gain < 0 ? 'Net loss' : 'Net gain', value: formatINR(r.gain), strong: true },
                { label: 'ROI', value: `${formatNum(r.roiPercent)}%`, strong: true },
                r.annualisedPercent !== null && {
                  label: 'Annualised return', value: `${formatNum(r.annualisedPercent)}%`,
                  hint: `Compound rate per year over ${formatNum(y, 0)} years`, strong: true,
                },
              ]} />
              <FormulaNote>
                ROI = (Returned − Invested) ÷ Invested × 100.
                {r.annualisedPercent !== null && ' Annualised = (Returned ÷ Invested)^(1 ÷ years) − 1, which is what makes returns over different periods comparable.'}
              </FormulaNote>
            </>
          )
        }
      />
    </ToolShell>
  );
}
