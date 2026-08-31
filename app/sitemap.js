import { TOOLS, SUPPORT_PAGES } from './lib/tools';

/**
 * Sitemap, generated from the central tool registry.
 *
 * This replaces the hand-maintained public/sitemap.xml, which had to be edited
 * by hand every time a tool was added and was therefore a standing drift risk.
 *
 * Two things to keep in mind if you edit this:
 *   · next.config.mjs sets `trailingSlash: true`, so every URL here ends in a
 *     slash. Registry `href` values deliberately do not, hence the appended '/'.
 *   · The domain is duplicated from app/lib/toolMeta.js rather than imported.
 *     Keep the two constants in step if the origin ever changes again.
 */
// Canonical origin. tools.decyfy.com is the live host; techsolve44.com 308-redirects
// here. Every canonical, sitemap and JSON-LD URL must use this value — pointing them
// at the old host would declare each page canonical to a URL that redirects away.
const SITE = 'https://tools.decyfy.com';

export default function sitemap() {
  return [
    {
      url: `${SITE}/`,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...TOOLS.map(tool => ({
      url: `${SITE}${tool.href}/`,
      changeFrequency: tool.sitemapChangefreq,
      priority: tool.sitemapPriority,
    })),
    ...SUPPORT_PAGES.map(page => ({
      url: `${SITE}${page.href}/`,
      changeFrequency: page.sitemapChangefreq,
      priority: page.sitemapPriority,
    })),
  ];
}
