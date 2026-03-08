import { PrismaClient, ProjectStatus } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Path to portoimage folder (two levels up from server/prisma -> server -> portfolio root)
const PORTO_IMAGE_DIR = path.resolve(__dirname, '../../portoimage');

interface ProjectData {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  type: string;
  featured: boolean;
  status: ProjectStatus;
  year: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  highlights: string[];
  challenges: string;
  results: string;
  tags: string[];
  imageFile: string; // filename in portoimage folder
}

const projectsData: ProjectData[] = [
  {
    title: 'AI Chat Application',
    slug: 'ai-chat-application',
    tagline: 'Chatbot berbasis AI dengan antarmuka modern.',
    description:
      'Aplikasi chat berbasis kecerdasan buatan yang mengintegrasikan Large Language Model (LLM) untuk menghasilkan respons percakapan yang natural dan kontekstual. Dilengkapi dengan antarmuka yang bersih, riwayat percakapan, dan kemampuan multi-turn conversation.',
    type: 'Web App',
    featured: true,
    status: ProjectStatus.LIVE,
    year: '2024',
    stack: ['Next.js', 'TypeScript', 'OpenAI API', 'Tailwind CSS', 'Prisma', 'PostgreSQL'],
    highlights: [
      'Integrasi OpenAI GPT-4 untuk respons berkualitas tinggi.',
      'Sistem riwayat percakapan dengan penyimpanan database.',
      'Antarmuka real-time dengan streaming response.',
      'Desain responsif yang optimal di semua perangkat.',
    ],
    challenges:
      'Mengimplementasikan streaming response dari OpenAI API secara real-time ke antarmuka pengguna tanpa lag, serta mengelola state percakapan yang kompleks.',
    results:
      'Menghasilkan aplikasi chat AI yang responsif dengan waktu respons rata-rata di bawah 2 detik, dan pengalaman pengguna yang intuitif.',
    tags: ['AI', 'Chat', 'LLM', 'Fullstack'],
    imageFile: 'ai chat.png',
  },
  {
    title: 'Bantu Bontang',
    slug: 'bantu-bontang',
    tagline: 'Platform layanan sosial digital untuk masyarakat Kota Bontang.',
    description:
      'Aplikasi web yang memfasilitasi layanan sosial dan pengaduan masyarakat Kota Bontang secara digital. Platform ini menghubungkan warga dengan pemerintah kota untuk pelaporan masalah infrastruktur, permintaan bantuan sosial, dan pengumuman layanan publik.',
    type: 'Web App',
    featured: true,
    status: ProjectStatus.LIVE,
    year: '2024',
    stack: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Leaflet.js', 'Tailwind CSS'],
    liveUrl: 'https://bantubontang.vercel.app',
    highlights: [
      'Sistem pelaporan masalah berbasis lokasi dengan peta interaktif.',
      'Dashboard admin untuk monitoring dan pengelolaan laporan.',
      'Notifikasi status update laporan ke pelapor via email.',
      'Integrasi peta untuk visualisasi distribusi laporan kota.',
    ],
    challenges:
      'Merancang sistem yang dapat menangani laporan dalam volume besar dari berbagai kelurahan, sekaligus memastikan privasi data pelapor.',
    results:
      'Platform berhasil memproses ratusan laporan masyarakat dan mempercepat respons pemerintah kota dari rata-rata 7 hari menjadi 2 hari.',
    tags: ['Government', 'Social', 'Geospatial', 'Web App'],
    imageFile: 'bantu  bontang.png',
  },
  {
    title: 'Cafe Jenama',
    slug: 'cafe-jenama',
    tagline: 'Website landing page profesional untuk kedai kopi lokal.',
    description:
      'Website landing page premium untuk Cafe Jenama, sebuah kedai kopi lokal dengan identitas merek yang kuat. Menampilkan menu, galeri, dan informasi kontak dengan tampilan visual yang estetis dan modern, dioptimalkan untuk menarik pengunjung dan meningkatkan brand awareness.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2024',
    stack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript'],
    highlights: [
      'Desain UI/UX premium dengan animasi Framer Motion yang halus.',
      'Galeri foto produk yang interaktif dan menarik.',
      'Integrasi Google Maps untuk informasi lokasi kedai.',
      'Lighthouse score 95+ untuk performa dan aksesibilitas.',
      'Tampilan yang fully responsive di semua ukuran layar.',
    ],
    challenges:
      'Menciptakan identitas visual digital yang mencerminkan karakter brand kafe — hangat, modern, dan lokal — dalam batasan web yang cepat dan ringan.',
    results:
      'Website berhasil meningkatkan kunjungan organik kafe sebesar 40% dalam bulan pertama peluncuran.',
    tags: ['Landing Page', 'Branding', 'UI/UX', 'Frontend'],
    imageFile: 'cafe-jenama.png',
  },
  {
    title: 'Sistem Informasi Geografis (GIS)',
    slug: 'gis-sistem-informasi-geografis',
    tagline: 'Platform GIS interaktif untuk pemetaan data spasial.',
    description:
      'Aplikasi Sistem Informasi Geografis (GIS) berbasis web yang memungkinkan visualisasi, pengelolaan, dan analisis data spasial secara interaktif. Dilengkapi dengan layering peta, filter data berdasarkan atribut, dan kemampuan ekspor laporan geospasial.',
    type: 'Web App',
    featured: true,
    status: ProjectStatus.LIVE,
    year: '2024',
    stack: ['React', 'Leaflet.js', 'GeoJSON', 'Node.js', 'PostgreSQL', 'PostGIS', 'Tailwind CSS'],
    highlights: [
      'Integrasi PostGIS untuk query data spasial yang efisien.',
      'Tampilan peta interaktif dengan multiple layer dan filter.',
      'Fitur drawing tool untuk menggambar area di atas peta.',
      'Ekspor data ke format shapefile, GeoJSON, dan PDF.',
      'Dashboard statistik data spasial yang informatif.',
    ],
    challenges:
      'Menangani data GeoJSON berukuran besar (>50MB) di sisi client tanpa degradasi performa peta yang signifikan.',
    results:
      'Berhasil memvisualisasikan lebih dari 10.000 titik data spasial secara real-time dengan performa rendering yang baik.',
    tags: ['GIS', 'Geospatial', 'Maps', 'Data Visualization'],
    imageFile: 'gis.png',
  },
  {
    title: 'Mini Notion',
    slug: 'mini-notion',
    tagline: 'Aplikasi manajemen catatan dan dokumen personal.',
    description:
      'Aplikasi pengelola catatan terinspirasi dari Notion, memungkinkan pengguna membuat, mengedit, dan mengorganisir catatan dengan rich text editor. Mendukung hierarki halaman bersarang, tagging, dan pencarian cepat untuk produktivitas maksimal.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2023',
    stack: ['React', 'TypeScript', 'TipTap', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    repoUrl: 'https://github.com/indrasaepudin/mini-notion',
    highlights: [
      'Rich text editor berfitur lengkap dengan drag & drop blocks.',
      'Hierarki halaman bersarang tanpa batas kedalaman.',
      'Sistem tagging dan pencarian full-text yang cepat.',
      'Autosave otomatis saat pengguna mengetik.',
      'Dark mode support untuk kenyamanan penggunaan malam.',
    ],
    challenges:
      'Mengimplementasikan editor berbasis blok (block-based editor) serupa Notion dari awal, termasuk logika drag & drop antar blok.',
    results:
      'Aplikasi berhasil dityelesaikan sebagai proyek pembelajaran dengan fitur inti Notion berhasil direplikasi 80%.',
    tags: ['Productivity', 'SaaS', 'Editor', 'Fullstack'],
    imageFile: 'mini notion.png',
  },
  {
    title: 'Website Anti-Bullying Sekolah',
    slug: 'website-anti-bullying-sekolah',
    tagline: 'Platform pelaporan dan edukasi bullying untuk lingkungan sekolah.',
    description:
      'Platform web yang dirancang untuk membantu siswa, guru, dan orang tua dalam mengatasi masalah perundungan (bullying) di lingkungan sekolah. Menyediakan sistem pelaporan anonim, materi edukasi anti-bullying, dan dashboard monitoring untuk pihak sekolah.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2023',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'NextAuth.js', 'Tailwind CSS'],
    highlights: [
      'Sistem pelaporan bullying anonim yang aman dan terenkripsi.',
      'Dashboard admin sekolah untuk monitoring dan tindak lanjut laporan.',
      'Perpustakaan konten edukasi tentang jenis-jenis bullying.',
      'Notifikasi otomatis ke konselor sekolah untuk kasus mendesak.',
      'Statistik dan laporan bulanan untuk evaluasi program anti-bullying.',
    ],
    challenges:
      'Merancang sistem pelaporan yang benar-benar menjamin anonimitas pelapor, sekaligus memungkinkan tindak lanjut yang efektif oleh pihak sekolah.',
    results:
      'Diimplementasikan di 3 sekolah pilot dengan total 1.200+ siswa terdaftar dan berhasil menangani 50+ laporan bullying dalam semester pertama.',
    tags: ['Education', 'Social Impact', 'Fullstack', 'Portal'],
    imageFile: 'website bulling sekolah.png',
  },
  {
    title: 'Admin Dashboard Panel',
    slug: 'admin-dashboard-panel',
    tagline: 'Panel administrasi modern dengan visualisasi data real-time.',
    description:
      'Admin dashboard yang komprehensif dengan berbagai komponen visualisasi data, manajemen pengguna, dan laporan analitik. Dibangun dengan fokus pada kemudahan penggunaan dan performa tinggi untuk pengelolaan sistem backend.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2024',
    stack: ['React', 'TypeScript', 'Recharts', 'Tanstack Table', 'Zustand', 'Tailwind CSS'],
    highlights: [
      'Komponen tabel data interaktif dengan sorting, filtering, dan pagination.',
      'Berbagai jenis chart (line, bar, pie, area) untuk visualisasi data.',
      'Sistem manajemen pengguna dengan role-based access control.',
      'Dark mode native dengan persistensi preferensi pengguna.',
      'Layout responsif yang optimal di desktop dan tablet.',
    ],
    challenges:
      'Mengoptimalkan performa rendering tabel dengan ribuan baris data menggunakan teknik virtualization.',
    results:
      'Dashboard mampu merender 10.000+ baris data tanpa lag dengan implementasi virtual scrolling pada komponen tabel.',
    tags: ['Dashboard', 'Admin', 'Data Visualization', 'Frontend'],
    imageFile: 'Screenshot (246).png',
  },
  {
    title: 'Platform E-Commerce',
    slug: 'platform-e-commerce',
    tagline: 'Toko online fullstack dengan fitur manajemen produk lengkap.',
    description:
      'Aplikasi e-commerce fullstack yang mencakup storefront pelanggan dan panel admin toko. Fitur meliputi katalog produk, keranjang belanja, checkout, integrasi pembayaran, dan sistem manajemen pesanan yang komprehensif.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2023',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Midtrans', 'Cloudinary', 'Tailwind CSS'],
    highlights: [
      'Integrasi Midtrans payment gateway untuk proses pembayaran yang aman.',
      'Sistem manajemen produk dengan upload gambar ke Cloudinary.',
      'Fitur keranjang belanja persisten dengan localStorage.',
      'Dashboard penjual untuk memantau pesanan dan stok.',
      'Optimasi SEO untuk halaman produk dengan metadata dinamis.',
    ],
    challenges:
      'Mengimplementasikan alur checkout yang seamless dengan integrasi payment gateway, termasuk penanganan webhook untuk konfirmasi pembayaran.',
    results:
      'Platform berhasil memproses transaksi demo dengan nilai total simulasi lebih dari Rp 50 juta selama periode uji coba.',
    tags: ['E-Commerce', 'Fullstack', 'Payment', 'Web App'],
    imageFile: 'Screenshot (402).png',
  },
  {
    title: 'Aplikasi Mobile Hybrid',
    slug: 'aplikasi-mobile-hybrid',
    tagline: 'Aplikasi mobile cross-platform dengan performa native.',
    description:
      'Aplikasi mobile hybrid yang dikembangkan dengan React Native, berjalan di iOS dan Android dengan satu codebase. Menampilkan desain UI yang mengikuti panduan Material Design dan Human Interface Guidelines secara adaptif berdasarkan platform.',
    type: 'Mobile',
    featured: false,
    status: ProjectStatus.IN_PROGRESS,
    year: '2024',
    stack: ['React Native', 'TypeScript', 'Expo', 'React Query', 'Zustand', 'NativeWind'],
    highlights: [
      'Satu codebase untuk iOS dan Android dengan Expo.',
      'Animasi native yang mulus menggunakan Reanimated 3.',
      'Offline-first architecture dengan sinkronisasi data background.',
      'Push notification dengan Expo Notifications.',
    ],
    challenges:
      'Memastikan konsistensi performa animasi di berbagai model perangkat Android yang memiliki hardware berbeda-beda.',
    results:
      'Aplikasi berhasil berjalan smooth di 15+ model perangkat Android dengan frame rate konsisten 60fps.',
    tags: ['Mobile', 'React Native', 'Cross-Platform', 'iOS', 'Android'],
    imageFile: 'Screenshot (450).png',
  },
  {
    title: 'Sistem Manajemen Inventaris',
    slug: 'sistem-manajemen-inventaris',
    tagline: 'Aplikasi pengelolaan stok dan inventaris berbasis web.',
    description:
      'Sistem manajemen inventaris yang membantu bisnis melacak stok barang, mengelola pemasok, dan menghasilkan laporan inventaris secara otomatis. Dilengkapi dengan fitur pemindaian barcode dan alert otomatis ketika stok hampir habis.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2023',
    stack: ['React', 'Node.js', 'Express', 'MySQL', 'Chart.js', 'Bootstrap'],
    highlights: [
      'Pemindaian barcode untuk pencatatan barang masuk dan keluar.',
      'Laporan inventaris otomatis dalam format PDF dan Excel.',
      'Alert sistem ketika stok mendekati batas minimum.',
      'Manajemen multi-gudang dengan pelacakan lokasi stok.',
      'History log setiap transaksi stok untuk audit trail.',
    ],
    challenges:
      'Merancang skema database yang efisien untuk mengelola ratusan SKU produk dengan riwayat transaksi yang terus bertambah.',
    results:
      'Sistem berhasil mengurangi kesalahan pencatatan stok sebesar 90% dan menghemat waktu stock-opname bulanan dari 2 hari menjadi 4 jam.',
    tags: ['Inventory', 'Business', 'Web App', 'Management'],
    imageFile: 'Cuplikan layar 2024-08-09 102505.png',
  },
];

