/**
 * Upload all certificate files to Cloudinary and update database previewUrl.
 * 
 * Usage: node scripts/upload-certificates.mjs
 * 
 * Requires:
 *   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local
 *   - DATABASE_URL in server/.env
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Load env from .env.local
dotenv.config({ path: path.join(ROOT, '.env.local') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log(`☁️  Cloudinary configured: ${process.env.CLOUDINARY_CLOUD_NAME}`);

// ============================================================================
// Certificate ID → File Path mapping
// ============================================================================
const CERT_DIR = path.join(ROOT, 'Sertifikat');

const certMap = [
  // AI & Data
  { id: 'cert-ai-01', file: 'AI & Data/AI.pdf', type: 'pdf' },
  { id: 'cert-ai-02', file: 'AI & Data/Lomba AI.pdf', type: 'pdf' },
  { id: 'cert-ai-03', file: 'AI & Data/indra-saepudin-certificate-Mini Course Revou - Dana Analitic.pdf', type: 'pdf' },

  // Cloud - Alibaba (images)
  { id: 'cert-cloud-01', file: 'Cloud/alibaba/15/ACA Cloud Computing Certification.jpg', type: 'image' },
  { id: 'cert-cloud-02', file: 'Cloud/alibaba/15/ACP.png', type: 'image' },
  { id: 'cert-cloud-03', file: 'Cloud/alibaba/Alibaba Cloud Certified Developers - 1.jpg', type: 'image' },
  { id: 'cert-cloud-04', file: 'Cloud/alibaba/Handle Large Traffic with Load Balancer（Exam）.jpg', type: 'image' },
  { id: 'cert-cloud-05', file: 'Cloud/alibaba/Operate and Manage Object Storage on the Cloud（Exam）.jpg', type: 'image' },
  { id: 'cert-cloud-06', file: 'Cloud/alibaba/Operate and Manage a Cloud Server（Exam）.jpg', type: 'image' },
  { id: 'cert-cloud-07', file: 'Cloud/alibaba/Operate and Manage a Relational Database on the Cloud（Exam）.jpg', type: 'image' },
  { id: 'cert-cloud-08', file: 'Cloud/alibaba/Use Cloud Resources Flexibly According to Business Requirement（Exam）.jpg', type: 'image' },
  { id: 'cert-cloud-09', file: 'Cloud/alibaba/15/Alibaba Cloud Network Solution.jpg', type: 'image' },
  { id: 'cert-cloud-10', file: 'Cloud/alibaba/15/mySQL for Beginners - Basic Queries.jpg', type: 'image' },
  { id: 'cert-cloud-11', file: 'Cloud/build-deploy-apps-easily-and-securely-with-google-cloud-certificate.pdf', type: 'pdf' },

  // Design
  { id: 'cert-design-01', file: 'Design/UI-UX.jpg', type: 'image' },

  // Events & Seminar
  { id: 'cert-event-01', file: 'Events & Seminar/INDRA SAEPUDIN.png', type: 'image' },
  { id: 'cert-event-02', file: 'Events & Seminar/INDRA SAEPUDIN (1).jpg', type: 'image' },
  { id: 'cert-event-03', file: 'Events & Seminar/Indra Saepudin(1).png', type: 'image' },
  { id: 'cert-event-04', file: 'Events & Seminar/Indra Saepudin.jpg', type: 'image' },
  { id: 'cert-event-05', file: 'Events & Seminar/Indra.jpg', type: 'image' },
  { id: 'cert-event-06', file: 'Events & Seminar/INDRA S.png', type: 'image' },
  { id: 'cert-event-07', file: 'Events & Seminar/sertif peserta.pdf', type: 'pdf' },
  { id: 'cert-event-08', file: 'Events & Seminar/Indra Saepudin - Media Kampus.pdf', type: 'pdf' },
  { id: 'cert-event-09', file: 'Events & Seminar/Salinan Sertifikat Seminar Nasional Al Qur_an Indra Saepudin.pdf', type: 'pdf' },
  { id: 'cert-event-10', file: 'Events & Seminar/Salinan e-Serfitikat _Nama Pada Sertifikat_ _ Seminar Internasional Manajemen Masjid Seri 5.pdf', type: 'pdf' },
  { id: 'cert-event-11', file: 'Events & Seminar/katin.pdf', type: 'pdf' },
  { id: 'cert-event-12', file: 'Events & Seminar/Salinan 1671514639855_Indra Saepudin_3847270.pdf', type: 'pdf' },

  // Others
  { id: 'cert-other-01', file: 'Others/011.pdf', type: 'pdf' },

  // Professional
  { id: 'cert-prof-01', file: 'Professional/Indra Saepudin - Sertifikat ADSE 2023.pdf', type: 'pdf' },
  { id: 'cert-prof-02', file: 'Professional/JDA/Indra_Saepudin_16042024_044547_signed.pdf', type: 'pdf' },
  { id: 'cert-prof-03', file: 'Professional/JDA/Indra_Saepudin_16042024_061942_signed.pdf', type: 'pdf' },
  { id: 'cert-prof-04', file: 'Professional/Sertifikat Magang.pdf', type: 'pdf' },

  // Programming - Codepolitan (original 3)
  { id: 'cert-prog-01', file: 'Programming/Codepolitan/certificate_html.pdf', type: 'pdf' },
  { id: 'cert-prog-02', file: 'Programming/Codepolitan/certificate_css.pdf', type: 'pdf' },
  { id: 'cert-prog-03', file: 'Programming/Codepolitan/certificate_bootstrap.pdf', type: 'pdf' },

  // Programming - Dicoding
  { id: 'cert-prog-04', file: 'Programming/dicoding/js.pdf', type: 'pdf' },
  { id: 'cert-prog-05', file: 'Programming/dicoding/sertifikat_course_123_3361103_280923112713.pdf', type: 'pdf' },
  { id: 'cert-prog-06', file: 'Programming/dicoding/sertifikat_course_177_3444753_311023115958.pdf', type: 'pdf' },
  { id: 'cert-prog-07', file: 'Programming/dicoding-developer-coaching-77-machine-learning-dasar-dasar-pemrograman-python-certificate.pdf', type: 'pdf' },
  { id: 'cert-prog-08', file: 'Programming/dicoding ori.pdf', type: 'pdf' },

  // Programming - Sanbercode
  { id: 'cert-prog-09', file: 'Programming/sanber/Indra Saepudin_sanber.pdf', type: 'pdf' },

  // Programming - IBM
  { id: 'cert-prog-10', file: 'Programming/IBM PY0101EN Certificate _ Cognitive Class.pdf', type: 'pdf' },

  // Programming - Sanbercode (Intro Python)
  { id: 'cert-prog-11', file: 'Programming/introduction python.pdf', type: 'pdf' },

  // Programming - Codepolitan (new 14)
  { id: 'cert-prog-12', file: 'Programming/Codepolitan/codepolitan/Ajax dan Web API.pdf', type: 'pdf' },
  { id: 'cert-prog-13', file: 'Programming/Codepolitan/codepolitan/Auth dan Implementasi ExpressJS.pdf', type: 'pdf' },
  { id: 'cert-prog-14', file: 'Programming/Codepolitan/codepolitan/ExpressJS.pdf', type: 'pdf' },
  { id: 'cert-prog-15', file: 'Programming/Codepolitan/codepolitan/Javascript.pdf', type: 'pdf' },
  { id: 'cert-prog-16', file: 'Programming/Codepolitan/codepolitan/MEVN - Shopping Card.pdf', type: 'pdf' },
  { id: 'cert-prog-17', file: 'Programming/Codepolitan/codepolitan/Mongo Relasi Express.pdf', type: 'pdf' },
  { id: 'cert-prog-18', file: 'Programming/Codepolitan/codepolitan/MongoDB Relationship.pdf', type: 'pdf' },
  { id: 'cert-prog-19', file: 'Programming/Codepolitan/codepolitan/MongoDB on JS.pdf', type: 'pdf' },
  { id: 'cert-prog-20', file: 'Programming/Codepolitan/codepolitan/MongoDB.pdf', type: 'pdf' },
  { id: 'cert-prog-21', file: 'Programming/Codepolitan/codepolitan/OOP- CODEPOLITAN.pdf', type: 'pdf' },
  { id: 'cert-prog-22', file: 'Programming/Codepolitan/codepolitan/RESTful ExpressJs.pdf', type: 'pdf' },
  { id: 'cert-prog-23', file: 'Programming/Codepolitan/codepolitan/VueJs 3.pdf', type: 'pdf' },
  { id: 'cert-prog-24', file: 'Programming/Codepolitan/codepolitan/nodeJS.pdf', type: 'pdf' },
  { id: 'cert-prog-25', file: 'Programming/Codepolitan/codepolitan/Certificate Detail - CODEPOLITAN.pdf', type: 'pdf' },

  // Security
  { id: 'cert-sec-01', file: 'Security/Indra Saepudin-WEBINAR KULIAH UMUM _CYBERSECURITY.pdf', type: 'pdf' },
  { id: 'cert-sec-02', file: 'Security/cyber_scurity.png', type: 'image' },
];

// ============================================================================
// Upload logic
// ============================================================================

async function uploadFile(certId, filePath, fileType) {
  const fullPath = path.join(CERT_DIR, filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`  ❌ File not found: ${filePath}`);
    return null;
  }

  const publicId = `portfolio/certificates/${certId}`;

  try {
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: 'portfolio/certificates',
      public_id: certId,
      resource_type: 'image',  // Always 'image' so PDFs get converted to image previews
      overwrite: true,
      invalidate: true,
      access_mode: 'public',
      tags: ['certificate', certId],
    });

    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error(`  ❌ Upload failed for ${certId}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log(`\n📁 Certificate directory: ${CERT_DIR}`);
  console.log(`📋 Total certificates to upload: ${certMap.length}\n`);

  const results = [];
  const errors = [];
  const sqlStatements = [];

  for (let i = 0; i < certMap.length; i++) {
    const cert = certMap[i];
    const progress = `[${i + 1}/${certMap.length}]`;
    process.stdout.write(`${progress} Uploading ${cert.id}...`);

    const result = await uploadFile(cert.id, cert.file, cert.type);

    if (result) {
      console.log(` ✅ ${result.secureUrl.substring(0, 80)}...`);
      results.push({ ...cert, url: result.secureUrl });

      // Build SQL UPDATE — all types are 'image' now (PDFs get converted by Cloudinary)
      sqlStatements.push(
        `UPDATE certifications SET "previewUrl" = '${result.secureUrl}', "previewType" = 'image', "updatedAt" = NOW() WHERE id = '${cert.id}';`
      );
    } else {
      errors.push(cert);
    }
  }

  // Write SQL file
  const sqlPath = path.join(ROOT, 'scripts', 'update-preview-urls.sql');
  fs.writeFileSync(sqlPath, sqlStatements.join('\n'));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Successfully uploaded: ${results.length}/${certMap.length}`);
  if (errors.length > 0) {
    console.log(`❌ Failed: ${errors.length}`);
    errors.forEach(e => console.log(`   - ${e.id}: ${e.file}`));
  }
  console.log(`\n📄 SQL update file saved to: ${sqlPath}`);
  console.log(`   Run this SQL against your database to update previewUrl fields.`);

  // Also output JSON results
  const jsonPath = path.join(ROOT, 'scripts', 'upload-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`📄 Upload results saved to: ${jsonPath}`);
}

main().catch(console.error);
