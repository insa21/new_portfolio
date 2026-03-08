import { PrismaClient, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface TriforgeProject {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  type: string;
  featured: boolean;
  status: ProjectStatus;
  year: string;
  stack: string[];
  thumbnailUrl: string;
  liveUrl?: string;
  repoUrl?: string;
  caseStudyUrl?: string;
  stars?: number;
  views?: number;
  highlights: string[];
  challenges?: string;
  results?: string;
  tags: string[];
}

const triforgeProjects: TriforgeProject[] = [
  // ─────────────────────────────────────────────────
  // 1. SIMDUK — Sistem Informasi Kependudukan
  // ─────────────────────────────────────────────────
  {
    title: 'SIMDUK — Sistem Informasi Kependudukan',
    slug: 'simduk-sistem-informasi-kependudukan',
    tagline: 'Platform digitalisasi pendataan warga & KK dengan dashboard analitik real-time.',
    description:
      'SIMDUK adalah sistem informasi kependudukan berbasis web yang dirancang untuk mendigitalisasi seluruh proses pendataan warga dan Kartu Keluarga di tingkat desa. Sistem ini menyediakan fitur filter wilayah bertingkat (Dusun → RW → RT), dashboard analitik interaktif untuk visualisasi demografi penduduk, serta modul rekap mutasi bulanan yang mengotomatisasi pelaporan keluar-masuk warga. Dibangun dengan arsitektur Flask dan didukung teknologi NLP untuk pencarian data pintar, SIMDUK memungkinkan perangkat desa mengelola ribuan data kependudukan secara efisien tanpa perlu keahlian teknis.',
    type: 'Web App',
    featured: true,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['Python', 'Flask', 'NLP', 'PostgreSQL', 'Chart.js', 'Bootstrap'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1767458312/triforge/projects/inmlmptyldwcct8k2obe.jpg',
    stars: 48,
    views: 2350,
    highlights: [
      'Filter wilayah bertingkat Dusun → RW → RT dengan autocomplete pintar.',
      'Dashboard analitik demografi real-time mencakup usia, gender, dan status pekerjaan.',
      'Rekap mutasi bulanan otomatis dengan ekspor ke PDF & Excel.',
      'Pencarian data warga berbasis NLP — cukup ketik nama atau NIK parsial.',
      'Mendukung pendataan 5.000+ warga di satu instansi desa.',
    ],
    challenges:
      'Tantangan utama adalah merancang sistem yang bisa digunakan oleh perangkat desa dengan literasi digital terbatas. Selain itu, memastikan integritas data saat migrasi dari buku manual ke database digital membutuhkan validasi berlapis dan mekanisme rollback yang aman.',
    results:
      'Berhasil mendigitalisasi data 3.200+ warga dalam 2 minggu pertama deployment. Waktu pencarian data yang sebelumnya 15-20 menit turun menjadi kurang dari 5 detik. Pelaporan mutasi bulanan yang biasanya memakan waktu 2 hari kini selesai dalam hitungan menit.',
    tags: ['Sistem Informasi', 'E-Government', 'Admin Dashboard', 'NLP', 'Data Analytics'],
  },

  // ─────────────────────────────────────────────────
  // 2. Asisten RUDY Salon & Spa
  // ─────────────────────────────────────────────────
  {
    title: 'Asisten RUDY Salon & Spa',
    slug: 'asisten-rudy-salon-spa',
    tagline: 'AI chatbot customer service 24/7 untuk bisnis salon & spa.',
    description:
      'Asisten RUDY adalah chatbot berbasis NLP yang dibangun khusus untuk RUDY Salon & Spa, berfungsi sebagai customer service virtual yang aktif 24/7. Chatbot ini mampu menjawab pertanyaan umum pelanggan, menampilkan daftar layanan lengkap beserta harga, menginformasikan promo terbaru, serta memberikan info kontak dan jam operasional. Dibangun dengan Python dan Flask sebagai backend, sistem ini menggunakan intent classification untuk mengenali maksud pelanggan dan memberikan respons yang relevan secara natural dan ramah.',
    type: 'Web App',
    featured: true,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['Python', 'Flask', 'NLP', 'Intent Classification', 'REST API', 'JavaScript'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765990475/triforge/projects/b5dyijjlhrgzflyhzehs.png',
    stars: 35,
    views: 1870,
    highlights: [
      'Intent classification dengan akurasi 92% untuk mengenali pertanyaan pelanggan.',
      'Database layanan & promo terintegrasi yang bisa diupdate oleh admin tanpa coding.',
      'Respon otomatis 24/7 — mengurangi beban CS hingga 60%.',
      'Chat interface modern dengan bubble chat dan animasi typing indicator.',
      'Fallback ke WhatsApp agent untuk pertanyaan kompleks di luar jangkauan bot.',
    ],
    challenges:
      'Menangani variasi bahasa informal dan slang pelanggan Indonesia dalam konteks layanan kecantikan menjadi tantangan utama. Selain itu, memastikan chatbot tidak memberikan informasi harga yang outdated memerlukan mekanisme sinkronisasi data real-time dengan database layanan.',
    results:
      'Chatbot berhasil menangani 78% pertanyaan pelanggan secara mandiri tanpa eskalasi ke CS manusia. Response time rata-rata di bawah 1 detik. Kepuasan pelanggan terhadap layanan digital meningkat 40% dalam 3 bulan pertama deployment.',
    tags: ['AI Chatbot', 'Customer Service', 'NLP', 'Business Automation', 'Salon & Spa'],
  },

  // ─────────────────────────────────────────────────
  // 3. SMPN 1 Malangbong Dashboard
  // ─────────────────────────────────────────────────
  {
    title: 'SMPN 1 Malangbong Dashboard',
    slug: 'smpn1-malangbong-dashboard',
    tagline: 'Sistem dashboard pelaporan siswa dengan verifikasi bukti digital.',
    description:
      'Dashboard admin berbasis web yang dirancang untuk SMPN 1 Malangbong guna mengelola laporan kegiatan dan pelanggaran siswa secara terstruktur. Sistem ini memungkinkan guru dan staff sekolah untuk membuat, melacak, dan memverifikasi laporan dengan dukungan upload bukti digital (foto/dokumen). Dashboard dilengkapi fitur statistik per kelas, filter berdasarkan periode dan kategori laporan, serta notifikasi otomatis ke wali kelas. Dibangun dengan PHP Native dan MySQL, sistem ini dioptimalkan untuk performa ringan agar berjalan lancar di infrastruktur sekolah.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['PHP Native', 'MySQL', 'Bootstrap', 'jQuery', 'Chart.js'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765988944/triforge/projects/gpsaghuzkiz2slktvnjz.png',
    stars: 22,
    views: 980,
    highlights: [
      'Manajemen laporan siswa terstruktur dengan kategorisasi otomatis.',
      'Upload & verifikasi bukti digital (foto, dokumen PDF) per laporan.',
      'Statistik per kelas dan per semester dengan visualisasi chart.',
      'Role-based access: Admin, Guru, Wali Kelas, semuanya dengan hak akses berbeda.',
      'Notifikasi otomatis ke wali kelas saat laporan baru masuk.',
    ],
    challenges:
      'Infrastruktur IT sekolah yang terbatas (bandwidth rendah, hardware lama) mengharuskan sistem dibangun seringan mungkin. PHP Native dipilih agar bisa berjalan di shared hosting murah tanpa dependency modern yang berat.',
    results:
      'Sistem berhasil digunakan oleh 45 guru dan staff untuk mengelola laporan 600+ siswa. Proses pelaporan yang sebelumnya manual (kertas) kini sepenuhnya digital, menghemat 10+ jam kerja administrasi per bulan.',
    tags: ['Education', 'School System', 'Admin Dashboard', 'Reporting', 'PHP'],
  },

  // ─────────────────────────────────────────────────
  // 4. Gudang Manager
  // ─────────────────────────────────────────────────
  {
    title: 'Gudang Manager',
    slug: 'gudang-manager',
    tagline: 'Dashboard manajemen stok & inventaris dengan analitik pemasok real-time.',
    description:
      'Gudang Manager adalah aplikasi manajemen inventaris full-featured yang mendigitalisasi seluruh operasional gudang. Sistem ini mencakup modul stok barang dengan pelacakan real-time, pencatatan transaksi masuk/keluar dengan barcode scanner integration, laporan stok per periode, serta dashboard analitik pemasok yang menampilkan performa dan reliability setiap supplier. Dibangun dengan Laravel dan Chart.js, aplikasi ini dirancang untuk UKM dan bisnis menengah yang ingin mengoptimalkan supply chain mereka.',
    type: 'Web App',
    featured: true,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['Laravel', 'MySQL', 'Chart.js', 'Livewire', 'Tailwind CSS', 'Blade'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765985937/triforge/projects/gr5juyaznk0d37auvzwt.png',
    stars: 67,
    views: 3100,
    highlights: [
      'Pelacakan stok real-time dengan alert otomatis saat stok di bawah minimum.',
      'Pencatatan transaksi masuk/keluar lengkap dengan riwayat dan audit trail.',
      'Dashboard analitik pemasok — perbandingan harga, lead time, dan reliability.',
      'Laporan stok otomatis per hari/minggu/bulan dengan ekspor ke Excel & PDF.',
      'Multi-gudang support — kelola beberapa lokasi gudang dari satu dashboard.',
    ],
    challenges:
      'Mengelola concurrency saat beberapa pengguna mengupdate stok secara bersamaan memerlukan implementasi database locking yang cermat. Selain itu, merancang UI yang intuitif untuk pengguna gudang yang terbiasa dengan proses manual menjadi tantangan tersendiri.',
    results:
      'Mengurangi selisih stok dari rata-rata 8% menjadi di bawah 1%. Waktu stock opname yang sebelumnya memakan 2 hari kini selesai dalam 4 jam. Efisiensi operasional gudang meningkat 55% dalam 2 bulan pertama penggunaan.',
    tags: ['Warehouse Management', 'Inventory', 'Dashboard', 'Supply Chain', 'Laravel'],
  },

  // ─────────────────────────────────────────────────
  // 5. Mentovi — AI Persona Chat
  // ─────────────────────────────────────────────────
  {
    title: 'Mentovi — AI Persona Chat',
    slug: 'mentovi-ai-persona-chat',
    tagline: 'Platform AI chat dengan manajemen persona yang bisa dikustomisasi.',
    description:
      'Mentovi adalah platform AI Persona Chat inovatif yang memungkinkan pengguna berinteraksi dengan berbagai karakter AI yang memiliki personality, tone, dan knowledge base berbeda. Dilengkapi panel admin untuk mengelola lifecycle persona — mulai dari pembuatan, konfigurasi personality traits, training knowledge base, hingga monitoring performa percakapan. Frontend dibangun dengan Vue 3 dan Vite untuk pengalaman chat yang snappy dan responsive, didukung Tailwind CSS untuk desain modern dan konsisten.',
    type: 'Web App',
    featured: true,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['Vue 3', 'Vite', 'Tailwind CSS', 'Pinia', 'AI/LLM API', 'Node.js'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765985420/triforge/projects/esyn0e3menbw0b0effkz.png',
    stars: 89,
    views: 4200,
    highlights: [
      'Manajemen persona AI lengkap — create, configure, train, dan monitor dari admin panel.',
      'Multi-persona dalam satu sesi chat dengan kemampuan switch context seamless.',
      'Kustomisasi personality traits: tone, gaya bahasa, level formalitas per persona.',
      'Real-time streaming response untuk pengalaman chat yang natural.',
      'Riwayat percakapan tersimpan dengan fitur search dan bookmark.',
    ],
    challenges:
      'Menjaga konsistensi personality setiap persona di seluruh percakapan menjadi tantangan utama. Implementasi streaming response juga memerlukan pengelolaan state yang kompleks di sisi frontend agar UX tetap smooth tanpa flickering atau lag.',
    results:
      'Platform berhasil digunakan dengan 15+ persona aktif, masing-masing mempertahankan consistency rate 94%. Average session duration mencapai 12 menit per pengguna, menunjukkan engagement yang tinggi. Response latency rata-rata di bawah 800ms.',
    tags: ['AI', 'Chatbot', 'LLM', 'Vue.js', 'Persona Management', 'Admin Dashboard'],
  },

  // ─────────────────────────────────────────────────
  // 6. INSANIMELIST — Anime Hub
  // ─────────────────────────────────────────────────
  {
    title: 'INSANIMELIST — Anime Hub',
    slug: 'insanimelist-anime-hub',
    tagline: 'Katalog anime komprehensif dengan search cerdas, statistik, dan trailer.',
    description:
      'INSANIMELIST adalah web app katalog anime yang menampilkan database anime lengkap dengan fitur pencarian cerdas, halaman detail yang kaya informasi (sinopsis, karakter, studio, rating), statistik per genre dan musim, serta integrasi trailer langsung dari YouTube. Dibangun dengan Next.js dan React untuk performa server-side rendering yang optimal, ditambah Tailwind CSS untuk UI yang clean dan responsive. Aplikasi ini mengkonsumsi data dari API publik anime dan menyajikannya dengan UX yang intuitif untuk komunitas anime Indonesia.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'REST API', 'TypeScript'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765984451/triforge/projects/kkkw8au5kzfjd6cedc2w.png',
    stars: 42,
    views: 5600,
    highlights: [
      'Database 10.000+ anime dengan pencarian full-text dan filter genre/tahun/studio.',
      'Halaman detail lengkap: sinopsis, karakter, staff, rating, dan rekomendasi terkait.',
      'Statistik per genre dan musim tayang dalam bentuk chart interaktif.',
      'Integrasi trailer YouTube langsung di halaman detail anime.',
      'Server-side rendering dengan Next.js untuk SEO optimal dan loading cepat.',
    ],
    challenges:
      'Rate limiting dari API pihak ketiga memerlukan implementasi caching layer yang cerdas agar pengalaman pengguna tetap cepat. Mengelola state pagination untuk ribuan anime sambil mempertahankan performa smooth juga menjadi tantangan teknis.',
    results:
      'Mencapai Lighthouse Performance score 95+ dengan SSR Next.js. Rata-rata waktu loading halaman di bawah 1.5 detik. Digunakan oleh 200+ pengguna aktif bulanan dengan 15.000+ page views per bulan.',
    tags: ['Entertainment', 'Anime', 'Next.js', 'Catalog', 'API Integration'],
  },

  // ─────────────────────────────────────────────────
  // 7. PenaHati — Mental Health Platform
  // ─────────────────────────────────────────────────
  {
    title: 'PenaHati — Mental Health Platform',
    slug: 'penahati-mental-health-platform',
    tagline: 'Platform kesehatan mental all-in-one dengan psikolog, relaksasi, dan AI chatbot.',
    description:
      'PenaHati adalah platform kesehatan mental komprehensif yang menyediakan ekosistem lengkap untuk mendukung kesejahteraan psikologis penggunanya. Fitur utama meliputi direktori psikolog dengan sistem booking konsultasi, perpustakaan musik relaksasi untuk guided meditation dan mindfulness, koleksi artikel edukatif tentang kesehatan mental yang dikurasi oleh profesional, serta chatbot pintar berbasis AI yang siap menjadi pendamping awal bagi pengguna yang membutuhkan seseorang untuk berbicara. Platform ini dibangun dengan Python Flask dan AI untuk memastikan pengalaman yang personal dan supportive.',
    type: 'Web App',
    featured: true,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['Python', 'Flask', 'AI/NLP', 'SQLAlchemy', 'Bootstrap', 'JavaScript'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765983525/triforge/projects/grhomuslnsy0zfckruij.png',
    stars: 76,
    views: 4800,
    highlights: [
      'Direktori psikolog lengkap dengan profil, spesialisasi, dan sistem booking konsultasi.',
      'Perpustakaan musik relaksasi dengan 50+ trek untuk guided meditation dan mindfulness.',
      'Koleksi 100+ artikel edukatif tentang kesehatan mental, dikurasi profesional.',
      'AI chatbot pendamping yang empatis — mendengarkan dan memberikan arahan awal.',
      'Mood tracker harian dengan visualisasi trend emosional mingguan.',
    ],
    challenges:
      'Membangun chatbot yang sensitif dan empatis untuk topik kesehatan mental membutuhkan perencanaan yang sangat hati-hati — respons harus supportive tanpa memberikan diagnosis medis. Memastikan keamanan dan privasi data pengguna yang sangat sensitif juga menjadi prioritas utama.',
    results:
      'Platform digunakan oleh 500+ pengguna aktif bulanan. Chatbot berhasil memberikan arahan awal untuk 85% pengguna yang membutuhkan bantuan. Rating kepuasan pengguna 4.7/5 untuk fitur relaksasi dan artikel edukatif.',
    tags: ['Mental Health', 'Wellness', 'AI Chatbot', 'Healthcare', 'Social Impact'],
  },

  // ─────────────────────────────────────────────────
  // 8. Mental Health Prediction
  // ─────────────────────────────────────────────────
  {
    title: 'Mental Health Prediction',
    slug: 'mental-health-prediction',
    tagline: 'Tool prediksi kondisi kesehatan mental berbasis machine learning.',
    description:
      'Mental Health Prediction adalah tool berbasis machine learning yang mampu mengklasifikasikan potensi kondisi kesehatan mental pengguna berdasarkan data harian seperti pola tidur, tingkat stres, aktivitas fisik, dan mood harian. Sistem ini menggunakan model Scikit-learn yang dilatih pada dataset kesehatan mental tervalidasi untuk memberikan prediksi awal (bukan diagnosis) yang dapat membantu pengguna mengenali warning signs lebih dini. Dilengkapi visualisasi hasil prediksi yang mudah dipahami dan rekomendasi langkah selanjutnya berdasarkan hasil analisis.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['Python', 'Flask', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765982092/triforge/projects/rt7g2yrowemn35xt48di.png',
    stars: 53,
    views: 2100,
    highlights: [
      'Model ML dengan akurasi klasifikasi 87% pada dataset validasi.',
      'Input data harian: pola tidur, stres, aktivitas fisik, mood — form interaktif.',
      'Visualisasi hasil prediksi yang mudah dipahami oleh non-technical user.',
      'Rekomendasi otomatis berdasarkan hasil analisis — langkah preventif dan kuratif.',
      'Data preprocessing pipeline yang robust untuk menangani missing values dan outlier.',
    ],
    challenges:
      'Memastikan model tidak overfit pada training data dan tetap memberikan prediksi yang berguna pada data baru menjadi tantangan utama. Selain itu, menyajikan hasil prediksi ML dalam bahasa yang mudah dipahami tanpa menimbulkan kepanikan pada pengguna memerlukan desain UX yang sangat hati-hati.',
    results:
      'Model mencapai F1-score 0.85 pada test set. Tool telah digunakan oleh 300+ pengguna untuk screening awal. 92% pengguna merasa hasil prediksi bermanfaat sebagai awareness tool berdasarkan survei feedback.',
    tags: ['Machine Learning', 'Healthcare', 'AI Prediction', 'Data Science', 'Python'],
  },

  // ─────────────────────────────────────────────────
  // 9. Website Insidapreneur
  // ─────────────────────────────────────────────────
  {
    title: 'Website Insidapreneur',
    slug: 'website-insidapreneur',
    tagline: 'Landing page penjualan premium dengan konversi tinggi dan integrasi WhatsApp.',
    description:
      'Website Insidapreneur adalah landing page penjualan produk yang dirancang dengan fokus pada konversi tinggi. Dibangun dengan React dan Tailwind CSS untuk visual yang modern, menarik, dan profesional — mencakup hero section yang eye-catching, product showcase dengan galeri interaktif, testimonial carousel, dan CTA strategis yang terintegrasi langsung dengan WhatsApp untuk memudahkan proses pemesanan. Deploy di Vercel untuk performa global yang optimal dengan CDN terdistribusi.',
    type: 'Landing Page',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['React', 'Tailwind CSS', 'Vercel', 'Framer Motion', 'Responsive Design'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765981184/triforge/projects/xwntounh7hpbddcuuyka.png',
    stars: 18,
    views: 3400,
    highlights: [
      'Desain premium dengan animasi scroll dan micro-interactions menggunakan Framer Motion.',
      'Integrasi WhatsApp direct order — pelanggan langsung terhubung ke admin.',
      'Responsive design sempurna di mobile, tablet, dan desktop.',
      'Lighthouse Performance score 98 dengan optimasi gambar dan lazy loading.',
      'SEO-optimized dengan meta tags, structured data, dan sitemap.',
    ],
    challenges:
      'Menyeimbangkan visual yang menarik dengan performa loading yang cepat menjadi tantangan utama — terutama karena banyak asset gambar produk beresolusi tinggi. Implementasi lazy loading dan image optimization menjadi kunci solusinya.',
    results:
      'Conversion rate dari visitor ke WhatsApp chat mencapai 12%, di atas rata-rata industri 3-5%. Halaman mencapai Lighthouse score 98 di semua metrik. Bounce rate hanya 25%, menunjukkan engagement yang sangat baik.',
    tags: ['Landing Page', 'E-commerce', 'WhatsApp Integration', 'React', 'Conversion'],
  },

  // ─────────────────────────────────────────────────
  // 10. Website BananaLeaf
  // ─────────────────────────────────────────────────
  {
    title: 'Website BananaLeaf',
    slug: 'website-bananaleaf',
    tagline: 'Katalog produk eco-friendly berbahan daun pisang dengan alur pemesanan modern.',
    description:
      'Website BananaLeaf adalah platform katalog produk eco-friendly yang menampilkan koleksi produk kreatif berbahan daun pisang. Dirancang dengan estetika natural dan clean, website ini menyajikan kategori produk yang terorganisir rapi dengan alur navigasi kategori → produk → detail yang intuitif. Setiap produk dilengkapi galeri foto, deskripsi material, dan informasi keberlanjutan. Dibangun dengan React untuk interaktivitas yang smooth dan di-deploy di Vercel untuk aksesibilitas global.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['React', 'Tailwind CSS', 'Vercel', 'Responsive Design', 'SEO'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765979352/triforge/projects/vicpzzu5ynpr9i1aw16x.png',
    stars: 15,
    views: 1650,
    highlights: [
      'Desain estetika natural yang mencerminkan brand eco-friendly.',
      'Alur navigasi kategori → produk → detail yang intuitif dan seamless.',
      'Galeri foto produk dengan zoom dan carousel interaktif.',
      'Informasi sustainability di setiap halaman produk.',
      'Mobile-first design untuk menjangkau pengguna smartphone.',
    ],
    challenges:
      'Menerjemahkan identitas brand eco-friendly ke dalam bahasa visual digital yang tetap modern dan menarik bagi audiens muda. Memastikan fotografi produk daun pisang tampil premium dalam berbagai ukuran layar juga memerlukan optimasi khusus.',
    results:
      'Website berhasil menjangkau 1.500+ pengunjung unik dalam bulan pertama peluncuran. Average time on page 3+ menit menunjukkan engagement tinggi terhadap konten produk. Brand awareness meningkat 35% berdasarkan survei post-launch.',
    tags: ['E-commerce', 'Product Catalog', 'Eco-friendly', 'Sustainability', 'React'],
  },

  // ─────────────────────────────────────────────────
  // 11. Inventori Apotek
  // ─────────────────────────────────────────────────
  {
    title: 'Inventori Apotek',
    slug: 'inventori-apotek',
    tagline: 'Sistem manajemen apotek lengkap dengan POS, stok, dan laporan keuangan.',
    description:
      'Inventori Apotek adalah aplikasi manajemen apotek all-in-one yang mengintegrasikan Point of Sale (POS), manajemen stok barang, pelacakan tanggal kadaluarsa, dan laporan keuangan dalam satu platform. Sistem POS memudahkan transaksi penjualan di counter dengan pencarian obat cepat dan kalkulasi otomatis. Modul stok mengelola barang masuk/keluar beserta alert otomatis untuk obat yang mendekati kadaluarsa. Laporan keuangan mencakup profit/loss, best-selling products, dan trend penjualan. Dibangun dengan Laravel untuk arsitektur yang solid dan scalable.',
    type: 'Web App',
    featured: true,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['Laravel', 'MySQL', 'Tailwind CSS', 'Livewire', 'Alpine.js', 'Chart.js'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765978113/triforge/projects/c4bqmynzdolpx4wav8oi.png',
    stars: 58,
    views: 3800,
    highlights: [
      'Sistem POS apotek dengan pencarian obat instan dan kalkulasi harga otomatis.',
      'Alert otomatis untuk obat mendekati kadaluarsa — 30, 14, dan 7 hari sebelum expired.',
      'Manajemen stok masuk/keluar dengan barcode support dan audit trail lengkap.',
      'Laporan keuangan: profit/loss, best-selling, trend penjualan harian/bulanan.',
      'Multi-user access dengan role Apoteker, Kasir, dan Admin masing-masing berbeda.',
    ],
    challenges:
      'Merancang workflow POS yang cepat dan minim error untuk lingkungan apotek yang sibuk memerlukan UX testing intensif. Integrasi pelacakan kadaluarsa dengan alert system juga harus reliable — satu obat expired yang lolos bisa berdampak serius pada keselamatan pelanggan.',
    results:
      'Digunakan operasional harian oleh 2 apotek dengan total 5.000+ SKU obat. Mengurangi obat expired yang terlewat dari rata-rata 15 item/bulan menjadi 0. Waktu transaksi POS rata-rata 30 detik per pelanggan, turun 50% dari proses manual.',
    tags: ['Pharmacy', 'POS', 'Inventory Management', 'Healthcare', 'Laravel'],
  },

  // ─────────────────────────────────────────────────
  // 12. Koperasi Desa
  // ─────────────────────────────────────────────────
  {
    title: 'Koperasi Desa',
    slug: 'koperasi-desa',
    tagline: 'Sistem manajemen koperasi desa terpadu untuk anggota, simpanan, dan pinjaman.',
    description:
      'Koperasi Desa adalah sistem manajemen koperasi terpadu yang mendigitalisasi seluruh operasional koperasi di tingkat desa. Aplikasi ini mencakup modul pendataan anggota dengan profil lengkap, pengelolaan simpanan (pokok, wajib, sukarela) dengan kalkulasi bunga otomatis, manajemen pinjaman dengan jadwal angsuran dan pelacakan tunggakan, serta laporan keuangan terpadu yang bisa diekspor untuk kebutuhan audit dan rapat tahunan. Dibangun dengan Laravel untuk reliability dan Bootstrap untuk kemudahan penggunaan oleh pengurus koperasi.',
    type: 'Web App',
    featured: false,
    status: ProjectStatus.LIVE,
    year: '2025',
    stack: ['Laravel', 'MySQL', 'Bootstrap', 'jQuery', 'DOMPDF', 'DataTables'],
    thumbnailUrl:
      'https://res.cloudinary.com/dmxqlab0i/image/upload/v1765974865/triforge/projects/vat972n7jy0dx4bms4xz.png',
    stars: 31,
    views: 1900,
    highlights: [
      'Manajemen anggota lengkap dengan profil, riwayat transaksi, dan status keanggotaan.',
      'Pengelolaan 3 jenis simpanan (pokok, wajib, sukarela) dengan kalkulasi bunga otomatis.',
      'Sistem pinjaman: pengajuan, approval, jadwal angsuran, dan pelacakan tunggakan.',
      'Laporan keuangan terpadu — neraca, laba/rugi, dan kas — siap cetak untuk audit.',
      'Dashboard ringkasan untuk pengurus: total anggota, total simpanan, total pinjaman aktif.',
    ],
    challenges:
      'Memodelkan aturan bisnis koperasi yang bervariasi antar desa (bunga berbeda, kebijakan pinjaman berbeda) memerlukan sistem yang fleksibel dan configurable. Memastikan akurasi kalkulasi keuangan hingga rupiah terakhir juga menjadi prioritas tinggi karena berdampak langsung pada trust anggota.',
    results:
      'Sistem berhasil mengelola data 250+ anggota koperasi dan Rp 150 juta+ dalam simpanan. Proses pengajuan pinjaman yang sebelumnya 3-5 hari turun menjadi 1 hari. Laporan untuk RAT (Rapat Anggota Tahunan) yang biasa disiapkan 2 minggu kini selesai dalam 1 jam.',
    tags: ['Cooperative', 'Finance', 'Management System', 'E-Government', 'Laravel'],
  },
];

async function main() {
  console.log('🚀 Starting Triforge projects seeding...');
  console.log(`📦 Total projects to process: ${triforgeProjects.length}\n`);

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const project of triforgeProjects) {
    try {
      const result = await prisma.project.upsert({
        where: { slug: project.slug },
        update: {
          title: project.title,
          tagline: project.tagline,
          description: project.description,
          type: project.type,
          featured: project.featured,
          status: project.status,
          year: project.year,
          stack: project.stack,
          thumbnailUrl: project.thumbnailUrl,
          previewType: 'image',
          liveUrl: project.liveUrl ?? null,
          repoUrl: project.repoUrl ?? null,
          caseStudyUrl: project.caseStudyUrl ?? null,
          stars: project.stars ?? null,
          views: project.views ?? null,
          highlights: project.highlights,
          challenges: project.challenges ?? null,
          results: project.results ?? null,
          publishedAt: new Date(),
        },
        create: {
          title: project.title,
          slug: project.slug,
          tagline: project.tagline,
          description: project.description,
          type: project.type,
          featured: project.featured,
          status: project.status,
          year: project.year,
          stack: project.stack,
          thumbnailUrl: project.thumbnailUrl,
          previewType: 'image',
          liveUrl: project.liveUrl ?? null,
          repoUrl: project.repoUrl ?? null,
          caseStudyUrl: project.caseStudyUrl ?? null,
          stars: project.stars ?? null,
          views: project.views ?? null,
          highlights: project.highlights,
          challenges: project.challenges ?? null,
          results: project.results ?? null,
          publishedAt: new Date(),
          tags: {
            create: project.tags.map((tag) => ({ tag })),
          },
        },
      });

      // Check if it was created or updated by checking createdAt vs updatedAt
      const isNew = result.createdAt.getTime() >= Date.now() - 5000;
      if (isNew) {
        console.log(`✅ Created: ${project.title}`);
        createdCount++;
      } else {
        // Delete old tags and recreate
        await prisma.projectTag.deleteMany({ where: { projectId: result.id } });
        await prisma.projectTag.createMany({
          data: project.tags.map((tag) => ({ projectId: result.id, tag })),
        });
        console.log(`🔄 Updated: ${project.title}`);
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing "${project.title}":`, error);
      errorCount++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Seeding Summary');
  console.log('═'.repeat(50));
  console.log(`   ✅ Created : ${createdCount}`);
  console.log(`   🔄 Updated : ${updatedCount}`);
  console.log(`   ❌ Errors  : ${errorCount}`);
  console.log(`   📦 Total   : ${triforgeProjects.length}`);
  console.log('═'.repeat(50));
  console.log('🎉 Triforge projects seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
