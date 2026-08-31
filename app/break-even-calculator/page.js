'use client';
import { useState } from 'react';
import ToolShell from '../components/tool-ui/ToolShell';
import { NumberField } from '../components/tool-ui/Field';
import { ResultPanel, ResultRows, FormulaNote, CalculatorLayout } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { breakEven, unitsForTargetProfit } from '../lib/calc';
import { parseNum, formatINR, formatNum } from '../lib/format';

const content = getToolContent('break-even-calculator');

export default function BreakEvenCalculator() {
  const [fixed, setFixed] = useState('200000');
  const [price, setPrice] = useState('1500');
  const [variable, setVariable] = useState('900');
  const [target, setTarget] = useState('');

  const f = parseNum(fixed), p = parseNum(price), v = parseNum(variable), t = parseNum(target);
  const r = breakEven(f, p, v);
  const targetUnits = t !== null ? unitsForTargetProfit(f, p, v, t) : null;

  return (
    <ToolShell
      slug="break-even-calculator"
      title="Break-even Calculator"
      outcome="Find how many units you need to sell before a product or venture starts making money."
      content={content}
    >
      <CalculatorLayout
        inputs={
          <>
            <NumberField id="be-fixed" label="Fixed costs" value={fixed} onChange={setFixed} prefix="₹"
              hint="Costs that do not change with volume — rent, salaries, software, insurance." />
            <NumberField id="be-price" label="Selling price per unit" value={price} onChange={setPrice} prefix="₹" />
            <NumberField id="be-var" label="Variable cost per unit" value={variable} onChange={setVariable} prefix="₹"
              hint="Costs incurred per sale — materials, packaging, payment fees, shipping." />
            <NumberField id="be-target" label="Target profit (optional)" value={target} onChange={setTarget} prefix="₹"
              hint="Leave blank to see break-even only." />
          </>
        }
        results={
          !r ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
              Enter fixed costs, price and variable cost.
            </div>
          ) : !r.viable ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              <p className="font-semibold mb-1">This never breaks even.</p>
              <p className="leading-relaxed">
                Each unit sells for {formatINR(p)} but costs {formatINR(v)} to produce, so every sale
                {r.contributionPerUnit === 0 ? ' contributes nothing towards' : ' loses money before touching'} the
                fixed costs. Volume cannot fix this — the price or the variable cost has to change first.
              </p>
            </div>
          ) : (
            <>
              <ResultPanel label="Break-even point"
                value={`${formatNum(r.breakEvenUnits, 0)} units`}
                sub={`That is ${formatINR(r.breakEvenRevenue)} of revenue before you make a rupee of profit.`} />
              <ResultRows rows={[
                { label: 'Contribution per unit', value: formatINR(r.contributionPerUnit),
                  hint: 'Price minus variable cost' },
                { label: 'Contribution margin', value: `${formatNum(r.contributionMarginPercent)}%` },
                { label: 'Break-even units', value: formatNum(r.breakEvenUnits, 0), strong: true },
                { label: 'Break-even revenue', value: formatINR(r.breakEvenRevenue), strong: true },
                targetUnits !== null && { label: `Units for ${formatINR(t)} profit`, value: formatNum(targetUnits, 0), strong: true },
              ]} />
              <FormulaNote>
                Break-even units = Fixed costs ÷ (Price − Variable cost) = {formatINR(f)} ÷ {formatINR(r.contributionPerUnit)}
              </FormulaNote>
            </>
          )
        }
      />
    </ToolShell>
  );
}
