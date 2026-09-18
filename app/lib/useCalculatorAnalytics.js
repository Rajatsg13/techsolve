'use client';
import { useEffect, useRef } from 'react';
import { trackToolStarted, trackToolCompleted } from './analytics';

/**
 * Event tracking for the live calculators.
 *
 * These eight tools have no Calculate button — they compute during render — and
 * seven of them ship pre-filled, so a finished result is on screen before the
 * visitor has done anything. Firing on "a result exists" would therefore fire on
 * every page view and measure nothing beyond page_view.
 *
 * So the rule is:
 *   page load              -> nothing, however complete the default result looks
 *   first meaningful edit  -> tool_started   (once per page view)
 *   first valid result after that edit -> tool_completed (once per page view)
 *   every later edit       -> nothing in v1
 *
 * The first edit is detected by watching a signature of the inputs and skipping
 * the value present on mount. That keeps the pages themselves untouched: no
 * handler is wrapped and no calculator behaviour changes.
 *
 * @param {string} slug      registry slug, e.g. 'gst-calculator'
 * @param {string} inputsKey a string that changes whenever any input changes
 * @param {boolean} hasResult whether the calculator currently shows a valid result
 */
export function useCalculatorAnalytics(slug, inputsKey, hasResult) {
  const mounted = useRef(false);
  const started = useRef(false);
  const completed = useRef(false);

  // First edit. The effect also runs on mount, which is the state we must
  // ignore, hence the mounted guard rather than a plain dependency.
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (started.current) return;
    started.current = true;
    trackToolStarted(slug);
  }, [slug, inputsKey]);

  // First valid result after that edit.
  useEffect(() => {
    if (!started.current || completed.current || !hasResult) return;
    completed.current = true;
    trackToolCompleted(slug);
  }, [slug, hasResult, inputsKey]);
}

export default useCalculatorAnalytics;
