/**
 * GA4 event tracking — Event Taxonomy v1.
 *
 * GA4 itself is installed in app/layout.js (property G-258PZM6WZJ) and sends
 * page_view automatically. This module adds the application-level events that
 * a page view cannot tell us: whether anyone actually *used* a tool.
 *
 * ── What may be sent ────────────────────────────────────────────────────────
 * Only the tool's slug, its category, a coarse error reason, and a share
 * platform name. Never file contents, document text, filenames, input values,
 * error messages from a library, or anything a user typed. Error reasons are a
 * fixed vocabulary (ERROR_REASON) precisely so a caller cannot accidentally
 * pass an exception message through.
 *
 * ── Categories come from the registry ───────────────────────────────────────
 * Call sites pass a slug; the category is looked up in app/lib/tools.js, which
 * is the single source of truth. Nothing here duplicates catalogue metadata.
 *
 * ── Failure is silent by design ─────────────────────────────────────────────
 * gtag is absent whenever an ad blocker removed it, during SSR, and in tests.
 * Every function no-ops in that case. Analytics must never break a tool.
 */

import { getToolBySlug, TOOLS } from './tools';

/**
 * Coarse, non-sensitive failure reasons.
 *
 * Deliberately a closed set: an exception message can contain a filename or
 * document text, so it must never be forwarded. Add a value here rather than
 * passing a free string at a call site.
 */
export const ERROR_REASON = {
  LOAD_FAILED:       'load_failed',        // the input could not be opened or decoded
  PROCESSING_FAILED: 'processing_failed',  // the operation itself failed
  ENCODING_FAILED:   'encoding_failed',    // the browser could not produce the output format
  UNSUPPORTED_INPUT: 'unsupported_input',  // a real file, but not one this tool can handle
  PASSWORD_REQUIRED: 'password_required',  // encrypted input, wrong or missing password
  LIMIT_EXCEEDED:    'limit_exceeded',     // over a size, page or count cap
};

const REASONS = new Set(Object.values(ERROR_REASON));

/** Low-level send. Everything else goes through this. */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, params);
  } catch {
    // Analytics must never surface an error into a tool.
  }
}

/** Category for a slug, from the registry. Returns undefined for unknown slugs. */
function categoryOf(slug) {
  return getToolBySlug(slug)?.category;
}

/** Slug + category params, omitting category when the slug is not in the registry. */
function toolParams(slug) {
  const category = categoryOf(slug);
  return category ? { tool_slug: slug, tool_category: category } : { tool_slug: slug };
}

/**
 * The user has actually begun using the tool — pressed the button that starts
 * the work, or made the first meaningful edit on a live calculator.
 * Never fired by a page load.
 */
export function trackToolStarted(slug) {
  trackEvent('tool_started', toolParams(slug));
}

/** The tool produced a valid result. Not fired for a pre-filled default state. */
export function trackToolCompleted(slug) {
  trackEvent('tool_completed', toolParams(slug));
}

/** The user initiated a download of the output. */
export function trackToolDownloaded(slug) {
  trackEvent('tool_downloaded', { tool_slug: slug });
}

/**
 * A real processing failure after the user started the tool.
 *
 * Not for empty fields, ordinary validation, expected invalid input or a
 * cancelled file picker. `reason` must be a value from ERROR_REASON; anything
 * else is replaced, so a raw exception message can never reach GA4.
 */
export function trackToolError(slug, reason) {
  trackEvent('tool_error', {
    ...toolParams(slug),
    error_reason: REASONS.has(reason) ? reason : ERROR_REASON.PROCESSING_FAILED,
  });
}

/** A related-tool recommendation was clicked. */
export function trackRelatedToolClicked(fromSlug, toSlug) {
  trackEvent('related_tool_clicked', {
    from_tool_slug: fromSlug,
    to_tool_slug: toSlug,
    to_tool_category: categoryOf(toSlug),
  });
}

/**
 * A share control was used.
 *
 * tool_slug is deliberately optional: the share bar is mounted site-wide, so it
 * also appears on the homepage and the support pages, where there is no tool.
 * GA4 records the page location on every event anyway.
 */
export function trackShareClicked(platform, slug) {
  trackEvent('share_clicked', slug ? { platform, tool_slug: slug } : { platform });
}

/** Feedback was submitted successfully. The message itself is never sent. */
export function trackFeedbackSubmitted() {
  trackEvent('feedback_submitted');
}

/**
 * Resolve a pathname to a tool slug via the registry, or undefined.
 *
 * Used by the shared download helper and the share bar, which are generic and
 * do not receive a slug from their caller. `trailingSlash: true` means paths
 * arrive as '/pdf-merge/'.
 */
export function toolSlugFromPath(pathname) {
  if (!pathname) return undefined;
  const clean = '/' + String(pathname).replace(/^\/+|\/+$/g, '');
  return TOOLS.find(t => t.href === clean)?.slug;
}
