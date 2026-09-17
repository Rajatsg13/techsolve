'use client';
import { useState } from 'react';
import ToolShell from '../components/tool-ui/ToolShell';
import { TextField, CheckField } from '../components/tool-ui/Field';
import { ResultPanel, ResultRows, FormulaNote, CalculatorLayout } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { workingDays } from '../lib/calc';
import { formatNum } from '../lib/format';

const content = getToolContent('working-days-calculator');
const DAYS = [
  { d: 1, label: 'Mon' }, { d: 2, label: 'Tue' }, { d: 3, label: 'Wed' }, { d: 4, label: 'Thu' },
  { d: 5, label: 'Fri' }, { d: 6, label: 'Sat' }, { d: 0, label: 'Sun' },
];

export default function WorkingDaysCalculator() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [week, setWeek] = useState([1, 2, 3, 4, 5]);
  const [inclusive, setInclusive] = useState(true);
  const [holidayText, setHolidayText] = useState('');

  const holidays = holidayText.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  const badHolidays = holidays.filter(h => !/^\d{4}-\d{2}-\d{2}$/.test(h));
  const r = start && end ? workingDays(start, end, { workingWeekdays: week, holidays, inclusive }) : null;

  const toggleDay = (d) =>
    setWeek(w => (w.includes(d) ? w.filter(x => x !== d) : [...w, d].sort()));

  return (
    <ToolShell
      slug="working-days-calculator"
      title="Working Days Calculator"
      outcome="Count the working days between two dates, excluding weekends and any holidays you list."
      content={content}
    >
      <CalculatorLayout
        inputs={
          <>
            <TextField id="wd-start" label="Start date" type="date" value={start} onChange={setStart} />
            <TextField id="wd-end" label="End date" type="date" value={end} onChange={setEnd} />

            <div>
              <p className="text-sm font-semibold text-ink-800 mb-1.5">Working days of the week</p>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map(({ d, label }) => (
                  <button key={d} type="button" onClick={() => toggleDay(d)} aria-pressed={week.includes(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      week.includes(d) ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-ink-200 bg-white text-ink-500 hover:border-brand-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-400 mt-1.5">Tap to include or exclude. Defaults to Monday–Friday.</p>
            </div>

            <CheckField id="wd-incl" label="Count the end date itself" checked={inclusive} onChange={setInclusive}
              hint="On for leave requests and project spans; off when measuring a gap between two dates." />

            <div>
              <label htmlFor="wd-hol" className="block text-sm font-semibold text-ink-800 mb-1.5">
                Holidays to exclude (optional)
              </label>
              <textarea id="wd-hol" rows={3} value={holidayText} onChange={e => setHolidayText(e.target.value)}
                placeholder={'2026-08-15\n2026-10-02'}
                className="w-full border border-ink-200 rounded-xl px-3 py-2.5 text-sm font-mono bg-white
                           focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
              <p className="text-xs text-ink-400 mt-1">One date per line, as YYYY-MM-DD. A holiday on a non-working day is ignored.</p>
              {badHolidays.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Ignoring {badHolidays.length} entr{badHolidays.length === 1 ? 'y' : 'ies'} that {badHolidays.length === 1 ? 'is' : 'are'} not in YYYY-MM-DD form.
                </p>
              )}
            </div>
          </>
        }
        results={
          !start || !end ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
              Pick a start and end date.
            </div>
          ) : !r ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              One of those dates could not be read. Use the date pickers above.
            </div>
          ) : r.error === 'END_BEFORE_START' ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              <p className="font-semibold mb-1">The end date is before the start date.</p>
              <p>Swap them, or pick a later end date.</p>
            </div>
          ) : week.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              No working days are selected, so the count is zero. Choose at least one day of the week.
            </div>
          ) : (
            <>
              <ResultPanel label="Working days" value={formatNum(r.workingDays, 0)}
                sub={`Across ${formatNum(r.totalDays, 0)} calendar days${inclusive ? ', including the end date' : ', excluding the end date'}.`} />
              <ResultRows rows={[
                { label: 'Calendar days', value: formatNum(r.totalDays, 0) },
                { label: 'Working days', value: formatNum(r.workingDays, 0), strong: true },
                { label: 'Non-working days', value: formatNum(r.nonWorkingDays, 0), hint: 'Days of the week you excluded' },
                r.holidaysExcluded > 0 && { label: 'Holidays excluded', value: formatNum(r.holidaysExcluded, 0) },
              ]} />
              <FormulaNote>
                Every date in the range is checked against your working week, then any listed holiday falling on a
                working day is removed. Dates are handled in UTC so a daylight-saving change cannot shift the count.
              </FormulaNote>
            </>
          )
        }
      />
    </ToolShell>
  );
}