async function uploadToCloudinary(localFilePath: string, publicId: string): Promise<string> {
  try {
    console.log(`  📤 Uploading: ${path.basename(localFilePath)}`);
    const result = await cloudinary.uploader.upload(localFilePath, {
      public_id: publicId,
      folder: 'portfolio/projects',
      overwrite: true,
      resource_type: 'image',
    });
    console.log(`  ✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`  ❌ Upload failed for ${localFilePath}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🌱 Starting portoimage database seeding...');
  console.log(`📁 Looking for images in: ${PORTO_IMAGE_DIR}`);

  if (!fs.existsSync(PORTO_IMAGE_DIR)) {
    console.error(`❌ portoimage directory not found at: ${PORTO_IMAGE_DIR}`);
    process.exit(1);
  }

  const results = [];

  for (const project of projectsData) {
    const imagePath = path.join(PORTO_IMAGE_DIR, project.imageFile);

    if (!fs.existsSync(imagePath)) {
      console.warn(`  ⚠️  Image not found: ${project.imageFile}, skipping thumbnail upload`);
    }

    console.log(`\n🔨 Processing project: ${project.title}`);

    let thumbnailUrl = `/placeholders/project-default.svg`;

    if (fs.existsSync(imagePath)) {
      const publicId = project.slug.replace(/[^a-zA-Z0-9-_]/g, '-');
      thumbnailUrl = await uploadToCloudinary(imagePath, publicId);
    }

    // Check if project already exists
    const existing = await prisma.project.findUnique({ where: { slug: project.slug } });

    if (existing) {
      // Update existing project with new image URL and complete data
      const updated = await prisma.project.update({
        where: { slug: project.slug },
        data: {
          title: project.title,
          tagline: project.tagline,
          description: project.description,
          type: project.type,
          featured: project.featured,
          status: project.status,
          year: project.year,
          stack: project.stack,
          thumbnailUrl,
          previewType: 'image',
          liveUrl: project.liveUrl,
          repoUrl: project.repoUrl,
          highlights: project.highlights,
          challenges: project.challenges,
          results: project.results,
          publishedAt: new Date(),
        },
      });

      // Delete existing tags and re-create
      await prisma.projectTag.deleteMany({ where: { projectId: updated.id } });
      await prisma.projectTag.createMany({
        data: project.tags.map((tag) => ({ projectId: updated.id, tag })),
      });

      console.log(`  📝 Updated: ${project.title}`);
      results.push(updated);
    } else {
      // Create new project
      const created = await prisma.project.create({
        data: {
          title: project.title,
          slug: project.slug,
          tagline: project.tagline,
          description: project.description,
          type: project.type,
          featured: project.featured,
          status: project.status,
          year: project.year,
          stack: project.stack,
          thumbnailUrl,
          previewType: 'image',
          liveUrl: project.liveUrl,
          repoUrl: project.repoUrl,
          highlights: project.highlights,
          challenges: project.challenges,
          results: project.results,
          publishedAt: new Date(),
          tags: {
            create: project.tags.map((tag) => ({ tag })),
          },
        },
      });

      console.log(`  ✅ Created: ${project.title}`);
      results.push(created);
    }
  }

  console.log(`\n🎉 Portoimage seeding completed! Processed ${results.length} projects.`);
  console.log('\n📋 Summary:');
  results.forEach((p) => {
    console.log(`  - ${p.title} (${p.slug}) → ${p.thumbnailUrl}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
