/**
 * CENTRAL TOOL REGISTRY — single source of truth for the tool catalogue.
 *
 * Replaces what used to be four hand-maintained lists (homepage arrays, header
 * nav, sitemap XML). The footer keeps its own curated shortlist — see NOTE.
 *
 * ── Adding a tool ────────────────────────────────────────────────────────────
 *   1. Build the tool: app/<slug>/page.js and app/<slug>/layout.js.
 *   2. Add an entry here — assign a `category` and `status: STATUS.ACTIVE`.
 *   3. Optionally add rich content in app/content/tools/<slug>.js.
 *   The homepage grid, header navigation and sitemap all follow automatically.
 *
 *   Never add an entry for a tool that does not exist and work. There are no
 *   placeholder or "coming soon" entries — the live catalogue contains only
 *   functioning tools. Planned tools live in the documentation, not here.
 *
 * ── status ───────────────────────────────────────────────────────────────────
 *   ACTIVE              The public Tools by Decyfy catalogue.
 *   FINLEARN_MIGRATION  Finance and investment tools. Still functional, still
 *                       routed, still in the sitemap, still linked from the
 *                       footer — but excluded from the homepage catalogue, the
 *                       navigation and related-tool recommendations. They are
 *                       candidates to move to a separate FinLearn product.
 *                       Do not delete them, change their routes, or edit their
 *                       implementations.
 *
 * ── the rule ─────────────────────────────────────────────────────────────────
 *   Status decides discovery; category decides where a tool is filed. Both live
 *   here. Components must not filter by status themselves — the selectors below
 *   already do it, by default, so a call site cannot forget.
 *
 * ── visibility ───────────────────────────────────────────────────────────────
 *   showOnHomepage / showInNavigation are per-tool overrides, independent of
 *   `status`. They exist to hide an individual ACTIVE tool from a surface; they
 *   are not the FinLearn mechanism.
 */

export const STATUS = {
  ACTIVE: 'ACTIVE',
  FINLEARN_MIGRATION: 'FINLEARN_MIGRATION',
};

export const CATEGORY = {
  DOCUMENTS:  'documents',
  FILES:      'files',
  DATA:       'data',
  BUSINESS:   'business',
  GENERATORS: 'generators',
  // Legacy taxonomy. Retained because the finance tools still reference it and
  // still work; it is kept out of public surfaces by STATUS, not by category.
  FINANCE:    'finance',
};

/**
 * Category metadata — the Tools by Decyfy product taxonomy.
 *
 *   id           stable internal identifier (never change; routes and content
 *                do not depend on it, but saved filters and analytics may)
 *   order        display order across every surface
 *   name         public display name
 *   navLabel     header dropdown heading (usually the same as `name`)
 *   description  one line, for section subtitles and future category pages
 *   homeIcon     emoji shown beside the homepage section heading
 *   homeIconBg   Tailwind class for that icon's background
 *   legacy       true = defined for continuity, not part of the public catalogue
 *
 * Categories with no ACTIVE tools are defined here but never rendered — the
 * selectors drop empty sections, so Data & Text, Business & Work and
 * Generators stay invisible until their first real tool ships. This is
 * deliberate: the taxonomy is ready, but the live catalogue only ever contains
 * tools that actually work.
 */
export const CATEGORY_META = {
  [CATEGORY.DOCUMENTS]: {
    id: CATEGORY.DOCUMENTS,
    order: 1,
    name: 'Documents & PDF',
    navLabel: 'Documents & PDF',
    description: 'Work with PDFs, documents and everyday file tasks.',
    homeIcon: '📄',
    homeIconBg: 'bg-red-100',
  },
  [CATEGORY.FILES]: {
    id: CATEGORY.FILES,
    order: 2,
    name: 'File & Image',
    navLabel: 'File & Image',
    description: 'Convert, resize and manage images and common files.',
    homeIcon: '🖼️',
    homeIconBg: 'bg-blue-100',
  },
  [CATEGORY.DATA]: {
    id: CATEGORY.DATA,
    order: 3,
    name: 'Data & Text',
    navLabel: 'Data & Text',
    description: 'Format, convert and work with structured data and text.',
    homeIcon: '🔤',
    homeIconBg: 'bg-violet-100',
  },
  [CATEGORY.BUSINESS]: {
    id: CATEGORY.BUSINESS,
    order: 4,
    name: 'Business & Work',
    navLabel: 'Business & Work',
    description: 'Practical calculators and utilities for everyday work decisions.',
    homeIcon: '📊',
    homeIconBg: 'bg-amber-100',
  },
  [CATEGORY.GENERATORS]: {
    id: CATEGORY.GENERATORS,
    order: 5,
    name: 'Generators',
    navLabel: 'Generators',
    description: 'Create commonly used business and personal documents.',
    homeIcon: '🧾',
    homeIconBg: 'bg-emerald-100',
  },
  [CATEGORY.FINANCE]: {
    id: CATEGORY.FINANCE,
    order: 90,
    legacy: true,
    name: 'Financial Calculators',
    navLabel: 'Calculators',
    description: 'Investment and loan calculators, pending migration to FinLearn.',
    homeIcon: '🧮',
    homeIconBg: 'bg-green-100',
  },
};

