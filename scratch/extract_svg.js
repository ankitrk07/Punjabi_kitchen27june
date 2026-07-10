const fs = require('fs');
const path = require('path');

const iconFile = fs.readFileSync(path.join(__dirname, '../src/data/iconBase64.ts'), 'utf8');
const base64Match = iconFile.match(/export const iconBase64 = "data:[^;]+;base64,([^"]+)"/);

if (!base64Match) {
  console.error("Could not find base64 string!");
  process.exit(1);
}

const buffer = Buffer.from(base64Match[1], 'base64');
const content = buffer.toString('binary');

// Find SVG inside the metadata
const svgStartIndex = content.indexOf('<svg');
const svgEndIndex = content.indexOf('</svg>');

if (svgStartIndex === -1 || svgEndIndex === -1) {
  console.log("No standard svg tags found. Saving PNG to scratch.");
  fs.writeFileSync(path.join(__dirname, 'temp_icon.png'), buffer);
} else {
  const svg = content.substring(svgStartIndex, svgEndIndex + 6);
  fs.writeFileSync(path.join(__dirname, 'extracted_logo.svg'), svg);
  console.log("Extracted SVG successfully!");
}
