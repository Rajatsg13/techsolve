/**
 * Regenerates the image and PDF fixtures used by image-tools.spec.js and
 * pdf-phase4.spec.js.
 *
 *   cd test-harness && node fixtures/generate.mjs
 *
 * Images are drawn with the harness's own Chromium canvas and PDFs with the
 * site's pdf-lib, so nothing beyond the two installed node_modules is needed.
 * The output is committed; rerun this only when a fixture has to change.
 *
 * The HEIC fixtures are made separately by make-heic.sh (macOS only). They are
 * converted, not camera-original, and are not evidence of real-iPhone support.
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const requireRoot = createRequire(path.join(HERE, '..', '..', 'package.json'));
const requireHarness = createRequire(path.join(HERE, '..', 'package.json'));
const { PDFDocument, StandardFonts, rgb } = requireRoot('pdf-lib');
const { chromium } = requireHarness('@playwright/test');

const out = (name) => path.join(HERE, name);
const write = (name, bytes) => fs.writeFileSync(out(name), bytes);

/* ── Images, drawn in a real browser canvas ─────────────────────────────── */

const browser = await chromium.launch();
const page = await browser.newPage();

/** Draw in the page and return encoded bytes. */
async function draw(kind, opts) {
  const b64 = await page.evaluate(async ({ kind, opts }) => {
    // Seeded PRNG so the fixtures are reproducible byte-for-byte in intent.
    let seed = opts.seed || 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    const c = document.createElement('canvas');
    c.width = opts.w; c.height = opts.h;
    const x = c.getContext('2d');

    if (kind === 'photo') {
      // Gradients plus fine noise, so JPEG has real detail to compress —
      // a flat image shrinks to nothing and proves little.
      const g = x.createLinearGradient(0, 0, opts.w, opts.h);
      g.addColorStop(0, '#78a0c8'); g.addColorStop(0.5, '#b49664'); g.addColorStop(1, '#5a8c50');
      x.fillStyle = g; x.fillRect(0, 0, opts.w, opts.h);
      const img = x.getImageData(0, 0, opts.w, opts.h);
      const d = img.data, amp = opts.noise ?? 6;
      for (let i = 0; i < d.length; i += 4) {
        const n = (rand() - 0.5) * 2 * amp;
        d[i] += n; d[i + 1] += n; d[i + 2] += n;
      }
      x.putImageData(img, 0, 0);
      for (let i = 0; i < 28; i++) {
        x.strokeStyle = `rgb(${rand()*255|0},${rand()*255|0},${rand()*255|0})`;
        x.lineWidth = 6;
        x.beginPath();
        x.ellipse(rand()*opts.w, rand()*opts.h, 20 + rand()*opts.w/10, 20 + rand()*opts.h/10, 0, 0, Math.PI*2);
        x.stroke();
      }
      x.fillStyle = '#fafafa';
      x.fillRect(opts.w/8, opts.h/8, opts.w/3, opts.h/12);
      x.fillStyle = '#0a0a0a';
      x.font = `bold ${Math.max(10, opts.h/30|0)}px sans-serif`;
      x.fillText('DECYFY TEST IMAGE', opts.w/8 + 16, opts.h/8 + opts.h/20);
    }

    if (kind === 'stripes') {
      for (let i = 0; i < opts.w; i += 200) { x.fillStyle = `rgb(${i%255},${(i*3)%255},${(i*7)%255})`; x.fillRect(i, 0, 100, opts.h); }
      for (let i = 0; i < opts.h; i += 300) { x.fillStyle = `rgb(${(i*5)%255},200,${(i*2)%255})`; x.fillRect(0, i, opts.w, 80); }
    }

    if (kind === 'transparent') {
      x.fillStyle = 'rgba(220,40,40,1)';
      x.beginPath(); x.arc(500, 500, 400, 0, Math.PI*2); x.fill();
      x.fillStyle = 'rgba(30,90,220,0.63)';
      x.fillRect(400, 0, 200, 1000);
    }

    if (kind === 'solid') { x.fillStyle = opts.color; x.fillRect(0, 0, opts.w, opts.h); }

    if (kind === 'scan') {
      // Looks like a table, but it is only pixels: the PDF built from it has
      // no text layer, which is the case PDF to Excel must refuse honestly.
      x.fillStyle = '#fff'; x.fillRect(0, 0, opts.w, opts.h);
      x.fillStyle = '#000'; x.font = '28px sans-serif';
      x.fillText('SCANNED INVOICE (image only, no text layer)', 60, 80);
      const cols = [60, 400, 700, 980];
      const rows = [['Item','Qty','Rate','Amount'],['Paper A4','20','250','5000'],['Toner','3','4200','12600'],['Stapler','5','180','900']];
      rows.forEach((r, ri) => {
        const y = 180 + ri * 70;
        r.forEach((cell, ci) => x.fillText(cell, cols[ci], y));
        x.strokeStyle = '#888'; x.beginPath(); x.moveTo(50, y + 30); x.lineTo(1190, y + 30); x.stroke();
      });
    }

    const blob = await new Promise(r => c.toBlob(r, opts.mime, opts.quality));
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return btoa(s);
  }, { kind, opts });
  return Buffer.from(b64, 'base64');
}