/**
 * Every category, in display order.
 *
 * The homepage and the header used to need separate orderings, because the
 * finance section sat in a different position on each. Now that finance is out
 * of both public surfaces, a single `order` serves both.
 */
export const CATEGORY_ORDER = Object.values(CATEGORY_META)
  .slice()
  .sort((a, b) => a.order - b.order)
  .map(c => c.id);

/**
 * Field reference
 *   slug              URL segment, also the app/<slug>/ directory name
 *   name              Canonical display name (homepage card title)
 *   href              Route as linked from the site. No trailing slash here —
 *                     next.config.mjs sets trailingSlash: true, and the sitemap
 *                     helper appends the slash. Do not change existing values.
 *   category          One of CATEGORY
 *   status            One of STATUS
 *   shortDescription  One line, used on the homepage card
 *   icon              Emoji used on the homepage card and in the nav label
 *   navName           Nav dropdown text when it differs from `name`
 *                     (kept so the rendered nav is byte-identical to before)
 *   badge             'Popular' | 'New' | undefined — homepage card badge
 *   showOnHomepage    Render in the homepage grid
 *   showInNavigation  Render in the header dropdown
 *   sitemapPriority   <priority> in the generated sitemap
 *   sitemapChangefreq <changefreq> in the generated sitemap
 */
