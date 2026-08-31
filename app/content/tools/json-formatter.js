const content = {
  slug: 'json-formatter',

  outcome: 'Make unreadable JSON readable, shrink it back down, or find the exact character that is breaking it.',

  whatItDoes: [
    'JSON arrives in two unhelpful states: one enormous line with no spaces, or almost-valid text that some parser is refusing without saying why. Formatting solves the first by re-indenting the structure so you can see the nesting. Validating solves the second by pointing at the specific line and column where the syntax breaks.',
    'Nothing about the data changes. Formatting and minifying only add or remove whitespace between tokens, so the parsed value is identical either way — the file is just easier or smaller to work with.',
  ],

  whenToUse: [
    { title: 'An API response is one long line', body: 'Logs and network tabs return minified JSON. Formatting it is usually the difference between finding the field you need in five seconds and five minutes.' },
    { title: 'Something rejected your config file', body: 'A tool says "invalid JSON" and stops. This tells you it is line 34, column 7, and shows you that line.' },
    { title: 'Before pasting into a ticket', body: 'Formatted JSON in a bug report means whoever picks it up can read the structure without reformatting it themselves.' },
    { title: 'Trimming a payload', body: 'Minifying strips every optional space and newline, which is worth doing before sending JSON over a slow connection or storing a lot of it.' },
  ],

  workplaceUses: [
    { title: 'Checking an integration payload', body: 'Paste what a vendor sent, confirm it is valid, and see which fields are actually present rather than assumed.' },
    { title: 'Editing a configuration file', body: 'Reformat a config you have been hand-editing to spot the missing brace before the deployment does.' },
    { title: 'Reading an export', body: 'Analytics and CRM exports are frequently minified JSON. Formatting makes the record shape obvious.' },
    { title: 'Comparing two responses', body: 'Format both with the same indent so a diff shows real differences instead of whitespace noise.' },
  ],

  howToSteps: [
    { title: 'Paste your JSON', body: 'Drop it into the input box. Large documents are fine — tens of thousands of records format without trouble.' },
    { title: 'Choose an indent', body: 'Two spaces, four spaces or a tab. Match whatever the rest of your project uses so the result can be pasted straight back.' },
    { title: 'Pick an action', body: 'Format re-indents it. Minify strips whitespace. Validate only checks it and reports the structure without changing anything.' },
    { title: 'Read the result — or the error', body: 'Valid JSON appears in the output box with a summary of its shape. Invalid JSON produces the reason, the line and column, and a caret pointing at the character.' },
    { title: 'Copy or download', body: 'Copy puts the output on your clipboard; Download saves it as a .json file.' },
  ],

  tips: [
    { title: 'The error points at where parsing stopped, not always where you went wrong', body: 'A missing comma on line 12 is often reported at line 13, because that is where the parser first saw something impossible. Check the line above the one named.' },
    { title: 'Trailing commas are the most common cause', body: 'JavaScript allows a comma after the last item in an object or array. JSON does not. If your file came from code, look there first.' },
    { title: 'JSON requires double quotes', body: 'Single quotes around keys or strings are valid JavaScript and invalid JSON. This is why a config copied out of a code file often fails.' },
    { title: 'Minified and formatted JSON are interchangeable', body: 'Whatever consumes your JSON does not care about the whitespace. Format it for humans, minify it for transmission, and the parsed data is the same.' },
    { title: 'Comments are not allowed', body: 'If your file has // or /* */ in it, it is JSONC or JSON5, not JSON. Strip the comments before validating.' },
  ],

  faqs: [
    { q: 'Is my data sent anywhere?', a: 'No. The formatting and validation run in your browser using the built-in JSON parser. This tool makes no network requests while it works, so your data never leaves the machine — which matters if you are pasting a real API response.' },
    { q: 'How large a file can it handle?', a: 'Comfortably into several megabytes. The limit in practice is your browser tab’s memory, not the tool. Very large documents may take a moment to render in the output box.' },
    { q: 'Why does it say invalid when my editor accepts it?', a: 'Editors often accept JSON5 or JSONC — trailing commas, comments, unquoted keys, single quotes. Strict JSON allows none of those. The error message will name whichever one it found.' },
    { q: 'Does formatting change my data?', a: 'No. Only whitespace between tokens changes. Key order, values and types are all preserved exactly, and minifying a formatted document returns the original byte for byte.' },
    { q: 'What does the structure summary mean?', a: 'After a successful validation it reports the top-level type, how many keys or array items it holds, and how deep the nesting goes. It is a quick way to confirm you pasted what you meant to.' },
    { q: 'Can it fix my JSON automatically?', a: 'No, and deliberately so. Guessing where a comma belongs risks producing valid JSON that means something different from what you intended. It tells you where the problem is and leaves the fix to you.' },
  ],

  relatedWorkflows: [
    {
      title: 'Debugging an API response',
      description: 'Turning a wall of minified JSON into something you can reason about.',
      steps: [
        { slug: 'json-formatter', note: 'Format the response so the structure is visible' },
        { label: 'Locate the field', note: 'Check the value is present and the type is what you expected' },
        { slug: 'base64-encoder-decoder', note: 'If a field holds an encoded token or blob, decode it' },
      ],
    },
  ],

  relatedTools: ['base64-encoder-decoder', 'url-encoder-decoder'],
};

export default content;
