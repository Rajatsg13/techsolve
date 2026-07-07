// Shared SEO metadata helper for per-tool layout.js files.
//
// Next.js merges the top-level `openGraph` / `twitter` keys SHALLOWLY across the
// layout tree: a segment that defines its own object replaces the parent's rather
// than deep-merging. So each tool must re-declare the fallback OG image and the
// `summary_large_image` card here, or they silently fall back to the root's values
// (or `summary` with no image). This wraps a tool's hand-written metadata and layers
// on canonical + og:url + og:image + twitter, keeping the tool's own title/keywords.
const SITE = 'https://techsolve44.com';
const OG_IMAGE = '/og-image.jpg';

export function toolMetadata(path, meta = {}) {
  const ogTitle = (meta.openGraph && meta.openGraph.title) || meta.title;
  const ogDesc = (meta.openGraph && meta.openGraph.description) || meta.description;
  return {
    ...meta,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: 'TechSolve44',
      ...(meta.openGraph || {}),
      url: SITE + path,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDesc,
      images: [OG_IMAGE],
    },
  };
}
