// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Unit tests for the Business & Work formulas.
 * Tag: @unit
 *
 * These import app/lib/calc.js directly and run in Node — no browser, no dev
 * server. The point is to verify the arithmetic independently of the UI, with
 * expected values worked out by hand rather than read off the implementation.
 */

let calc;
test.beforeAll(async () => {
  calc = await import('../../app/lib/calc.js');
});

const near = (a, b, tol = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(tol);

test.describe('@unit percentage', () => {
  test('percentOf: 15% of 200 = 30', () => near(calc.percentOf(15, 200), 30));
  test('percentOf handles zero percent', () => near(calc.percentOf(0, 200), 0));
  test('whatPercent: 30 of 200 = 15%', () => near(calc.whatPercent(30, 200), 15));
  test('whatPercent guards divide-by-zero', () => expect(calc.whatPercent(30, 0)).toBeNull());
  test('applyPercent add: 200 +15% = 230', () => near(calc.applyPercent(200, 15, 'add'), 230));
  test('applyPercent remove: 200 -15% = 170', () => near(calc.applyPercent(200, 15, 'remove'), 170));
  test('invalid input returns null', () => expect(calc.percentOf(NaN, 10)).toBeNull());
});

test.describe('@unit percentage change', () => {
  test('80 -> 100 is +25%', () => {
    const r = calc.percentChange(80, 100);
    near(r.percentChange, 25); expect(r.direction).toBe('increase'); near(r.difference, 20);
  });
  test('100 -> 80 is -20%', () => {
    const r = calc.percentChange(100, 80);
    near(r.percentChange, -20); expect(r.direction).toBe('decrease');
  });
  test('unchanged is reported as such', () => {
    expect(calc.percentChange(50, 50).direction).toBe('unchanged');
  });
  test('change from zero is undefined, not infinite', () => {
    expect(calc.percentChange(0, 100).percentChange).toBeNull();
  });
  test('negative start uses magnitude: -50 -> -25 is +50%', () => {
    near(calc.percentChange(-50, -25).percentChange, 50);
  });
});

test.describe('@unit GST', () => {
  test('add 18% to 1000', () => {
    const r = calc.gst(1000, 18, 'add');
    near(r.base, 1000); near(r.tax, 180); near(r.total, 1180);
    near(r.cgst, 90); near(r.sgst, 90); near(r.igst, 180);
  });
  test('remove 18% from an inclusive 1180', () => {
    const r = calc.gst(1180, 18, 'remove');
    near(r.base, 1000); near(r.tax, 180); near(r.total, 1180);
  });
  test('add then remove round-trips', () => {
    const added = calc.gst(2499, 12, 'add');
    const removed = calc.gst(added.total, 12, 'remove');
    near(removed.base, 2499, 1e-9);
  });
  test('zero rate is a no-op', () => {
    const r = calc.gst(500, 0, 'add');
    near(r.tax, 0); near(r.total, 500);
  });
  test('negative rate rejected', () => expect(calc.gst(500, -5, 'add')).toBeNull());
});

test.describe('@unit profit margin', () => {
  test('cost 60, revenue 100 -> 40% margin, 66.67% markup', () => {
    const r = calc.profitMargin(60, 100);
    near(r.profit, 40); near(r.marginPercent, 40); near(r.markupPercent, 66.6666667, 1e-4);
  });
  test('a loss reports negative margin', () => {
    const r = calc.profitMargin(120, 100);
    near(r.profit, -20); near(r.marginPercent, -20);
  });
  test('zero revenue does not divide by zero', () => {
    expect(calc.profitMargin(50, 0).marginPercent).toBeNull();
  });
  test('priceForMargin: cost 60 at 40% margin -> 100', () => {
    near(calc.priceForMargin(60, 40), 100);
  });
  test('a 100% margin is impossible', () => expect(calc.priceForMargin(60, 100)).toBeNull());
  test('markup and margin round-trip', () => {
    const price = calc.priceForMargin(60, 40);
    near(calc.profitMargin(60, price).marginPercent, 40);
  });
});

test.describe('@unit break-even', () => {
  test('fixed 10000, price 50, variable 30 -> 500 units / 25000 revenue', () => {
    const r = calc.breakEven(10000, 50, 30);
    near(r.contributionPerUnit, 20); near(r.breakEvenUnits, 500);
    near(r.breakEvenRevenue, 25000); near(r.contributionMarginPercent, 40);
    expect(r.viable).toBe(true);
  });
  test('selling below variable cost never breaks even', () => {
    const r = calc.breakEven(10000, 20, 30);
    expect(r.viable).toBe(false); expect(r.breakEvenUnits).toBeNull();
  });
  test('zero contribution is not viable', () => {
    expect(calc.breakEven(1000, 30, 30).viable).toBe(false);
  });
  test('units for a target profit', () => {
    near(calc.unitsForTargetProfit(10000, 50, 30, 5000), 750);
  });
});

test.describe('@unit ROI', () => {
  test('10000 -> 15000 is +50%', () => {
    const r = calc.roi(10000, 15000);
    near(r.gain, 5000); near(r.roiPercent, 50);
  });
  test('a loss is negative', () => near(calc.roi(10000, 8000).roiPercent, -20));
  test('annualised over 3 years', () => {
    const r = calc.roi(10000, 15000, 3);
    near(r.annualisedPercent, (Math.pow(1.5, 1 / 3) - 1) * 100, 1e-6);
  });
  test('doubling in 1 year annualises to 100%', () => {
    near(calc.roi(100, 200, 1).annualisedPercent, 100, 1e-9);
  });
  test('no period means no annualised figure', () => {
    expect(calc.roi(100, 200).annualisedPercent).toBeNull();
  });
  test('zero investment rejected', () => expect(calc.roi(0, 100)).toBeNull());
});

test.describe('@unit salary hike', () => {
  test('600000 with a 10% hike', () => {
    const r = calc.salaryAfterHike(600000, 10);
    near(r.increase, 60000); near(r.newSalary, 660000); near(r.monthlyIncrease, 5000);
  });
  test('implied hike between two salaries', () => {
    const r = calc.hikeBetween(600000, 750000);
    near(r.hikePercent, 25); near(r.increase, 150000); near(r.monthlyIncrease, 12500);
  });
  test('a pay cut is negative', () => near(calc.hikeBetween(100000, 90000).hikePercent, -10));
  test('zero current salary rejected', () => expect(calc.hikeBetween(0, 100)).toBeNull());
  test('hike then reverse round-trips', () => {
    const after = calc.salaryAfterHike(500000, 17.5);
    near(calc.hikeBetween(500000, after.newSalary).hikePercent, 17.5, 1e-9);
  });
});

test.describe('@unit working days', () => {
  test('a full Mon-Fri week', () => {
    // 2026-08-03 is a Monday; through Friday 2026-08-07.
    const r = calc.workingDays('2026-08-03', '2026-08-07');
    expect(r.totalDays).toBe(5); expect(r.workingDays).toBe(5); expect(r.nonWorkingDays).toBe(0);
  });
  test('a week including the weekend', () => {
    const r = calc.workingDays('2026-08-03', '2026-08-09'); // Mon -> Sun
    expect(r.totalDays).toBe(7); expect(r.workingDays).toBe(5); expect(r.nonWorkingDays).toBe(2);
  });
  test('holidays are excluded and counted separately', () => {
    const r = calc.workingDays('2026-08-03', '2026-08-07', { holidays: ['2026-08-05'] });
    expect(r.workingDays).toBe(4); expect(r.holidaysExcluded).toBe(1);
  });
  test('a holiday landing on a weekend is not double-counted', () => {
    const r = calc.workingDays('2026-08-03', '2026-08-09', { holidays: ['2026-08-08'] });
    expect(r.workingDays).toBe(5); expect(r.holidaysExcluded).toBe(0);
  });
  test('a six-day working week', () => {
    const r = calc.workingDays('2026-08-03', '2026-08-09', { workingWeekdays: [1, 2, 3, 4, 5, 6] });
    expect(r.workingDays).toBe(6);
  });
  test('same day inclusive counts one', () => {
    expect(calc.workingDays('2026-08-03', '2026-08-03').workingDays).toBe(1);
  });
  test('exclusive drops the end date', () => {
    expect(calc.workingDays('2026-08-03', '2026-08-07', { inclusive: false }).totalDays).toBe(4);
  });
  test('end before start is reported, not silently zero', () => {
    expect(calc.workingDays('2026-08-07', '2026-08-03').error).toBe('END_BEFORE_START');
  });
  test('a span crossing a DST boundary keeps its day count', () => {
    // Northern-hemisphere DST changes in late March; UTC parsing must not shift the count.
    const r = calc.workingDays('2026-03-25', '2026-04-01');
    expect(r.totalDays).toBe(8);
  });
  test('malformed and calendar-invalid dates rejected', () => {
    expect(calc.workingDays('not-a-date', '2026-08-07')).toBeNull();
    expect(calc.workingDays('2026-02-30', '2026-03-05')).toBeNull();
  });
});
