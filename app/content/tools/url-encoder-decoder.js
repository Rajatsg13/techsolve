const content = {
  slug: 'url-encoder-decoder',
  outcome: 'Make text safe to put in a link, or turn a URL full of %20 and %3A back into something you can read.',
  whatItDoes: [
    'URLs may only contain a limited set of characters. Anything else — a space, an ampersand, an accent, a Hindi character — has to be written as a percent sign followed by its byte value. That is why a link to a search for "annual report 2026" arrives full of %20.',
    'This converts in both directions, and offers two scopes because they are genuinely different jobs. Encoding a single value escapes the separators : / ? & = so they cannot be mistaken for URL structure. Encoding a whole address leaves those separators intact so the URL still works.',
  ],
  whenToUse: [
    { title: 'Building a link with a value in it', body: 'A search term, a filename or an email address going into a query parameter has to be encoded, or the first space or ampersand breaks the link.' },
    { title: 'A tracking URL is unreadable', body: 'Campaign links accumulate encoded parameters. Decoding shows what is actually being passed.' },
    { title: 'A link keeps breaking at the same point', body: 'Usually an unencoded & or # is ending the parameter early. Encoding the value fixes it.' },
    { title: 'Reading a redirect chain', body: 'Sign-in and payment flows nest an entire return URL inside a parameter, encoded. Decoding untangles it.' },
  ],
  workplaceUses: [
    { title: 'Preparing a marketing link', body: 'Encode campaign values so a UTM parameter containing a space or an ampersand does not truncate the URL.' },
    { title: 'Debugging a failing integration', body: 'Decode the callback URL a provider is sending to see exactly which parameters arrived.' },
    { title: 'Pre-filling a form link', body: 'Query-string values that contain punctuation need encoding before the link is shared.' },
    { title: 'Documenting an API call', body: 'Decode an example request so the parameters can be read in a ticket or runbook.' },
  ],
  howToSteps: [
    { title: 'Choose a direction', body: 'Encode makes text URL-safe. Decode turns percent-encoding back into readable text.' },
    { title: 'Choose a scope', body: 'Single value is right for one parameter — it escapes : / ? & = as well. Whole URL preserves them so an entire address stays functional.' },
    { title: 'Paste and run', body: 'The result appears below with a copy button.' },
    { title: 'Check the breakdown', body: 'When the result is a complete URL, the parts are listed underneath — protocol, host, path, and every query parameter as a separate row.' },
  ],
  tips: [
    { title: 'Encode the value, not the whole URL', body: 'Running a complete address through single-value encoding escapes its own :// and ? and produces a string that is no longer a link. Match the scope to the job.' },
    { title: 'A space can be %20 or +', body: 'Both appear in the wild. %20 is correct everywhere; + means a space only inside a query string. This tool produces %20, which is always safe.' },
    { title: 'Encoding twice is a real bug', body: 'If you see %2520, a value was encoded, then the whole URL was encoded again. %25 is an encoded percent sign. Decode twice to recover it.' },
    { title: 'Never put credentials or personal data in a URL', body: 'Query strings are stored in browser history, server logs and analytics. Encoding makes them transportable, not private.' },
    { title: 'A bare % is invalid', body: 'A percent sign must be followed by two hex digits. A literal percent has to be written %25 — which is why "100%" alone fails to decode.' },
  ],
  faqs: [
    { q: 'Is my data uploaded?', a: 'No. Encoding and decoding use built-in browser functions and this tool makes no network requests while working. Nothing you paste is transmitted.' },
    { q: 'What is the difference between the two scopes?', a: 'Single value escapes the reserved characters : / ? & = so your text cannot be mistaken for URL structure — use it for one parameter. Whole URL leaves those intact so a complete address remains valid, and only escapes things like spaces.' },
    { q: 'Why does my decode fail with an error about %?', a: 'A percent sign must be followed by two hexadecimal digits. Something like "100%" or "%zz" is not valid percent-encoding. The error names the sequence it stopped at.' },
    { q: 'Why do I see %2520 in a URL?', a: 'That is a double encoding: %25 is an encoded % sign, so %2520 was originally %20, which was itself a space. Decode twice to get back to the space.' },
    { q: 'Does it handle non-English text?', a: 'Yes. Characters are encoded as UTF-8 bytes, so Hindi, Tamil, Arabic, Chinese and emoji all round-trip correctly.' },
    { q: 'What is the URL breakdown for?', a: 'When your result is a full URL it is split into protocol, host, path, fragment and each query parameter as its own row — much easier than reading a long query string by eye.' },
  ],
  relatedWorkflows: [
    {
      title: 'Untangling a redirect URL',
      description: 'Sign-in and payment flows nest a return address inside a parameter, often more than once.',
      steps: [
        { slug: 'url-encoder-decoder', note: 'Decode the parameter to reveal the inner URL' },
        { label: 'Decode again if needed', note: 'If you still see %25, the value was encoded twice' },
        { slug: 'json-formatter', note: 'If a parameter holds JSON, format it to read the contents' },
      ],
    },
  ],
  relatedTools: ['base64-encoder-decoder', 'json-formatter'],
};

export default content;
