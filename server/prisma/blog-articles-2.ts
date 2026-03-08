import { BlogArticle } from './blog-articles-1';

export const articles: BlogArticle[] = [
  {
    title: 'Server Components di React 19: Revolusi Arsitektur Frontend',
    slug: 'server-components-react-19-revolusi-frontend',
    excerpt: 'Deep dive ke React 19 Server Components dan Server Actions. Bagaimana paradigma baru ini mengubah cara kita membangun aplikasi web, mengurangi bundle size, dan menyederhanakan data fetching.',
    content: `React 19 membawa perubahan fundamental terbesar sejak React Hooks. Server Components memungkinkan rendering di server tanpa mengirim JavaScript ke client, sementara Server Actions menyederhanakan data mutation tanpa API routes. Ini bukan sekadar fitur baru — ini paradigma baru.

## Apa Itu Server Components?

Server Components adalah React components yang di-render **sepenuhnya di server**. Mereka tidak pernah menjadi bagian dari client bundle. Ini berarti:

- **Zero bundle size impact** — import library besar di Server Component tidak menambah client JS
- **Direct database access** — bisa query database langsung tanpa API endpoint
- **Secure by default** — API keys dan secrets tetap di server
- **Performance** — HTML di-stream ke client, rendering lebih cepat

\`\`\`jsx
// Server Component - runs ONLY on server
async function ProductList() {
  const products = await db.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
\`\`\`

Perhatikan: tidak ada \`useState\`, tidak ada \`useEffect\`, tidak ada loading state. Data tersedia langsung karena fetching terjadi di server.

## Server Components vs Client Components

Perbedaan fundamental:

**Server Components (default di Next.js App Router):**
- Render di server saja
- Bisa async, bisa akses database/filesystem
- Tidak bisa menggunakan hooks atau event handlers
- Tidak menambah ukuran bundle client

**Client Components (ditandai dengan 'use client'):**
- Render di client dan server (SSR + hydration)
- Bisa menggunakan useState, useEffect, onClick, dll
- Menambah ukuran bundle client
- Diperlukan untuk interaktivitas

> **Aturan praktis:** Jadikan semua component sebagai Server Component secara default. Hanya tambahkan 'use client' ketika benar-benar membutuhkan interaktivitas (form input, button click, animation state).

## Server Actions: Mengganti API Routes

Server Actions menghilangkan kebutuhan membuat API routes terpisah untuk data mutation. Form submission langsung memanggil fungsi server:

\`\`\`jsx
// Server Action
async function createPost(formData) {
  'use server';

  const title = formData.get('title');
  const content = formData.get('content');

  await db.post.create({ data: { title, content } });
  revalidatePath('/blog');
}

// Client Component menggunakan Server Action
function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Post title" />
      <textarea name="content" placeholder="Content" />
      <button type="submit">Publish</button>
    </form>
  );
}
\`\`\`

Keuntungan:
- **Progressive enhancement** — form bekerja bahkan tanpa JavaScript
- **Type safety** — bisa menggunakan TypeScript end-to-end
- **Automatic revalidation** — cache otomatis di-update setelah mutation
- **Simpler mental model** — tidak perlu memikirkan API endpoint, fetch, loading state

## Patterns dan Best Practices

### Composition Pattern

Gunakan Server Component sebagai wrapper yang mengambil data, dan Client Component untuk bagian interaktif:

\`\`\`jsx
// Server Component - fetches data
async function ProductPage({ id }) {
  const product = await getProduct(id);
  const reviews = await getReviews(id);

  return (
    <div>
      <ProductInfo product={product} />
      {/* Client component hanya untuk bagian interaktif */}
      <AddToCartButton productId={id} price={product.price} />
      <ReviewList reviews={reviews} />
    </div>
  );
}
\`\`\`

### Streaming dan Suspense

Gunakan Suspense untuk streaming partial content. Component yang lambat tidak memblokir seluruh halaman:

\`\`\`jsx
async function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </div>
  );
}
\`\`\`

Setiap Suspense boundary di-stream secara independen. User melihat content yang tersedia duluan.

## Impact pada Developer Experience

Pengalaman dari 3 proyek production menggunakan React 19 Server Components:

- **Codebase 30-40% lebih kecil** — tidak perlu API routes, loading states manual, useEffect untuk fetching
- **Client bundle 50% lebih kecil** — library heavy dipindah ke server
- **Time to First Byte** turun 40% — server rendering lebih efisien
- **Developer productivity naik** — fokus pada UI, bukan plumbing

## Migration Strategy

Untuk proyek yang sudah berjalan dengan Client Components:

1. **Mulai dari leaf components** — halaman statis, footer, header
2. **Identifikasi data fetching** — pindahkan useEffect + fetch ke Server Components
3. **Refactor bertahap** — tidak perlu migrasi sekaligus
4. **Keep Client Components** — untuk form, modal, dropdown, dan elemen interaktif

React 19 Server Components bukan tentang menghilangkan Client Components, tetapi tentang memberikan pilihan yang tepat untuk setiap bagian UI.`,
    coverUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&h=630&fit=crop',
    categorySlug: 'frontend',
    tags: ['React', 'Server Components', 'Next.js', 'JavaScript', 'Frontend'],
    readTime: '13 min',
    views: 8920,
    featured: true,
    publishedAt: '2025-02-15',
    metaTitle: 'React 19 Server Components — Revolusi Arsitektur Frontend',
    metaDescription: 'Deep dive React 19 Server Components dan Server Actions. Paradigma baru frontend: zero bundle impact, direct DB access, dan streaming.',
  },
  {
    title: 'Membangun Design System yang Konsisten dan Scalable',
    slug: 'membangun-design-system-konsisten-scalable',
    excerpt: 'Panduan step-by-step membangun design system menggunakan Radix UI primitives dan Tailwind CSS. Dari design tokens, component library, hingga documentation.',
    content: `Design system adalah investasi jangka panjang yang meningkatkan konsistensi UI, mempercepat development, dan memudahkan kolaborasi antara designer dan developer. Artikel ini membahas pendekatan pragmatis membangun design system dari nol hingga matang.

## Mengapa Design System?

Tanpa design system, masalah ini familiar:

- Button dengan 5 variasi warna yang berbeda di halaman yang berbeda
- Spacing yang inkonsisten antar section
- Setiap developer membuat komponen sendiri untuk kebutuhan yang sama
- Designer frustasi karena implementasi tidak sesuai Figma

Design system menyelesaikan semua ini dengan **single source of truth** untuk visual language aplikasi.

## Layer 1: Design Tokens

Design tokens adalah nilai-nilai atomic yang menjadi fondasi visual:

\`\`\`css
:root {
  /* Colors */
  --color-primary: 222.2 84% 4.9%;
  --color-accent: 210 40% 96.1%;
  --color-destructive: 0 84.2% 60.2%;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Cal Sans', 'Inter', sans-serif;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
}
\`\`\`

> **Tips:** Gunakan semantic naming (--color-primary) bukan descriptive naming (--color-blue). Ini memudahkan theming dan dark mode.

## Layer 2: UI Primitives dengan Radix UI

Radix UI menyediakan unstyled, accessible primitives. Kita menambahkan styling di atasnya:

\`\`\`jsx
import * as Dialog from '@radix-ui/react-dialog';

function Modal({ children, trigger }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40
          backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          bg-background rounded-xl shadow-xl p-6
          w-full max-w-md animate-slide-up">
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
\`\`\`

Keuntungan Radix:
- **Accessibility bawaan** — keyboard navigation, ARIA attributes, focus management
- **Unstyled** — full control atas visual
- **Composable** — setiap bagian bisa dikustomisasi

## Layer 3: Compound Components

Bangun komponen tingkat tinggi dari primitives:

### Button Component

\`\`\`jsx
const buttonVariants = {
  variant: {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-foreground hover:bg-secondary/80",
    outline: "border border-border bg-transparent hover:bg-accent",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-white hover:bg-destructive/90",
  },
  size: {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  },
};

function Button({ variant = "primary", size = "md", children, ...props }) {
  return (
    <button className={cn(
      "inline-flex items-center justify-center rounded-md font-medium",
      "transition-colors focus-visible:outline-none focus-visible:ring-2",
      buttonVariants.variant[variant],
      buttonVariants.size[size]
    )} {...props}>
      {children}
    </button>
  );
}
\`\`\`

### Input Component

\`\`\`jsx
function Input({ label, error, helper, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input className={cn(
        "w-full h-10 px-3 rounded-md border bg-transparent",
        "focus:outline-none focus:ring-2 focus:ring-accent",
        error ? "border-destructive" : "border-border"
      )} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}
\`\`\`

## Layer 4: Pattern Library

Gabungkan komponen menjadi patterns yang reusable:

- **FormSection** — label + input + validation + helper text
- **DataTable** — table + sorting + filtering + pagination
- **PageHeader** — breadcrumb + title + description + actions
- **EmptyState** — illustration + message + CTA

## Documentation

Design system tanpa dokumentasi tidak akan diadopsi oleh tim. Dokumentasi yang baik mencakup:

- **Component catalog** — visual preview setiap komponen dan variannya
- **Usage guidelines** — kapan menggunakan komponen apa
- **Code examples** — copy-paste ready
- **Do and Don'ts** — contoh penggunaan yang benar dan salah
- **Changelog** — perubahan di setiap versi

Tools: Storybook tetap menjadi standar industri untuk component documentation dan visual testing.

## Maintenance dan Governance

- **Versioning** — gunakan semantic versioning (major.minor.patch)
- **Contribution guidelines** — proses untuk menambah/mengubah komponen
- **Visual regression testing** — Chromatic atau Percy untuk menangkap perubahan visual yang tidak diinginkan
- **Regular audit** — review setiap kuartal untuk memastikan adopsi dan menemukan inkonsistensi

Design system yang berhasil adalah yang adopted oleh seluruh tim, bukan yang paling banyak komponennya.`,
    coverUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=630&fit=crop',
    categorySlug: 'frontend',
    tags: ['Design System', 'Radix UI', 'Tailwind CSS', 'React', 'UI/UX'],
    readTime: '12 min',
    views: 5340,
    featured: false,
    publishedAt: '2025-01-28',
    metaTitle: 'Membangun Design System Scalable — Radix UI + Tailwind CSS',
    metaDescription: 'Panduan design system: design tokens, Radix UI primitives, compound components, documentation, dan governance.',
  },
  {
    title: 'Web Performance Optimization: Menuju Lighthouse Score 100',
    slug: 'web-performance-optimization-lighthouse-100',
    excerpt: 'Teknik komprehensif meningkatkan performa web: Core Web Vitals, code splitting, image optimization, font loading, dan caching strategy.',
    content: `Setiap detik loading tambahan mengurangi conversion rate 7%. Web performance bukan hanya tentang kecepatan — ini langsung berdampak pada bisnis. Artikel ini mendokumentasikan proses optimasi website dari Lighthouse score 58 menjadi 98.

## Audit Awal: Memahami Masalah

Sebelum optimasi, lakukan audit menyeluruh. Gunakan Lighthouse, WebPageTest, dan Chrome DevTools Performance tab. Fokus pada Core Web Vitals:

- **LCP (Largest Contentful Paint)** — seberapa cepat konten utama terlihat. Target: < 2.5s
- **INP (Interaction to Next Paint)** — responsivitas terhadap interaksi user. Target: < 200ms
- **CLS (Cumulative Layout Shift)** — stabilitas visual saat loading. Target: < 0.1

Hasil audit awal proyek ini:
- LCP: 4.8s (buruk)
- INP: 380ms (buruk)
- CLS: 0.25 (perlu perbaikan)
- Total bundle: 2.8MB
- 47 request third-party scripts

## Langkah 1: Image Optimization

Image biasanya kontributor terbesar untuk page weight. Optimasi yang dilakukan:

**Format modern:**
\`\`\`jsx
<picture>
  <source srcSet="/hero.avif" type="image/avif" />
  <source srcSet="/hero.webp" type="image/webp" />
  <img src="/hero.jpg" alt="Hero" loading="lazy"
    width={1200} height={630} />
</picture>
\`\`\`

- AVIF mengurangi size 50% dibanding WebP, 80% dibanding JPEG
- Selalu sertakan width dan height untuk mencegah CLS
- Gunakan \`loading="lazy"\` untuk gambar below-the-fold
- Gunakan \`fetchpriority="high"\` untuk LCP image

**Responsive images:**
\`\`\`jsx
<img
  srcSet="/hero-400.avif 400w, /hero-800.avif 800w, /hero-1200.avif 1200w"
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Hero"
/>
\`\`\`

Hasil: Image payload turun dari 1.8MB menjadi 320KB.

## Langkah 2: JavaScript Bundle Optimization

**Code splitting:**
\`\`\`jsx
// Lazy load halaman yang tidak langsung dibutuhkan
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AnalyticsDashboard = lazy(() => import('./pages/Analytics'));

// Dynamic import untuk library besar
const loadChart = () => import('chart.js/auto');
\`\`\`

**Tree shaking:**
\`\`\`javascript
// Hindari: import seluruh library
import _ from 'lodash';

// Lebih baik: import hanya yang dibutuhkan
import debounce from 'lodash/debounce';
\`\`\`

**Bundle analysis:**
Gunakan \`@next/bundle-analyzer\` atau \`source-map-explorer\` untuk visualisasi bundle dan identifikasi dependency yang besar.

Hasil: JS bundle turun dari 1.2MB menjadi 380KB.

## Langkah 3: Font Loading Strategy

Font loading yang salah menyebabkan FOUT (Flash of Unstyled Text) atau FOIT (Flash of Invisible Text):

\`\`\`css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
  unicode-range: U+0000-00FF;
}
\`\`\`

- **font-display: swap** — tampilkan fallback font terlebih dahulu
- **Preload critical fonts** — \`<link rel="preload" href="/fonts/Inter.woff2" as="font">\`
- **Subset fonts** — hanya include karakter yang dibutuhkan
- **Variable fonts** — satu file untuk semua weights

## Langkah 4: Third-Party Scripts

47 third-party scripts adalah masalah serius. Strategi:

- **Audit kebutuhan** — 15 script tidak lagi digunakan, langsung hapus
- **Lazy loading** — muat analytics dan chat widget setelah user interaction
- **Self-hosting** — host Google Fonts dan critical scripts sendiri
- **Web Workers** — pindahkan processing berat ke background thread

## Langkah 5: Caching Strategy

\`\`\`
# Static assets: cache agresif (1 tahun)
Cache-Control: public, max-age=31536000, immutable

# HTML: revalidate setiap kali
Cache-Control: no-cache, must-revalidate

# API responses: cache singkat
Cache-Control: public, max-age=60, stale-while-revalidate=300
\`\`\`

## Hasil Akhir

Setelah semua optimasi:

- **LCP:** 4.8s → 1.2s
- **INP:** 380ms → 85ms
- **CLS:** 0.25 → 0.02
- **Lighthouse Performance:** 58 → 98
- **Page Weight:** 2.8MB → 620KB
- **Time to Interactive:** 6.2s → 1.8s

Dampak bisnis: bounce rate turun 28%, conversion rate naik 18%, dan SEO ranking meningkat rata-rata 3 posisi.`,
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    categorySlug: 'frontend',
    tags: ['Performance', 'Lighthouse', 'Core Web Vitals', 'Optimization', 'SEO'],
    readTime: '14 min',
    views: 7650,
    featured: true,
    publishedAt: '2024-12-28',
    metaTitle: 'Web Performance Optimization — Dari Lighthouse 58 ke 98',
    metaDescription: 'Teknik web performance: image optimization, code splitting, font strategy, third-party audit, dan caching. Studi kasus Lighthouse 58→98.',
  },
  {
    title: 'Animasi Web Interaktif dengan Framer Motion',
    slug: 'animasi-web-interaktif-framer-motion',
    excerpt: 'Membuat animasi UI yang smooth dan purposeful menggunakan Framer Motion di React. Dari transition dasar hingga gesture-based animations dan page transitions.',
    content: `Animasi yang baik bukan soal visual yang mencolok — tetapi tentang memberikan feedback, mengarahkan perhatian, dan membuat interface terasa responsif. Framer Motion menjadi pilihan utama di ekosistem React karena API-nya intuitif dan performant.

## Filosofi Animasi yang Baik

Sebelum menulis kode, pahami prinsip dasar:

- **Purposeful** — setiap animasi harus punya alasan (feedback, guidance, delight)
- **Quick** — animasi UI tidak boleh memperlambat user. Target: 200-400ms
- **Natural** — gunakan easing yang meniru physics dunia nyata
- **Consistent** — timing dan easing sama di seluruh aplikasi

> Animasi yang terlalu lambat membuat user menunggu. Animasi yang terlalu cepat tidak terlihat. Sweet spot ada di 200-400ms untuk sebagian besar UI transition.

## Dasar Framer Motion

### Animate Prop

\`\`\`jsx
import { motion } from 'framer-motion';

function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
\`\`\`

### Variants untuk Orchestration

Variants memungkinkan koordinasi animasi parent-children:

\`\`\`jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function StaggeredList({ items }) {
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {items.map(i => (
        <motion.li key={i.id} variants={item}>
          {i.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
\`\`\`

Setiap list item muncul dengan jeda 100ms, menciptakan efek cascade yang natural.

## Exit Animations dengan AnimatePresence

Salah satu keunggulan Framer Motion — animasi saat elemen dihapus dari DOM:

\`\`\`jsx
import { AnimatePresence, motion } from 'framer-motion';

function NotificationList({ notifications }) {
  return (
    <AnimatePresence>
      {notifications.map(notif => (
        <motion.div
          key={notif.id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          {notif.message}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
\`\`\`

## Gesture Animations

### Hover dan Tap

\`\`\`jsx
<motion.button
  whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click Me
</motion.button>
\`\`\`

### Drag

\`\`\`jsx
<motion.div
  drag
  dragConstraints={{ top: 0, left: 0, right: 300, bottom: 300 }}
  dragElastic={0.1}
  whileDrag={{ scale: 1.1, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
/>
\`\`\`

## Scroll-Based Animations

Menampilkan elemen saat masuk viewport:

\`\`\`jsx
import { motion, useInView } from 'framer-motion';

function RevealOnScroll({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
\`\`\`

## Page Transitions di Next.js

Animasi transisi antar halaman:

\`\`\`jsx
// layout.tsx
import { AnimatePresence } from 'framer-motion';

function Template({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
\`\`\`

## Performance Tips

Animasi yang buruk bisa membuat UI terasa lambat:

- **Hanya animasikan transform dan opacity** — properti lain trigger layout recalculation
- **Hindari animasi pada mount massal** — stagger 50+ elemen bisa dropping frames
- **Gunakan \`layout\` prop dengan hati-hati** — memicu FLIP animation yang expensive
- **Disable animasi di reduced-motion** — respek accessibility preference user

\`\`\`jsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<motion.div
  animate={{ opacity: 1 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
/>
\`\`\`

Framer Motion membuat animasi React menjadi declarative dan maintainable. Kuncinya adalah restraint — gunakan animasi secukupnya, dengan timing yang tepat, untuk tujuan yang jelas.`,
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=630&fit=crop',
    categorySlug: 'frontend',
    tags: ['Framer Motion', 'Animation', 'React', 'UI/UX', 'JavaScript'],
    readTime: '12 min',
    views: 4890,
    featured: false,
    publishedAt: '2024-11-18',
    metaTitle: 'Animasi Web Interaktif dengan Framer Motion — Panduan Lengkap',
    metaDescription: 'Membuat animasi React dengan Framer Motion: transitions, gesture animations, scroll reveal, page transitions, dan performance tips.',
  },
  {
    title: 'State Management di 2025: Zustand vs Redux Toolkit vs Jotai',
    slug: 'state-management-2025-zustand-redux-jotai',
    excerpt: 'Perbandingan mendalam tiga state management library terpopuler di React. Kapan menggunakan apa, kelebihan masing-masing, dan decision framework.',
    content: `State management di React sudah berevolusi jauh dari era Redux boilerplate yang verbose. Di 2025, tiga library mendominasi: Zustand untuk simplicity, Redux Toolkit untuk scalability, dan Jotai untuk atomic approach. Masing-masing punya sweet spot.

## Overview Singkat

**Zustand** — Minimalis, satu store, API ramping. Sangat populer di proyek kecil-menengah. Bundle size: ~1KB.

**Redux Toolkit (RTK)** — Versi modern Redux yang menghilangkan boilerplate. Standar di enterprise dan proyek besar. Includes RTK Query untuk data fetching. Bundle size: ~11KB.

**Jotai** — Atomic state management terinspirasi Recoil. State didefinisikan sebagai atom individual. Bundle size: ~3KB.

## Zustand: Simplicity First

\`\`\`javascript
import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,

  addItem: (product) => set((state) => ({
    items: [...state.items, product],
    total: state.total + product.price,
  })),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id),
    total: state.total - state.items.find(i => i.id === id).price,
  })),

  clearCart: () => set({ items: [], total: 0 }),
}));

// Usage - dead simple
function CartCount() {
  const count = useCartStore(state => state.items.length);
  return <span>{count} items</span>;
}
\`\`\`

**Kelebihan Zustand:**
- Tidak perlu Provider wrapper
- API minimalis — bisa dipelajari dalam 10 menit
- Selector-based subscription otomatis meminimalkan re-render
- Middleware bawaan: persist, devtools, immer

**Kapan gunakan:** Proyek kecil-menengah, shared state sederhana (cart, auth, UI state), tim kecil yang ingin setup cepat.

## Redux Toolkit: Enterprise-Grade

\`\`\`javascript
import { createSlice, configureStore } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
      state.total += action.payload.price;
    },
    removeItem: (state, action) => {
      const idx = state.items.findIndex(i => i.id === action.payload);
      state.total -= state.items[idx].price;
      state.items.splice(idx, 1);
    },
  },
});
\`\`\`

**Kelebihan Redux Toolkit:**
- Standardized patterns yang konsisten
- RTK Query untuk server state management
- Excellent DevTools — time travel debugging
- Middleware system yang powerful
- TypeScript support yang mature

**Kapan gunakan:** Proyek enterprise, tim besar (5+ developer), state yang kompleks dengan banyak slice, kebutuhan debugging yang advanced.

## Jotai: Atomic Approach

\`\`\`javascript
import { atom, useAtom } from 'jotai';

const cartItemsAtom = atom([]);
const cartTotalAtom = atom(
  (get) => get(cartItemsAtom).reduce((sum, item) => sum + item.price, 0)
);

// Derived atoms - computed automatically
const cartCountAtom = atom(
  (get) => get(cartItemsAtom).length
);

function CartCount() {
  const [count] = useAtom(cartCountAtom);
  return <span>{count} items</span>;
}
\`\`\`

**Kelebihan Jotai:**
- Bottom-up approach — mulai kecil, scale seiring kebutuhan
- Fine-grained re-rendering — hanya komponen yang subscribe ke atom tertentu yang re-render
- Composable — atom bisa depend pada atom lain
- Integrasi natural dengan React Suspense

**Kapan gunakan:** Proyek dengan state yang granular, form-heavy applications, state yang banyak interrelasi, preferensi pendekatan bottom-up.

## Decision Framework

| Kriteria | Zustand | Redux Toolkit | Jotai |
|----------|---------|---------------|-------|
| Learning curve | Rendah | Sedang | Rendah |
| Boilerplate | Minimal | Moderate | Minimal |
| DevTools | Basic | Excellent | Basic |
| Server state | Manual | RTK Query | Manual |
| Tim besar | Cukup | Excellent | Cukup |
| Performance | Bagus | Bagus | Excellent |
| Bundle size | ~1KB | ~11KB | ~3KB |

## Rekomendasi Praktis

Berdasarkan pengalaman di 10+ proyek:

1. **Side project / MVP:** Zustand — setup tercepat, learning curve rendah
2. **Startup (2-5 devs):** Zustand atau Jotai — tergantung kompleksitas state
3. **Enterprise (5+ devs):** Redux Toolkit — standardized patterns dan tooling
4. **Banyak form/granular state:** Jotai — atomic approach match dengan form fields
5. **Butuh server state caching:** Redux Toolkit + RTK Query atau gunakan TanStack Query

> **Hot take:** Untuk sebagian besar proyek baru di 2025, Zustand + TanStack Query adalah kombinasi yang sweet. Zustand untuk client state, TanStack Query untuk server state. Simple, performant, dan maintainable.

## Satu Hal yang Sering Dilupakan

Sebelum memilih library, pertanyakan: **apakah kamu benar-benar butuh global state?** React sendiri sudah powerful dengan:
- \`useState\` untuk local state
- \`useContext\` untuk shared state di subtree
- URL search params untuk state yang shareable
- Server Components untuk server state

Banyak kasus "state management" sebenarnya hanya butuh lifting state up atau context sederhana.`,
    coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
    categorySlug: 'frontend',
    tags: ['State Management', 'Zustand', 'Redux', 'Jotai', 'React'],
    readTime: '11 min',
    views: 6780,
    featured: false,
    publishedAt: '2025-02-08',
    metaTitle: 'State Management 2025 — Zustand vs Redux Toolkit vs Jotai',
    metaDescription: 'Perbandingan Zustand, Redux Toolkit, dan Jotai: kelebihan, kekurangan, decision framework, dan rekomendasi untuk setiap tipe proyek.',
  },
  {
    title: 'Micro-Frontend Architecture untuk Tim Engineering Besar',
    slug: 'micro-frontend-architecture-tim-engineering',
    excerpt: 'Implementasi micro-frontend menggunakan Module Federation untuk memungkinkan multiple tim bekerja independen pada satu aplikasi web besar.',
    content: `Ketika aplikasi frontend tumbuh menjadi ratusan ribu baris kode dan dikerjakan oleh 5+ tim, monolith frontend menjadi bottleneck. Setiap merge conflict, setiap deployment yang saling menunggu, dan setiap regresi yang tidak terlacak memperlambat velocity tim. Micro-frontend menawarkan solusi.

## Apa Itu Micro-Frontend?

Konsep yang sama dengan microservices, diterapkan di frontend: memecah aplikasi web besar menjadi feature-specific modules yang bisa dikembangkan, di-test, dan di-deploy secara independen oleh tim yang berbeda.

Contoh: di aplikasi e-commerce besar, setiap tim memiliki module sendiri:
- **Tim Product:** halaman katalog, detail produk, pencarian
- **Tim Cart:** keranjang belanja, checkout, pembayaran
- **Tim User:** profil, order history, wishlist
- **Tim Marketing:** banner, promo, loyalty program

## Module Federation: Webpack 5

Module Federation memungkinkan satu aplikasi mengonsumsi module dari aplikasi lain saat runtime — tanpa package publish, tanpa monorepo.

\`\`\`javascript
// webpack.config.js - Host Application
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        productModule: 'product@http://cdn.example.com/product/entry.js',
        cartModule: 'cart@http://cdn.example.com/cart/entry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
\`\`\`

\`\`\`javascript
// webpack.config.js - Product Remote
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'product',
      filename: 'entry.js',
      exposes: {
        './ProductList': './src/components/ProductList',
        './ProductDetail': './src/pages/ProductDetail',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
\`\`\`

## Shared Dependencies Management

Shared dependencies (React, React Router, design system) harus dikelola dengan hati-hati:

- **Singleton mode** — pastikan hanya satu instance React yang loaded
- **Version compatibility** — semua modules harus compatible dengan shared dependency versions
- **Fallback** — jika remote module gagal load, tampilkan fallback UI

> **Peringatan:** Version mismatch pada shared dependencies adalah sumber bug tersembunyi yang paling sulit di-debug. Investasi di tooling untuk enforce compatibility dari awal.

## Communication Antar Modules

Modules yang terisolasi tetap perlu berkomunikasi. Tiga pendekatan:

**1. Custom Events (Loosely Coupled)**
\`\`\`javascript
// Product module emits event
window.dispatchEvent(new CustomEvent('product:addToCart', {
  detail: { productId: '123', quantity: 1 }
}));

// Cart module listens
window.addEventListener('product:addToCart', (e) => {
  addToCart(e.detail.productId, e.detail.quantity);
});
\`\`\`

**2. Shared State Store**
Zustand store yang di-share via Module Federation.

**3. URL-based Communication**
Menggunakan URL search params untuk state yang perlu di-share lintas modules.

## Design System sebagai Kontrak Visual

Design system menjadi sangat kritikal di micro-frontend. Ini menjadi **kontrak visual** yang menjamin konsistensi:

- Publish sebagai npm package versioned
- Semua modules mengonsumsi design system yang sama
- Visual regression testing di level design system
- Breaking changes di-handle via major version bump

## Testing Strategy

Testing micro-frontend memerlukan pendekatan berlapis:

- **Unit tests** — per module, dengan mock untuk inter-module dependencies
- **Integration tests** — test komunikasi antar modules
- **E2E tests** — test flow lintas modules (search → product detail → add to cart → checkout)
- **Contract tests** — memastikan interface antar modules tidak break

## Deployment Independence

Keuntungan utama micro-frontend adalah deployment independen:

- Setiap module punya CI/CD pipeline sendiri
- Deploy product module tanpa re-deploy cart module
- Rollback per-module tanpa mempengaruhi yang lain
- Canary deployment per-module

## Kapan Micro-Frontend Berlebihan?

Micro-frontend menambah complexity signifikan. Jangan gunakan jika:

- Tim kurang dari 3-4 developer
- Aplikasi masih dalam tahap awal (MVP)
- Tidak ada kebutuhan deployment independen
- Tim belum mature dalam DevOps practices

Micro-frontend adalah solusi organisasional, bukan teknikal. Jika ini memecahkan masalah koordinasi tim, maka manfaatnya melebihi complexity-nya.`,
    coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
    categorySlug: 'frontend',
    tags: ['Micro-Frontend', 'Module Federation', 'Architecture', 'Webpack', 'React'],
    readTime: '13 min',
    views: 4560,
    featured: false,
    publishedAt: '2025-01-12',
    metaTitle: 'Micro-Frontend Architecture — Module Federation untuk Tim Besar',
    metaDescription: 'Implementasi micro-frontend: Module Federation, shared dependencies, inter-module communication, dan deployment independence.',
  },
  {
    title: 'Progressive Web App: Membangun Aplikasi Offline-First',
    slug: 'progressive-web-app-offline-first',
    excerpt: 'Cara membangun PWA yang bekerja offline, mendukung push notification, dan bisa di-install. Dari service worker hingga caching strategies.',
    content: `Progressive Web App menggabungkan yang terbaik dari web dan native app: discoverability web dengan capabilities native. PWA bisa di-install di home screen, bekerja offline, dan mengirim push notification — tanpa app store.

## Mengapa PWA di 2025?

Meski native app masih dominan, PWA punya keunggulan:

- **No app store friction** — user langsung akses, no download wait
- **Cross-platform** — satu codebase untuk semua device
- **Always up-to-date** — update otomatis tanpa user action
- **Smaller footprint** — PWA average 200KB vs native app 20-200MB
- **SEO benefit** — konten bisa di-index Google

## Service Worker: The Heart of PWA

Service Worker adalah JavaScript yang berjalan di background thread, terpisah dari main thread. Ia mengontrol network requests dan caching:

\`\`\`javascript
// sw.js - Service Worker
const CACHE_NAME = 'app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      )
    )
  );
});
\`\`\`

## Caching Strategies

Pilih strategy berdasarkan tipe content:

### Cache First (Static Assets)
\`\`\`javascript
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request)
          .then(response => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
            return response;
          })
        )
    );
  }
});
\`\`\`

Cek cache dulu, fetch kalau tidak ada. Cocok untuk gambar, fonts, static assets.

### Network First (API Data)
Fetch dari network dulu, fallback ke cache jika offline. Cocok untuk data yang sering berubah.

### Stale While Revalidate (Semi-Dynamic)
Return dari cache langsung (instant), tapi fetch di background untuk update cache. Cocok untuk content yang boleh sedikit stale.

## Web App Manifest

Manifest.json mendefinisikan bagaimana PWA tampil saat di-install:

\`\`\`json
{
  "name": "Portfolio App",
  "short_name": "Portfolio",
  "description": "Professional portfolio and blog",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#6366f1",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
\`\`\`

## Offline Experience yang Baik

Offline bukan berarti menampilkan "No Connection" page. PWA yang baik:

- **Menampilkan cached content** — user bisa browse halaman yang pernah dikunjungi
- **Queue actions** — form submission disimpan dan dikirim saat online kembali
- **Visual indicator** — beritahu user bahwa mereka sedang offline
- **Background Sync** — sinkronisasi data saat koneksi kembali

\`\`\`javascript
// Background Sync API
self.addEventListener('sync', event => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(
      getQueuedMessages()
        .then(messages => Promise.all(
          messages.map(msg => sendMessage(msg))
        ))
    );
  }
});
\`\`\`

## Push Notifications

Push notification meningkatkan re-engagement secara signifikan:

\`\`\`javascript
// Request permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  });

  // Kirim subscription ke backend
  await fetch('/api/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription)
  });
}
\`\`\`

> **Best practice:** Jangan langsung minta permission saat halaman load. Berikan konteks dulu — jelaskan benefit notification, dan minta saat user melakukan action yang relevan.

## Workbox: Simplifikasi Service Worker

Menulis service worker manual bisa kompleks. Workbox dari Google menyederhanakan:

\`\`\`javascript
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images', maxEntries: 100 })
);

registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api', networkTimeoutSeconds: 3 })
);
\`\`\`

## Mengukur Keberhasilan PWA

Metrik penting:
- **Install rate** — berapa persen user yang install
- **Offline usage** — seberapa sering diakses saat offline
- **Notification engagement** — CTR push notification
- **Lighthouse PWA score** — audit otomatis compliance

PWA menghadirkan pengalaman berkualitas tinggi tanpa barrier app store, dengan jangkauan SEO dan kemudahan deployment web.`,
    coverUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop',
    categorySlug: 'frontend',
    tags: ['PWA', 'Service Worker', 'Offline', 'Web Development', 'JavaScript'],
    readTime: '14 min',
    views: 5120,
    featured: false,
    publishedAt: '2024-12-02',
    metaTitle: 'Progressive Web App Offline-First — Service Worker & Caching Strategy',
    metaDescription: 'Membangun PWA: service worker, caching strategies, push notifications, background sync, Workbox, dan offline experience.',
  },
  {
    title: 'End-to-End Testing dengan Playwright: Best Practices',
    slug: 'end-to-end-testing-playwright-best-practices',
    excerpt: 'Panduan praktis menulis E2E test yang reliable menggunakan Playwright. Dari setup, writing tests, hingga integrasi CI/CD dan visual regression testing.',
    content: `End-to-end testing memvalidasi bahwa aplikasi bekerja dari perspektif user. Playwright dari Microsoft telah menjadi standar baru, menggeser Cypress dengan kemampuan multi-browser, auto-waiting, dan parallel execution yang superior.

## Mengapa Playwright?

Dibanding Cypress dan Selenium:

- **Multi-browser native** — Chromium, Firefox, WebKit dalam satu framework
- **Auto-waiting** — otomatis menunggu element actionable sebelum berinteraksi
- **Parallel by default** — test berjalan paralel tanpa konfigurasi ekstra
- **Network interception** — mock API responses dengan mudah
- **Trace viewer** — visual debugging yang powerful

## Setup Project

\`\`\`bash
npm init playwright@latest
\`\`\`

Konfigurasi dasar di \`playwright.config.ts\`:

\`\`\`typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});
\`\`\`

## Menulis Test yang Resilient

### Gunakan User-Facing Locators

\`\`\`typescript
// Buruk - fragile terhadap perubahan markup
await page.click('.btn.btn-primary.submit-class');
await page.click('#submit-btn-123');

// Baik - resilient, berdasarkan apa yang user lihat
await page.getByRole('button', { name: 'Submit Order' }).click();
await page.getByLabel('Email address').fill('user@example.com');
await page.getByPlaceholder('Search products...').fill('laptop');
await page.getByText('Add to Cart').click();
\`\`\`

### Page Object Model

Abstraksi halaman ke dalam class yang reusable:

\`\`\`typescript
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}

// Dalam test
test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('admin@test.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
\`\`\`

## API Mocking

Mock API responses untuk test yang deterministic:

\`\`\`typescript
test('shows products from API', async ({ page }) => {
  await page.route('**/api/products', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([
        { id: 1, name: 'Laptop Pro', price: 15000000 },
        { id: 2, name: 'Keyboard Mech', price: 1500000 },
      ]),
    });
  });

  await page.goto('/products');
  await expect(page.getByText('Laptop Pro')).toBeVisible();
  await expect(page.getByText('Keyboard Mech')).toBeVisible();
});
\`\`\`

## Visual Regression Testing

Tangkap screenshot dan bandingkan dengan baseline:

\`\`\`typescript
test('homepage visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.01,
  });
});
\`\`\`

> **Tips:** Jalankan visual regression test hanya di satu browser (misalnya Chromium) dan di environment yang controlled (Docker) untuk menghindari false positives.

## CI/CD Integration

\`\`\`yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
\`\`\`

## Anti-Patterns yang Harus Dihindari

- **Test yang terlalu banyak detail** — E2E test harus menguji flow, bukan unit behavior
- **Hard-coded waits** — gunakan auto-waiting Playwright, jangan \`page.waitForTimeout()\`
- **Test yang saling bergantung** — setiap test harus bisa berjalan independen
- **Over-mocking** — mock hanya external services, biarkan bagian aplikasi berjalan nyata
- **Mengabaikan flaky tests** — fix atau hapus, jangan diabaikan

Playwright membuat E2E testing menjadi developer-friendly, reliable, dan fast — tiga hal yang sebelumnya sulit didapat bersamaan.`,
    coverUrl: 'https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=1200&h=630&fit=crop',
    categorySlug: 'frontend',
    tags: ['Playwright', 'Testing', 'E2E', 'CI/CD', 'Frontend', 'Quality Assurance'],
    readTime: '12 min',
    views: 4230,
    featured: false,
    publishedAt: '2025-02-20',
    metaTitle: 'E2E Testing Playwright — Best Practices & CI/CD Integration',
    metaDescription: 'Panduan Playwright: setup, resilient locators, Page Object Model, API mocking, visual regression, dan integrasi CI/CD.',
  },
];
