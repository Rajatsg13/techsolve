/**
 * TOOL CONTENT REGISTRY
 *
 * Rich, human-written content for individual tool pages. Separate from
 * app/lib/tools.js on purpose:
 *
 *   app/lib/tools.js      — catalogue facts (name, route, category, status).
 *                           Every tool has an entry. Drives discovery surfaces.
 *   app/content/tools/    — page content (explanations, steps, FAQs).
 *                           Optional. Drives what a visitor reads on the page.
 *
 * Adoption is progressive: a tool with no content file here renders exactly as
 * it did before, with no error and no empty headings.
 *
 * ── Adding content for a tool ────────────────────────────────────────────────
 *   1. Create app/content/tools/<slug>.js exporting a default object (copy
 *      pdf-merge.js as the reference).
 *   2. Import and register it in CONTENT below.
 *   3. In the tool's page.js:
 *        import ToolContent from '../components/tool-content/ToolContent';
 *        import { getToolContent } from '../content/tools';
 *        ...
 *        <ToolContent content={getToolContent('<slug>')} />
 *      Put it after the tool interface — the tool must stay reachable without
 *      scrolling past an article.
 *
 * ── Schema ───────────────────────────────────────────────────────────────────
 * Every field is optional except `slug`. Omit a field and its section is not
 * rendered at all.
 *
 *   slug              string    Must match the registry slug in app/lib/tools.js
 *   outcome           string    One line: the result the user gets. Shown under
 *                               the page heading, above the tool.
 *   whatItDoes        string[]  Paragraphs explaining the practical purpose
 *   whenToUse         Item[]    Situations that lead someone here
 *   workplaceUses     Item[]    Concrete work examples
 *   howToSteps        Item[]    Ordered instructions for the real interface
 *   tips              Item[]    Guidance that prevents a mistake or rework
 *   faqs              {q,a}[]   Questions, answered honestly
 *   relatedWorkflows  Workflow[]
 *   relatedTools      string[]  Registry slugs — never names or URLs
 *
 *   Item      = { title: string, body: string }
 *   Workflow  = { title, description, steps: Step[] }
 *   Step      = { slug?: string, label?: string, note?: string }
 *               `slug` links to a tool via the registry; `label` is for a step
 *               that is not a tool ("Review and submit"). One or the other.
 *
 * ── Writing guidance ─────────────────────────────────────────────────────────
 *   · Describe what the tool actually does. Check the implementation first.
 *   · Do not restate the same point in two sections.
 *   · No marketing voice, no padding for length.
 *   · Only claim privacy, limits or behaviour that has been verified.
 */

import pdfMerge from './pdf-merge';
import jsonFormatter from './json-formatter';
import base64EncoderDecoder from './base64-encoder-decoder';
import urlEncoderDecoder from './url-encoder-decoder';
import percentageCalculator from './percentage-calculator';
import percentageIncreaseCalculator from './percentage-increase-calculator';
import gstCalculator from './gst-calculator';
import profitMarginCalculator from './profit-margin-calculator';
import breakEvenCalculator from './break-even-calculator';
import roiCalculator from './roi-calculator';
import salaryHikeCalculator from './salary-hike-calculator';
import workingDaysCalculator from './working-days-calculator';
import invoiceGenerator from './invoice-generator';
import payslipGenerator from './payslip-generator';
import rentReceiptGenerator from './rent-receipt-generator';

const CONTENT = {
  'pdf-merge': pdfMerge,
  'json-formatter': jsonFormatter,
  'base64-encoder-decoder': base64EncoderDecoder,
  'url-encoder-decoder': urlEncoderDecoder,
  'percentage-calculator': percentageCalculator,
  'percentage-increase-calculator': percentageIncreaseCalculator,
  'gst-calculator': gstCalculator,
  'profit-margin-calculator': profitMarginCalculator,
  'break-even-calculator': breakEvenCalculator,
  'roi-calculator': roiCalculator,
  'salary-hike-calculator': salaryHikeCalculator,
  'working-days-calculator': workingDaysCalculator,
  'invoice-generator': invoiceGenerator,
  'payslip-generator': payslipGenerator,
  'rent-receipt-generator': rentReceiptGenerator,
};

/**
 * Content for a tool, or `undefined` if it has none yet.
 * Callers pass the result straight to <ToolContent>, which renders nothing
 * when given undefined.
 */
export function getToolContent(slug) {
  return CONTENT[slug];
}

/** Slugs that currently have rich content. Useful for tests and audits. */
export function getSlugsWithContent() {
  return Object.keys(CONTENT);
}

export default CONTENT;
