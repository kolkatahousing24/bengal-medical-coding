import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const INPUT_DIR = '/home/z/my-project/public/images';
const OUTPUT_DIR = '/home/z/my-project/public/images/gallery';

const MAX_WIDTH = 1200;
const JPEG_QUALITY = 80;
const TARGET_SIZE_KB = 200;

async function getFileInfo(filePath) {
  const s = await stat(filePath);
  return {
    size: s.size,
    sizeKB: (s.size / 1024).toFixed(1),
  };
}

async function optimizeGalleryImage(inputPath, outputPath) {
  const before = await getFileInfo(inputPath);
  
  await sharp(inputPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(outputPath);
  
  const after = await getFileInfo(outputPath);
  const reduction = ((1 - after.size / before.size) * 100).toFixed(1);
  
  return { before: before.sizeKB, after: after.sizeKB, reduction, underTarget: after.size <= TARGET_SIZE_KB * 1024 };
}

async function convertPngToJpeg(inputPath, outputPath) {
  const before = await getFileInfo(inputPath);
  
  await sharp(inputPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(outputPath);
  
  const after = await getFileInfo(outputPath);
  const reduction = ((1 - after.size / before.size) * 100).toFixed(1);
  
  return { before: before.sizeKB, after: after.sizeKB, reduction, underTarget: after.size <= TARGET_SIZE_KB * 1024 };
}

async function main() {
  console.log('=== Image Optimization Script ===\n');
  
  // 1. Optimize gallery images (gallery-1.jpg through gallery-10.jpg)
  console.log('--- Gallery Images (JPEG → optimized JPEG) ---');
  const galleryResults = [];
  
  for (let i = 1; i <= 10; i++) {
    const filename = `gallery-${i}.jpg`;
    const inputPath = path.join(INPUT_DIR, filename);
    const outputPath = path.join(OUTPUT_DIR, filename);
    
    console.log(`Processing ${filename}...`);
    const result = await optimizeGalleryImage(inputPath, outputPath);
    galleryResults.push({ filename, ...result });
    console.log(`  ${result.before}KB → ${result.after}KB (${result.reduction}% reduction) ${result.underTarget ? '✅' : '❌ OVER TARGET'}`);
  }
  
  // 2. Convert PNG images to JPEG
  console.log('\n--- PNG Images (PNG → optimized JPEG) ---');
  const pngFiles = [
    'classroom-training.png',
    'faculty-female.png',
    'faculty-male.png',
    'graduation-placement.png',
    'workshop.png',
  ];
  
  const pngResults = [];
  
  for (const filename of pngFiles) {
    const inputPath = path.join(INPUT_DIR, filename);
    const outputFilename = filename.replace('.png', '.jpg');
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    
    console.log(`Processing ${filename} → ${outputFilename}...`);
    const result = await convertPngToJpeg(inputPath, outputPath);
    pngResults.push({ filename, outputFilename, ...result });
    console.log(`  ${result.before}KB → ${result.after}KB (${result.reduction}% reduction) ${result.underTarget ? '✅' : '❌ OVER TARGET'}`);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  const allResults = [...galleryResults, ...pngResults];
  const totalBefore = allResults.reduce((sum, r) => sum + parseFloat(r.before), 0);
  const totalAfter = allResults.reduce((sum, r) => sum + parseFloat(r.after), 0);
  const overTarget = allResults.filter(r => !r.underTarget);
  
  console.log(`Total before: ${totalBefore.toFixed(1)}KB`);
  console.log(`Total after:  ${totalAfter.toFixed(1)}KB`);
  console.log(`Overall reduction: ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`);
  console.log(`Files under 200KB target: ${allResults.length - overTarget.length}/${allResults.length}`);
  
  if (overTarget.length > 0) {
    console.log(`\nFiles over 200KB target:`);
    overTarget.forEach(r => console.log(`  - ${r.filename || r.outputFilename}: ${r.after}KB`));
  }
}

main().catch(console.error);
