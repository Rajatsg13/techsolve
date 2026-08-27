import Link from 'next/link';
import { getToolBySlug } from '../../lib/tools';

/**
 * Related workflows — a tool placed in the sequence people actually use it in.
 *
 * Deliberately just structured content, not a workflow engine. A step either
 * points at a tool (`slug`, resolved through the registry) or is a plain
 * instruction (`label`) such as "Review and submit".
 *
 * A step whose slug is unknown falls back to rendering its note as plain text
 * rather than disappearing, so a typo degrades instead of losing a step.
 */
function StepLabel({ step }) {
  const tool = step.slug ? getToolBySlug(step.slug) : null;

  if (tool) {
    return (
      <Link
        href={tool.href}
        className="text-sm font-semibold text-brand-700 hover:text-brand-900 hover:underline"
      >
        {tool.icon} {tool.name}
      </Link>
    );
  }
  return (
    <span className="text-sm font-semibold text-slate-800">
      {step.label || step.slug}
    </span>
  );
}

export default function RelatedWorkflows({ workflows }) {
  if (!workflows?.length) return null;

  return (
    <div className="space-y-5">
      {workflows.map(flow => (
        <div key={flow.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800">{flow.title}</h3>
          {flow.description && (
            <p className="text-sm text-slate-600 leading-relaxed mt-1">{flow.description}</p>
          )}

          <ol className="mt-4 space-y-0">
            {flow.steps.map((step, i) => (
              <li key={step.slug || step.label || i}>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-slate-400 w-4 flex-shrink-0 text-right" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="min-w-0 pb-0.5">
                    <StepLabel step={step} />
                    {step.note && (
                      <span className="block text-xs text-slate-500 leading-relaxed mt-0.5">{step.note}</span>
                    )}
                  </div>
                </div>
                {i < flow.steps.length - 1 && (
                  <div className="flex" aria-hidden="true">
                    <span className="w-4 flex-shrink-0" />
                    <span className="ml-3 my-1 border-l border-slate-300 h-3" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
