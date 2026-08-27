/**
 * Numbered instructions for the tool's real interface.
 *
 * Keeps the numbered-circle treatment the tool pages already used, so this
 * section looks native rather than bolted on.
 */
export default function HowToSteps({ steps }) {
  if (!steps?.length) return null;
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-3">
          <span
            className="w-6 h-6 flex-shrink-0 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center mt-0.5"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{step.title}</p>
            <p className="text-sm text-slate-600 leading-relaxed mt-0.5">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
