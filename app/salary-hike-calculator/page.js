'use client';
import { useState } from 'react';
import ToolShell from '../components/tool-ui/ToolShell';
import { NumberField, ModeTabs } from '../components/tool-ui/Field';
import { ResultPanel, ResultRows, FormulaNote, CalculatorLayout } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { salaryAfterHike, hikeBetween } from '../lib/calc';
import { parseNum, formatINR, formatNum } from '../lib/format';

const content = getToolContent('salary-hike-calculator');

export default function SalaryHikeCalculator() {
  const [mode, setMode] = useState('percent');
  const [current, setCurrent] = useState('600000');
  const [hike, setHike] = useState('12');
  const [offered, setOffered] = useState('750000');

  const c = parseNum(current), h = parseNum(hike), o = parseNum(offered);
  const byPercent = mode === 'percent' ? salaryAfterHike(c, h) : null;
  const byAmount = mode === 'amount' ? hikeBetween(c, o) : null;

  return (
    <ToolShell
      slug="salary-hike-calculator"
      title="Salary Hike Calculator"
      outcome="Turn a percentage hike into a real number, or work out the percentage an offer actually represents."
      content={content}
    >
      <CalculatorLayout
        inputs={
          <>
            <div>
              <p className="text-sm font-semibold text-ink-800 mb-1.5">What do you know?</p>
              <ModeTabs label="Calculation type" value={mode} onChange={setMode} options={[
                { value: 'percent', label: 'The hike %' },
                { value: 'amount', label: 'The new salary' },
              ]} />
            </div>
            <NumberField id="sh-current" label="Current salary (annual)" value={current} onChange={setCurrent} prefix="₹" />
            {mode === 'percent'
              ? <NumberField id="sh-hike" label="Hike offered" value={hike} onChange={setHike} suffix="%" />
              : <NumberField id="sh-offered" label="New salary offered (annual)" value={offered} onChange={setOffered} prefix="₹" />}
          </>
        }
        results={
          mode === 'percent' ? (
            !byPercent ? <Empty /> : (
              <>
                <ResultPanel label="New annual salary" value={formatINR(byPercent.newSalary, 0)}
                  sub={`An increase of ${formatINR(byPercent.increase, 0)} a year.`} />
                <ResultRows rows={[
                  { label: 'Current', value: formatINR(c, 0) },
                  { label: `Hike at ${formatNum(h)}%`, value: formatINR(byPercent.increase, 0) },
                  { label: 'New salary', value: formatINR(byPercent.newSalary, 0), strong: true },
                  { label: 'Extra per month', value: formatINR(byPercent.monthlyIncrease, 0), strong: true },
                ]} />
                <FormulaNote>New = Current × (1 + Hike ÷ 100). Monthly figures are the annual difference ÷ 12, before tax and deductions.</FormulaNote>
              </>
            )
          ) : (
            !byAmount ? <Empty /> : (
              <>
                <ResultPanel label="That is a hike of"
                  value={`${byAmount.hikePercent > 0 ? '+' : ''}${formatNum(byAmount.hikePercent)}%`}
                  sub={byAmount.increase >= 0
                    ? `${formatINR(byAmount.increase, 0)} more a year, or ${formatINR(byAmount.monthlyIncrease, 0)} a month.`
                    : `${formatINR(Math.abs(byAmount.increase), 0)} less a year — this offer is a pay cut.`}
                  tone={byAmount.increase < 0 ? 'ink' : 'brand'} />
                <ResultRows rows={[
                  { label: 'Current', value: formatINR(c, 0) },
                  { label: 'Offered', value: formatINR(o, 0) },
                  { label: 'Difference', value: formatINR(byAmount.increase, 0), strong: true },
                  { label: 'Hike', value: `${formatNum(byAmount.hikePercent)}%`, strong: true },
                ]} />
                <FormulaNote>Hike = (Offered − Current) ÷ Current × 100</FormulaNote>
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
    Enter your current salary and the figure you are comparing it with.
  </div>
);
