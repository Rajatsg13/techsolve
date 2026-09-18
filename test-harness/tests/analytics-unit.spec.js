// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Unit tests for the analytics helper.
 * Tag: @unit
 *
 * The point of most of these is what must NOT reach GA4: a raw error message,
 * an unknown error reason, or anything beyond the agreed parameters.
 */

let A;
const sent = [];

test.beforeAll(async () => {
  global.window = { gtag: (...args) => sent.push(args), location: { pathname: '/' } };
  A = await import('../../app/lib/analytics.js');
});
test.beforeEach(() => { sent.length = 0; });
const last = () => sent[sent.length - 1];

test.describe('@unit analytics event names and params', () => {
  test('tool_started carries slug and category from the registry', () => {
    A.trackToolStarted('pdf-merge');
    expect(last()).toEqual(['event', 'tool_started', { tool_slug: 'pdf-merge', tool_category: 'documents' }]);
  });

  test('tool_completed looks the category up too', () => {
    A.trackToolCompleted('gst-calculator');
    expect(last()[2]).toEqual({ tool_slug: 'gst-calculator', tool_category: 'business' });
  });

  test('tool_downloaded carries only the slug', () => {
    A.trackToolDownloaded('pdf-rotate');
    expect(last()).toEqual(['event', 'tool_downloaded', { tool_slug: 'pdf-rotate' }]);
  });

  test('related_tool_clicked carries origin and destination', () => {
    A.trackRelatedToolClicked('pdf-merge', 'pdf-split');
    expect(last()[2]).toEqual({
      from_tool_slug: 'pdf-merge', to_tool_slug: 'pdf-split', to_tool_category: 'documents',
    });
  });

  test('share_clicked works without a tool slug', () => {
    A.trackShareClicked('whatsapp');
    expect(last()).toEqual(['event', 'share_clicked', { platform: 'whatsapp' }]);
  });

  test('share_clicked includes the slug when there is one', () => {
    A.trackShareClicked('copy_link', 'pdf-merge');
    expect(last()[2]).toEqual({ platform: 'copy_link', tool_slug: 'pdf-merge' });
  });

  test('feedback_submitted sends no parameters at all', () => {
    A.trackFeedbackSubmitted();
    expect(last()).toEqual(['event', 'feedback_submitted', {}]);
  });
});

test.describe('@unit analytics never leaks sensitive data', () => {
  test('an error message cannot be passed through as a reason', () => {
    // The whole point of the closed vocabulary: this must not reach GA4.
    A.trackToolError('pdf-merge', 'Could not open /Users/rajat/salary-2026.pdf');
    expect(last()[2].error_reason).toBe('processing_failed');
    expect(JSON.stringify(last())).not.toContain('salary');
  });

  test('a known reason is passed through unchanged', () => {
    A.trackToolError('pdf-unlock', A.ERROR_REASON.PASSWORD_REQUIRED);
    expect(last()[2]).toEqual({
      tool_slug: 'pdf-unlock', tool_category: 'documents', error_reason: 'password_required',
    });
  });

  test('every reason in the vocabulary is generic and non-sensitive', () => {
    for (const v of Object.values(A.ERROR_REASON)) expect(v).toMatch(/^[a-z_]+$/);
  });
});

test.describe('@unit analytics degrades safely', () => {
  test('does nothing when gtag is absent, and does not throw', () => {
    const saved = global.window.gtag;
    delete global.window.gtag;
    expect(() => A.trackToolStarted('pdf-merge')).not.toThrow();
    expect(sent).toHaveLength(0);
    global.window.gtag = saved;
  });

  test('a throwing gtag never surfaces into a tool', () => {
    const saved = global.window.gtag;
    global.window.gtag = () => { throw new Error('blocked by extension'); };
    expect(() => A.trackToolCompleted('pdf-merge')).not.toThrow();
    global.window.gtag = saved;
  });

  test('an unknown slug still sends the event, without a category', () => {
    A.trackToolStarted('not-a-real-tool');
    expect(last()[2]).toEqual({ tool_slug: 'not-a-real-tool' });
  });
});

test.describe('@unit slug resolution from a path', () => {
  test('resolves a trailing-slash tool path', () => {
    expect(A.toolSlugFromPath('/pdf-merge/')).toBe('pdf-merge');
    expect(A.toolSlugFromPath('/pdf-merge')).toBe('pdf-merge');
  });
  test('returns undefined off a tool page', () => {
    expect(A.toolSlugFromPath('/')).toBeUndefined();
    expect(A.toolSlugFromPath('/about/')).toBeUndefined();
    expect(A.toolSlugFromPath('')).toBeUndefined();
  });
  test('resolves legacy finance routes too, since they remain reachable', () => {
    expect(A.toolSlugFromPath('/emi-calculator/')).toBe('emi-calculator');
  });
});
