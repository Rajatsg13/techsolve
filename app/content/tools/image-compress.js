const content = {
  slug: 'image-compress',
  outcome: 'A smaller version of your image that still looks right.',
  whatItDoes: [
    'You choose either a quality level or a target file size, and the tool re-encodes your image to match. It reports the size before and after, so you can see whether the trade was worth making.',
    'Target-size mode works by trying progressively lower quality until the file fits. If it cannot get there even at the lowest setting, it says so rather than quietly handing you a file that is still too big.',
  ],
  whenToUse: [
    { title: 'An upload box rejects your file', body: 'Government portals, job applications and exam forms routinely cap uploads at 100 KB, 200 KB or 1 MB.' },
    { title: 'An email attachment is too large', body: 'A handful of phone photos will exceed most attachment limits on their own.' },
    { title: 'A page is loading slowly', body: 'Full-resolution photos are the usual reason a site feels heavy.' },
  ],
  workplaceUses: [
    { title: 'Application and KYC uploads', body: 'Portals that demand a photo or signature under a specific size, often with no way to see why the upload failed.' },
    { title: 'Product and catalogue images', body: 'Get a consistent, reasonable size across a batch before they go into a listing or a deck.' },
    { title: 'Reports and presentations', body: 'A deck full of untouched phone photos is unnecessarily large to email or store.' },
    { title: 'Website and CMS images', body: 'Reduce dimensions as well as quality — a 4000 px photo displayed 800 px wide is wasted bytes.' },
  ],
  howToSteps: [
    { title: 'Add your image', body: 'JPG, PNG, WebP, GIF or BMP, up to 50 MB. The original dimensions are shown once it loads.' },
    { title: 'Choose quality or a target size', body: 'Quality mode gives you direct control. Target-size mode is better when a form has a hard limit.' },
    { title: 'Pick the output format', body: 'JPEG is accepted everywhere. WebP is usually smallest. PNG stays lossless and will not shrink much.' },
    { title: 'Reduce the dimensions if you need to', body: 'For large photos this does more than quality alone. The longest side is capped and the shape is preserved.' },
    { title: 'Compress, check the preview, then download', body: 'The before and after sizes are shown side by side, with the preview at the actual output.' },
  ],
  tips: [
    { title: 'Scaling down beats quality alone', body: 'If a 12-megapixel photo must fit 200 KB, lowering quality will make it look bad before it makes it small. Cap the longest side at 1600 px first and you will usually keep more apparent detail.' },
    { title: 'PNG will barely shrink', body: 'PNG is lossless. If your PNG is a photograph and does not need transparency, switching it to JPEG or WebP is what actually reduces the size.' },
    { title: 'Transparency becomes white', body: 'JPEG and WebP output flatten transparent areas onto a white background. Keep PNG if you need the transparency.' },
    { title: 'Already-compressed files may not shrink', body: 'Re-compressing a small JPG often makes it slightly larger. The tool tells you when nothing was saved instead of pretending otherwise.' },
    { title: 'Compression is one-way', body: 'Detail removed by a lossy format cannot be recovered. Keep your original if the image matters.' },
  ],
  faqs: [
    { q: 'Are my images uploaded anywhere?', a: 'No. The compression happens in your browser using the canvas API. The file never leaves your device, and nothing is stored after you close the tab.' },
    { q: 'Can I compress to an exact file size?', a: 'Not exactly — the browser gives no way to request a precise output size. Target-size mode lowers quality step by step until the file is under your limit, which is what upload forms actually check.' },
    { q: 'Which format should I choose?', a: 'JPEG when something else has to accept the file. WebP when you control where it is used and want the smallest result. PNG only when you need transparency or the image is a screenshot or diagram with flat colour and text.' },
    { q: 'Will it work on my phone?', a: 'Yes. The tool works the same on a phone browser, though very large images take longer on older devices.' },
    { q: 'Does it strip location data from photos?', a: 'Re-encoding through the canvas does not carry EXIF metadata across, so the output will not contain the original camera or GPS tags. Treat that as a side effect worth knowing, not a privacy guarantee — verify anything that matters legally.' },
  ],
  relatedWorkflows: [
    {
      title: 'Get photos under an upload limit',
      description: 'Take a batch of phone photos and make them acceptable to a form.',
      steps: [
        { slug: 'heic-to-jpg', note: 'Convert iPhone HEIC photos to JPG first' },
        { slug: 'image-compress', note: 'Bring each one under the size limit' },
        { label: 'Upload to the form' },
      ],
    },
    {
      title: 'Assemble a document from photos',
      description: 'Combine several images into one file to submit.',
      steps: [
        { slug: 'image-crop', note: 'Trim each photo to what matters' },
        { slug: 'image-compress', note: 'Reduce the size' },
        { slug: 'image-to-pdf', note: 'Combine them into a single PDF' },
      ],
    },
  ],
  relatedTools: ['image-crop', 'image-resize', 'heic-to-jpg', 'image-to-pdf'],
};
export default content;
