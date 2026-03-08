/**
 * Update issuerLogo for all certifications based on their issuer name.
 * 
 * Maps each issuer to their corresponding logo file in /logos/.
 * Related sub-organizations share the same logo (e.g., STMIK Jabar variants).
 * 
 * Usage: npx tsx scripts/update-issuer-logos.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map issuer names to their logo paths
const ISSUER_LOGO_MAP: Record<string, string> = {
  // Cloud Providers
  'Alibaba Cloud': '/logos/alibaba-cloud.svg',
  'Alibaba Cloud (Apsara Clouder)': '/logos/alibaba-cloud.svg',
  'Alibaba Cloud / ADSE': '/logos/alibaba-cloud.svg',
  'Google Cloud': '/logos/google-cloud.svg',

  // Programming Platforms
  'Codepolitan': '/logos/codepolitan.svg',
  'Dicoding Indonesia': '/logos/dicoding.svg',
  'IBM (Cognitive Class)': '/logos/ibm.svg',
  'Sanbercode': '/logos/sanbercode.svg',

  // Edu-tech
  'RevoU': '/logos/revou.svg',

  // Institutions (STMIK Jabar family)
  'STMIK Jabar': '/logos/stmik-jabar.svg',
  'LPPM STMIK Jabar': '/logos/stmik-jabar.svg',
  'HIMATIF STMIK Jabar': '/logos/stmik-jabar.svg',
  'BEM STMIK Jabar': '/logos/stmik-jabar.svg',
  'HIMASI STMIK Jabar': '/logos/stmik-jabar.svg',
  'HIMASI': '/logos/stmik-jabar.svg',

  // Professional / Partnership
  'JDA': '/logos/jda.svg',

  // Events / Seminars
  'Seminar Nasional': '/logos/seminar.svg',
  'Seminar Internasional': '/logos/seminar.svg',

  // Other Institutions
  'Institut Teknologi Tangerang Selatan': '/logos/itts.svg',

  // Fallback
  'Unknown': '/logos/default.svg',
};

async function main() {
  console.log('🖼️  Updating issuer logos for all certifications...\n');

  // Get all certifications
  const certifications = await prisma.certification.findMany({
    select: { id: true, issuer: true, issuerLogo: true },
  });

  console.log(`📋 Total certifications: ${certifications.length}`);
  console.log(`📋 Unique issuers: ${new Set(certifications.map(c => c.issuer)).size}\n`);

  let updated = 0;
  let skipped = 0;
  let unmapped = 0;

  for (const cert of certifications) {
    const logoPath = ISSUER_LOGO_MAP[cert.issuer];

    if (!logoPath) {
      console.warn(`⚠️  No logo mapping for issuer: "${cert.issuer}" (cert: ${cert.id})`);
      unmapped++;
      continue;
    }

    if (cert.issuerLogo === logoPath) {
      skipped++;
      continue;
    }

    await prisma.certification.update({
      where: { id: cert.id },
      data: { issuerLogo: logoPath },
    });

    console.log(`✅ ${cert.id} → ${logoPath}`);
    updated++;
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Update Summary');
  console.log('═'.repeat(50));
  console.log(`   ✅ Updated  : ${updated}`);
  console.log(`   ⏭️  Skipped  : ${skipped} (already correct)`);
  console.log(`   ⚠️  Unmapped : ${unmapped}`);
  console.log(`   📦 Total    : ${certifications.length}`);
  console.log('═'.repeat(50));
  console.log('🎉 Issuer logo update completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