export const TOOLS = [
  // ── Documents & PDF ───────────────────────────────────────────────────────
  {
    slug: 'pdf-to-word',
    navOrder: 5,
    name: 'PDF to Word',
    href: '/pdf-to-word',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Convert PDF files to editable Word documents instantly.',
    icon: '📄',
    badge: 'Popular',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'pdf-to-jpg',
    navOrder: 7,
    name: 'PDF to JPG',
    href: '/pdf-to-jpg',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Convert each PDF page to a high-quality JPG image.',
    icon: '🖼️',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'pdf-merge',
    navOrder: 1,
    name: 'Merge PDF',
    href: '/pdf-merge',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Combine multiple PDF files into a single document.',
    icon: '🔗',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'pdf-split',
    navOrder: 2,
    name: 'Split PDF',
    href: '/pdf-split',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Split a PDF into pages or custom page ranges.',
    icon: '✂️',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'pdf-organize',
    navOrder: 3,
    name: 'Organize Pages',
    href: '/pdf-organize',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Reorder and delete pages in your PDF.',
    icon: '📑',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'pdf-compress',
    navOrder: 4,
    name: 'Compress PDF',
    href: '/pdf-compress',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Reduce PDF file size without losing quality.',
    icon: '🗜️',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'word-to-pdf',
    navOrder: 6,
    name: 'Word to PDF',
    href: '/word-to-pdf',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Convert Word (.docx) files to PDF format online.',
    icon: '📝',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'pdf-watermark',
    navOrder: 8,
    name: 'Watermark PDF',
    href: '/pdf-watermark',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Add a custom text watermark to every page.',
    icon: '💧',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'pdf-page-numbers',
    navOrder: 9,
    name: 'Add Page Numbers',
    href: '/pdf-page-numbers',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Number every page of your PDF automatically.',
    icon: '🔢',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'html-to-pdf',
    navOrder: 10,
    name: 'HTML to PDF',
    href: '/html-to-pdf',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Convert any HTML content to a PDF file.',
    icon: '🌐',
    badge: 'New',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'pdf-ocr',
    navOrder: 11,
    name: 'OCR PDF',
    href: '/pdf-ocr',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Extract text from scanned PDFs using OCR.',
    icon: '🔍',
    badge: 'New',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'pdf-unlock',
    navOrder: 12,
    name: 'Remove PDF Password',
    href: '/pdf-unlock',
    category: CATEGORY.DOCUMENTS,
    status: STATUS.ACTIVE,
    shortDescription: 'Remove owner or user password protection from any PDF.',
    icon: '🔓',
    navName: 'Remove Password',
    badge: 'New',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },

  // ── Images & Scanning ─────────────────────────────────────────────────────
  {
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    href: '/image-to-pdf',
    category: CATEGORY.FILES,
    status: STATUS.ACTIVE,
    shortDescription: 'Convert JPG, PNG images into a PDF file easily.',
    icon: '🖼️',
    badge: 'Popular',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'image-resize',
    name: 'Image Resizer',
    href: '/image-resize',
    category: CATEGORY.FILES,
    status: STATUS.ACTIVE,
    shortDescription: 'Resize JPG, PNG or WebP to any size. Change format & quality.',
    icon: '📐',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'scan-to-pdf',
    name: 'Scan to PDF',
    href: '/scan-to-pdf',
    category: CATEGORY.FILES,
    status: STATUS.ACTIVE,
    shortDescription: 'Use your phone camera to scan documents to PDF.',
    icon: '📷',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },

  // ── Finance — FinLearn migration candidates ───────────────────────────────
  // Fully functional and still shipping. Not part of the future product
  // direction. Do not delete, redirect or modify their implementations.
  {
    slug: 'emi-calculator',
    name: 'EMI Calculator',
    href: '/emi-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: 'Calculate EMI for home, car or personal loans instantly.',
    icon: '🏠',
    navIcon: '🏦',
    badge: 'Popular',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'sip-calculator',
    name: 'SIP Calculator',
    href: '/sip-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: 'Calculate returns on your monthly SIP investments.',
    icon: '📈',
    badge: 'Popular',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'lumpsum-calculator',
    name: 'Lumpsum Calculator',
    href: '/lumpsum-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: 'Calculate returns on a one-time mutual fund investment.',
    icon: '💰',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'ppf-calculator',
    name: 'PPF Calculator',
    href: '/ppf-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: 'Calculate your Public Provident Fund returns & maturity.',
    icon: '🏦',
    navIcon: '🏛️',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'income-tax-calculator',
    name: 'Income Tax Calculator',
    href: '/income-tax-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: 'Calculate salary breakdown & income tax for FY 2025-26.',
    icon: '🧾',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'graham-number-calculator',
    name: 'Graham Number Calculator',
    href: '/graham-number-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: "Find a stock's intrinsic value using Benjamin Graham's formula.",
    icon: '📐',
    badge: 'New',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'fire-calculator',
    name: 'FIRE Calculator',
    href: '/fire-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: 'Calculate your Financial Independence number and years to early retirement.',
    icon: '🔥',
    badge: 'New',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'sharpe-ratio-calculator',
    name: 'Sharpe Ratio Calculator',
    href: '/sharpe-ratio-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: "Measure your portfolio's risk-adjusted return quality.",
    icon: '📊',
    badge: 'New',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'stock-profit-calculator',
    name: 'Stock Profit Calculator',
    href: '/stock-profit-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: 'Net share trading profit after brokerage, STT, GST and capital gains tax.',
    icon: '📉',
    badge: 'New',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'monthly',
  },
  {
    slug: 'mf-profit-calculator',
    name: 'MF Profit Calculator',
    href: '/mf-profit-calculator',
    category: CATEGORY.FINANCE,
    status: STATUS.FINLEARN_MIGRATION,
    shortDescription: 'Search any Indian mutual fund and see real profit, XIRR and tax on gains.',
    icon: '💹',
    badge: 'New',
    showOnHomepage: true,
    showInNavigation: true,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'monthly',
  },
];

/**
 * Non-tool routes that still belong in the sitemap. Kept here so the sitemap
 * has a single source too. `/` is emitted separately by app/sitemap.js.
 */
export const SUPPORT_PAGES = [
  { href: '/changelog',       sitemapPriority: 0.4, sitemapChangefreq: 'weekly'  },
  { href: '/about',           sitemapPriority: 0.4, sitemapChangefreq: 'monthly' },
  { href: '/contact',         sitemapPriority: 0.3, sitemapChangefreq: 'monthly' },
  { href: '/privacy-policy',  sitemapPriority: 0.3, sitemapChangefreq: 'yearly'  },
  { href: '/terms-of-service',sitemapPriority: 0.3, sitemapChangefreq: 'yearly'  },
];

/* ── Selectors ──────────────────────────────────────────────────────────────
 *
 * THE DISCOVERY RULE, in one place:
 *
 *   ACTIVE              → the public Tools by Decyfy catalogue. Appears on the
 *                         homepage, in the navigation, and in related-tool
 *                         recommendations.
 *   FINLEARN_MIGRATION  → functional legacy. Routes keep working, pages stay in
 *                         the sitemap and remain linked from the footer, but
 *                         they are absent from the primary discovery surfaces.
 *
 * getHomepageSections() and getNavigationGroups() exclude FINLEARN_MIGRATION by
 * default, so call sites pass nothing and cannot forget the rule. Nothing in
 * app/page.js or app/components/Header.js filters by status — if that ever
 * appears in a component, the rule has leaked and belongs back here.
 */