const JPG = 'image/jpeg', PNG = 'image/png';

write('photo-large.jpg',   await draw('photo', { w: 4032, h: 3024, mime: JPG, quality: 0.9, seed: 11 }));  // an iPhone-sized shot
write('photo-medium.jpg',  await draw('photo', { w: 3000, h: 2000, mime: JPG, quality: 0.85, seed: 12, noise: 4 }));
write('photo-small.jpg',   await draw('photo', { w: 1200, h: 800,  mime: JPG, quality: 0.85, seed: 13 }));
write('panorama.jpg',      await draw('photo', { w: 6000, h: 1200, mime: JPG, quality: 0.8, seed: 14, noise: 3 }));  // extreme shape for 9:16
write('already-small.jpg', await draw('photo', { w: 800,  h: 600,  mime: JPG, quality: 0.35, seed: 15, noise: 3 }));  // the "nothing saved" path
write('huge-80mp.jpg',     await draw('stripes', { w: 10000, h: 8000, mime: JPG, quality: 0.6 }));          // past a phone, under canvas limits
write('transparent.png',   await draw('transparent', { w: 1000, h: 1000, mime: PNG }));
write('one-pixel.png',     await draw('solid', { w: 1, h: 1, color: '#ff0000', mime: PNG }));
const scanJpg =            await draw('scan', { w: 1240, h: 1754, mime: JPG, quality: 0.8 });
await browser.close();

// Invalid inputs
fs.writeFileSync(out('not-an-image.jpg'), 'this is definitely not an image, just text pretending to be one\n'.repeat(40));
const small = fs.readFileSync(out('photo-small.jpg'));
write('corrupt.jpg', small.subarray(0, Math.floor(small.length / 3)));         // real JPEG header, truncated body

/* ── PDFs ───────────────────────────────────────────────────────────────── */

const A4 = [595.28, 841.89];
const A4L = [841.89, 595.28];

{ // Mixed orientation, with markers to prove text survives rotation and corners are not clipped
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const fb = await doc.embedFont(StandardFonts.HelveticaBold);
  [['PORTRAIT ONE', A4], ['LANDSCAPE TWO', A4L], ['PORTRAIT THREE', A4], ['LANDSCAPE FOUR', A4L]].forEach(([label, size], i) => {
    const p = doc.addPage(size);
    const { width, height } = p.getSize();
    p.drawText(label, { x: 50, y: height - 90, size: 26, font: fb, color: rgb(0.05, 0.1, 0.3) });
    p.drawText(`This is page ${i + 1} of 4. Marker text PAGE${i + 1}MARKER for extraction checks.`, { x: 50, y: height - 130, size: 11, font: f });
    p.drawText(`${Math.round(width)} x ${Math.round(height)} points`, { x: 50, y: height - 155, size: 10, font: f });
    p.drawText('TL', { x: 12, y: height - 22, size: 9, font: fb });
    p.drawText('BR', { x: width - 30, y: 12, size: 9, font: fb });
    p.drawRectangle({ x: 40, y: 60, width: width - 80, height: height - 220, borderColor: rgb(0.7, 0.7, 0.8), borderWidth: 1 });
  });
  write('mixed-orientation.pdf', await doc.save());
}

