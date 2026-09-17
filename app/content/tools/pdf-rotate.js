const content = {
  slug: 'pdf-rotate',
  outcome: 'A PDF whose pages are the right way up, saved so they stay that way.',
  whatItDoes: [
    'You see every page as a thumbnail, turn the ones that are wrong, and download the corrected file. Pages can be rotated individually or all together, in either direction.',
    'The rotation is written into the document, so it holds wherever the file is opened. This is the difference between this and turning a page in a PDF reader: the reader only changes your view, and the next person to open it sees the original orientation again.',
  ],
  whenToUse: [
    { title: 'A scan came out sideways', body: 'Feeding pages into a scanner the wrong way round is easy to do and annoying to live with.' },
    { title: 'Photos of documents are rotated', body: 'A phone camera records an orientation that not every tool interprets the same way.' },
    { title: 'Mixed orientations in one file', body: 'A report with landscape tables among portrait pages often ends up inconsistent after merging.' },
  ],
  workplaceUses: [
    { title: 'Scanned paperwork before filing', body: 'Get invoices, contracts and forms upright before they go into a shared drive, so nobody has to tilt their head.' },
    { title: 'Documents assembled from several sources', body: 'After merging files from different people, orientations rarely agree.' },
    { title: 'Anything about to be printed', body: 'A page that only looks right because someone rotated their viewer will print wrong.' },
    { title: 'Submissions to a portal', body: 'Reviewers usually will not rotate pages for you, and some systems reject documents that are not upright.' },
  ],
  howToSteps: [
    { title: 'Add your PDF', body: 'Up to 100 MB and 200 pages. Every page is shown as a thumbnail once it loads.' },
    { title: 'Turn the pages that need it', body: 'Use the arrows under any page for that page alone, or the all-pages buttons at the top for the whole document.' },
    { title: 'Check the highlighting', body: 'Pages you have changed are outlined and labelled with their rotation, and the count at the top tells you how many will change.' },
    { title: 'Download', body: 'The button stays inactive until something has actually been rotated, so you cannot download an unchanged copy by accident.' },
  ],
  tips: [
    { title: 'Rotating is not the same as re-scanning', body: 'This changes orientation only. If a scan is skewed by a few degrees rather than a clean 90, rotation will not straighten it.' },
    { title: 'Rotations add up', body: 'Pressing right twice gives 180°, and four times returns to the original. The label under each page always shows where it has ended up.' },
    { title: 'Existing rotation is respected', body: 'If a page already declares a rotation, yours is added to it rather than replacing it, so what you see in the preview is what you get.' },
    { title: 'Nothing is re-encoded', body: 'Only each page’s orientation flag changes. Text stays text, images keep their quality, and the file size barely moves.' },
  ],
  faqs: [
    { q: 'Will the rotation stick when someone else opens it?', a: 'Yes. The orientation is saved into the document itself, not applied as a temporary view. That is the difference from rotating in a PDF reader, which usually only changes what you see.' },
    { q: 'Does this reduce quality?', a: 'No. Pages are not re-rendered or converted to images — only the orientation is changed — so text stays selectable and images are untouched.' },
    { q: 'Can I rotate different pages by different amounts?', a: 'Yes. Each page keeps its own rotation, so you can turn one page 90° and another 180° in the same document.' },
    { q: 'Is my document uploaded?', a: 'No. It is read and rewritten in your browser, and nothing is stored after you close the tab.' },
    { q: 'Can it fix a page that is only slightly crooked?', a: 'No. PDF rotation works in quarter turns. A slight skew from a scanner needs a deskew tool, which this is not.' },
  ],
  relatedWorkflows: [
    {
      title: 'Tidy up a batch of scans',
      description: 'Get scanned paperwork into a state worth filing.',
      steps: [
        { slug: 'pdf-rotate', note: 'Turn the pages the right way up' },
        { slug: 'pdf-organize', note: 'Reorder or drop pages' },
        { slug: 'pdf-compress', note: 'Bring the file size down before sharing' },
      ],
    },
  ],
  relatedTools: ['pdf-organize', 'pdf-merge', 'pdf-split', 'pdf-compress'],
};
export default content;
