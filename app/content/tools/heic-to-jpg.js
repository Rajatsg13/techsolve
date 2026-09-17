const content = {
  slug: 'heic-to-jpg',
  outcome: 'Your iPhone photos as JPG, PNG or WebP files that anything will open.',
  whatItDoes: [
    'HEIC is the format iPhones save photos in by default. It is efficient, but plenty of software still cannot open it — older Windows versions, many web forms, and a lot of internal business systems. This converts HEIC and HEIF files into formats those systems accept.',
    'You can add up to 30 photos at once and convert them in one pass. Each file is checked by its actual contents rather than its name, so a HEIC that someone renamed to .jpg is still detected correctly — and a genuine JPG is rejected with an explanation instead of being processed pointlessly.',
  ],
  whenToUse: [
    { title: 'A form will not accept your photo', body: 'Upload fields that list JPG and PNG usually reject HEIC outright.' },
    { title: 'You are sending photos to someone on Windows', body: 'Older Windows installations cannot open HEIC without an extra codec from the Microsoft Store.' },
    { title: 'Software will not import them', body: 'Many business systems, older editors and print services still expect JPG.' },
  ],
  workplaceUses: [
    { title: 'Expense and reimbursement claims', body: 'Receipt photos taken on an iPhone often will not attach to expense systems as HEIC.' },
    { title: 'Site, inspection and condition reports', body: 'Convert a set of photos so they can be dropped into a report or a shared drive that others can open.' },
    { title: 'Insurance and warranty claims', body: 'Claim portals are among the least forgiving about file formats.' },
    { title: 'Sharing with mixed-device teams', body: 'JPG is the safe common denominator when you do not know what the other person is using.' },
  ],
  howToSteps: [
    { title: 'Add your HEIC photos', body: 'Up to 30 files, 50 MB each. Files that are not really HEIC are flagged straight away with the reason.' },
    { title: 'Choose the output format', body: 'JPG is the safe choice. PNG is lossless but much larger. WebP is smallest but not universally accepted.' },
    { title: 'Set the quality', body: '90% is a good default for photographs. Lower it if the files need to be smaller.' },
    { title: 'Convert', body: 'Files are processed one at a time so a large batch does not lock up the tab. Each row shows its result and dimensions.' },
    { title: 'Download individually or all at once', body: 'Downloading all saves the files one after another; your browser may ask permission for multiple downloads the first time.' },
  ],
  tips: [
    { title: 'The first conversion is the slow one', body: 'On browsers without built-in HEIC support, a decoder has to load before the first file can be converted. Later files in the same session are much faster.' },
    { title: 'Safari is quicker', body: 'Safari on Mac and iPhone can decode HEIC itself, so the tool uses that directly and skips the download entirely.' },
    { title: 'JPG files are usually larger than the HEIC', body: 'HEIC is a more efficient format, so the same photo as JPG is often bigger. Compress afterwards if size matters.' },
    { title: 'Stop the problem at the source', body: 'On iPhone, Settings › Camera › Formats › Most Compatible makes the camera save JPG instead of HEIC from then on.' },
    { title: 'Live Photos convert as a still', body: 'Only the main image is converted. The motion component is not carried across into JPG, which has no way to hold it.' },
  ],
  faqs: [
    { q: 'Are my photos uploaded anywhere?', a: 'No. Conversion runs in your browser on your own device. Photos are never transmitted, and nothing is stored after you close the tab.' },
    { q: 'Why is the first photo slower than the rest?', a: 'Chrome, Edge and Firefox cannot decode HEIC on their own, so a decoder is downloaded the first time you convert. It is reused for the rest of the session. Safari decodes HEIC natively and skips this entirely.' },
    { q: 'Why is my JPG bigger than the original HEIC?', a: 'That is expected. HEIC compresses more efficiently than JPEG, so the same image usually takes more space as a JPG. Lower the quality setting, or compress the result afterwards.' },
    { q: 'Does it keep the photo date and location?', a: 'No. The converted file is re-encoded from the decoded image, so the original EXIF metadata — including the date taken and any GPS location — is not carried over.' },
    { q: 'What about HEIF files, or .heic from other cameras?', a: 'HEIF files work the same way. Files are identified by their container, so most HEIC and HEIF variants are handled — but some unusual encodings may fail, in which case the file is marked with an error rather than producing a broken image.' },
    { q: 'Can I convert a whole album at once?', a: 'Up to 30 files per batch. That limit exists because each conversion is real work on your device, and a much larger batch would make the tab unresponsive.' },
  ],
  relatedWorkflows: [
    {
      title: 'Get iPhone photos into a report',
      description: 'Turn a set of HEIC photos into something you can send.',
      steps: [
        { slug: 'heic-to-jpg', note: 'Convert the photos to JPG' },
        { slug: 'image-compress', note: 'Reduce the file sizes' },
        { slug: 'image-to-pdf', note: 'Combine them into one PDF' },
      ],
    },
  ],
  relatedTools: ['image-compress', 'image-crop', 'image-resize', 'image-to-pdf'],
};
export default content;