{ // Simple digital table: text and numbers
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const fb = await doc.embedFont(StandardFonts.HelveticaBold);
  const p = doc.addPage(A4);
  const { height } = p.getSize();
  p.drawText('Quarterly Sales Report', { x: 50, y: height - 60, size: 18, font: fb });
  const cols = [50, 210, 330, 440];
  [['Region','Units','Revenue','Growth'],['North','1240','285000','12.5'],['South','980','196400','-3.2'],
   ['East','1567','412300','22.8'],['West','742','158900','5.1'],['Central','2103','655200','31.4']]
    .forEach((r, ri) => r.forEach((cell, ci) =>
      p.drawText(cell, { x: cols[ci], y: height - 110 - ri * 26, size: 11, font: ri === 0 ? fb : f })));
  write('table-simple.pdf', await doc.save());
}

{ // Table continuing across two pages, header repeated
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const fb = await doc.embedFont(StandardFonts.HelveticaBold);
  const cols = [50, 200, 320, 450];
  for (let pg = 0; pg < 2; pg++) {
    const p = doc.addPage(A4);
    const { height } = p.getSize();
    p.drawText(`Inventory Page ${pg + 1}`, { x: 50, y: height - 55, size: 16, font: fb });
    ['Item','Code','Qty','Price'].forEach((c, ci) => p.drawText(c, { x: cols[ci], y: height - 95, size: 11, font: fb }));
    for (let r = 0; r < 12; r++) {
      const n = pg * 12 + r + 1;
      [`Widget ${n}`, `SKU-${1000 + n}`, String(n * 7), String((n * 13.5).toFixed(2))]
        .forEach((c, ci) => p.drawText(c, { x: cols[ci], y: height - 120 - r * 22, size: 10, font: f }));
    }
  }
  write('table-multipage.pdf', await doc.save());
}

{ // Known secrets for redaction checks — including one hard against the bottom edge
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const fb = await doc.embedFont(StandardFonts.HelveticaBold);
  const p1 = doc.addPage(A4); let h = p1.getSize().height;
  p1.drawText('Confidential Personnel Record', { x: 50, y: h - 60, size: 16, font: fb });
  p1.drawText('Employee: Jane Doe', { x: 50, y: h - 100, size: 12, font: f });
  p1.drawText('SECRETALPHA1234 national id number', { x: 50, y: h - 130, size: 12, font: f });
  p1.drawText('Salary: SECRETBRAVO5678 per annum', { x: 50, y: h - 160, size: 12, font: f });
  p1.drawText('This line must SURVIVE the redaction.', { x: 50, y: h - 220, size: 12, font: f });
  p1.drawText('SECRETEDGE9999', { x: 50, y: 30, size: 12, font: f });
  const p2 = doc.addPage(A4L); h = p2.getSize().height;
  p2.drawText('Landscape Appendix', { x: 50, y: h - 60, size: 16, font: fb });
  p2.drawText('SECRETCHARLIE4321 on a landscape page', { x: 50, y: h - 110, size: 12, font: f });
  p2.drawText('Landscape line that must SURVIVE too.', { x: 50, y: h - 150, size: 12, font: f });
  const p3 = doc.addPage(A4); h = p3.getSize().height;
  p3.drawText('Page three is never redacted.', { x: 50, y: h - 80, size: 13, font: f });
  p3.drawText('UNTOUCHEDPAGETEXT must remain selectable.', { x: 50, y: h - 110, size: 12, font: f });
  write('secrets.pdf', await doc.save());
}

{ // Image-only page: no text layer at all
  const doc = await PDFDocument.create();
  const img = await doc.embedJpg(scanJpg);
  const p = doc.addPage(A4);
  p.drawImage(img, { x: 0, y: 0, width: A4[0], height: A4[1] });
  write('scanned-no-text.pdf', await doc.save());
}

for (const f of fs.readdirSync(HERE).filter(n => !/\.(mjs|sh|md)$/.test(n)).sort()) {
  console.log(`${(fs.statSync(out(f)).size / 1024).toFixed(1).padStart(9)} KB  ${f}`);
}
