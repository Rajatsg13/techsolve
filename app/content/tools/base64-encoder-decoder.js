const content = {
  slug: 'base64-encoder-decoder',
  outcome: 'Turn text into Base64 for somewhere that only accepts plain characters, or decode Base64 back to readable text.',
  whatItDoes: [
    'Base64 rewrites data using only 64 safe characters — letters, digits, plus and slash. It exists because plenty of systems were built to carry text and will corrupt anything else: email bodies, URLs, JSON string fields, HTML attributes. Encoding first means the data survives the trip.',
    'It is an encoding, not encryption. Anyone who has the string can decode it, including this page. Base64 makes data safe to transport, not private.',
  ],
  whenToUse: [
    { title: 'A token or key arrived Base64-encoded', body: 'JWTs, API credentials and webhook payloads often carry Base64 sections. Decoding shows you what is actually inside.' },
    { title: 'You need to embed data in text', body: 'Putting a small image or file into a JSON field, a CSS file or an HTML attribute requires it to be text first.' },
    { title: 'Something is corrupting your data in transit', body: 'If a value survives locally but arrives mangled, encoding it before sending usually fixes it.' },
    { title: 'Reading a config value', body: 'Deployment platforms and CI systems commonly store secrets Base64-encoded so they can sit in a text field.' },
  ],
  workplaceUses: [
    { title: 'Inspecting an auth token', body: 'Decode the payload section of a token to check which account, scope or expiry it carries.' },
    { title: 'Preparing a value for a config field', body: 'Encode a multi-line certificate or key so it fits on one line in an environment variable.' },
    { title: 'Checking a webhook body', body: 'Some providers Base64 the payload. Decoding tells you whether the problem is their data or your handler.' },
    { title: 'Passing text through a URL', body: 'The URL-safe option produces a string with no + / or = characters, so it can sit in a link or filename unescaped.' },
  ],
  howToSteps: [
    { title: 'Choose a direction', body: 'Encode turns text into Base64. Decode turns Base64 back into text.' },
    { title: 'Paste your input', body: 'For decoding, whitespace and line breaks are ignored, and missing = padding is added for you — so a string copied out of a log usually works as-is.' },
    { title: 'Turn on URL-safe if the result goes in a link', body: 'This swaps + and / for - and _ and drops the padding. Decoding accepts either form automatically.' },
    { title: 'Press the button and copy the result', body: 'Use result as input flips the direction and moves the output across, which is a quick way to confirm a round trip.' },
  ],
  tips: [
    { title: 'Base64 is not security', body: 'It is trivially reversible. Never use it to hide a password, key or anything sensitive — if it matters, it needs real encryption.' },
    { title: 'Encoded data gets about a third bigger', body: 'Three bytes become four characters. A 300 KB image becomes roughly 400 KB of Base64, which is worth knowing before you embed one.' },
    { title: 'Non-Latin text works here', body: 'The browser’s built-in Base64 function fails outright on anything beyond Latin-1. This tool encodes to UTF-8 first, so Hindi, Tamil, Chinese and emoji all survive a round trip.' },
    { title: 'If decoding says "binary data", that is the answer', body: 'It means the Base64 is valid but decodes to a file rather than text — usually an image. That is information, not a failure.' },
    { title: 'A JWT is three Base64 sections joined by dots', body: 'Decode the middle section for the payload. Decode the first for the header. The third is a signature and will look like binary, because it is.' },
  ],
  faqs: [
    { q: 'Is my data uploaded?', a: 'No. Encoding and decoding use built-in browser functions and this tool makes no network requests while working. Nothing you paste leaves your device — which matters when the thing you are decoding is a live token.' },
    { q: 'Is Base64 encryption?', a: 'No. It is a reversible encoding with no key and no secret. Anyone holding the string can read it. Use it to make data transportable, never to make it private.' },
    { q: 'Why did my accented or Hindi text break in another tool?', a: 'Most simple implementations call btoa directly, which throws on any character above U+00FF. This tool encodes text to UTF-8 bytes first, so the full range works.' },
    { q: 'What is URL-safe Base64?', a: 'A variant using - and _ instead of + and /, with the trailing = padding removed, so the result can go into a URL or filename without further escaping. Decoding here accepts both variants.' },
    { q: 'My Base64 has no padding — will it still decode?', a: 'Yes. Missing = characters are added back automatically. Whitespace and line breaks are also stripped, so a value copied from a wrapped log still works.' },
    { q: 'Can I encode a file?', a: 'Not in this tool — it works on text. Decoding a string that turns out to be a file is detected and reported rather than shown as unreadable characters.' },
  ],
  relatedWorkflows: [
    {
      title: 'Inspecting an auth token',
      description: 'Working out what a token actually contains when a request is being rejected.',
      steps: [
        { slug: 'base64-encoder-decoder', note: 'Decode the payload section between the dots' },
        { slug: 'json-formatter', note: 'Format the decoded JSON to read the claims and expiry' },
      ],
    },
  ],
  relatedTools: ['json-formatter', 'url-encoder-decoder'],
};

export default content;
