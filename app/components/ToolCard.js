import Link from 'next/link';

export default function ToolCard({ icon, title, description, href, badge }) {
  return (
    <Link href={href}
      className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-100
                 hover:border-brand-200 transition-all duration-200 flex flex-col gap-3">
      {badge && (
        <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
          {badge}
        </span>
      )}
      <div className="w-11 h-11 rounded-xl bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center
                      text-2xl transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 group-hover:text-brand-700 transition-colors text-sm">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto flex items-center text-xs font-medium text-brand-600 group-hover:text-brand-800">
        Use Tool
        <svg className="ml-1 w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
