/**
 * Script to generate high-resolution, standards-compliant favicons and app icons
 * matching Google Search Favicon Guidelines (multiples of 48px square) and PWA specs.
 */

const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve(__dirname, '../client/node_modules/sharp'));

const SOURCE_IMAGE = path.resolve(
  '/home/abdulkhaliqwebdeveloper/.gemini/antigravity/brain/e12182b6-8a90-4e44-9951-da84622c7189/.user_uploaded/media_1789735930874.jpg'
);

const PUBLIC_DIR = path.resolve(__dirname, '../client/public');
const APP_DIR = path.resolve(__dirname, '../client/src/app');

// Bounding box & crop parameters:
// Center of logo mark is (513, 220.5).
// 430x430 square centered at (513, 221) gives:
// left: 298, top: 6, width: 430, height: 430.
// This guarantees safe circular clipping margin without touching logo edges.
const CROP_BOX = {
  left: 298,
  top: 6,
  width: 430,
  height: 430,
};

function createIco(images) {
  // Header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(images.length, 4); // image count

  let offset = 6 + images.length * 16;
  const entries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0); // width
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image byte size
    entry.writeUInt32LE(offset, 12); // offset in file
    entries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((img) => img.buffer)]);
}

async function generate() {
  console.log('Loading source image from:', SOURCE_IMAGE);
  if (!fs.existsSync(SOURCE_IMAGE)) {
    throw new Error(`Source image not found at ${SOURCE_IMAGE}`);
  }

  const baseExtractor = sharp(SOURCE_IMAGE).extract(CROP_BOX);

  // 1. Generate PNGs at required sizes
  console.log('Generating high-res PNG icons...');
  
  // 512x512 (Standard & PWA)
  const buf512 = await baseExtractor
    .clone()
    .resize(512, 512, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512.png'), buf512);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon.png'), buf512);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-maskable-512.png'), buf512);
  fs.writeFileSync(path.join(APP_DIR, 'icon.png'), buf512);
  console.log(' - icon-512.png, icon.png, icon-maskable-512.png created (512x512)');

  // 192x192 (PWA & Android)
  const buf192 = await baseExtractor
    .clone()
    .resize(192, 192, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-192.png'), buf192);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-maskable-192.png'), buf192);
  console.log(' - icon-192.png, icon-maskable-192.png created (192x192)');

  // 180x180 (Apple Touch Icon)
  const buf180 = await baseExtractor
    .clone()
    .resize(180, 180, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), buf180);
  fs.writeFileSync(path.join(APP_DIR, 'apple-icon.png'), buf180);
  console.log(' - apple-touch-icon.png created (180x180)');

  // 96x96 (Google Favicon multiple & Desktop HiDPI)
  const buf96 = await baseExtractor
    .clone()
    .resize(96, 96, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-96x96.png'), buf96);
  console.log(' - favicon-96x96.png created (96x96)');

  // 48x48 (CRITICAL FOR GOOGLE SEARCH - official minimum multiple)
  const buf48 = await baseExtractor
    .clone()
    .resize(48, 48, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-48x48.png'), buf48);
  console.log(' - favicon-48x48.png created (48x48 - Google Search standard)');

  // 32x32 & 16x16 for ICO
  const buf32 = await baseExtractor
    .clone()
    .resize(32, 32, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const buf16 = await baseExtractor
    .clone()
    .resize(16, 16, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 2. Generate multi-resolution favicon.ico
  console.log('Generating multi-resolution favicon.ico (16, 32, 48px)...');
  const icoBuffer = createIco([
    { size: 16, buffer: buf16 },
    { size: 32, buffer: buf32 },
    { size: 48, buffer: buf48 },
  ]);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  console.log(' - public/favicon.ico created successfully (bytes:', icoBuffer.length, ')');

  // 3. Generate icon.svg embedding 512x512 base64
  console.log('Generating icon.svg...');
  const base64Png = buf512.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${base64Png}" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon.svg'), svgContent);
  fs.writeFileSync(path.join(APP_DIR, 'icon.svg'), svgContent);
  console.log(' - icon.svg created');

  console.log('\nAll favicons and site icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
