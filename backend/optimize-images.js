const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadsDir = path.join(__dirname, '../uploads');

async function optimizeAll() {
  const files = fs.readdirSync(uploadsDir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const inputPath = path.join(uploadsDir, file);
    const outputPath = path.join(uploadsDir, path.basename(file, ext) + '.webp');

    if (fs.existsSync(outputPath)) continue;

    try {
      await sharp(inputPath)
        .resize({ width: 600 })
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Optimized: ${file} -> ${path.basename(outputPath)}`);
      fs.unlinkSync(inputPath);
    } catch (e) {
      console.error('Error optimizing', file, e);
    }
  }
}

optimizeAll(); 