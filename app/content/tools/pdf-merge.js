import { MAX_FILES, MAX_FILE_MB, MAX_TOTAL_MB } from '../../pdf-merge/limits';

/**
 * Rich content for /pdf-merge/.
 *
 * Reference implementation for the tool-content architecture — see
 * app/content/tools/index.js for the schema and how to add another tool.
 *
 * Everything here describes behaviour that the current implementation actually
 * has. The bookmark and form-field claims below were verified against
 * pdf-lib's copyPages() output, not assumed.
 */
const content = {
  slug: 'pdf-merge',

  outcome:
    'Combine several PDFs into one file, in the order you choose, without uploading anything.',

  whatItDoes: [
    'Merging takes the pages out of several PDF files and writes them into a single new document, one file after another, in the order you arrange them. Nothing is re-encoded along the way — pages are copied as they are, so text stays selectable and images keep their original resolution.',
    'The result is one file to attach, print or file away instead of several. That matters most when the person receiving it has to read the documents in a particular order, or when a system will only accept a single attachment.',
  ],

  whenToUse: [
    {
      title: 'Someone asked for “one file”',
      body: 'Application portals, procurement systems and HR tools frequently accept a single upload. Merging is usually faster than asking whether they will take a zip.',
    },
    {
      title: 'The reading order matters',
      body: 'A covering letter should arrive before the annexures it refers to. Sending four separate attachments leaves that order to chance.',
    },
    {
      title: 'A document arrived in pieces',
      body: 'Scanners often produce one PDF per batch of pages, and colleagues often send one section each. Merging reassembles them into the document everyone thinks of as a single thing.',
    },
    {
      title: 'You are archiving something',
      body: 'A single dated file is easier to find in two years than a folder of fragments with inconsistent names.',
    },
  ],

  workplaceUses: [
    {
      title: 'Supporting documents for a submission',
      body: 'Form, identity proof, address proof and photographs combined in the order the checklist lists them.',
    },
    {
      title: 'A report assembled from several contributors',
      body: 'Each section written separately, then merged once in the agreed order for circulation.',
    },
    {
      title: 'Scanned paperwork',
      body: 'Multi-batch scans of a signed contract, invoice set or register combined back into one continuous document.',
    },
    {
      title: 'A single file to share',
      body: 'One attachment on an email instead of six, so nothing gets missed when it is forwarded on.',
    },
    {
      title: 'Meeting or board packs',
      body: 'Agenda, minutes of the previous meeting and supporting notes issued as one document ahead of the meeting.',
    },
  ],

  howToSteps: [
    {
      title: 'Add your PDFs',
      body: `Drop files onto the box above or click to browse. You can add them in several goes — each batch is appended to the list. Only PDFs are accepted; other file types are ignored. You need at least two files, and can add up to ${MAX_FILES}.`,
    },
    {
      title: 'Put them in the right order',
      body: 'The list order is the page order in the finished document. Use the ↑ and ↓ buttons on each row to move a file, and × to drop one you added by mistake. Ordering is done here, not by renaming files first.',
    },
    {
      title: 'Check the size bar',
      body: `The bar shows the combined size against the ${MAX_TOTAL_MB} MB total limit, and turns amber then red as you approach it. Individual files are capped at ${MAX_FILE_MB} MB.`,
    },
    {
      title: 'Merge and download',
      body: 'Press the merge button. The combined file is built in your browser and downloads as merged.pdf. Large sets can take several seconds — the button shows progress while it works.',
    },
  ],

  tips: [
    {
      title: 'Confirm the order before you merge, not after',
      body: 'Reordering afterwards means splitting the file apart again. A glance down the list takes a moment; the file names in the list are the ones you will be reading in sequence.',
    },
    {
      title: 'Open the merged file before you send it',
      body: 'Check the joins — particularly that no source document was truncated and that a scanned section is the right way up. Merging cannot fix a page that was already rotated wrongly.',
    },
    {
      title: 'Bookmarks and fillable form fields are not carried over',
      body: 'Pages, text and images transfer intact, but a PDF outline (the bookmark sidebar) is dropped, and interactive form fields stop being fillable — a filled form keeps its visible answers as static content. If you need the form to stay interactive, send it separately rather than merging it.',
    },
    {
      title: 'Compress afterwards, not before',
      body: 'If the merged file is too large to email, run it through Compress PDF once at the end. Compressing each part first gives a worse result for the same loss of quality.',
    },
    {
      title: 'Merging is not redaction',
      body: 'Anything hidden behind a white box or cropped from view in a source document is still in the merged file. Remove sensitive content properly before combining, not by covering it.',
    },
    {
      title: 'Need more than the file limit allows?',
      body: `Merge in stages: combine the first ${MAX_FILES} files, then merge the downloaded result with the remaining ones. The output of a merge is an ordinary PDF and can be merged again.`,
    },
  ],

  faqs: [
    {
      q: 'How many PDFs can I merge at once?',
      a: `Up to ${MAX_FILES} files in a single merge, with a limit of ${MAX_FILE_MB} MB per file and ${MAX_TOTAL_MB} MB in total. If you have more, merge in stages — the merged file can be merged again with the rest.`,
    },
    {
      q: 'Does merging reduce quality?',
      a: 'No. Pages are copied from the source files without being re-encoded, so text remains selectable and images keep their original resolution. The merged file is roughly the size of its parts added together — merging does not compress anything.',
    },
    {
      q: 'Are my files uploaded to a server?',
      a: 'No. The merge runs entirely in your browser using a PDF library loaded with the page, and this tool makes no network requests while it works. Your files are never transmitted anywhere, which also means the merge works with the network disconnected.',
    },
    {
      q: 'What happens to bookmarks, links and form fields?',
      a: 'Page content — text, images, and the visible appearance of annotations — is preserved. The document outline (bookmarks) is not carried into the merged file, and interactive form fields lose their interactivity, though a completed form keeps its answers visible on the page. Links pointing to a location inside the original document may no longer land in the right place, because the page numbering changes.',
    },
    {
      q: 'Can I merge a password-protected PDF?',
      a: 'Sometimes. A PDF carrying only a restrictions password will usually merge. A PDF that requires a password to open will not — remove the password first using Remove PDF Password, then merge.',
    },
    {
      q: 'Can I choose which pages from each file to include?',
      a: 'Not in this tool — it combines every page of each file you add. To use only part of a document, extract the pages you want with Split PDF first, then merge the results. To drop or reorder individual pages after merging, use Organize Pages.',
    },
    {
      q: 'What is the merged file called?',
      a: 'It downloads as merged.pdf. Rename it after downloading — a descriptive name matters more than usual when the file is an assembled pack rather than a single original.',
    },
  ],

  relatedWorkflows: [
    {
      title: 'Preparing a document pack for submission',
      description:
        'The usual sequence when several documents have to arrive as one file, in a set order, under a size limit.',
      steps: [
        { slug: 'pdf-merge', note: 'Combine the documents in the order the checklist asks for' },
        { slug: 'pdf-organize', note: 'Drop duplicate or blank pages and fix any that are out of place' },
        { slug: 'pdf-compress', note: 'Only if the file is too large to send' },
        { label: 'Review and submit', note: 'Open the finished file once, end to end, before uploading' },
      ],
    },
    {
      title: 'Reassembling a scanned document',
      description:
        'Scanners tend to produce one file per batch of pages. This turns those batches back into a single readable document.',
      steps: [
        { slug: 'pdf-merge', note: 'Join the batches in page order' },
        { slug: 'pdf-organize', note: 'Correct any pages the feeder pulled in the wrong order' },
        { slug: 'pdf-ocr', note: 'Make the scan searchable, if you will need to find text in it later' },
        { slug: 'pdf-compress', note: 'Scans are often large — compress before archiving or emailing' },
      ],
    },
  ],

  // Resolved through the central registry (app/lib/tools.js) — names and URLs
  // are never duplicated here.
  relatedTools: ['pdf-split', 'pdf-organize', 'pdf-compress', 'pdf-unlock', 'image-to-pdf'],
};

export default content;
