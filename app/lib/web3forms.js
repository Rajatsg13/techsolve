// Single source of truth for the Web3Forms integration.
//
// Both the contact page and the sitewide feedback widget submit through here so
// the access key lives in exactly one place. The site is a static export, so
// there is no server to post to — every submission is a client-side fetch.
//
// History worth knowing: /contact shipped for months with a handler that called
// preventDefault(), set sent=true, and sent nothing. It showed "Message Sent!"
// while discarding the message. If you touch this file, verify against a real
// submission — a green UI state proves nothing on its own.

export const WEB3FORMS_KEY = '66f215ff-88b8-4266-b38a-e6aac88a5caa';
const ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * POSTs to Web3Forms and throws unless it genuinely succeeded.
 * Web3Forms can return HTTP 200 with `{ success: false }`, so the status code
 * alone is not enough to treat a submission as delivered.
 */
export async function submitToWeb3Forms(fields) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...fields }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Submission failed (HTTP ${res.status})`);
  }
  return data;
}

/** Maps a thrown error to something a person can act on. */
export function friendlyError(err) {
  // fetch() rejects with TypeError when the request never left the browser.
  return err instanceof TypeError
    ? 'Could not reach the server. Check your connection and try again.'
    : 'Something went wrong sending that. Please try again in a moment.';
}
