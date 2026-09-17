/**
 * PDF layouts for the three generators.
 *
 * Kept out of the page components so the same layout can be exercised from a
 * test without rendering React, and so the pages stay about the form.
 */
import { createDoc, drawDocumentHeader, drawPartyPanels, drawFooter, pdfMoney, MARGIN, A4 } from './docPdf.js';
import { invoiceTotals, payslipTotals, amountInWords, formatDocDate } from './generators.js';

const DISCLAIMER_COMMON =
  'Generated with Tools by Decyfy. The person issuing this document is responsible for the accuracy of the information it contains.';

/* ── Invoice ────────────────────────────────────────────────────────────── */

export async function buildInvoicePdf(data) {
  const t = invoiceTotals(data.items, {
    extraDiscountPercent: data.extraDiscountPercent,
    interState: data.interState,
    roundTotal: data.roundTotal,
  });

  const doc = await createDoc({ title: `Invoice ${data.invoiceNumber || ''}`.trim(), subject: 'Invoice' });

  drawDocumentHeader(doc, {
    title: 'Invoice',
    meta: [
      { label: 'Invoice no.', value: data.invoiceNumber || '—' },
      { label: 'Date', value: formatDocDate(data.invoiceDate) || '—' },
      data.dueDate ? { label: 'Due', value: formatDocDate(data.dueDate) } : null,
    ],
    issuer: data.sellerName,
    issuerLines: [data.sellerAddress, data.sellerGstin ? `GSTIN: ${data.sellerGstin}` : '', data.sellerContact],
  });

  drawPartyPanels(doc, [
    { title: 'Billed to', name: data.buyerName, lines: [data.buyerAddress, data.buyerGstin ? `GSTIN: ${data.buyerGstin}` : '', data.buyerContact] },
    { title: 'Supply', name: data.interState ? 'Inter-state (IGST)' : 'Within state (CGST + SGST)',
      lines: [data.placeOfSupply ? `Place of supply: ${data.placeOfSupply}` : ''] },
  ]);

  const showTax = t.lines.some(l => l.taxPercent > 0);
  const showDisc = t.lines.some(l => l.discountPercent > 0);
  const cols = [
    { label: '#', width: 24 },
    { label: 'Description', width: showTax && showDisc ? 175 : 235 },
    { label: 'Qty', width: 42, align: 'right' },
    { label: 'Rate', width: 72, align: 'right' },
    ...(showDisc ? [{ label: 'Disc %', width: 46, align: 'right' }] : []),
    ...(showTax ? [{ label: 'Tax %', width: 42, align: 'right' }] : []),
    { label: 'Amount', width: 80, align: 'right' },
  ];

  doc.table(cols, t.lines.map((l, i) => [
    String(i + 1),
    l.description || '—',
    String(l.qty),
    pdfMoney(l.rate),
    ...(showDisc ? [l.discountPercent ? `${l.discountPercent}%` : '—'] : []),
    ...(showTax ? [l.taxPercent ? `${l.taxPercent}%` : '—'] : []),
    pdfMoney(l.net),
  ]));

  doc.space(10);
  doc.totals([
    { label: 'Subtotal', value: pdfMoney(t.grossSubtotal) },
    t.lineDiscountTotal ? { label: 'Line discounts', value: '- ' + pdfMoney(t.lineDiscountTotal) } : null,
    t.extraDiscount ? { label: `Invoice discount (${data.extraDiscountPercent}%)`, value: '- ' + pdfMoney(t.extraDiscount) } : null,
    { label: 'Taxable value', value: pdfMoney(t.taxableValue) },
    ...t.taxBreakdown.flatMap(b => data.interState
      ? [{ label: `IGST @ ${b.rate}%`, value: pdfMoney(b.igst) }]
      : [{ label: `CGST @ ${b.rate / 2}%`, value: pdfMoney(b.cgst) },
         { label: `SGST @ ${b.rate / 2}%`, value: pdfMoney(b.sgst) }]),
    t.roundOff ? { label: 'Round off', value: pdfMoney(t.roundOff) } : null,
    { label: 'Total', value: pdfMoney(t.total), strong: true, spaceBefore: true },
  ]);

  doc.space(18);
  doc.paragraph(`Amount in words: ${amountInWords(t.total)} Rupees only`, { size: 8.5, weight: 'bold' });

  if (data.notes) { doc.space(10); doc.text('NOTES', { size: 7.5, weight: 'bold' }); doc.y -= 12; doc.paragraph(data.notes, { size: 9 }); }
  if (data.paymentDetails) { doc.space(8); doc.text('PAYMENT DETAILS', { size: 7.5, weight: 'bold' }); doc.y -= 12; doc.paragraph(data.paymentDetails, { size: 9 }); }

  drawFooter(doc, {
    signatureLabel: `For ${data.sellerName || 'the supplier'}`,
    disclaimer: DISCLAIMER_COMMON + ' This document does not itself constitute tax advice, and applicable tax rates are those entered by the issuer.',
  });

  return { bytes: await doc.save(), totals: t, hadUnsupportedCharacters: doc.warnings };
}

