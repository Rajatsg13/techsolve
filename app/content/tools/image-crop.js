const content = {
  slug: 'image-crop',
  outcome: 'Just the part of the image you wanted, at exactly the dimensions you need.',
  whatItDoes: [
    'You drag a selection over your image — or lock it to a fixed shape such as 1:1 or 16:9 — and download only that region. The exact output dimensions in pixels are shown before you commit, so you are not guessing.',
    'The selection can also be typed in directly. If you need a crop to start at a specific pixel or come out at an exact width, the number fields are more precise than dragging.',
  ],
  whenToUse: [
    { title: 'Something needs a specific shape', body: 'Profile pictures want a square, video thumbnails want 16:9, and stories want 9:16.' },
    { title: 'The subject is lost in the frame', body: 'A photo taken from too far back is usually fixed by cropping, not editing.' },
    { title: 'Something should not be in the picture', body: 'Trim away a bystander, a messy edge, or a stray document on the desk.' },
  ],
  workplaceUses: [
    { title: 'Profile and team photos', body: 'Crop headshots square so they sit consistently in a directory, a deck or a website.' },
    { title: 'Screenshots for documentation', body: 'Cut a screenshot down to the part being described so the reader is not hunting for it.' },
    { title: 'Document photos', body: 'Trim the desk, the shadow and the edges out of a photographed form before submitting it.' },
    { title: 'Social and marketing assets', body: 'Produce the same image at 1:1, 16:9 and 9:16 for different placements from one original.' },
  ],
  howToSteps: [
    { title: 'Add your image', body: 'JPG, PNG, WebP, GIF or BMP, up to 50 MB.' },
    { title: 'Choose a shape, or stay freeform', body: 'Freeform lets you drag any rectangle. A fixed ratio keeps the proportions locked while you resize.' },
    { title: 'Drag to position the selection', body: 'Drag inside the box to move it, or drag a corner handle to resize. This works with a finger on a phone as well as a mouse.' },
    { title: 'Fine-tune with numbers if you need to', body: 'X, Y, width and height are all editable. The selection is always kept inside the image.' },
    { title: 'Check the output size, crop and download', body: 'The exact pixel dimensions are shown before you crop, and again on the result.' },
  ],
  tips: [
    { title: 'Cropping cannot add resolution', body: 'A small crop of a small image gives a small file. If the result needs to be large, start from the highest-resolution original you have.' },
    { title: 'Choose the shape before fine-tuning', body: 'Switching ratio adjusts the selection around its centre, so pick the shape first and position it afterwards.' },
    { title: 'PNG keeps transparency, JPEG does not', body: 'Cropping a transparent PNG to JPEG fills the transparent areas with white.' },
    { title: 'Check what a platform actually crops to', body: 'Many sites apply their own crop on top of yours. A square that is safe at 1:1 may still get circled by an avatar frame.' },
  ],
  faqs: [
    { q: 'Are my images uploaded anywhere?', a: 'No. Cropping happens in your browser. The file never leaves your device and nothing is kept after you close the tab.' },
    { q: 'Can I crop to an exact pixel size?', a: 'Yes. Type the width and height directly instead of dragging. The selection is kept within the image bounds, so the largest exact size is limited by the original.' },
    { q: 'Does it work on a phone?', a: 'Yes. The selection responds to touch — drag inside it to move, drag a corner to resize.' },
    { q: 'Can I crop several images the same way at once?', a: 'Not currently. Each image is cropped individually, because the right crop is rarely identical across photos.' },
    { q: 'Is the original changed?', a: 'No. You download a new file; the original on your device is untouched.' },
  ],
  relatedWorkflows: [
    {
      title: 'Prepare a photo for an application form',
      description: 'Get a photo to the shape and size a portal will accept.',
      steps: [
        { slug: 'heic-to-jpg', note: 'Convert from HEIC if the photo came from an iPhone' },
        { slug: 'image-crop', note: 'Crop to the required shape' },
        { slug: 'image-compress', note: 'Bring it under the size limit' },
      ],
    },
  ],
  relatedTools: ['image-compress', 'image-resize', 'heic-to-jpg', 'image-to-pdf'],
};
export default content;
