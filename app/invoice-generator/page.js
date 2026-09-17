'use client';
import { useState, useMemo } from 'react';
import ToolShell, { ToolNotice } from '../components/tool-ui/ToolShell';
import { TextField, CheckField, NumberField } from '../components/tool-ui/Field';
import { GeneratorLayout, FormSection, AreaField, ProblemList, CharacterWarning, GeneratePanel, RowEditor }
  from '../components/tool-ui/GeneratorShell';
import { ResultRows } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { invoiceTotals, validateInvoice } from '../lib/generators';
import { hasUnsupportedCharacters } from '../lib/docPdf';
import { downloadBytes } from '../lib/download';
import { formatINR } from '../lib/format';

const content = getToolContent('invoice-generator');
const blankItem = { description: '', qty: '1', rate: '', discountPercent: '', taxPercent: '18' };

export default function InvoiceGenerator() {
  const [d, setD] = useState({
    sellerName: '', sellerAddress: '', sellerGstin: '', sellerContact: '',
    buyerName: '', buyerAddress: '', buyerGstin: '', buyerContact: '', placeOfSupply: '',
    invoiceNumber: '', invoiceDate: new Date().toISOString().slice(0, 10), dueDate: '',
    interState: false, roundTotal: true, extraDiscountPercent: '',
    notes: '', paymentDetails: '',
    items: [{ ...blankItem }],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (v) => setD(p => ({ ...p, [k]: v }));
  const totals = useMemo(() => invoiceTotals(d.items, {
    extraDiscountPercent: d.extraDiscountPercent, interState: d.interState, roundTotal: d.roundTotal,
  }), [d.items, d.extraDiscountPercent, d.interState, d.roundTotal]);

  const problems = validateInvoice(d);
  const unsupported = [
    ['Your business name', d.sellerName], ['Your address', d.sellerAddress],
    ['Customer name', d.buyerName], ['Customer address', d.buyerAddress],
    ['A line item description', d.items.map(i => i.description).join(' ')],
    ['Notes', d.notes],
  ].filter(([, v]) => hasUnsupportedCharacters(v)).map(([label]) => label);

  const generate = async () => {
    setBusy(true); setError('');
    try {
      const { buildInvoicePdf } = await import('../lib/generatorPdfs');
      const { bytes } = await buildInvoicePdf(d);
      downloadBytes(bytes, `invoice-${(d.invoiceNumber || 'draft').replace(/[^\w-]/g, '-')}.pdf`, 'application/pdf');
    } catch (e) {
      setError('Could not generate the PDF: ' + (e?.message || 'unknown error'));
    }
    setBusy(false);
  };

  return (
    <ToolShell
      slug="invoice-generator"
      title="Invoice Generator"
      outcome="Fill in the details and download a clean, professional invoice PDF — no account, no watermark."
      notice={<ToolNotice>Tax rates are whatever you enter. This tool does not determine which rate applies to what you sell, and it is not tax advice.</ToolNotice>}
      content={content}
    >
      <GeneratorLayout
        form={
          <>
            <FormSection title="Your business" hint="Appears at the top of the invoice as the issuer.">
              <TextField id="inv-seller" label="Business name" value={d.sellerName} onChange={set('sellerName')} placeholder="Meridian Design Studio LLP" />
              <TextField id="inv-gstin" label="GSTIN (optional)" value={d.sellerGstin} onChange={set('sellerGstin')} placeholder="29ABCDE1234F1Z5" />
              <AreaField id="inv-seller-addr" label="Address" value={d.sellerAddress} onChange={set('sellerAddress')} rows={2} />
              <TextField id="inv-seller-contact" label="Email or phone (optional)" value={d.sellerContact} onChange={set('sellerContact')} />
            </FormSection>

            <FormSection title="Customer">
              <TextField id="inv-buyer" label="Customer name" value={d.buyerName} onChange={set('buyerName')} />
              <TextField id="inv-buyer-gstin" label="Customer GSTIN (optional)" value={d.buyerGstin} onChange={set('buyerGstin')} />
              <AreaField id="inv-buyer-addr" label="Billing address" value={d.buyerAddress} onChange={set('buyerAddress')} rows={2} />
              <TextField id="inv-pos" label="Place of supply (optional)" value={d.placeOfSupply} onChange={set('placeOfSupply')} placeholder="Karnataka" />
              <TextField id="inv-buyer-contact" label="Customer email or phone (optional)" value={d.buyerContact} onChange={set('buyerContact')} />
            </FormSection>

            <FormSection title="Invoice details">
              <TextField id="inv-number" label="Invoice number" value={d.invoiceNumber} onChange={set('invoiceNumber')} placeholder="INV-2026-001" />
              <TextField id="inv-date" label="Invoice date" type="date" value={d.invoiceDate} onChange={set('invoiceDate')} />
              <TextField id="inv-due" label="Due date (optional)" type="date" value={d.dueDate} onChange={set('dueDate')} />
              <div className="space-y-2.5 sm:pt-6">
                <CheckField id="inv-inter" label="Inter-state supply (IGST)" checked={d.interState} onChange={set('interState')}
                  hint="Off means CGST + SGST." />
                <CheckField id="inv-round" label="Round total to whole rupees" checked={d.roundTotal} onChange={set('roundTotal')} />
              </div>
            </FormSection>

            <FormSection title="Line items" hint="Tax is applied per line, so you can mix rates on one invoice." columns={1}>
              <RowEditor
                rows={d.items} onChange={set('items')} addLabel="Add line item"
                columns={[
                  { key: 'description', label: 'Description', flex: '2.6fr', placeholder: 'Design retainer' },
                  { key: 'qty', label: 'Qty', type: 'number', flex: '0.7fr' },
                  { key: 'rate', label: 'Rate', type: 'number', flex: '1fr' },
                  { key: 'discountPercent', label: 'Disc %', type: 'number', flex: '0.7fr' },
                  { key: 'taxPercent', label: 'Tax %', type: 'number', flex: '0.7fr' },
                ]}
              />
              <NumberField id="inv-extra-disc" label="Invoice-level discount (optional)" value={d.extraDiscountPercent}
                onChange={set('extraDiscountPercent')} suffix="%" hint="Applied after line discounts. Tax is recalculated on the reduced value." />
            </FormSection>

            <FormSection title="Notes and payment" columns={1}>
              <AreaField id="inv-notes" label="Notes (optional)" value={d.notes} onChange={set('notes')} rows={2}
                placeholder="Payment due within 30 days." />
              <AreaField id="inv-pay" label="Payment details (optional)" value={d.paymentDetails} onChange={set('paymentDetails')} rows={2}
                placeholder="Bank name · A/C number · IFSC" />
            </FormSection>
          </>
        }
        summary={
          <>
            <ResultRows rows={[
              { label: 'Subtotal', value: formatINR(totals.grossSubtotal) },
              totals.lineDiscountTotal ? { label: 'Line discounts', value: '− ' + formatINR(totals.lineDiscountTotal) } : null,
              totals.extraDiscount ? { label: 'Invoice discount', value: '− ' + formatINR(totals.extraDiscount) } : null,
              { label: 'Taxable value', value: formatINR(totals.taxableValue) },
              ...totals.taxBreakdown.map(b => ({
                label: d.interState ? `IGST @ ${b.rate}%` : `CGST+SGST @ ${b.rate}%`,
                value: formatINR(b.amount),
              })),
              totals.roundOff ? { label: 'Round off', value: formatINR(totals.roundOff) } : null,
            ]} />
            <ProblemList problems={problems} />
            <CharacterWarning fields={unsupported} />
            {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700" role="alert">{error}</div>}
            <GeneratePanel
              label="Download invoice PDF" totalLabel="Total" total={formatINR(totals.total)}
              onGenerate={generate} disabled={problems.length > 0} busy={busy}
              note="Built in your browser. Nothing you type is uploaded."
            />
          </>
        }
      />
    </ToolShell>
  );
}