/* ── Payslip ────────────────────────────────────────────────────────────── */

export async function buildPayslipPdf(data) {
  const t = payslipTotals(data.earnings, data.deductions);
  const doc = await createDoc({ title: `Payslip ${data.period || ''}`.trim(), subject: 'Payslip' });

  drawDocumentHeader(doc, {
    title: 'Payslip',
    meta: [
      { label: 'Pay period', value: data.period || '—' },
      data.payDate ? { label: 'Pay date', value: formatDocDate(data.payDate) } : null,
    ],
    issuer: data.employerName,
    issuerLines: [data.employerAddress],
  });

  drawPartyPanels(doc, [
    { title: 'Employee', name: data.employeeName,
      lines: [data.employeeId ? `Employee ID: ${data.employeeId}` : '', data.designation, data.department] },
    { title: 'Payment', name: data.paymentMode || 'Bank transfer',
      lines: [
        data.bankAccount ? `Account: ${data.bankAccount}` : '',
        data.pan ? `PAN: ${data.pan}` : '',
        data.uan ? `UAN: ${data.uan}` : '',
      ] },
  ]);

  // Attendance, when supplied. A payslip that shows paid days is far easier to
  // reconcile against a partial month than one that shows only amounts.
  const attendance = [
    data.paidDays !== '' && data.paidDays != null ? `Paid days: ${data.paidDays}` : '',
    data.lopDays !== '' && data.lopDays != null ? `Loss of pay: ${data.lopDays}` : '',
  ].filter(Boolean);
  if (attendance.length) {
    doc.space(2);
    doc.text(attendance.join('     '), { size: 9, color: [0.36, 0.42, 0.52] });
    doc.y -= 16;
  }

  const half = (doc.contentWidth - 16) / 2;
  const startY = doc.y;

  // Earnings and deductions sit side by side, so both columns are drawn from
  // the same starting y and the cursor is moved to whichever ran longer.
  const drawColumn = (x, title, rows, totalLabel, totalValue) => {
    let y = startY;
    doc.box({ x, y: y - 20, width: half, height: 20, color: [0.965, 0.976, 0.988] });
    doc.text(title.toUpperCase(), { x: x + 8, y: y - 13, size: 7.5, weight: 'bold', color: [0.36, 0.42, 0.52] });
    y -= 30;
    rows.forEach(r => {
      doc.text(r.label, { x: x + 8, y, size: 9.5 });
      doc.text(pdfMoney(r.amount), { x, y, size: 9.5, align: 'right', width: half - 8 });
      y -= 16;
    });
    y -= 4;
    doc.rule({ y: y + 6, x, width: half });
    doc.text(totalLabel, { x: x + 8, y: y - 6, size: 9.5, weight: 'bold' });
    doc.text(pdfMoney(totalValue), { x, y: y - 6, size: 9.5, weight: 'bold', align: 'right', width: half - 8 });
    return y - 20;
  };

  const endA = drawColumn(MARGIN, 'Earnings', t.earnings, 'Gross earnings', t.grossEarnings);
  const endB = drawColumn(MARGIN + half + 16, 'Deductions', t.deductions, 'Total deductions', t.totalDeductions);
  doc.y = Math.min(endA, endB) - 10;

  doc.ensure(70);
  const boxTop = doc.y;
  doc.box({ x: MARGIN, y: boxTop - 46, width: doc.contentWidth, height: 46, color: [0.925, 0.957, 1] });
  doc.text('NET PAY', { x: MARGIN + 14, y: boxTop - 18, size: 8, weight: 'bold', color: [0.36, 0.42, 0.52] });
  doc.text(pdfMoney(t.netPay), { x: MARGIN + 14, y: boxTop - 36, size: 16, weight: 'bold' });
  doc.text(`${amountInWords(t.netPay)} Rupees only`, {
    x: MARGIN, y: boxTop - 36, size: 8.5, align: 'right', width: doc.contentWidth - 14, color: [0.36, 0.42, 0.52] });
  doc.y = boxTop - 60;

  if (data.notes) { doc.space(6); doc.paragraph(data.notes, { size: 9 }); }

  drawFooter(doc, {
    signatureLabel: `For ${data.employerName || 'the employer'}`,
    disclaimer: DISCLAIMER_COMMON + ' This is a self-prepared salary statement produced from figures supplied by the issuer. '
      + 'It is not issued by any payroll authority and is not proof of employment or income.',
  });

  return { bytes: await doc.save(), totals: t, hadUnsupportedCharacters: doc.warnings };
}

