/**
 * Cross-brand contextual advertising configuration.
 *
 * Rules (from marketing plan):
 *  - Contextual only — appears only where relevant to the user's task
 *  - One per page maximum
 *  - Below the fold, after the tool result, above the FAQ
 *  - No animation, no popups, no autoplay
 *  - Set active: true ONLY once that brand's website is fully live
 *
 * Icons are rendered by CrossBrandCard using the iconKey string —
 * no JSX stored here to keep this a plain JS config file.
 */

export const BRANDS = {
  growbiz: {
    name: 'GrowBiz Consulting',
    url: 'https://growbizconsulting.in',   // update when live
    tagline: 'Making a big financial decision? GrowBiz Consulting can help you plan it properly.',
    cta: 'Talk to a consultant →',
    active: false,                          // flip to true when site is live
    iconKey: 'briefcase',
    iconColor: 'text-emerald-600',
  },

  dhyai: {
    name: 'Dhyai Studio',
    url: 'https://dhyaistudio.com',        // update when live
    tagline: 'Need professional document design or brand assets? Dhyai Studio can help.',
    cta: 'See our work →',
    active: false,
    iconKey: 'palette',
    iconColor: 'text-violet-600',
  },

  levelupx: {
    name: 'LevelUpX AI',
    url: 'https://levelupxai.com',         // update when live
    tagline: 'Want to automate this workflow with AI? Check out LevelUpX AI.',
    cta: 'Explore AI tools →',
    active: false,
    iconKey: 'sparkle',
    iconColor: 'text-blue-600',
  },
};

/**
 * Maps each tool page slug to the brand that should appear on it.
 * Only slugs listed here will ever show a card (and only if brand.active === true).
 */
export const PAGE_BRAND_MAP = {
  // Financial calculators → GrowBiz Consulting
  'emi-calculator':           'growbiz',
  'sip-calculator':           'growbiz',
  'lumpsum-calculator':       'growbiz',
  'ppf-calculator':           'growbiz',
  'income-tax-calculator':    'growbiz',
  'graham-number-calculator': 'growbiz',
  'fire-calculator':          'growbiz',
  'sharpe-ratio-calculator':  'growbiz',
  'stock-profit-calculator':  'growbiz',
  'mf-profit-calculator':     'growbiz',

  // PDF & image tools → Dhyai Studio
  'pdf-merge':        'dhyai',
  'pdf-watermark':    'dhyai',
  'pdf-page-numbers': 'dhyai',
  'pdf-compress':     'dhyai',
  'image-resize':     'dhyai',
  'image-to-pdf':     'dhyai',
  'word-to-pdf':      'dhyai',
  'html-to-pdf':      'dhyai',
  'pdf-unlock':       'dhyai',

  // AI-adjacent PDF tools → LevelUpX AI
  'pdf-ocr':      'levelupx',
  'scan-to-pdf':  'levelupx',
  'pdf-to-word':  'levelupx',
};
