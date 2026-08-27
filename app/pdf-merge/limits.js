/**
 * Merge PDF limits — the single source of truth.
 *
 * These are imported by both the tool itself (app/pdf-merge/page.js, where they
 * drive validation) and its content file (app/content/tools/pdf-merge.js, where
 * they appear in the FAQ answers). Keeping them here means the documented limits
 * can never drift away from the enforced ones.
 */
export const MAX_FILES    = 20;   // files per merge
export const MAX_FILE_MB  = 30;   // per individual file
export const MAX_TOTAL_MB = 100;  // across all selected files