/* ── Rent receipt ───────────────────────────────────────────────────────── */

export async function buildRentReceiptPdf(data) {
  const doc = await createDoc({ title: `Rent receipt ${data.receiptNumber || ''}`.trim(), subject: 'Rent receipt' });
  const amount = Number(String(data.amount ?? '').replace(/,/g, '')) || 0;

  drawDocumentHeader(doc, {
    title: 'Rent Receipt',
    meta: [
      data.receiptNumber ? { label: 'Receipt no.', value: data.receiptNumber } : null,
      { label: 'Payment date', value: formatDocDate(data.paymentDate) || '—' },
    ],
    issuer: data.landlordName,
    issuerLines: [data.landlordAddress, data.landlordPan ? `PAN: ${data.landlordPan}` : ''],
  });

  doc.ensure(80);
  const top = doc.y;
  doc.box({ x: MARGIN, y: top - 56, width: doc.contentWidth, height: 56, color: [0.925, 0.957, 1] });
  doc.text('AMOUNT RECEIVED', { x: MARGIN + 14, y: top - 18, size: 8, weight: 'bold', color: [0.36, 0.42, 0.52] });
  doc.text(pdfMoney(amount), { x: MARGIN + 14, y: top - 42, size: 20, weight: 'bold' });
  doc.y = top - 70;

  doc.paragraph(`${amountInWords(amount)} Rupees only`, { size: 9, weight: 'bold' });
  doc.space(8);

  doc.paragraph(
    `Received from ${data.tenantName || '—'} the sum shown above towards rent for the property at `
    + `${data.propertyAddress || '—'}, for the period ${formatDocDate(data.periodFrom) || '—'} to `
    + `${formatDocDate(data.periodTo) || '—'}, paid by ${data.paymentMode || 'cash'}`
    + `${data.paymentReference ? ` (reference ${data.paymentReference})` : ''}.`,
    { size: 10, lineHeight: 1.5 },
  );

  doc.space(14);
  drawPartyPanels(doc, [
    { title: 'Tenant', name: data.tenantName, lines: [data.tenantAddress] },
    { title: 'Property', name: '', lines: [data.propertyAddress] },
  ]);

  if (data.notes) { doc.paragraph(data.notes, { size: 9 }); }

  drawFooter(doc, {
    signatureLabel: 'Landlord signature',
    revenueStamp: !!data.includeRevenueStamp,
    disclaimer: DISCLAIMER_COMMON + ' Whether this receipt satisfies any particular requirement — including for a rent '
      + 'allowance claim — depends on the rules that apply to you. Check them, or ask a qualified adviser.',
  });

  return { bytes: await doc.save(), amount, hadUnsupportedCharacters: doc.warnings };
}
