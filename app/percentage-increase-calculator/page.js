'use client';
import { useState } from 'react';
import ToolShell from '../components/tool-ui/ToolShell';
import { NumberField } from '../components/tool-ui/Field';
import { ResultPanel, ResultRows, FormulaNote, CalculatorLayout } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { percentChange } from '../lib/calc';
import { parseNum, formatNum } from '../lib/format';

const content = getToolContent('percentage-increase-calculator');

export default function PercentageIncreaseCalculator() {
  const [from, setFrom] = useState('80');
  const [to, setTo] = useState('100');

  const nf = parseNum(from), nt = parseNum(to);
  const r = percentChange(nf, nt);
  const undefinedFromZero = r && r.percentChange === null;

  return (
    <ToolShell
      slug="percentage-increase-calculator"
      title="Percentage Increase Calculator"
      outcome="Compare two numbers and get the percentage increase or decrease between them."
      content={content}
    >
      <CalculatorLayout
        inputs={
          <>
            <NumberField id="pi-from" label="Original value" value={from} onChange={setFrom}
              hint="Where it started — last month, last year, the old price." />
            <NumberField id="pi-to" label="New value" value={to} onChange={setTo}
              hint="Where it ended up." />
          </>
        }
        results={
          !r ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
              Enter both values to see the change.
            </div>
          ) : undefinedFromZero ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              <p className="font-semibold mb-1">Percentage change from zero is undefined.</p>
              <p className="leading-relaxed">
                Going from 0 to {formatNum(nt)} is an increase of {formatNum(r.difference)} in absolute
                terms, but there is no meaningful percentage — any increase from nothing is infinite.
                Report the absolute change instead.
              </p>
            </div>
          ) : (
            <>
              <ResultPanel
                label={r.direction === 'decrease' ? 'Decrease' : r.direction === 'increase' ? 'Increase' : 'No change'}
                value={`${r.percentChange > 0 ? '+' : ''}${formatNum(r.percentChange)}%`}
                sub={r.direction === 'unchanged'
                  ? 'The two values are the same.'
                  : `${formatNum(nf)} → ${formatNum(nt)} is a ${r.direction} of ${formatNum(Math.abs(r.difference))}.`}
                tone={r.direction === 'decrease' ? 'ink' : 'brand'}
              />
              <ResultRows rows={[
                { label: 'Original', value: formatNum(nf) },
                { label: 'New', value: formatNum(nt) },
                { label: 'Absolute change', value: `${r.difference > 0 ? '+' : ''}${formatNum(r.difference)}` },
                { label: 'Percentage change', value: `${r.percentChange > 0 ? '+' : ''}${formatNum(r.percentChange)}%`, strong: true },
              ]} />
              <FormulaNote>
                (New − Original) ÷ |Original| × 100 = ({formatNum(nt)} − {formatNum(nf)}) ÷ {formatNum(Math.abs(nf))} × 100
              </FormulaNote>
            </>
          )
        }
      />
    </ToolShell>
  );
}
