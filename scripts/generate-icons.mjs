/**
 * Render the SVG master into PNGs at the sizes Kakao / Apple / favicons want.
 *
 * Usage:
 *   node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const sources = [
  {
    src: "public/app-icon.svg",
    targets: [
      { out: "public/app-icon-1024.png", size: 1024 },
      { out: "public/app-icon-512.png", size: 512 },
      { out: "public/app-icon-256.png", size: 256 },
      { out: "public/app-icon-192.png", size: 192 },
      { out: "public/apple-touch-icon.png", size: 180 },
    ],
  },
  {
    src: "public/favicon.svg",
    targets: [
      { out: "public/favicon-48.png", size: 48 },
      { out: "public/favicon-32.png", size: 32 },
      { out: "public/favicon-16.png", size: 16 },
    ],
  },
];

for (const { src, targets } of sources) {
  const svg = readFileSync(resolve(root, src));
  for (const { out, size } of targets) {
    // High `density` so the SVG renders sharply before we resize down
    await sharp(svg, { density: Math.max(384, size * 2) })
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toFile(resolve(root, out));
    console.log(`✓ ${out}  (${size}×${size})`);
  }
}

// Bundle the favicon PNGs into a single multi-resolution favicon.ico
const icoSources = [
  resolve(root, "public/favicon-16.png"),
  resolve(root, "public/favicon-32.png"),
  resolve(root, "public/favicon-48.png"),
];
const ico = await pngToIco(icoSources);
writeFileSync(resolve(root, "public/favicon.ico"), ico);
console.log("✓ public/favicon.ico  (16+32+48)");

console.log("\nDone.");
