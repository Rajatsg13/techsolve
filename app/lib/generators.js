/**
 * Document generator calculations and validation.
 *
 * Pure like app/lib/calc.js — no React, no DOM, no pdf-lib — so invoice totals
 * and payslip net pay can be proved in Node rather than only read off a
 * rendered PDF. The PDF layer consumes what these return.
 *
 * Money is handled in rupees as floating point, then rounded to 2dp at every
 * boundary via `round2`. That is adequate for documents of this size; anything
 * doing real ledger arithmetic should use integer paise instead.
 */

/** Round to 2 decimals without the usual floating-point drift (1.005 -> 1.01). */
export const round2 = (n) =>
  Number.isFinite(n) ? Math.round((n + Number.EPSILON) * 100) / 100 : 0;

const num = (v) => {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

/* ── Invoice ────────────────────────────────────────────────────────────── */

/**
 * Total an invoice.
 *
 * Per line: amount = qty × rate, less a per-line discount percentage.
 * Tax is applied per line, because a real invoice can mix rates — one line at
 * 18% and another at 5% is normal, and applying a single rate to the subtotal
 * would quietly produce the wrong tax.
 *
 * @param {Array} items  [{ description, qty, rate, discountPercent, taxPercent }]
 * @param {object} opts
 * @param {number} opts.extraDiscountPercent  applied to the whole net subtotal
 * @param {boolean} opts.interState           IGST if true, else CGST+SGST split
 * @param {boolean} opts.roundTotal           round the final total to a whole rupee
 */
export function invoiceTotals(items = [], {
  extraDiscountPercent = 0, interState = false, roundTotal = false,
} = {}) {
  const lines = items.map((item) => {
    const qty = num(item.qty);
    const rate = num(item.rate);
    const gross = round2(qty * rate);
    const discountPercent = num(item.discountPercent);
    const discount = round2(gross * (discountPercent / 100));
    const net = round2(gross - discount);
    const taxPercent = num(item.taxPercent);
    const tax = round2(net * (taxPercent / 100));
    return {
      description: item.description || '',
      qty, rate, gross, discountPercent, discount, net, taxPercent, tax,
      total: round2(net + tax),
    };
  });

  const grossSubtotal = round2(lines.reduce((s, l) => s + l.gross, 0));
  const lineDiscountTotal = round2(lines.reduce((s, l) => s + l.discount, 0));
  const netAfterLineDiscounts = round2(lines.reduce((s, l) => s + l.net, 0));

  // An invoice-level discount reduces each line proportionally, so the tax on
  // each line has to be recomputed rather than taken from the line figures.
  const extraPct = num(extraDiscountPercent);
  const extraDiscount = round2(netAfterLineDiscounts * (extraPct / 100));
  const taxableValue = round2(netAfterLineDiscounts - extraDiscount);
  const factor = netAfterLineDiscounts === 0 ? 0 : taxableValue / netAfterLineDiscounts;

  const taxTotal = round2(lines.reduce((s, l) => s + l.net * factor * (l.taxPercent / 100), 0));

  // Group tax by rate — a compliant invoice shows each rate separately.
  const byRate = {};
  for (const l of lines) {
    if (!l.taxPercent) continue;
    const adjustedTax = round2(l.net * factor * (l.taxPercent / 100));
    byRate[l.taxPercent] = round2((byRate[l.taxPercent] || 0) + adjustedTax);
  }
  const taxBreakdown = Object.entries(byRate)
    .map(([rate, amount]) => ({
      rate: Number(rate),
      amount,
      cgst: interState ? 0 : round2(amount / 2),
      sgst: interState ? 0 : round2(amount / 2),
      igst: interState ? amount : 0,
    }))
    .sort((a, b) => a.rate - b.rate);

  const preRound = round2(taxableValue + taxTotal);
  const total = roundTotal ? Math.round(preRound) : preRound;

  return {
    lines,
    grossSubtotal,
    lineDiscountTotal,
    netAfterLineDiscounts,
    extraDiscount,
    taxableValue,
    taxTotal,
    taxBreakdown,
    interState,
    roundOff: round2(total - preRound),
    total,
  };
}

/** Required fields for a usable invoice. Returns a list of human-readable problems. */
export function validateInvoice(data) {
  const problems = [];
  if (!data.sellerName?.trim()) problems.push('Add your business name.');
  if (!data.buyerName?.trim()) problems.push('Add the customer name.');
  if (!data.invoiceNumber?.trim()) problems.push('Add an invoice number.');
  if (!data.invoiceDate) problems.push('Add an invoice date.');
  const usable = (data.items || []).filter(i => i.description?.trim() && num(i.qty) > 0);
  if (!usable.length) problems.push('Add at least one line item with a description and a quantity above zero.');
  const negatives = (data.items || []).some(i => num(i.qty) < 0 || num(i.rate) < 0);
  if (negatives) problems.push('Quantities and rates cannot be negative.');
  return problems;
}

/* ── Payslip ────────────────────────────────────────────────────────────── */

/**
 * Total a payslip.
 * Gross is the sum of earnings, net is gross minus deductions. Deductions are
 * allowed to exceed gross (it happens with recoveries), so the result can be
 * negative and is reported rather than clamped.
 */
export function payslipTotals(earnings = [], deductions = []) {
  const clean = (rows) => rows
    .filter(r => r.label?.trim())
    .map(r => ({ label: r.label.trim(), amount: round2(num(r.amount)) }));

  const e = clean(earnings);
  const d = clean(deductions);
  const grossEarnings = round2(e.reduce((s, r) => s + r.amount, 0));
  const totalDeductions = round2(d.reduce((s, r) => s + r.amount, 0));

  return {
    earnings: e,
    deductions: d,
    grossEarnings,
    totalDeductions,
    netPay: round2(grossEarnings - totalDeductions),
    negative: grossEarnings - totalDeductions < 0,
  };
}

export function validatePayslip(data) {
  const problems = [];
  if (!data.employerName?.trim()) problems.push('Add the employer name.');
  if (!data.employeeName?.trim()) problems.push('Add the employee name.');
  if (!data.period?.trim()) problems.push('Add the pay period this payslip covers.');
  const hasEarning = (data.earnings || []).some(r => r.label?.trim() && num(r.amount) !== 0);
  if (!hasEarning) problems.push('Add at least one earnings line with an amount.');
  return problems;
}

/* ── Rent receipt ───────────────────────────────────────────────────────── */

export function validateRentReceipt(data) {
  const problems = [];
  if (!data.landlordName?.trim()) problems.push('Add the landlord name.');
  if (!data.tenantName?.trim()) problems.push('Add the tenant name.');
  if (!data.propertyAddress?.trim()) problems.push('Add the property address.');
  if (num(data.amount) <= 0) problems.push('Add the rent amount received.');
  if (!data.periodFrom || !data.periodTo) problems.push('Add the rent period this receipt covers.');
  if (data.periodFrom && data.periodTo && data.periodTo < data.periodFrom) {
    problems.push('The end of the rent period is before the start.');
  }
  if (!data.paymentDate) problems.push('Add the date the payment was received.');
  return problems;
}

/* ── Shared helpers ─────────────────────────────────────────────────────── */

/**
 * Amount in words, Indian numbering (lakh / crore).
 * Rent receipts and invoices conventionally carry this, and it is a genuine
 * check against a mistyped figure.
 */
export function amountInWords(amount) {
  const n = Math.floor(Math.abs(num(amount)));
  const paise = Math.round((Math.abs(num(amount)) - n) * 100);
  if (n === 0 && paise === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const twoDigit = (x) => x < 20 ? ones[x] : (tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : ''));
  const threeDigit = (x) => {
    const h = Math.floor(x / 100), r = x % 100;
    return (h ? ones[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? twoDigit(r) : '');
  };

  const parts = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;

  if (crore) parts.push(threeDigit(crore) + ' Crore');
  if (lakh) parts.push(twoDigit(lakh) + ' Lakh');
  if (thousand) parts.push(twoDigit(thousand) + ' Thousand');
  if (rest) parts.push(threeDigit(rest));

  let words = parts.join(' ').trim() || 'Zero';
  if (paise) words += ' and ' + twoDigit(paise) + ' Paise';
  return words;
}

/** yyyy-mm-dd -> "05 Aug 2026". Returns the input unchanged when unparseable. */
export function formatDocDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (m < 1 || m > 12) return iso;
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`;
}
