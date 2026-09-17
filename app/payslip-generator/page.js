'use client';
import { useState, useMemo } from 'react';
import ToolShell, { ToolNotice } from '../components/tool-ui/ToolShell';
import { TextField } from '../components/tool-ui/Field';
import { GeneratorLayout, FormSection, AreaField, ProblemList, CharacterWarning, GeneratePanel, RowEditor }
  from '../components/tool-ui/GeneratorShell';
import { ResultRows } from '../components/tool-ui/Result';
import { getToolContent } from '../content/tools';
import { payslipTotals, validatePayslip } from '../lib/generators';
import { hasUnsupportedCharacters } from '../lib/docPdf';
import { downloadBytes } from '../lib/download';
import { formatINR } from '../lib/format';

const content = getToolContent('payslip-generator');

export default function PayslipGenerator() {
  const [d, setD] = useState({
    employerName: '', employerAddress: '',
    employeeName: '', employeeId: '', designation: '', department: '',
    period: '', payDate: new Date().toISOString().slice(0, 10),
    paidDays: '', lopDays: '', pan: '', uan: '', bankAccount: '',
    earnings: [
      { label: 'Basic salary', amount: '' },
      { label: 'House rent allowance', amount: '' },
    ],
    deductions: [{ label: 'Provident fund', amount: '' }],
    notes: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (v) => setD(p => ({ ...p, [k]: v }));

  const totals = useMemo(() => payslipTotals(d.earnings, d.deductions), [d.earnings, d.deductions]);
  const problems = validatePayslip(d);
  const unsupported = [
    ['Employer name', d.employerName], ['Employer address', d.employerAddress],
    ['Employee name', d.employeeName], ['Designation', d.designation],
    ['An earnings or deduction label', [...d.earnings, ...d.deductions].map(r => r.label).join(' ')],
    ['Notes', d.notes],
  ].filter(([, v]) => hasUnsupportedCharacters(v)).map(([label]) => label);

  const generate = async () => {
    setBusy(true); setError('');
    try {
      const { buildPayslipPdf } = await import('../lib/generatorPdfs');
      const { bytes } = await buildPayslipPdf(d);
      const who = (d.employeeName || 'payslip').replace(/[^\w-]+/g, '-').toLowerCase();
      const when = (d.period || '').replace(/[^\w-]+/g, '-').toLowerCase();
      downloadBytes(bytes, `payslip-${who}${when ? '-' + when : ''}.pdf`, 'application/pdf');
    } catch (e) {
      setError('Could not generate the PDF: ' + (e?.message || 'unknown error'));
    }
    setBusy(false);
  };

  return (
    <ToolShell
      slug="payslip-generator"
      title="Payslip Generator"
      outcome="Enter earnings and deductions, and download a clear salary slip PDF for one employee and one pay period."
      notice={
        <ToolNotice>
          This produces a salary statement from the figures you enter. It does not calculate PF, ESI,
          professional tax or TDS for you, and it is not a substitute for payroll software or tax advice.
        </ToolNotice>
      }
      content={content}
    >
      <GeneratorLayout
        form={
          <>
            <FormSection title="Employer">
              <TextField id="ps-employer" label="Employer name" value={d.employerName} onChange={set('employerName')} />
              <TextField id="ps-period" label="Pay period" value={d.period} onChange={set('period')} placeholder="August 2026" />
              <AreaField id="ps-employer-addr" label="Employer address (optional)" value={d.employerAddress} onChange={set('employerAddress')} rows={2} />
              <TextField id="ps-paydate" label="Payment date" type="date" value={d.payDate} onChange={set('payDate')} />
            </FormSection>

            <FormSection title="Employee">
              <TextField id="ps-emp" label="Employee name" value={d.employeeName} onChange={set('employeeName')} />
              <TextField id="ps-empid" label="Employee ID (optional)" value={d.employeeId} onChange={set('employeeId')} />
              <TextField id="ps-desig" label="Designation (optional)" value={d.designation} onChange={set('designation')} />
              <TextField id="ps-dept" label="Department (optional)" value={d.department} onChange={set('department')} />
              <TextField id="ps-paid" label="Paid days (optional)" value={d.paidDays} onChange={set('paidDays')} placeholder="31" />
              <TextField id="ps-lop" label="Loss-of-pay days (optional)" value={d.lopDays} onChange={set('lopDays')} placeholder="0" />
              <TextField id="ps-pan" label="PAN (optional)" value={d.pan} onChange={set('pan')} />
              <TextField id="ps-uan" label="UAN (optional)" value={d.uan} onChange={set('uan')} />
              <TextField id="ps-bank" label="Bank account (optional)" value={d.bankAccount} onChange={set('bankAccount')}
                hint="Shown as entered — mask it yourself if you only want the last four digits." />
            </FormSection>

            <FormSection title="Earnings" columns={1}>
              <RowEditor rows={d.earnings} onChange={set('earnings')} addLabel="Add earning"
                columns={[
                  { key: 'label', label: 'Component', flex: '2.4fr', placeholder: 'Conveyance allowance' },
                  { key: 'amount', label: 'Amount', type: 'number', flex: '1fr' },
                ]} />
            </FormSection>

            <FormSection title="Deductions" columns={1}>
              <RowEditor rows={d.deductions} onChange={set('deductions')} addLabel="Add deduction" minRows={0}
                columns={[
                  { key: 'label', label: 'Component', flex: '2.4fr', placeholder: 'Professional tax' },
                  { key: 'amount', label: 'Amount', type: 'number', flex: '1fr' },
                ]} />
            </FormSection>

            <FormSection title="Notes" columns={1}>
              <AreaField id="ps-notes" label="Notes (optional)" value={d.notes} onChange={set('notes')} rows={2} />
            </FormSection>
          </>
        }
        summary={
          <>
            <ResultRows rows={[
              { label: 'Gross earnings', value: formatINR(totals.grossEarnings) },
              { label: 'Total deductions', value: '− ' + formatINR(totals.totalDeductions) },
            ]} />
            {totals.negative && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
                Deductions exceed gross earnings, so net pay is negative. That is allowed — recoveries do
                happen — but check the figures if it was not intended.
              </div>
            )}
            <ProblemList problems={problems} />
            <CharacterWarning fields={unsupported} />
            {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700" role="alert">{error}</div>}
            <GeneratePanel
              label="Download payslip PDF" totalLabel="Net pay" total={formatINR(totals.netPay)}
              onGenerate={generate} disabled={problems.length > 0} busy={busy}
              note="Built in your browser. Salary details are not uploaded anywhere."
            />
          </>
        }
      />
    </ToolShell>
  );
}
