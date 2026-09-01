import Section, { ItemList } from './Section';
import HowToSteps from './HowToSteps';
import FaqList from './FaqList';
import RelatedTools from './RelatedTools';
import RelatedWorkflows from './RelatedWorkflows';

/**
 * Renders every rich-content section a tool has, in a consistent order.
 *
 * A tool page adds all of this with one line:
 *
 *   <ToolContent content={getToolContent('pdf-merge')} />
 *
 * Graceful degradation is the point:
 *   · no content at all  → renders nothing (page is unchanged)
 *   · some fields missing → only the present sections render, no empty headings
 *
 * The tool's own heading, outcome line and interface stay in the page itself,
 * above this component — a visitor must never have to scroll past an article
 * to reach the tool.
 *
 * Sections that are simple prose or a title/body list are rendered here rather
 * than being split into their own single-purpose components; only sections with
 * genuinely distinct presentation (steps, FAQs, workflows, related tools) get
 * their own file.
 */
export default function ToolContent({ content }) {
  if (!content) return null;

  const {
    slug,
    whatItDoes,
    limitations,
    whenToUse,
    workplaceUses,
    howToSteps,
    tips,
    faqs,
    relatedWorkflows,
    relatedTools,
  } = content;

  return (
    <div className="mt-4">
      {whatItDoes?.length > 0 && (
        <Section title="What this tool does">
          <div className="space-y-3">
            {whatItDoes.map((para, i) => (
              <p key={i} className="text-sm text-slate-600 leading-relaxed">{para}</p>
            ))}
          </div>
        </Section>
      )}

      {/*
        Limitations sit immediately after what the tool does, before any of the
        selling. Some tools have a trade-off a reader must not miss — redaction
        rasterises the page, signing is not a certified signature — and burying
        that at the bottom of an FAQ would be a way of hiding it.
      */}
      {limitations?.length > 0 && (
        <Section title="Important limitations">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
            {limitations.map((para, i) => (
              <p key={i} className="text-sm text-amber-900 leading-relaxed flex gap-2.5">
                <span aria-hidden="true" className="select-none">•</span>
                <span>{para}</span>
              </p>
            ))}
          </div>
        </Section>
      )}

      {whenToUse?.length > 0 && (
        <Section title="When you might need it">
          <ItemList items={whenToUse} columns />
        </Section>
      )}

      {workplaceUses?.length > 0 && (
        <Section title="Common workplace uses">
          <ItemList items={workplaceUses} columns />
        </Section>
      )}

      {howToSteps?.length > 0 && (
        <Section title="How to use it">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <HowToSteps steps={howToSteps} />
          </div>
        </Section>
      )}

      {tips?.length > 0 && (
        <Section title="Practical tips">
          <ItemList items={tips} />
        </Section>
      )}

      {faqs?.length > 0 && (
        <Section title="Common questions">
          <FaqList faqs={faqs} />
        </Section>
      )}

      {relatedWorkflows?.length > 0 && (
        <Section title="Related workflows">
          <RelatedWorkflows workflows={relatedWorkflows} />
        </Section>
      )}

      {relatedTools?.length > 0 && (
        <Section title="Related tools">
          <RelatedTools slugs={relatedTools} currentSlug={slug} />
        </Section>
      )}
    </div>
  );
}
