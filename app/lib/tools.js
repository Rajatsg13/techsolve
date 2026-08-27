/**
 * CENTRAL TOOL REGISTRY — single source of truth for the tool catalogue.
 *
 * Before this file existed, every tool had to be listed by hand in the homepage
 * arrays, the header nav, the footer and public/sitemap.xml. They stayed in sync
 * by discipline alone. This registry replaces the first three of those sources
 * (the footer still has its own hand-picked shortlist — see NOTE at the bottom).
 *
 * ── Adding a tool ────────────────────────────────────────────────────────────
 *   1. Add an entry here.
 *   2. Create app/<slug>/page.js and app/<slug>/layout.js (SEO metadata still
 *      lives in the layout via toolMetadata() — deliberately NOT merged into
 *      this registry yet, see NOTE).
 *   The homepage grid, header navigation and sitemap all follow automatically.
 *
 * ── status ───────────────────────────────────────────────────────────────────
 *   ACTIVE              Part of the forward-looking tool catalogue.
 *   FINLEARN_MIGRATION  Finance/investment tools that still work and still ship,
 *                       but are not part of the future product direction. They
 *                       are candidates to move to a separate FinLearn product.
 *                       Nothing is deleted or redirected — this flag exists so
 *                       the rest of the site can exclude them later by changing
 *                       one filter rather than editing many files.
 *
 * ── visibility ───────────────────────────────────────────────────────────────
 *   showOnHomepage / showInNavigation are independent of `status` on purpose.
 *   Today every tool is visible, which preserves the current site exactly.
 *   To hide the FinLearn set later, filter on `status` at the call sites in
 *   app/page.js and app/components/Header.js — do not delete entries.
 */

export const STATUS = {
  ACTIVE: 'ACTIVE',
  FINLEARN_MIGRATION: 'FINLEARN_MIGRATION',
};

export const CATEGORY = {
  DOCUMENTS: 'documents',
  IMAGES: 'images',
  FINANCE: 'finance',
};

/**
 * Category presentation metadata, keyed by category id.
 *
 * `navLabel` drives the header dropdown heading. `homeTitle` / `homeSubtitle` /
 * `homeIcon` / `homeIconBg` drive the homepage section header. These strings and
 * classes are reproduced exactly as they were before the registry existed —
 * changing them changes the rendered site.
 */
export const CATEGORY_META = {
  [CATEGORY.DOCUMENTS]: {
    id: CATEGORY.DOCUMENTS,
    navLabel: 'PDF Tools',
    homeTitle: 'PDF Tools',
    homeSubtitle: 'Convert, merge, split and edit PDF files for free',
    homeIcon: '📄',
    homeIconBg: 'bg-red-100',
  },
  [CATEGORY.IMAGES]: {
    id: CATEGORY.IMAGES,
    navLabel: 'Image Tools',
    homeTitle: 'Image Tools',
    homeSubtitle: 'Convert and resize images in your browser',
    homeIcon: '🖼️',
    homeIconBg: 'bg-blue-100',
  },
  [CATEGORY.FINANCE]: {
    id: CATEGORY.FINANCE,
    navLabel: 'Calculators',
    homeTitle: 'Financial Calculators',
    homeSubtitle: 'EMI, SIP, PPF, Income Tax and more',
    homeIcon: '🧮',
    homeIconBg: 'bg-green-100',
  },
};

/**
 * The homepage and the header nav order their categories differently, and did
 * so before the registry existed. Both orders are preserved deliberately.
 */
export const HOMEPAGE_CATEGORY_ORDER = [CATEGORY.DOCUMENTS, CATEGORY.FINANCE, CATEGORY.IMAGES];
export const NAV_CATEGORY_ORDER      = [CATEGORY.DOCUMENTS, CATEGORY.IMAGES, CATEGORY.FINANCE];

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
    category: CATEGORY.IMAGES,
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
    category: CATEGORY.IMAGES,
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
    category: CATEGORY.IMAGES,
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
 * Prefer these over filtering TOOLS inline, so the eventual FinLearn split is
 * a change in one place.
 */

/** Every tool, regardless of status. */
export const getAllTools = () => TOOLS;

/** Tools in the forward-looking catalogue. */
export const getActiveTools = () => TOOLS.filter(t => t.status === STATUS.ACTIVE);

/** Finance tools earmarked for a future FinLearn product. */
export const getFinLearnTools = () => TOOLS.filter(t => t.status === STATUS.FINLEARN_MIGRATION);

/** Tools in one category, in registry order. */
export const getToolsByCategory = (categoryId) => TOOLS.filter(t => t.category === categoryId);

/** Look up a single tool. Returns undefined if the slug is unknown. */
export const getToolBySlug = (slug) => TOOLS.find(t => t.slug === slug);

/**
 * Homepage sections. Returns [{ ...category, tools: [] }], skipping any
 * category left with no visible tools.
 *
 * To drop the finance section from the main experience later, pass
 * { excludeFinLearn: true } — nothing else needs to change.
 */
export function getHomepageSections({ excludeFinLearn = false } = {}) {
  return HOMEPAGE_CATEGORY_ORDER
    .map(categoryId => ({
      ...CATEGORY_META[categoryId],
      tools: TOOLS.filter(t =>
        t.category === categoryId &&
        t.showOnHomepage &&
        (!excludeFinLearn || t.status !== STATUS.FINLEARN_MIGRATION)
      ),
    }))
    .filter(section => section.tools.length > 0);
}

/**
 * Header dropdown groups. Same shape the header used before this registry
 * existed: [{ label, items: [{ label, href }] }].
 */
export function getNavigationGroups({ excludeFinLearn = false } = {}) {
  return NAV_CATEGORY_ORDER
    .map(categoryId => ({
      label: CATEGORY_META[categoryId].navLabel,
      items: TOOLS
        .filter(t =>
          t.category === categoryId &&
          t.showInNavigation &&
          (!excludeFinLearn || t.status !== STATUS.FINLEARN_MIGRATION)
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
