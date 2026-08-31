/**
 * Business & Work calculations.
 *
 * Deliberately pure: no React, no DOM, no formatting. Every function takes
 * numbers and returns numbers, which means the formulas can be unit-tested
 * directly (test-harness/tests/calc-unit.spec.js) rather than only through the
 * UI. If a number on a tool page is ever wrong, the bug is either here or in the
 * binding — and this file is the half that can be proved.
 *
 * Callers pass validated numbers; these functions return null when the inputs
 * cannot produce a meaningful answer (division by zero, negative denominators)
 * rather than Infinity or NaN.
 */

const ok = (...v) => v.every(x => typeof x === 'number' && Number.isFinite(x));

/* ── Percentage ─────────────────────────────────────────────────────────── */

/** What is P% of X. */
export function percentOf(percent, value) {
  if (!ok(percent, value)) return null;
  return (percent / 100) * value;
}

/** X is what percent of Y. */
export function whatPercent(part, whole) {
  if (!ok(part, whole) || whole === 0) return null;
  return (part / whole) * 100;
}

/** Add or remove P% from a value. */
export function applyPercent(value, percent, direction = 'add') {
  if (!ok(value, percent)) return null;
  return direction === 'remove' ? value * (1 - percent / 100) : value * (1 + percent / 100);
}

/* ── Percentage increase / decrease ─────────────────────────────────────── */

/**
 * Change from `from` to `to`.
 * Returns { difference, percentChange, direction }.
 * percentChange is null when `from` is 0 — percentage change from zero is
 * undefined, and reporting "infinite growth" would be nonsense.
 */
export function percentChange(from, to) {
  if (!ok(from, to)) return null;
  const difference = to - from;
  const percent = from === 0 ? null : (difference / Math.abs(from)) * 100;
  return {
    difference,
    percentChange: percent,
    direction: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'unchanged',
  };
}

/* ── GST ────────────────────────────────────────────────────────────────── */

/**
 * Indian GST, both directions.
 *
 * mode 'add'    — `amount` excludes GST; add it on.
 * mode 'remove' — `amount` already includes GST; work backwards to the base.
 *
 * CGST/SGST apply to supply within a state and are half the rate each; IGST
 * applies to inter-state supply and carries the whole rate. Which one applies is
 * a matter of where buyer and seller are, not something this tool can infer, so
 * both splits are returned and the page shows them side by side.
 */
export function gst(amount, ratePercent, mode = 'add') {
  if (!ok(amount, ratePercent) || ratePercent < 0) return null;
  let base, tax;
  if (mode === 'remove') {
    base = amount / (1 + ratePercent / 100);
    tax = amount - base;
  } else {
    base = amount;
    tax = amount * (ratePercent / 100);
  }
  return {
    base,
    tax,
    total: base + tax,
    cgst: tax / 2,
    sgst: tax / 2,
    igst: tax,
  };
}

/* ── Profit margin ──────────────────────────────────────────────────────── */

/**
 * Margin and markup from cost and revenue.
 *
 * These two get confused constantly and the difference is money: margin is
 * profit over *revenue*, markup is profit over *cost*. A 50% markup is a 33.3%
 * margin. Both are returned so the page can show them together.
 */
export function profitMargin(cost, revenue) {
  if (!ok(cost, revenue)) return null;
  const profit = revenue - cost;
  return {
    profit,
    marginPercent: revenue === 0 ? null : (profit / revenue) * 100,
    markupPercent: cost === 0 ? null : (profit / cost) * 100,
  };
}

/** Selling price needed to hit a target margin on a given cost. */
export function priceForMargin(cost, targetMarginPercent) {
  if (!ok(cost, targetMarginPercent) || targetMarginPercent >= 100) return null;
  return cost / (1 - targetMarginPercent / 100);
}

/* ── Break-even ─────────────────────────────────────────────────────────── */

/**
 * Break-even in units and revenue.
 * Contribution per unit is price minus variable cost; if that is zero or
 * negative the business never breaks even at any volume, so units is null.
 */
