import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const logoSvg = await readFile(join(root, "public/flolabs-logo.svg"));
const width = 1200;
const height = 630;

const logoSize = 220;
const logoPng = await sharp(logoSvg).resize(logoSize, logoSize).png().toBuffer();
const logoBase64 = logoPng.toString("base64");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e6f0ff"/>
      <stop offset="55%" stop-color="#f7f9fc"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00349b"/>
      <stop offset="100%" stop-color="#0476d9"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${width}" height="8" fill="url(#accent)"/>
  <circle cx="1040" cy="120" r="180" fill="#00349b" opacity="0.06"/>
  <circle cx="180" cy="520" r="140" fill="#0476d9" opacity="0.08"/>
  <image href="data:image/png;base64,${logoBase64}" x="96" y="${(height - logoSize) / 2}" width="${logoSize}" height="${logoSize}"/>
  <text x="360" y="280" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#00349b">FloLabs International</text>
  <text x="360" y="340" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600" fill="#0476d9">Innovation in AI &amp; Robotics</text>
  <text x="360" y="400" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#2f3f52">Experiential learning through hands-on AI and robotics projects.</text>
  <text x="360" y="520" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#00349b">flolabs.international</text>
</svg>`;

const ogImage = await sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(join(root, "public/og-image.png"), ogImage);

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

const appleIcon = await sharp(logoSvg)
  .resize(180, 180, { fit: "contain", background: transparent })
  .png()
  .toBuffer();

await writeFile(join(root, "app/apple-icon.png"), appleIcon);

async function createFaviconIco(outputPath) {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((size) =>
      sharp(logoSvg)
        .resize(size, size, {
          fit: "contain",
          background: transparent,
        })
        .png()
        .toBuffer(),
    ),
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map((png, index) => {
    const size = sizes[index];
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  await writeFile(outputPath, Buffer.concat([header, ...entries, ...pngs]));
}

await createFaviconIco(join(root, "app/favicon.ico"));

console.log("Generated public/og-image.png, app/apple-icon.png, and app/favicon.ico");
