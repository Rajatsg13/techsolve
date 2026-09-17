// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Unit tests for image geometry and format logic.
 * Tag: @unit
 *
 * Expected values are worked out by hand, not read off the implementation.
 */

let I;
test.beforeAll(async () => { I = await import('../../app/lib/image.js'); });

test.describe('@unit crop clamping', () => {
  test('a rectangle already inside the image is unchanged', () => {
    expect(I.clampCrop({ x: 10, y: 20, width: 100, height: 50 }, 400, 300))
      .toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  test('a rectangle running off the right edge slides back in', () => {
    // 3900 + 400 = 4300, image is 4000 wide -> x must become 3600
    expect(I.clampCrop({ x: 3900, y: 0, width: 400, height: 100 }, 4000, 3000).x).toBe(3600);
  });

  test('negative origin is pulled to zero', () => {
    const r = I.clampCrop({ x: -50, y: -80, width: 100, height: 100 }, 400, 300);
    expect(r.x).toBe(0); expect(r.y).toBe(0);
  });

  test('a rectangle wider than the image is trimmed to the image', () => {
    const r = I.clampCrop({ x: 0, y: 0, width: 9999, height: 9999 }, 400, 300);
    expect(r.width).toBe(400); expect(r.height).toBe(300);
  });

  test('a zero-size rectangle becomes one pixel, never zero', () => {
    // A zero-dimension canvas throws in the browser, so this must not be 0.
    const r = I.clampCrop({ x: 0, y: 0, width: 0, height: 0 }, 400, 300);
    expect(r.width).toBe(1); expect(r.height).toBe(1);
  });
});

test.describe('@unit aspect ratio fitting', () => {
  test('a square ratio produces equal sides', () => {
    const r = I.applyAspectRatio({ x: 0, y: 0, width: 400, height: 200 }, 1, 800, 600);
    expect(r.width).toBe(r.height);
  });

  test('16:9 on a 4:3 image fits the width and letterboxes vertically', () => {
    // 4000 wide / (16/9) = 2250 high, centred in 3000 -> y = 375
    const r = I.centredCrop(16 / 9, 4000, 3000);
    expect(r).toEqual({ x: 0, y: 375, width: 4000, height: 2250 });
  });

  test('9:16 on a landscape image fits the height', () => {
    // height 3000 -> width 3000 * 9/16 = 1687.5 -> 1688, centred in 4000
    const r = I.centredCrop(9 / 16, 4000, 3000);
    expect(r.height).toBe(3000);
    expect(r.width).toBe(1688);
    expect(r.x).toBe(Math.round((4000 - 1688) / 2));
  });

  test('the reshaped rectangle keeps its centre', () => {
    const before = { x: 100, y: 100, width: 400, height: 400 };
    const after = I.applyAspectRatio(before, 16 / 9, 1000, 1000);
    const cBefore = before.x + before.width / 2;
    const cAfter = after.x + after.width / 2;
    expect(Math.abs(cBefore - cAfter)).toBeLessThanOrEqual(1);
  });

  test('freeform leaves the rectangle alone apart from clamping', () => {
    expect(I.applyAspectRatio({ x: 5, y: 5, width: 50, height: 90 }, null, 400, 300))
      .toEqual({ x: 5, y: 5, width: 50, height: 90 });
  });

  test('a ratio that cannot fit shrinks rather than overflowing', () => {
    const r = I.applyAspectRatio({ x: 0, y: 0, width: 400, height: 300 }, 16 / 9, 400, 300);
    expect(r.width).toBeLessThanOrEqual(400);
    expect(r.height).toBeLessThanOrEqual(300);
    expect(Math.abs(r.width / r.height - 16 / 9)).toBeLessThan(0.02);
  });

  test('every offered ratio produces a rectangle inside the image', () => {
    for (const preset of I.ASPECT_RATIOS) {
      const r = I.centredCrop(preset.value, 1920, 1080);
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(1920);
      expect(r.y + r.height).toBeLessThanOrEqual(1080);
    }
  });
});

test.describe('@unit scaling', () => {
  test('fits inside a box preserving ratio', () => {
    // 4000x3000 into 1000 wide -> 1000x750
    expect(I.fitWithin(4000, 3000, 1000, 1000)).toMatchObject({ width: 1000, height: 750 });
  });

  test('never enlarges a small image', () => {
    expect(I.fitWithin(200, 100, 4000, 4000)).toMatchObject({ width: 200, height: 100, scale: 1 });
  });

  test('leaves a normal image untouched by the canvas limiter', () => {
    expect(I.fitCanvasLimits(4000, 3000)).toEqual({ width: 4000, height: 3000, limited: false });
  });

  test('brings an oversized image under the dimension limit', () => {
    const r = I.fitCanvasLimits(30000, 10000);
    expect(r.limited).toBe(true);
    expect(r.width).toBeLessThanOrEqual(I.MAX_CANVAS_DIM);
    expect(r.height).toBeLessThanOrEqual(I.MAX_CANVAS_DIM);
  });

  test('brings a huge-area image under the pixel limit', () => {
    const r = I.fitCanvasLimits(16000, 16000);
    expect(r.width * r.height).toBeLessThanOrEqual(I.MAX_CANVAS_AREA);
  });
});

test.describe('@unit formats', () => {
  test('png stays png so transparency survives', () => {
    expect(I.defaultFormatFor('image/png')).toBe('png');
    expect(I.keepsTransparency('png')).toBe(true);
  });

  test('photographs default to jpeg', () => {
    expect(I.defaultFormatFor('image/jpeg')).toBe('jpeg');
    expect(I.defaultFormatFor('image/heic')).toBe('jpeg');
    expect(I.keepsTransparency('jpeg')).toBe(false);
  });

  test('webp is preserved', () => expect(I.defaultFormatFor('image/webp')).toBe('webp'));

  test('an unknown format falls back rather than throwing', () => {
    expect(I.getFormat('nonsense').id).toBe('jpeg');
  });
});

test.describe('@unit savings', () => {
  test('reports the percentage saved', () => expect(I.savingsPercent(1000, 250)).toBe(75));
  test('reports a negative when the output grew', () => expect(I.savingsPercent(100, 150)).toBe(-50));
  test('an empty original gives null rather than Infinity', () => expect(I.savingsPercent(0, 10)).toBe(null));
});

test.describe('@unit filenames', () => {
  test('swaps the extension', () => expect(I.retargetFilename('holiday.png', 'jpg')).toBe('holiday.jpg'));
  test('adds a suffix', () => expect(I.retargetFilename('holiday.png', 'jpg', '-compressed')).toBe('holiday-compressed.jpg'));
  test('handles a name with dots', () => expect(I.retargetFilename('my.photo.v2.heic', 'jpg')).toBe('my.photo.v2.jpg'));
  test('handles a name with no extension', () => expect(I.retargetFilename('scan', 'jpg')).toBe('scan.jpg'));
  test('handles an empty name', () => expect(I.retargetFilename('', 'jpg')).toBe('image.jpg'));
});
