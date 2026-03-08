/**
 * Upload issuer logos to Cloudinary and update database issuerLogo URLs.
 * 
 * Uploads all PNG/JPG logo files from public/logos/ to Cloudinary,
 * then updates each certification's issuerLogo field with the Cloudinary URL.
 * 
 * Usage: node scripts/upload-logos-cloudinary.mjs
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Load env
dotenv.config({ path: path.join(ROOT, '.env.local') });

// Also load server .env for DATABASE_URL
dotenv.config({ path: path.join(ROOT, 'server', '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);

// ============================================================================
// Logo file → Cloudinary public_id mapping
// ============================================================================
const LOGOS_DIR = path.join(ROOT, 'public', 'logos');

const logoFiles = [
  { file: 'alibaba.jpg', publicId: 'alibaba-cloud' },
  { file: 'codepolitan.png', publicId: 'codepolitan' },
  { file: 'dicoding.png', publicId: 'dicoding' },
  { file: 'google-cloud.png', publicId: 'google-cloud' },
  { file: 'ibm.png', publicId: 'ibm' },
  { file: 'sanbercode.png', publicId: 'sanbercode' },
  { file: 'stmikjabar.png', publicId: 'stmik-jabar' },
  { file: 'revou.png', publicId: 'revou' },
  { file: 'itts.png', publicId: 'itts' },
  { file: 'jda.png', publicId: 'jda' },
  { file: 'seminar.png', publicId: 'seminar' },
  { file: 'default.png', publicId: 'default' },
];

// Map issuer names → Cloudinary public ID key
const ISSUER_TO_LOGO_KEY = {
  'Alibaba Cloud': 'alibaba-cloud',
  'Alibaba Cloud (Apsara Clouder)': 'alibaba-cloud',
  'Alibaba Cloud / ADSE': 'alibaba-cloud',
  'Google Cloud': 'google-cloud',
  'Codepolitan': 'codepolitan',
  'Dicoding Indonesia': 'dicoding',
  'IBM (Cognitive Class)': 'ibm',
  'Sanbercode': 'sanbercode',
  'RevoU': 'revou',
  'STMIK Jabar': 'stmik-jabar',
  'LPPM STMIK Jabar': 'stmik-jabar',
  'HIMATIF STMIK Jabar': 'stmik-jabar',
  'BEM STMIK Jabar': 'stmik-jabar',
  'HIMASI STMIK Jabar': 'stmik-jabar',
  'HIMASI': 'stmik-jabar',
  'JDA': 'jda',
  'Seminar Nasional': 'seminar',
  'Seminar Internasional': 'seminar',
  'Institut Teknologi Tangerang Selatan': 'itts',
  'Unknown': 'default',
};

// ============================================================================
// Upload logos to Cloudinary
// ============================================================================
async function uploadLogos() {
  console.log(`\n📁 Logos directory: ${LOGOS_DIR}`);
  console.log(`📋 Total logos to upload: ${logoFiles.length}\n`);

  const uploadedUrls = {};

  for (let i = 0; i < logoFiles.length; i++) {
    const logo = logoFiles[i];
    const fullPath = path.join(LOGOS_DIR, logo.file);
    const progress = `[${i + 1}/${logoFiles.length}]`;

    if (!fs.existsSync(fullPath)) {
      console.error(`${progress} ❌ File not found: ${logo.file}`);
      continue;
    }

    process.stdout.write(`${progress} Uploading ${logo.file}...`);

    try {
      const result = await cloudinary.uploader.upload(fullPath, {
        folder: 'portfolio/logos',
        public_id: logo.publicId,
        resource_type: 'image',
        overwrite: true,
        invalidate: true,
        access_mode: 'public',
        tags: ['logo', 'issuer', logo.publicId],
      });

      console.log(` ✅ ${result.secure_url}`);
      uploadedUrls[logo.publicId] = result.secure_url;
    } catch (error) {
      console.error(` ❌ ${error.message}`);
    }
  }

  return uploadedUrls;
}

// ============================================================================
// Generate SQL update statements
// ============================================================================
async function generateSqlUpdates(uploadedUrls) {
  console.log('\n📊 Generating SQL update statements...\n');

  const sqlStatements = [];

  // For each issuer → logo mapping, generate bulk UPDATE
  const logoKeyToUrl = uploadedUrls;

  // Group issuers by logo key
  const keyToIssuers = {};
  for (const [issuer, key] of Object.entries(ISSUER_TO_LOGO_KEY)) {
    if (!keyToIssuers[key]) keyToIssuers[key] = [];
    keyToIssuers[key].push(issuer);
  }

  for (const [key, issuers] of Object.entries(keyToIssuers)) {
    const url = logoKeyToUrl[key];
    if (!url) {
      console.warn(`⚠️ No URL for key: ${key}`);
      continue;
    }

    const issuerList = issuers.map(i => `'${i.replace(/'/g, "''")}'`).join(', ');
    const sql = `UPDATE certifications SET "issuerLogo" = '${url}', "updatedAt" = NOW() WHERE issuer IN (${issuerList});`;
    sqlStatements.push(sql);
    console.log(`✅ ${key} → ${issuers.length} issuer(s)`);
  }

  // Write SQL file
  const sqlPath = path.join(ROOT, 'scripts', 'update-issuer-logos.sql');
  fs.writeFileSync(sqlPath, sqlStatements.join('\n'));
  console.log(`\n📄 SQL file saved to: ${sqlPath}`);

  // Also output JSON for reference
  const jsonPath = path.join(ROOT, 'scripts', 'logo-urls.json');
  fs.writeFileSync(jsonPath, JSON.stringify(uploadedUrls, null, 2));
  console.log(`📄 Logo URLs JSON saved to: ${jsonPath}`);

  return sqlStatements;
}

// ============================================================================
// Main
// ============================================================================
async function main() {
  console.log('🚀 Starting logo upload to Cloudinary...\n');

  // Step 1: Upload logos
  const uploadedUrls = await uploadLogos();

  console.log(`\n✅ Uploaded ${Object.keys(uploadedUrls).length} logos to Cloudinary`);

  // Step 2: Generate SQL
  await generateSqlUpdates(uploadedUrls);

  console.log('\n🎉 Upload complete! Now run the SQL updates against the database.');
  console.log('   You can use: npx prisma db execute --stdin --schema server/prisma/schema.prisma < scripts/update-issuer-logos.sql');
}

main().catch(console.error);
