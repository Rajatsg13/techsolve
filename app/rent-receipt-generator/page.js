'use client';
import { useState, useMemo } from 'react';
import ToolShell, { ToolNotice } from '../components/tool-ui/ToolShell';
import { TextField, NumberField, CheckField, SelectField } from '../components/tool-ui/Field';
import { GeneratorLayout, FormSection, AreaField, ProblemList, CharacterWarning, GeneratePanel }
  from '../components/tool-ui/GeneratorShell';
import { ResultRows } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { validateRentReceipt, amountInWords } from '../lib/generators';
import { hasUnsupportedCharacters } from '../lib/docPdf';
import { downloadBytes } from '../lib/download';
import { formatINR } from '../lib/format';

const content = getToolContent('rent-receipt-generator');

const monthStart = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10); };
const monthEnd = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth() + 1, 0).toISOString().slice(0, 10); };

export default function RentReceiptGenerator() {
  const [d, setD] = useState({
    receiptNumber: '', landlordName: '', landlordPan: '', landlordAddress: '',
    tenantName: '', tenantAddress: '', propertyAddress: '',
    amount: '', periodFrom: monthStart(), periodTo: monthEnd(),
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMode: 'Bank transfer', paymentReference: '',
    includeRevenueStamp: false, notes: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (v) => setD(p => ({ ...p, [k]: v }));

  const problems = validateRentReceipt(d);
  const words = useMemo(() => amountInWords(d.amount), [d.amount]);
  const unsupported = [
    ['Landlord name', d.landlordName], ['Landlord address', d.landlordAddress],
    ['Tenant name', d.tenantName], ['Tenant address', d.tenantAddress], ['Property address', d.propertyAddress], ['Notes', d.notes],
  ].filter(([, v]) => hasUnsupportedCharacters(v)).map(([label]) => label);

  // PAN is required by employers only above ₹1,00,000 of rent a year — flag it
  // when the monthly figure implies that, rather than demanding it always.
  const panLikelyNeeded = Number(d.amount) * 12 > 100000 && !d.landlordPan.trim();

  const generate = async () => {
    setBusy(true); setError('');
    try {
      const { buildRentReceiptPdf } = await import('../lib/generatorPdfs');
      const { bytes } = await buildRentReceiptPdf(d);
      downloadBytes(bytes, `rent-receipt-${(d.periodFrom || 'draft').slice(0, 7)}.pdf`, 'application/pdf');
    } catch (e) {
      setError('Could not generate the PDF: ' + (e?.message || 'unknown error'));
    }
    setBusy(false);
  };

  return (
    <ToolShell
      slug="rent-receipt-generator"
      title="Rent Receipt Generator"
      outcome="Produce a signed-format rent receipt PDF for one rent period, ready to submit for HRA."
      notice={
        <ToolNotice>
          A rent receipt records a payment that actually happened. Whether your employer accepts it, and
          what else they ask for, is up to them — this is not tax advice.
        </ToolNotice>
      }
      content={content}
    >
      <GeneratorLayout
        form={
          <>
            <FormSection title="Landlord">
              <TextField id="rr-landlord" label="Landlord name" value={d.landlordName} onChange={set('landlordName')} />
              <TextField id="rr-pan" label="Landlord PAN" value={d.landlordPan} onChange={set('landlordPan')}
                hint="Usually required when annual rent is above Rs. 1,00,000." />
              <AreaField id="rr-landlord-addr" label="Landlord address (optional)" value={d.landlordAddress} onChange={set('landlordAddress')} rows={2} />
              <TextField id="rr-number" label="Receipt number (optional)" value={d.receiptNumber} onChange={set('receiptNumber')} />
            </FormSection>

            <FormSection title="Tenant and property">
              <TextField id="rr-tenant" label="Tenant name" value={d.tenantName} onChange={set('tenantName')} />
              <TextField id="rr-tenant-addr" label="Tenant address (optional)" value={d.tenantAddress} onChange={set('tenantAddress')} />
              <AreaField id="rr-property" label="Property address" value={d.propertyAddress} onChange={set('propertyAddress')} rows={2}
                hint="The rented property this receipt covers." />
            </FormSection>

            <FormSection title="Payment">
              <NumberField id="rr-amount" label="Rent received" value={d.amount} onChange={set('amount')} prefix="₹" />
              <TextField id="rr-paydate" label="Date received" type="date" value={d.paymentDate} onChange={set('paymentDate')} />
              <TextField id="rr-from" label="Rent period from" type="date" value={d.periodFrom} onChange={set('periodFrom')} />
              <TextField id="rr-to" label="Rent period to" type="date" value={d.periodTo} onChange={set('periodTo')} />
              <SelectField id="rr-mode" label="Payment mode" value={d.paymentMode} onChange={set('paymentMode')}
                options={['Bank transfer', 'UPI', 'Cheque', 'Cash', 'Card'].map(v => ({ value: v, label: v }))} />
              <TextField id="rr-ref" label="Reference (optional)" value={d.paymentReference} onChange={set('paymentReference')}
                placeholder="UTR / cheque number" />
              <div className="sm:col-span-2">
                <CheckField id="rr-stamp" label="Include a revenue stamp box" checked={d.includeRevenueStamp} onChange={set('includeRevenueStamp')}
                  hint="Adds a box for a physical stamp over the signature. Conventionally used for cash payments above Rs. 5,000." />
              </div>
            </FormSection>

            <FormSection title="Notes" columns={1}>
              <AreaField id="rr-notes" label="Notes (optional)" value={d.notes} onChange={set('notes')} rows={2} />
            </FormSection>
          </>
        }
        summary={
          <>
            <ResultRows rows={[
              { label: 'Amount in words', value: words },
              { label: 'Payment mode', value: d.paymentMode },
            ]} />
            {panLikelyNeeded && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
                At this rent, the annual total is above Rs. 1,00,000 — employers usually ask for the
                landlord’s PAN. The receipt will still generate without it.
              </div>
            )}
            <ProblemList problems={problems} />
            <CharacterWarning fields={unsupported} />
            {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700" role="alert">{error}</div>}
            <GeneratePanel
              label="Download receipt PDF" totalLabel="Rent received" total={formatINR(d.amount || 0)}
              onGenerate={generate} disabled={problems.length > 0} busy={busy}
              note="Built in your browser. Nothing you type is uploaded."
            />
          </>
        }
      />
    </ToolShell>
  );
}