export function breakEven(fixedCosts, pricePerUnit, variableCostPerUnit) {
  if (!ok(fixedCosts, pricePerUnit, variableCostPerUnit)) return null;
  const contribution = pricePerUnit - variableCostPerUnit;
  const viable = contribution > 0;
  return {
    contributionPerUnit: contribution,
    contributionMarginPercent: pricePerUnit === 0 ? null : (contribution / pricePerUnit) * 100,
    breakEvenUnits: viable ? fixedCosts / contribution : null,
    breakEvenRevenue: viable ? (fixedCosts / contribution) * pricePerUnit : null,
    viable,
  };
}

/** Units needed to reach a target profit. */
export function unitsForTargetProfit(fixedCosts, pricePerUnit, variableCostPerUnit, targetProfit) {
  if (!ok(fixedCosts, pricePerUnit, variableCostPerUnit, targetProfit)) return null;
  const contribution = pricePerUnit - variableCostPerUnit;
  if (contribution <= 0) return null;
  return (fixedCosts + targetProfit) / contribution;
}

/* ── ROI ────────────────────────────────────────────────────────────────── */

/**
 * Return on investment.
 * When a holding period is supplied, also returns the annualised rate so that
 * returns over different durations can be compared honestly — a 40% return over
 * five years is not comparable to 40% in one.
 */
export function roi(initialInvestment, finalValue, years = null) {
  if (!ok(initialInvestment, finalValue) || initialInvestment === 0) return null;
  const gain = finalValue - initialInvestment;
  const roiPercent = (gain / initialInvestment) * 100;
  let annualisedPercent = null;
  if (years !== null && Number.isFinite(years) && years > 0 && initialInvestment > 0 && finalValue > 0) {
    annualisedPercent = (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100;
  }
  return { gain, roiPercent, annualisedPercent };
}

/* ── Salary hike ────────────────────────────────────────────────────────── */

/** New salary after a percentage hike. */
export function salaryAfterHike(current, hikePercent) {
  if (!ok(current, hikePercent)) return null;
  const increase = current * (hikePercent / 100);
  return { increase, newSalary: current + increase, monthlyIncrease: increase / 12 };
}

/** The hike percentage implied by moving from one salary to another. */
export function hikeBetween(current, offered) {
  if (!ok(current, offered) || current === 0) return null;
  const increase = offered - current;
  return {
    increase,
    hikePercent: (increase / current) * 100,
    monthlyIncrease: increase / 12,
  };
}

/* ── Working days ───────────────────────────────────────────────────────── */

/**
 * Count days between two dates.
 *
 * @param {string} startISO  yyyy-mm-dd
 * @param {string} endISO    yyyy-mm-dd
 * @param {object} opts
 * @param {number[]} opts.workingWeekdays  0=Sun … 6=Sat. Default Mon–Fri.
 * @param {string[]} opts.holidays         yyyy-mm-dd dates to exclude
 * @param {boolean}  opts.inclusive        count the end date itself (default true)
 *
 * Dates are parsed as UTC midnight deliberately. Constructing them in local time
 * makes the count shift by a day either side of a DST boundary.
 */
export function workingDays(startISO, endISO, {
  workingWeekdays = [1, 2, 3, 4, 5], holidays = [], inclusive = true,
} = {}) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (!start || !end) return null;
  if (end < start) return { error: 'END_BEFORE_START' };

  const holidaySet = new Set(holidays.filter(Boolean));
  const workingSet = new Set(workingWeekdays);

  let totalDays = 0, working = 0, weekendOrOff = 0, holidaysCounted = 0;
  const last = new Date(end);
  if (!inclusive) last.setUTCDate(last.getUTCDate() - 1);

  for (let d = new Date(start); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    totalDays++;
    const iso = d.toISOString().slice(0, 10);
    if (!workingSet.has(d.getUTCDay())) { weekendOrOff++; continue; }
    if (holidaySet.has(iso)) { holidaysCounted++; continue; }
    working++;
  }

  return { totalDays, workingDays: working, nonWorkingDays: weekendOrOff, holidaysExcluded: holidaysCounted };
}

/** yyyy-mm-dd -> Date at UTC midnight, or null when unparseable. */
export function parseISODate(iso) {
  if (typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (Number.isNaN(d.getTime())) return null;
  // Reject calendar-invalid dates like 2026-02-30, which Date would roll over.
  if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return d;
}
