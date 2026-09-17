'use client';
import { useState } from 'react';
import ToolShell from '../components/tool-ui/ToolShell';
import { NumberField, ModeTabs } from '../components/tool-ui/Field';
import { ResultPanel, ResultRows, FormulaNote, CalculatorLayout } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { profitMargin, priceForMargin } from '../lib/calc';
import { parseNum, formatINR, formatNum } from '../lib/format';

const content = getToolContent('profit-margin-calculator');

export default function ProfitMarginCalculator() {
  const [mode, setMode] = useState('from-price');
  const [cost, setCost] = useState('600');
  const [revenue, setRevenue] = useState('1000');
  const [target, setTarget] = useState('40');

  const c = parseNum(cost), rv = parseNum(revenue), t = parseNum(target);
  const r = mode === 'from-price' ? profitMargin(c, rv) : null;
  const neededPrice = mode === 'target' ? priceForMargin(c, t) : null;
  const atTarget = neededPrice !== null ? profitMargin(c, neededPrice) : null;

  return (
    <ToolShell
      slug="profit-margin-calculator"
      title="Profit Margin Calculator"
      outcome="Find the margin and markup on a sale, or the price you need to charge to hit a target margin."
      content={content}
    >
      <CalculatorLayout
        inputs={
          <>
            <div>
              <p className="text-sm font-semibold text-ink-800 mb-1.5">What do you know?</p>
              <ModeTabs label="Calculation type" value={mode} onChange={setMode} options={[
                { value: 'from-price', label: 'Cost and price' },
                { value: 'target', label: 'Cost and target margin' },
              ]} />
            </div>
            <NumberField id="pm-cost" label="Cost per unit" value={cost} onChange={setCost} prefix="₹"
              hint="What it costs you to make or buy." />
            {mode === 'from-price'
              ? <NumberField id="pm-rev" label="Selling price" value={revenue} onChange={setRevenue} prefix="₹" />
              : <NumberField id="pm-target" label="Target margin" value={target} onChange={setTarget} suffix="%"
                  hint="Margin is measured against the selling price, so it must be below 100%." />}
          </>
        }
        results={
          mode === 'from-price' ? (
            !r ? <Empty /> : (
              <>
                <ResultPanel label="Profit margin"
                  value={r.marginPercent === null ? '—' : `${formatNum(r.marginPercent)}%`}
                  sub={r.marginPercent === null
                    ? 'A selling price of zero has no margin.'
                    : `${formatINR(r.profit)} profit on a ${formatINR(rv)} sale.`}
                  tone={r.profit < 0 ? 'ink' : 'brand'} />
                <ResultRows rows={[
                  { label: 'Cost', value: formatINR(c) },
                  { label: 'Selling price', value: formatINR(rv) },
                  { label: r.profit < 0 ? 'Loss' : 'Profit', value: formatINR(r.profit), strong: true },
                  { label: 'Margin', value: r.marginPercent === null ? '—' : `${formatNum(r.marginPercent)}%`,
                    hint: 'Profit as a share of the selling price', strong: true },
                  { label: 'Markup', value: r.markupPercent === null ? '—' : `${formatNum(r.markupPercent)}%`,
                    hint: 'Profit as a share of the cost' },
                ]} />
                <FormulaNote>
                  Margin = (Price − Cost) ÷ Price × 100. Markup = (Price − Cost) ÷ Cost × 100.
                  They are not the same number, and mixing them up is how prices end up too low.
                </FormulaNote>
              </>
            )
          ) : (
            neededPrice === null ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                {t !== null && t >= 100
                  ? 'A margin of 100% or more is impossible — the price would have to be infinite.'
                  : 'Enter a cost and a target margin below 100%.'}
              </div>
            ) : (
              <>
                <ResultPanel label="Price you need to charge" value={formatINR(neededPrice)}
                  sub={`Gives a ${formatNum(t)}% margin on a ${formatINR(c)} cost.`} />
                <ResultRows rows={[
                  { label: 'Cost', value: formatINR(c) },
                  { label: 'Required price', value: formatINR(neededPrice), strong: true },
                  { label: 'Profit per unit', value: formatINR(atTarget.profit) },
                  { label: 'Equivalent markup', value: `${formatNum(atTarget.markupPercent)}%` },
                ]} />
                <FormulaNote>Price = Cost ÷ (1 − Margin ÷ 100) = {formatINR(c)} ÷ (1 − {formatNum(t)} ÷ 100)</FormulaNote>
              </>
            )
          )
        }
      />
    </ToolShell>
  );
}

const Empty = () => (
  <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
    Enter a cost and a selling price.
  </div>
);
