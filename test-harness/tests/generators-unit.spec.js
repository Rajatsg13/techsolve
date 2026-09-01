// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Unit tests for the generator calculations.
 * Tag: @unit
 *
 * Expected values are worked out by hand, not read off the implementation.
 */

let G;
test.beforeAll(async () => { G = await import('../../app/lib/generators.js'); });
const near = (a, b, tol = 0.005) => expect(Math.abs(a - b)).toBeLessThan(tol);

test.describe('@unit invoice totals', () => {
  test('a single line with no discount or tax', () => {
    const r = G.invoiceTotals([{ description: 'Design', qty: 2, rate: 5000 }]);
    near(r.grossSubtotal, 10000); near(r.taxTotal, 0); near(r.total, 10000);
  });

  test('quantity times rate, plus 18% tax', () => {
    const r = G.invoiceTotals([{ description: 'Consulting', qty: 10, rate: 1500, taxPercent: 18 }]);
    near(r.taxableValue, 15000); near(r.taxTotal, 2700); near(r.total, 17700);
  });

  test('a per-line discount reduces the taxable value', () => {
    const r = G.invoiceTotals([{ description: 'X', qty: 1, rate: 1000, discountPercent: 10, taxPercent: 18 }]);
    near(r.lineDiscountTotal, 100);
    near(r.taxableValue, 900);
    near(r.taxTotal, 162);   // 18% of 900, not of 1000
    near(r.total, 1062);
  });

  test('mixed tax rates are taxed per line, not on the subtotal', () => {
    const r = G.invoiceTotals([
      { description: 'A', qty: 1, rate: 1000, taxPercent: 18 },
      { description: 'B', qty: 1, rate: 1000, taxPercent: 5 },
    ]);
    near(r.taxableValue, 2000);
    near(r.taxTotal, 230);            // 180 + 50, not 2000 × either rate
    near(r.total, 2230);
    expect(r.taxBreakdown.map(t => t.rate)).toEqual([5, 18]);
    near(r.taxBreakdown.find(t => t.rate === 18).amount, 180);
    near(r.taxBreakdown.find(t => t.rate === 5).amount, 50);
  });

  test('an invoice-level discount reduces tax proportionally', () => {
    const r = G.invoiceTotals(
      [{ description: 'A', qty: 1, rate: 1000, taxPercent: 18 }],
      { extraDiscountPercent: 10 },
    );
    near(r.extraDiscount, 100);
    near(r.taxableValue, 900);
    near(r.taxTotal, 162);   // recomputed on the discounted value
    near(r.total, 1062);
  });

  test('intra-state splits tax into CGST and SGST', () => {
    const r = G.invoiceTotals([{ qty: 1, rate: 1000, taxPercent: 18, description: 'A' }], { interState: false });
    const t = r.taxBreakdown[0];
    near(t.cgst, 90); near(t.sgst, 90); near(t.igst, 0);
  });

  test('inter-state puts the whole rate in IGST', () => {
    const r = G.invoiceTotals([{ qty: 1, rate: 1000, taxPercent: 18, description: 'A' }], { interState: true });
    const t = r.taxBreakdown[0];
    near(t.igst, 180); near(t.cgst, 0); near(t.sgst, 0);
  });

  test('round-off to a whole rupee is reported', () => {
    const r = G.invoiceTotals([{ qty: 3, rate: 333.33, taxPercent: 18, description: 'A' }], { roundTotal: true });
    expect(Number.isInteger(r.total)).toBe(true);
    near(r.total - r.roundOff, r.taxableValue + r.taxTotal, 0.011);
  });

  test('empty invoice totals zero rather than NaN', () => {
    const r = G.invoiceTotals([]);
    expect(r.total).toBe(0); expect(Number.isNaN(r.total)).toBe(false);
  });

  test('blank and non-numeric fields are treated as zero', () => {
    const r = G.invoiceTotals([{ description: 'A', qty: '', rate: 'abc', taxPercent: null }]);
    expect(r.total).toBe(0);
  });

  test('many line items total correctly', () => {
    const items = Array.from({ length: 40 }, (_, i) => ({ description: `Item ${i}`, qty: 2, rate: 250, taxPercent: 18 }));
    const r = G.invoiceTotals(items);
    near(r.taxableValue, 20000); near(r.taxTotal, 3600); near(r.total, 23600);
  });

  test('a large amount stays exact to 2dp', () => {
    const r = G.invoiceTotals([{ description: 'A', qty: 1, rate: 12345678.9, taxPercent: 18 }]);
    near(r.total, 12345678.9 * 1.18, 0.02);
  });

  test('a 100% line discount leaves nothing taxable', () => {
    const r = G.invoiceTotals([{ description: 'Free', qty: 1, rate: 500, discountPercent: 100, taxPercent: 18 }]);
    near(r.taxableValue, 0); near(r.taxTotal, 0); near(r.total, 0);
  });
});

test.describe('@unit invoice validation', () => {
  const base = {
    sellerName: 'Acme', buyerName: 'Client', invoiceNumber: 'INV-1', invoiceDate: '2026-08-01',
    items: [{ description: 'Work', qty: 1, rate: 100 }],
  };
  test('a complete invoice has no problems', () => expect(G.validateInvoice(base)).toEqual([]));
  test('missing seller is reported', () => {
    expect(G.validateInvoice({ ...base, sellerName: '' }).join(' ')).toMatch(/business name/i);
  });
  test('missing invoice number is reported', () => {
    expect(G.validateInvoice({ ...base, invoiceNumber: '  ' }).join(' ')).toMatch(/invoice number/i);
  });
  test('no usable line item is reported', () => {
    expect(G.validateInvoice({ ...base, items: [{ description: '', qty: 0 }] }).join(' ')).toMatch(/line item/i);
  });
  test('negative quantities are rejected', () => {
    expect(G.validateInvoice({ ...base, items: [{ description: 'X', qty: -1, rate: 10 }] }).join(' ')).toMatch(/negative/i);
  });
});

