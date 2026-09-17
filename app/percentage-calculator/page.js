'use client';
import { useState } from 'react';
import ToolShell from '../components/tool-ui/ToolShell';
import { NumberField, ModeTabs } from '../components/tool-ui/Field';
import { ResultPanel, ResultRows, FormulaNote, CalculatorLayout } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { percentOf, whatPercent, applyPercent } from '../lib/calc';
import { parseNum, formatNum } from '../lib/format';

const content = getToolContent('percentage-calculator');

const MODES = [
  { value: 'of', label: '% of a number' },
  { value: 'what', label: 'X is what % of Y' },
  { value: 'change', label: 'Add / remove %' },
];

export default function PercentageCalculator() {
  const [mode, setMode] = useState('of');
  const [a, setA] = useState('15');
  const [b, setB] = useState('200');
  const [direction, setDirection] = useState('add');

  const na = parseNum(a), nb = parseNum(b);
  let result = null, panel = null, rows = [], formula = null;

  if (mode === 'of') {
    result = percentOf(na, nb);
    panel = result === null ? null : formatNum(result);
    formula = `${formatNum(na ?? 0)} ÷ 100 × ${formatNum(nb ?? 0)}`;
    rows = result === null ? [] : [
      { label: 'Percentage', value: `${formatNum(na)}%` },
      { label: 'Of value', value: formatNum(nb) },
      { label: 'Result', value: formatNum(result), strong: true },
    ];
  } else if (mode === 'what') {
    result = whatPercent(na, nb);
    panel = result === null ? null : `${formatNum(result)}%`;
    formula = `${formatNum(na ?? 0)} ÷ ${formatNum(nb ?? 0)} × 100`;
    rows = result === null ? [] : [
      { label: 'Part', value: formatNum(na) },
      { label: 'Whole', value: formatNum(nb) },
      { label: 'Share', value: `${formatNum(result)}%`, strong: true },
    ];
  } else {
    result = applyPercent(nb, na, direction);
    panel = result === null ? null : formatNum(result);
    formula = direction === 'add'
      ? `${formatNum(nb ?? 0)} × (1 + ${formatNum(na ?? 0)} ÷ 100)`
      : `${formatNum(nb ?? 0)} × (1 − ${formatNum(na ?? 0)} ÷ 100)`;
    rows = result === null ? [] : [
      { label: 'Starting value', value: formatNum(nb) },
      { label: direction === 'add' ? 'Increase' : 'Decrease', value: `${formatNum(na)}%` },
      { label: 'Change', value: formatNum(Math.abs(result - nb)) },
      { label: 'Result', value: formatNum(result), strong: true },
    ];
  }

  const labels = {
    of: ['Percentage (%)', 'Of this number'],
    what: ['This number', 'Is what percent of'],
    change: ['Percentage (%)', 'Starting value'],
  }[mode];

  return (
    <ToolShell
      slug="percentage-calculator"
      title="Percentage Calculator"
      outcome="Work out a percentage of a value, what share one number is of another, or a value after adding or removing a percentage."
      content={content}
    >
      <CalculatorLayout
        inputs={
          <>
            <div>
              <p className="text-sm font-semibold text-ink-800 mb-1.5">What do you need?</p>
              <ModeTabs label="Calculation type" value={mode} onChange={setMode} options={MODES} />
            </div>
            <NumberField id="pc-a" label={labels[0]} value={a} onChange={setA}
              suffix={mode === 'what' ? undefined : '%'} />
            <NumberField id="pc-b" label={labels[1]} value={b} onChange={setB} />
            {mode === 'change' && (
              <div>
                <p className="text-sm font-semibold text-ink-800 mb-1.5">Direction</p>
                <ModeTabs label="Add or remove" value={direction} onChange={setDirection}
                  options={[{ value: 'add', label: 'Add' }, { value: 'remove', label: 'Remove' }]} />
              </div>
            )}
          </>
        }
        results={
          panel === null ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
              Enter both values to see the result.
              {mode === 'what' && nb === 0 && ' A total of zero has no percentage.'}
            </div>
          ) : (
            <>
              <ResultPanel label="Result" value={panel} />
              <ResultRows rows={rows} />
              <FormulaNote>{formula}</FormulaNote>
            </>
          )
        }
      />
    </ToolShell>
  );
}