/** Every tool, both statuses. */
export const getAllTools = () => TOOLS;

/** The public catalogue. */
export const getActiveTools = () => TOOLS.filter(t => t.status === STATUS.ACTIVE);

/** Finance tools earmarked for a future FinLearn product. */
export const getFinLearnTools = () => TOOLS.filter(t => t.status === STATUS.FINLEARN_MIGRATION);

/**
 * Tools in one category, in registry order.
 * ACTIVE-only by default, matching every other public-facing selector.
 */
export const getToolsByCategory = (categoryId, { includeFinLearn = false } = {}) =>
  TOOLS.filter(t =>
    t.category === categoryId &&
    (includeFinLearn || t.status === STATUS.ACTIVE)
  );

/** Look up a single tool by slug, any status. Returns undefined if unknown. */
export const getToolBySlug = (slug) => TOOLS.find(t => t.slug === slug);

/** Categories that currently contain at least one ACTIVE tool, in display order. */
export const getPopulatedCategories = () =>
  CATEGORY_ORDER
    .filter(id => getToolsByCategory(id).length > 0)
    .map(id => CATEGORY_META[id]);

/**
 * Homepage catalogue sections: [{ ...categoryMeta, tools: [] }].
 *
 * Empty categories are dropped, so the three categories that exist in the
 * taxonomy but have no tools yet (Data & Text, Business & Work, Generators)
 * never render as empty headings.
 */
export function getHomepageSections({ includeFinLearn = false } = {}) {
  return CATEGORY_ORDER
    .map(categoryId => ({
      ...CATEGORY_META[categoryId],
      tools: TOOLS.filter(t =>
        t.category === categoryId &&
        t.showOnHomepage &&
        (includeFinLearn || t.status === STATUS.ACTIVE)
      ),
    }))
    .filter(section => section.tools.length > 0);
}

/**
 * Header dropdown groups: [{ label, items: [{ label, href }] }].
 * Groups with no items are dropped, so no empty dropdown can appear.
 */
export function getNavigationGroups({ includeFinLearn = false } = {}) {
  return CATEGORY_ORDER
    .map(categoryId => ({
      label: CATEGORY_META[categoryId].navLabel,
      items: TOOLS
        .filter(t =>
          t.category === categoryId &&
          t.showInNavigation &&
          (includeFinLearn || t.status === STATUS.ACTIVE)
        )
        // The header lists PDF tools in a different order from the homepage
        // grid. `navOrder` preserves that; categories without it keep registry
        // order (Array.prototype.sort is stable).
        .slice()
        .sort((a, b) => (a.navOrder ?? Number.MAX_SAFE_INTEGER) - (b.navOrder ?? Number.MAX_SAFE_INTEGER))
        .map(t => ({
          label: `${t.navIcon || t.icon} ${t.navName || t.name}`,
          href: t.href,
        })),
    }))
    .filter(group => group.items.length > 0);
}

/**
 * Resolve a content file's `relatedTools` slugs into tool objects.
 *
 * Centralised so no content file has to know the discovery rule, and so a
 * future content author cannot accidentally recommend a tool that is on its way
 * out of the product:
 *
 *   · unknown slug              → dropped (a typo never ships a dead link)
 *   · the current tool itself   → dropped
 *   · FINLEARN_MIGRATION tool   → dropped when the page it appears on is ACTIVE
 *
 * A FinLearn page may still recommend its FinLearn siblings — the rule is
 * derived from the host page's status rather than hard-coded, so the finance
 * tools stay coherent among themselves right up until they migrate.
 */
export function resolveRelatedTools(slugs, { currentSlug } = {}) {
  const host = currentSlug ? getToolBySlug(currentSlug) : undefined;
  const hostIsFinLearn = host?.status === STATUS.FINLEARN_MIGRATION;

  return (slugs || [])
    .filter(slug => slug !== currentSlug)
    .map(getToolBySlug)
    .filter(Boolean)
    .filter(tool => hostIsFinLearn || tool.status === STATUS.ACTIVE);
}

/*
 * NOTE — deliberately NOT centralised in this step:
 *
 *  · SEO metadata. Each tool keeps its own app/<slug>/layout.js using
 *    toolMetadata() from app/lib/toolMeta.js. That helper exists because
 *    Next.js merges openGraph/twitter shallowly across the layout tree, and
 *    folding it into this registry would be a large, riskier change.
 *
 *  · Per-tool rich content (FAQs, how-to steps, workplace uses). Those are
 *    still inline JSX in each page.js. The intended next step is one content
 *    module per tool that this registry can reference.
 *
 *  · The footer (app/components/Footer.js) shows a hand-picked shortlist, not
 *    the full catalogue, so it was left alone rather than silently changing
 *    what visitors see.
 */