test.describe('@unit payslip totals', () => {
  test('gross, deductions and net', () => {
    const r = G.payslipTotals(
      [{ label: 'Basic', amount: 40000 }, { label: 'HRA', amount: 16000 }, { label: 'Special', amount: 9000 }],
      [{ label: 'PF', amount: 4800 }, { label: 'Professional Tax', amount: 200 }, { label: 'TDS', amount: 3500 }],
    );
    near(r.grossEarnings, 65000);
    near(r.totalDeductions, 8500);
    near(r.netPay, 56500);
    expect(r.negative).toBe(false);
  });

  test('rows without a label are ignored', () => {
    const r = G.payslipTotals([{ label: 'Basic', amount: 100 }, { label: '', amount: 999 }], []);
    near(r.grossEarnings, 100);
    expect(r.earnings).toHaveLength(1);
  });

  test('deductions exceeding gross give a negative net, reported not clamped', () => {
    const r = G.payslipTotals([{ label: 'Basic', amount: 1000 }], [{ label: 'Recovery', amount: 1500 }]);
    near(r.netPay, -500);
    expect(r.negative).toBe(true);
  });

  test('no deductions means net equals gross', () => {
    const r = G.payslipTotals([{ label: 'Basic', amount: 25000 }], []);
    near(r.netPay, 25000);
  });

  test('decimal amounts round to 2dp', () => {
    const r = G.payslipTotals([{ label: 'A', amount: 33.333 }, { label: 'B', amount: 33.333 }], []);
    near(r.grossEarnings, 66.67, 0.011);
  });

  test('empty payslip is zero, not NaN', () => {
    const r = G.payslipTotals([], []);
    expect(r.netPay).toBe(0);
  });
});

test.describe('@unit payslip validation', () => {
  const base = { employerName: 'Acme', employeeName: 'Priya', period: 'August 2026',
                 earnings: [{ label: 'Basic', amount: 1000 }] };
  test('a complete payslip has no problems', () => expect(G.validatePayslip(base)).toEqual([]));
  test('missing period is reported', () => {
    expect(G.validatePayslip({ ...base, period: '' }).join(' ')).toMatch(/pay period/i);
  });
  test('no earnings is reported', () => {
    expect(G.validatePayslip({ ...base, earnings: [] }).join(' ')).toMatch(/earnings/i);
  });
});

test.describe('@unit rent receipt validation', () => {
  const base = {
    landlordName: 'R Sharma', tenantName: 'A Khan', propertyAddress: '12 Main St',
    amount: 25000, periodFrom: '2026-08-01', periodTo: '2026-08-31', paymentDate: '2026-08-05',
  };
  test('a complete receipt has no problems', () => expect(G.validateRentReceipt(base)).toEqual([]));
  test('zero rent is rejected', () => {
    expect(G.validateRentReceipt({ ...base, amount: 0 }).join(' ')).toMatch(/rent amount/i);
  });
  test('a reversed period is caught', () => {
    const p = G.validateRentReceipt({ ...base, periodFrom: '2026-08-31', periodTo: '2026-08-01' });
    expect(p.join(' ')).toMatch(/before the start/i);
  });
  test('missing address is reported', () => {
    expect(G.validateRentReceipt({ ...base, propertyAddress: '' }).join(' ')).toMatch(/address/i);
  });
});

test.describe('@unit amount in words', () => {
  test('simple values', () => {
    expect(G.amountInWords(0)).toBe('Zero');
    expect(G.amountInWords(1)).toBe('One');
    expect(G.amountInWords(15)).toBe('Fifteen');
    expect(G.amountInWords(90)).toBe('Ninety');
  });
  test('hundreds and thousands', () => {
    expect(G.amountInWords(105)).toBe('One Hundred Five');
    expect(G.amountInWords(2500)).toBe('Two Thousand Five Hundred');
  });
  test('indian lakh and crore grouping', () => {
    expect(G.amountInWords(100000)).toBe('One Lakh');
    expect(G.amountInWords(2500000)).toBe('Twenty Five Lakh');
    expect(G.amountInWords(10000000)).toBe('One Crore');
    expect(G.amountInWords(12345678)).toBe('One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight');
  });
  test('paise are included', () => {
    expect(G.amountInWords(1250.5)).toMatch(/One Thousand Two Hundred Fifty and Fifty Paise/);
  });
});

test.describe('@unit document date formatting', () => {
  test('formats an ISO date', () => expect(G.formatDocDate('2026-08-05')).toBe('05 Aug 2026'));
  test('pads a single-digit day', () => expect(G.formatDocDate('2026-12-01')).toBe('01 Dec 2026'));
  test('passes through anything unparseable', () => expect(G.formatDocDate('not-a-date')).toBe('not-a-date'));
  test('handles an empty value', () => expect(G.formatDocDate('')).toBe(''));
});

test.describe('@unit rounding', () => {
  test('round2 avoids float drift', () => {
    expect(G.round2(1.005)).toBe(1.01);
    expect(G.round2(0.1 + 0.2)).toBe(0.3);
  });
});
