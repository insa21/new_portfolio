import { BlogArticle } from './blog-articles-1';

export const articles: BlogArticle[] = [
  {
    title: 'Mendesain REST API yang Clean dan Maintainable',
    slug: 'mendesain-rest-api-clean-maintainable',
    excerpt: 'Best practices mendesain REST API modern: naming conventions, error handling, pagination, versioning, dan dokumentasi OpenAPI yang developer-friendly.',
    content: `REST API yang dirancang dengan baik menjadi fondasi stabil selama bertahun-tahun. API yang buruk menjadi technical debt mahal yang memperlambat setiap tim yang menggunakannya. Artikel ini merangkum standar desain yang proven di production.

## Prinsip Dasar API Design

Sebelum masuk ke teknis, pahami tiga prinsip utama:

- **Consistency** — semua endpoint mengikuti konvensi yang sama
- **Predictability** — developer bisa menebak endpoint tanpa baca dokumentasi
- **Evolvability** — API bisa berkembang tanpa breaking existing clients

## URL Design yang Intuitif

Gunakan nouns, bukan verbs. HTTP method sudah menunjukkan action:

\`\`\`
GET    /api/v1/users          → List users
POST   /api/v1/users          → Create user
GET    /api/v1/users/123      → Get user by ID
PUT    /api/v1/users/123      → Update user
DELETE /api/v1/users/123      → Delete user
\`\`\`

**Konvensi:**
- Plural nouns: \`/users\` bukan \`/user\`
- Kebab-case: \`/order-items\` bukan \`/orderItems\`
- Nested resources untuk relasi: \`/users/123/orders\`
- Maximum 2 level nesting — lebih dari itu gunakan query parameter

## Error Handling yang Konsisten

Standardisasi format error response menggunakan RFC 7807 Problem Details:

\`\`\`json
{
  "status": 422,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    },
    {
      "field": "password",
      "message": "Must be at least 8 characters"
    }
  ],
  "requestId": "req_abc123"
}
\`\`\`

**HTTP Status Codes yang tepat:**
- **200** — Success
- **201** — Created (setelah POST)
- **204** — No Content (setelah DELETE)
- **400** — Bad Request (format salah)
- **401** — Unauthorized (belum login)
- **403** — Forbidden (tidak punya akses)
- **404** — Not Found
- **422** — Unprocessable Entity (validasi gagal)
- **429** — Too Many Requests
- **500** — Internal Server Error

> Jangan gunakan 200 untuk semua response lalu mengandalkan field \`success: false\` di body. HTTP status codes exist for a reason.

## Pagination yang Scalable

### Cursor-Based Pagination

Lebih performant dari offset-based untuk dataset besar:

\`\`\`json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTAwfQ==",
    "has_more": true,
    "total": 1542
  }
}
\`\`\`

**Endpoint:** \`GET /api/v1/products?cursor=eyJpZCI6MTAwfQ==&limit=20\`

Keuntungan cursor-based:
- Konsisten meski ada insert/delete
- Performa tidak menurun di halaman ke-1000
- Natural untuk infinite scroll

## Filtering dan Sorting

\`\`\`
GET /api/v1/products?category=electronics&min_price=100000&max_price=5000000
GET /api/v1/products?sort=-created_at,title
GET /api/v1/products?fields=id,title,price
\`\`\`

- Filter menggunakan query parameters
- Sort dengan prefix \`-\` untuk descending
- Field selection untuk mengurangi payload size

## API Versioning

**URL-based versioning** paling straightforward:

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

**Aturan versioning:**
- Minor changes (tambah field baru) — tidak perlu version baru, pastikan backward compatible
- Breaking changes (hapus/rename field, ubah structure) — butuh major version
- Deprecation policy: announce 6 bulan sebelum sunset

## Rate Limiting

\`\`\`
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1709123456
\`\`\`

Implementasi rate limiting per endpoint dan per user. Return 429 ketika limit tercapai. Sertakan \`Retry-After\` header agar client tahu kapan bisa mencoba lagi.

## Request/Response Best Practices

**Request:**
- Gunakan JSON sebagai default content type
- Validasi input di layer paling awal (middleware)
- Sanitize input untuk mencegah injection

**Response:**
- Selalu wrap response dalam envelope konsisten
- Sertakan metadata (request ID, timestamp)
- Gunakan camelCase untuk JSON properties
- Null vs missing field — definisikan konvensi yang konsisten

## Dokumentasi dengan OpenAPI

Dokumentasi yang baik adalah dokumentasi yang selalu up-to-date. Gunakan OpenAPI 3.0:

\`\`\`yaml
openapi: 3.0.0
paths:
  /users:
    get:
      summary: List all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
\`\`\`

Generate dokumentasi interaktif dari OpenAPI spec menggunakan Swagger UI atau Redoc. Bonus: auto-generate SDK untuk client dari spec yang sama.

REST API yang well-designed menjadi multiplier untuk seluruh tim engineering. Investasi waktu di desain awal menghemat banyak waktu maintenance di kemudian hari.`,
    coverUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop',
    categorySlug: 'backend',
    tags: ['REST API', 'API Design', 'Backend', 'Node.js', 'Best Practices'],
    readTime: '12 min',
    views: 8930,
    featured: true,
    publishedAt: '2025-02-12',
    metaTitle: 'REST API Design Best Practices — Panduan Lengkap 2025',
    metaDescription: 'Best practices REST API: naming, error handling, pagination, versioning, rate limiting, dan dokumentasi OpenAPI.',
  },
  {
    title: 'PostgreSQL Performance Tuning: Indexing dan Query Optimization',
    slug: 'postgresql-performance-tuning-indexing-optimization',
    excerpt: 'Deep dive optimasi PostgreSQL: memahami EXPLAIN ANALYZE, memilih index yang tepat, optimasi query, dan monitoring performa database.',
    content: `Query database yang lambat adalah bottleneck performa paling umum di aplikasi backend. Sering kali, satu index yang tepat mengubah query dari detik menjadi milidetik. Artikel ini membahas teknik sistematis untuk mengoptimasi PostgreSQL.

## Langkah 1: Pahami Query Execution Plan

Sebelum optimasi, pahami bagaimana PostgreSQL mengeksekusi query. Gunakan \`EXPLAIN ANALYZE\`:

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.*, u.name as customer_name
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.status = 'pending'
  AND o.created_at > '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;
\`\`\`

**Hal yang perlu diperhatikan:**
- **Seq Scan** — membaca seluruh tabel, biasanya buruk untuk tabel besar
- **Index Scan** — menggunakan index, biasanya lebih efisien
- **Index Only Scan** — semua data ada di index, paling efisien
- **actual time** — waktu eksekusi sebenarnya
- **rows** — jumlah rows yang diproses vs yang diharapkan

> Selalu gunakan \`ANALYZE\` bukan hanya \`EXPLAIN\`. \`EXPLAIN\` saja hanya menunjukkan estimasi planner, bukan eksekusi aktual.

## Jenis-Jenis Index PostgreSQL

### B-Tree Index (Default)

Cocok untuk equality dan range queries:

\`\`\`sql
-- Single column index
CREATE INDEX idx_orders_status ON orders(status);

-- Composite index (urutan kolom penting!)
CREATE INDEX idx_orders_status_date
ON orders(status, created_at DESC);
\`\`\`

**Urutan kolom di composite index sangat penting:**
- Letakkan kolom equality di depan
- Letakkan kolom range/sort di belakang
- Index (status, created_at) bisa melayani query WHERE status = 'pending' ORDER BY created_at
- Tapi TIDAK bisa melayani query WHERE created_at > X saja (kolom pertama harus digunakan)

### GIN Index

Untuk full-text search, JSONB, dan array operations:

\`\`\`sql
-- Full-text search
CREATE INDEX idx_products_search
ON products USING GIN(to_tsvector('indonesian', name || ' ' || description));

-- JSONB query
CREATE INDEX idx_users_metadata
ON users USING GIN(metadata);
\`\`\`

### Partial Index

Index hanya untuk subset data yang sering di-query:

\`\`\`sql
-- Hanya index orders yang belum selesai
CREATE INDEX idx_orders_pending
ON orders(created_at DESC)
WHERE status IN ('pending', 'processing');
\`\`\`

Partial index lebih kecil, lebih cepat, dan menghemat storage.

### Covering Index (INCLUDE)

Menambahkan kolom ke index tanpa meng-index-nya, enabling index-only scan:

\`\`\`sql
CREATE INDEX idx_orders_covering
ON orders(status, created_at DESC)
INCLUDE (total_amount, user_id);
\`\`\`

Query yang membutuhkan status, created_at, total_amount, dan user_id bisa dilayani sepenuhnya dari index tanpa mengakses tabel.

## Optimasi Query Umum

### N+1 Query Problem

\`\`\`sql
-- Buruk: N+1 queries
SELECT * FROM orders WHERE user_id = 1;
-- Lalu untuk setiap order:
SELECT * FROM order_items WHERE order_id = ?;

-- Baik: JOIN atau subquery
SELECT o.*, oi.*
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.user_id = 1;
\`\`\`

### Hindari SELECT *

\`\`\`sql
-- Buruk
SELECT * FROM orders WHERE status = 'pending';

-- Baik - hanya ambil yang dibutuhkan
SELECT id, user_id, total_amount, created_at
FROM orders WHERE status = 'pending';
\`\`\`

### Optimasi COUNT

\`\`\`sql
-- Lambat pada tabel besar (full table scan)
SELECT COUNT(*) FROM orders;

-- Estimasi cepat (cukup untuk UI)
SELECT reltuples::bigint
FROM pg_class
WHERE relname = 'orders';
\`\`\`

## Monitoring Index Usage

\`\`\`sql
-- Cek index yang tidak digunakan
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
\`\`\`

Index yang tidak digunakan hanya memperlambat write operations. Hapus secara berkala.

## Connection Pooling

PostgreSQL membuat proses baru untuk setiap koneksi — mahal secara resource. Gunakan PgBouncer atau built-in connection pooling:

- **Transaction pooling** — connection dikembalikan ke pool setelah setiap transaksi
- **Pool size** — aturan praktis: 2-3x jumlah CPU cores
- Monitor: active connections, waiting connections, dan transaction duration

## Hasil Optimasi Nyata

Pada proyek e-commerce dengan 15 juta orders:

- Menambah composite index menurunkan query time dari 4.2s ke 3ms
- Partial index mengurangi index storage 80%
- Connection pooling dengan PgBouncer mengurangi connection overhead 70%
- Keseluruhan: database CPU usage turun 55% dan P99 latency turun dari 2.1s ke 45ms`,
    coverUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=630&fit=crop',
    categorySlug: 'backend',
    tags: ['PostgreSQL', 'Database', 'Performance', 'Indexing', 'SQL'],
    readTime: '14 min',
    views: 7230,
    featured: true,
    publishedAt: '2024-12-20',
    metaTitle: 'PostgreSQL Performance Tuning — Indexing & Query Optimization',
    metaDescription: 'Deep dive PostgreSQL: EXPLAIN ANALYZE, B-Tree/GIN/partial index, query optimization, connection pooling, dan monitoring.',
  },
  {
    title: 'Implementasi Authentication dengan JWT dan OAuth 2.0',
    slug: 'implementasi-authentication-jwt-oauth-2',
    excerpt: 'Arsitektur authentication modern: JWT access token dengan refresh token rotation, OAuth 2.0 social login, dan security hardening untuk production.',
    content: `Authentication yang benar sejak awal menghindarkan refaktor besar dan potensi security breach. Artikel ini membahas implementasi auth modern yang security-first menggunakan JWT dan OAuth 2.0.

## Arsitektur Dual Token

Gunakan dua jenis token:

- **Access Token** — short-lived (15 menit), disimpan di memory client
- **Refresh Token** — long-lived (7 hari), disimpan di httpOnly cookie

Mengapa dual token? Access token yang short-lived mengurangi window of attack jika token di-compromise. Refresh token yang tersimpan di httpOnly cookie tidak bisa diakses JavaScript, mengurangi risiko XSS.

\`\`\`typescript
function generateTokens(user: User) {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}
\`\`\`

## Refresh Token Rotation

Saat client mengirim refresh token untuk mendapatkan access token baru, selalu generate refresh token baru juga dan invalidasi yang lama. Ini mencegah token replay attack.

\`\`\`typescript
async function refreshTokens(oldRefreshToken: string) {
  const payload = jwt.verify(oldRefreshToken, REFRESH_SECRET);
  const user = await db.user.findUnique({
    where: { id: payload.userId }
  });

  // Cek token version — invalidasi jika sudah dipakai
  if (payload.tokenVersion !== user.tokenVersion) {
    // Possible token reuse — invalidasi semua tokens user ini
    await db.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } }
    });
    throw new Error('Token reuse detected — all sessions invalidated');
  }

  // Rotate: increment version, invalidasi token lama
  await db.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 } }
  });

  return generateTokens(user);
}
\`\`\`

> **Penting:** Ketika token reuse terdeteksi, invalidasi semua sessions user. Ini mengindikasikan bahwa refresh token mungkin telah dicuri.

## OAuth 2.0 Social Login

Implementasi social login dengan Google sebagai contoh:

**Flow:**
1. Client redirect ke Google Authorization URL
2. User login dan consent di Google
3. Google redirect ke callback URL dengan authorization code
4. Server menukar code dengan access token di Google
5. Server fetch profil user dari Google
6. Server create/update user dan generate JWT

\`\`\`typescript
// Callback endpoint
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  // Exchange code for tokens
  const { tokens } = await googleClient.getToken(code);
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID,
  });

  const { email, name, picture } = ticket.getPayload();

  // Upsert user
  const user = await db.user.upsert({
    where: { email },
    create: { email, name, avatar: picture, provider: 'GOOGLE' },
    update: { name, avatar: picture },
  });

  const { accessToken, refreshToken } = generateTokens(user);

  // Set refresh token sebagai httpOnly cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(\`/auth/success?token=\${accessToken}\`);
});
\`\`\`

## Role-Based Access Control (RBAC)

Definisikan permissions, bukan hanya roles:

\`\`\`typescript
const PERMISSIONS = {
  ADMIN: ['users:read', 'users:write', 'posts:read', 'posts:write', 'posts:delete'],
  EDITOR: ['posts:read', 'posts:write'],
  VIEWER: ['posts:read'],
};

function authorize(...requiredPermissions: string[]) {
  return (req, res, next) => {
    const userPermissions = PERMISSIONS[req.user.role];
    const hasPermission = requiredPermissions.every(
      p => userPermissions.includes(p)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Usage
app.delete('/api/posts/:id', authorize('posts:delete'), deletePost);
\`\`\`

## Security Hardening Checklist

- **HTTPS everywhere** — tidak ada exception
- **CORS restrictive** — whitelist hanya domain yang diizinkan
- **Rate limit pada login** — maksimal 5 attempts per 15 menit
- **Password hashing** — bcrypt dengan cost factor 12+
- **CSRF protection** — untuk cookie-based auth
- **Security headers** — Helmet.js untuk Express
- **Input validation** — Zod atau Joi untuk semua input
- **SQL injection prevention** — parameterized queries atau ORM

## Monitoring dan Audit

Log semua auth events untuk security audit:

- Login success/failure (dengan IP dan User Agent)
- Token refresh events
- Password reset requests
- Permission denied incidents
- Unusual patterns: login dari negara berbeda, brute force attempts

Alert pada anomali untuk incident response yang cepat. Auth monitoring bukan nice-to-have — ini requirement untuk production system.`,
    coverUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=1200&h=630&fit=crop',
    categorySlug: 'backend',
    tags: ['Authentication', 'JWT', 'OAuth', 'Security', 'Node.js'],
    readTime: '15 min',
    views: 6780,
    featured: false,
    publishedAt: '2025-01-22',
    metaTitle: 'Authentication JWT & OAuth 2.0 — Implementasi Lengkap & Secure',
    metaDescription: 'Implementasi auth modern: JWT dual token, refresh rotation, OAuth 2.0 social login, RBAC, dan security hardening.',
  },
  {
    title: 'Arsitektur Microservices: Kapan Tepat dan Kapan Berlebihan',
    slug: 'arsitektur-microservices-kapan-tepat-berlebihan',
    excerpt: 'Analisis jujur tentang microservices: keuntungan nyata, hidden costs, dan decision framework untuk memilih antara monolith, modular monolith, atau microservices.',
    content: `Microservices bukan silver bullet. Banyak tim mengadopsinya terlalu dini, menambah complexity tanpa mendapat benefit yang dijanjikan. Artikel ini memberikan perspektif realistis berdasarkan pengalaman di 5 proyek dengan skala berbeda.

## Mitos vs Realita Microservices

**Mitos:** Microservices lebih mudah di-scale.
**Realita:** Scale berdasarkan kebutuhan, bukan arsitektur. Monolith yang well-designed bisa menangani jutaan request/hari.

**Mitos:** Microservices membuat deployment lebih cepat.
**Realita:** Jika infrastructure dan tooling belum siap, deployment microservices justru lebih lambat dan berisiko.

**Mitos:** Microservices mengurangi complexity.
**Realita:** Complexity berpindah dari codebase ke infrastructure. Total complexity biasanya meningkat.

## Hidden Costs yang Jarang Dibicarakan

Microservices membawa overhead yang signifikan:

- **Network latency** — setiap service call menambah latency
- **Distributed debugging** — tracing request di 10+ services menggunakan distributed tracing
- **Data consistency** — eventual consistency memerlukan design pattern khusus
- **Operational overhead** — monitoring, logging, deployment untuk setiap service
- **Testing complexity** — integration testing antar services
- **Team coordination** — API contract management dan versioning

> Microservices trade complexity yang kamu lihat di codebase dengan complexity yang tersembunyi di infrastructure. Pastikan tim siap menangani keduanya.

## Decision Framework

### Pilih Monolith Jika:

- Tim kecil (kurang dari 8 developer)
- Produk masih di tahap awal (MVP, market validation)
- Domain bisnis belum stabil
- Tim belum memiliki DevOps maturity
- Budget infrastructure terbatas

### Pilih Modular Monolith Jika:

- Tim menengah (8-20 developer)
- Butuh development independence tanpa deployment independence
- Domain bisnis sudah cukup stabil
- Ingin preparation untuk microservices di masa depan

### Pilih Microservices Jika:

- Tim besar (20+ developer, 3+ squad)
- Butuh scaling independen per fitur
- Deployment monolith menjadi bottleneck
- Tim sudah mature dalam DevOps
- Budget infrastructure mencukupi

## Modular Monolith: Middle Ground

Modular monolith memberikan banyak benefit microservices tanpa complexity-nya:

\`\`\`
src/
├── modules/
│   ├── user/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── module.ts
│   ├── order/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── module.ts
│   └── payment/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       └── module.ts
├── shared/
│   ├── database/
│   └── middleware/
└── app.ts
\`\`\`

**Aturan modular monolith:**
- Setiap module memiliki boundary yang jelas
- Module berkomunikasi via defined interfaces, bukan akses langsung ke internal
- Database tables di-own oleh satu module saja
- Shared code minimal dan well-defined

Ketika kebutuhan microservices benar-benar muncul, extraction per module menjadi straightforward karena boundaries sudah jelas.

## Kalau Tetap Pilih Microservices

Jika setelah evaluasi jujur, microservices memang tepat, berikut guidelines praktis:

**Start small:**
- Mulai dengan 3-5 services, bukan 20
- Extract dimulai dari bounded context yang paling independen

**Infrastructure first:**
- CI/CD per-service harus siap sebelum development dimulai
- Monitoring dan distributed tracing wajib dari hari pertama
- Service mesh atau API gateway sudah di-setup

**Communication patterns:**
- Synchronous (REST/gRPC) untuk query yang butuh response langsung
- Asynchronous (message queue) untuk event processing
- API contract testing untuk mencegah breaking changes

**Data management:**
- Setiap service memiliki database sendiri
- Event-driven data synchronization
- Saga pattern untuk distributed transactions

## Studi Kasus: Keputusan yang Tepat

**Proyek A — E-commerce Startup (5 devs):**
Memilih modular monolith. Bisa iterate cepat, deploy sederhana. Setelah 2 tahun dan tim tumbuh jadi 15, barulah mulai extract payment module menjadi service terpisah karena kebutuhan scaling independen yang jelas.

**Proyek B — Enterprise Platform (25 devs, 4 squad):**
Memilih microservices dari awal. Investasi besar di infrastructure (3 bulan) sebelum fitur pertama. Tapi hasilnya: setiap squad bisa deploy 5-10x per hari tanpa koordinasi, velocity meningkat 200%.

Kunci keberhasilan bukan arsitektur apa yang dipilih, tetapi apakah keputusan tersebut sesuai dengan konteks tim, produk, dan organisasi.`,
    coverUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&h=630&fit=crop',
    categorySlug: 'backend',
    tags: ['Microservices', 'Architecture', 'Monolith', 'Node.js', 'System Design'],
    readTime: '13 min',
    views: 5670,
    featured: false,
    publishedAt: '2024-11-28',
    metaTitle: 'Microservices vs Monolith — Decision Framework yang Jujur',
    metaDescription: 'Analisis realistis microservices: hidden costs, decision framework, modular monolith sebagai middle ground, dan studi kasus.',
  },
  {
    title: 'Event-Driven Architecture dengan Apache Kafka',
    slug: 'event-driven-architecture-apache-kafka',
    excerpt: 'Implementasi event-driven architecture menggunakan Kafka: producer-consumer pattern, event schema, exactly-once semantics, dan monitoring.',
    content: `Event-Driven Architecture mengubah cara komponen sistem berinteraksi. Alih-alih memanggil service lain secara langsung, komponen mempublikasikan event, dan subscriber yang tertarik akan bereaksi. Apache Kafka menjadi backbone pilihan untuk arsitektur ini.

## Mengapa Event-Driven?

Tiga keuntungan utama yang didapat:

**Loose Coupling** — Producer tidak perlu tahu siapa yang mengkonsumsi event. Services bisa ditambah atau dihapus tanpa mengubah producer.

**Scalability** — Consumer bisa di-scale independen. Jika notification service kewalahan, tambah instance tanpa mempengaruhi order service.

**Resilience** — Jika consumer down, event tetap tersimpan di Kafka dan akan diproses saat consumer kembali online.

## Kafka Fundamentals

### Topics dan Partitions

Topic adalah kategori event. Partition memungkinkan parallel processing:

\`\`\`
Topic: order-events
├── Partition 0: [order-1, order-4, order-7, ...]
├── Partition 1: [order-2, order-5, order-8, ...]
└── Partition 2: [order-3, order-6, order-9, ...]
\`\`\`

Setiap consumer dalam satu consumer group membaca dari partition yang berbeda, enabling horizontal scaling.

### Producer

\`\`\`typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ brokers: ['kafka:9092'] });
const producer = kafka.producer();

async function publishOrderEvent(order) {
  await producer.send({
    topic: 'order-events',
    messages: [{
      key: order.userId,
      value: JSON.stringify({
        eventType: 'ORDER_CREATED',
        timestamp: new Date().toISOString(),
        data: {
          orderId: order.id,
          userId: order.userId,
          items: order.items,
          totalAmount: order.total,
        }
      }),
    }],
  });
}
\`\`\`

**Partition key:** Menggunakan \`userId\` sebagai key memastikan semua event dari user yang sama masuk ke partition yang sama, menjaga ordering per user.

### Consumer

\`\`\`typescript
const consumer = kafka.consumer({ groupId: 'notification-service' });

await consumer.subscribe({ topic: 'order-events' });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());

    switch (event.eventType) {
      case 'ORDER_CREATED':
        await sendOrderConfirmation(event.data);
        break;
      case 'ORDER_SHIPPED':
        await sendShippingNotification(event.data);
        break;
    }
  },
});
\`\`\`

## Event Schema Design

Event schema yang baik adalah fondasi EDA yang maintainable:

\`\`\`json
{
  "eventId": "evt_abc123",
  "eventType": "ORDER_CREATED",
  "version": "1.0",
  "timestamp": "2025-02-15T10:30:00Z",
  "source": "order-service",
  "correlationId": "req_xyz789",
  "data": {
    "orderId": "ord_123",
    "userId": "usr_456",
    "items": [...],
    "totalAmount": 1500000
  }
}
\`\`\`

**Best practices:**
- Event names dalam past tense: \`OrderCreated\`, bukan \`CreateOrder\`
- Sertakan semua data yang consumer butuhkan (fat events) untuk menghindari callback
- Version events untuk backward compatibility
- Gunakan Schema Registry (Confluent) untuk validasi otomatis

## Exactly-Once Semantics

Dalam distributed system, tiga semantics delivery:

- **At-most-once** — bisa kehilangan event, processing sekali atau tidak sama sekali
- **At-least-once** — tidak kehilangan event, tapi bisa diproses lebih dari sekali
- **Exactly-once** — setiap event diproses tepat sekali

Kafka mendukung exactly-once via idempotent producer dan transactional API. Tapi dalam praktik, lebih pragmatis menggunakan **at-least-once** dengan **idempotent consumer**:

\`\`\`typescript
async function handleEvent(event) {
  // Cek apakah event sudah pernah diproses
  const processed = await db.processedEvents.findUnique({
    where: { eventId: event.eventId }
  });

  if (processed) return; // Skip duplicate

  // Process event
  await db.$transaction([
    processOrder(event.data),
    db.processedEvents.create({ data: { eventId: event.eventId } })
  ]);
}
\`\`\`

## Dead Letter Queue (DLQ)

Event yang gagal diproses setelah beberapa retry dikirim ke DLQ untuk analisis manual:

- Retry 3x dengan exponential backoff
- Jika masih gagal, kirim ke DLQ topic
- Alert tim untuk investigasi
- Dashboard DLQ untuk monitoring event yang gagal

## Monitoring Kafka

Metrik penting yang harus dimonitor:

- **Consumer lag** — seberapa tertinggal consumer dari producer
- **Throughput** — messages per second per topic/partition
- **Error rate** — failed message processing
- **Partition balance** — distribusi data antar partitions

Gunakan Kafka Manager, Confluent Control Center, atau custom Prometheus metrics untuk monitoring comprehensive.

Event-driven architecture dengan Kafka memberikan fondasi yang scalable dan resilient untuk sistem terdistribusi. Kuncinya adalah desain event schema yang thoughtful dan monitoring yang comprehensive.`,
    coverUrl: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&h=630&fit=crop',
    categorySlug: 'backend',
    tags: ['Kafka', 'Event-Driven', 'Architecture', 'Messaging', 'Backend'],
    readTime: '14 min',
    views: 4280,
    featured: false,
    publishedAt: '2025-02-05',
    metaTitle: 'Event-Driven Architecture dengan Kafka — Implementasi Lengkap',
    metaDescription: 'Implementasi EDA dengan Kafka: producer-consumer, event schema, exactly-once semantics, DLQ, dan monitoring.',
  },
  {
    title: 'Caching Strategies: Dari Browser ke Redis',
    slug: 'caching-strategies-browser-ke-redis',
    excerpt: 'Strategi multi-layer caching untuk aplikasi web: browser cache, CDN edge, application-level Redis cache, dan database query cache.',
    content: `Caching adalah teknik paling impactful untuk performa aplikasi. Satu cache hit menghilangkan seluruh processing chain. Tapi caching juga sumber bug membingungkan jika salah kelola. Artikel ini membahas strategi pragmatis di setiap layer.

## Cache Hierarchy

Pikirkan caching sebagai piramida:

- **Layer 1: Browser Cache** — terdekat ke user, tercepat
- **Layer 2: CDN Edge** — server terdekat secara geografis
- **Layer 3: Application (Redis)** — shared cache di server
- **Layer 4: Database Query Cache** — built-in database caching

Setiap layer menangkap request sebelum sampai ke layer berikutnya.

## Browser Cache

HTTP Cache-Control headers mengontrol browser caching:

\`\`\`
# Static assets (CSS, JS, images) — cache agresif
Cache-Control: public, max-age=31536000, immutable

# HTML pages — always revalidate
Cache-Control: no-cache

# API responses — cache singkat
Cache-Control: public, max-age=60, s-maxage=300,
  stale-while-revalidate=600
\`\`\`

**File hashing** memungkinkan cache agresif pada static assets. File \`app.a1b2c3.js\` bisa di-cache selamanya karena hash berubah saat content berubah.

> **stale-while-revalidate** adalah game changer: browser return response dari cache langsung (instant), tapi fetch versi baru di background. User mendapat kecepatan cache tanpa staleness.

## CDN Edge Cache

CDN menyimpan content di server yang secara geografis dekat dengan user:

**Apa yang di-cache:**
- Static assets (images, CSS, JS, fonts)
- HTML pages yang jarang berubah
- API responses public (product list, blog posts)

**Cache invalidation:**
- Purge by URL: invalidasi halaman spesifik saat content berubah
- Purge by tag: group related content, invalidate sekaligus
- TTL-based: automatic expiration

**Setup Cloudflare:**
\`\`\`
# Page Rules
*.example.com/static/*
  Cache Level: Cache Everything
  Edge TTL: 1 month

*.example.com/api/public/*
  Cache Level: Cache Everything
  Edge TTL: 5 minutes
\`\`\`

## Redis: Application-Level Cache

Redis adalah in-memory data store yang menyimpan hasil query expensive dan computed data.

### Cache-Aside Pattern

\`\`\`typescript
async function getProductById(id: string) {
  const cacheKey = \`product:\${id}\`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Cache miss — query database
  const product = await db.product.findUnique({ where: { id } });

  // Set cache with TTL
  await redis.setex(cacheKey, 300, JSON.stringify(product));

  return product;
}
\`\`\`

### Write-Through Pattern

Write ke cache dan database secara simultan:

\`\`\`typescript
async function updateProduct(id: string, data: ProductUpdate) {
  // Update database
  const product = await db.product.update({
    where: { id },
    data,
  });

  // Update cache
  await redis.setex(\`product:\${id}\`, 300, JSON.stringify(product));

  // Invalidate list cache
  await redis.del('products:list:*');

  return product;
}
\`\`\`

### Cache Warming

Untuk cache yang sering diakses, proaktif isi cache sebelum diminta:

\`\`\`typescript
// Jalankan setiap 5 menit
async function warmPopularProductsCache() {
  const popular = await db.product.findMany({
    where: { published: true },
    orderBy: { views: 'desc' },
    take: 100,
  });

  const pipeline = redis.pipeline();
  for (const product of popular) {
    pipeline.setex(\`product:\${product.id}\`, 600, JSON.stringify(product));
  }
  await pipeline.exec();
}
\`\`\`

## Cache Invalidation Strategies

Cache invalidation adalah masalah tersulit. Beberapa pendekatan:

**1. TTL-Based:** Set expiration time. Paling sederhana, accept staleness dalam window tertentu.

**2. Event-Based:** Invalidate saat data berubah. Precise tapi memerlukan event system.

**3. Tag-Based:** Group cache entries dengan tag, invalidate seluruh group.

**4. Versioned Keys:** Encode version dalam cache key (\`product:v3:123\`). Increment version saat data berubah.

## Monitoring Cache

Metrik yang harus ditrack:

- **Hit Rate** — target 90%+ untuk frequently accessed data
- **Miss Rate** — high miss rate menandakan caching strategy yang kurang optimal
- **Eviction Rate** — terlalu tinggi berarti memory tidak cukup
- **Latency** — P99 Redis latency harus di bawah 5ms

\`\`\`typescript
// Custom metrics
const cacheHits = new prometheus.Counter({ name: 'cache_hits_total' });
const cacheMisses = new prometheus.Counter({ name: 'cache_misses_total' });

async function cachedQuery(key, queryFn, ttl = 300) {
  const cached = await redis.get(key);
  if (cached) {
    cacheHits.inc();
    return JSON.parse(cached);
  }
  cacheMisses.inc();
  const result = await queryFn();
  await redis.setex(key, ttl, JSON.stringify(result));
  return result;
}
\`\`\`

Caching yang baik bisa mengurangi database load 80%+ dan menurunkan response time dari ratusan milidetik menjadi single-digit milidetik.`,
    coverUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&h=630&fit=crop',
    categorySlug: 'backend',
    tags: ['Caching', 'Redis', 'CDN', 'Performance', 'Backend'],
    readTime: '13 min',
    views: 5420,
    featured: false,
    publishedAt: '2024-12-12',
    metaTitle: 'Caching Strategy Multi-Layer — Browser, CDN, Redis',
    metaDescription: 'Strategi caching: browser cache, CDN edge, Redis application cache. Patterns, invalidation, warming, dan monitoring.',
  },
  {
    title: 'GraphQL di Production: Lessons Learned dari 3 Proyek',
    slug: 'graphql-production-lessons-learned',
    excerpt: 'Pengalaman nyata menggunakan GraphQL di production: kapan menggunakan vs REST, N+1 problem, caching challenges, dan security considerations.',
    content: `Setelah mengimplementasikan GraphQL di 3 proyek production dengan skala berbeda, saya memiliki perspektif yang lebih nuanced tentang kapan GraphQL memberikan value dan kapan REST tetap lebih pragmatis. Artikel ini membagikan lessons learned yang jujur.

## Kapan GraphQL Shine

GraphQL memberikan value terbesar ketika:

- **Multiple client types** — mobile app butuh data minimal, web app butuh data lengkap, dari satu API
- **Complex relationships** — entity yang saling terkait dengan kedalaman bervariasi
- **Rapid frontend iteration** — frontend bisa mengubah data requirements tanpa menunggu backend
- **Overfetching problem** — REST endpoints mengembalikan terlalu banyak data yang tidak dibutuhkan

## Kapan REST Lebih Tepat

- **Simple CRUD** — GraphQL overkill untuk endpoints sederhana
- **File upload/download** — REST handles ini jauh lebih baik
- **Caching straightforward** — HTTP caching pada REST sangat mature
- **Tim kecil** — learning curve GraphQL menambah overhead

## N+1 Problem: Enemy Utama

N+1 query adalah masalah paling umum di GraphQL. Resolve setiap field bisa memicu query database terpisah:

\`\`\`graphql
query {
  users {        # 1 query
    name
    posts {      # N queries (1 per user)
      title
      comments { # N*M queries
        text
      }
    }
  }
}
\`\`\`

**Solusi: DataLoader**

DataLoader melakukan batching dan caching automatic:

\`\`\`typescript
import DataLoader from 'dataloader';

const postLoader = new DataLoader(async (userIds) => {
  // 1 query untuk semua users, bukan N queries
  const posts = await db.post.findMany({
    where: { userId: { in: userIds } }
  });

  // Group by userId, maintain order
  return userIds.map(id => posts.filter(p => p.userId === id));
});

// Di resolver
const resolvers = {
  User: {
    posts: (user) => postLoader.load(user.id),
  },
};
\`\`\`

> DataLoader harus di-instantiate per-request, bukan global. Ini mencegah cache pollution antar request yang berbeda.

## Caching di GraphQL

Caching lebih challenging di GraphQL dibanding REST:

**REST:** \`GET /users/123\` bisa di-cache berdasarkan URL. Sederhana.

**GraphQL:** Setiap query bisa berbeda — caching berdasarkan query string tidak efektif.

**Solusi yang digunakan:**

1. **Persisted Queries** — client mengirim hash query, bukan query string lengkap. Server lookup hash → gunakan response cache.

2. **Response caching per field** — cache di resolver level menggunakan Redis.

3. **CDN caching** — untuk persisted queries dengan GET method, CDN bisa cache response.

## Security: Query Depth dan Complexity

GraphQL membuka risiko query yang sangat expensive:

\`\`\`graphql
# Query "jahat" yang bisa crash server
query {
  users {
    posts {
      comments {
        author {
          posts {
            comments {
              author {
                posts { ... }
              }
            }
          }
        }
      }
    }
  }
}
\`\`\`

**Proteksi wajib:**

\`\`\`typescript
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const server = new ApolloServer({
  schema,
  validationRules: [
    depthLimit(5),
    createComplexityLimitRule(1000),
  ],
});
\`\`\`

- **Depth limiting** — batasi kedalaman query (rekomendasi: max 5-7)
- **Complexity analysis** — assign cost pada setiap field, tolak query yang melebihi budget
- **Query allowlisting** — di production, hanya allow registered queries

## Schema Design Principles

**Lessons dari 3 proyek:**

- Input types terpisah dari output types
- Gunakan connections (edges + nodes) untuk pagination, bukan simple arrays
- Nullable by default, mark NOT NULL secara eksplisit
- Evolve schema secara additive — jangan hapus fields, deprecate dulu

## Performance Monitoring

Track metrik spesifik GraphQL:

- **Resolver execution time** per field
- **Query complexity** distribution
- **Error rate** per operation
- **Cache hit rate** per resolver

Tools: Apollo Studio, GraphQL Mesh, atau custom instrumentation.

## Kesimpulan Jujur

GraphQL adalah tool yang powerful **untuk masalah yang tepat**. Dari 3 proyek: 2 proyek mendapat benefit signifikan (mobile+web multi-client), 1 proyek lebih cocok menggunakan REST yang di-refactor (simple CRUD API). Jangan gunakan GraphQL karena hype — gunakan karena solving real problems.`,
    coverUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=630&fit=crop',
    categorySlug: 'backend',
    tags: ['GraphQL', 'API', 'Backend', 'Node.js', 'Performance'],
    readTime: '13 min',
    views: 4560,
    featured: false,
    publishedAt: '2025-01-08',
    metaTitle: 'GraphQL di Production — Lessons Learned dari 3 Proyek',
    metaDescription: 'Pengalaman GraphQL production: N+1 solutions, caching challenges, security, schema design, dan kapan GraphQL vs REST.',
  },
  {
    title: 'Serverless vs Container: Memilih Arsitektur yang Tepat',
    slug: 'serverless-vs-container-memilih-arsitektur',
    excerpt: 'Perbandingan mendalam serverless (AWS Lambda, Vercel Functions) vs container (Docker, Kubernetes). Decision framework berdasarkan use case nyata.',
    content: `Serverless dan container adalah dua pendekatan deployment yang saling melengkapi, bukan saling mengganti. Masing-masing optimal untuk use case tertentu. Artikel ini membantu kamu membuat keputusan berdasarkan kebutuhan nyata.

## Serverless: Event-Driven, Pay-Per-Use

Serverless functions (AWS Lambda, Vercel Functions, Cloudflare Workers) berjalan hanya saat ada request. Kamu tidak mengelola server, tidak memikirkan scaling, dan hanya membayar saat function berjalan.

**Karakteristik:**
- **Cold start** — delay 100ms-2s saat function pertama kali dipanggil
- **Execution timeout** — biasanya 10-15 menit max
- **Stateless** — setiap invocation independen
- **Auto-scaling** — dari 0 ke ribuan concurrency secara otomatis
- **Pay-per-invocation** — $0.20 per 1 juta requests (Lambda)

\`\`\`typescript
// Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, message } = req.body;
    await sendEmail({ to: email, body: message });
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
\`\`\`

## Containers: Full Control, Consistent Environment

Container (Docker) mengemas aplikasi dengan semua dependency-nya. Kubernetes mengorkestrasikan container di production.

**Karakteristik:**
- **No cold start** — container selalu running
- **No timeout** — bisa long-running processes
- **Stateful possible** — bisa menyimpan state di memory
- **Manual scaling** — define autoscaling rules
- **Fixed cost** — bayar infrastructure terus-menerus

\`\`\`dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
\`\`\`

## Decision Framework

### Pilih Serverless Untuk:

- **API endpoints** yang traffic-nya bervariasi (idle malam hari, peak siang)
- **Webhook handlers** — menerima dan memproses webhook dari third-party
- **Scheduled tasks** — CRON jobs yang jalan periodik
- **Image/file processing** — resize, compress, konversi
- **MVP dan prototyping** — deploy dalam hitungan menit

### Pilih Container Untuk:

- **Long-running processes** — WebSocket server, streaming, background workers
- **High-throughput API** — konsisten di atas 1000 req/sec
- **Stateful applications** — in-memory caching, connection pooling
- **Complex dependencies** — aplikasi dengan system-level dependencies
- **ML inference** — GPU-accelerated model serving

### Hybrid Approach

Dalam praktik, proyek mature mengombinasikan keduanya:

- **Core API** → Container (konsisten, no cold start, connection pooling)
- **Webhook handlers** → Serverless (sporadic traffic, auto-scaling)
- **Scheduled jobs** → Serverless (jalankan 1x sehari, bayar hanya saat running)
- **Image processing** → Serverless (burst workloads, auto-scaling)
- **Admin panel** → Serverless (traffic rendah, hemat biaya)

## Cost Comparison

| Skenario | Serverless (Lambda) | Container (ECS) |
|----------|-------------------|-----------------|
| 100K req/hari | ~$2/bulan | ~$30/bulan |
| 1M req/hari | ~$20/bulan | ~$30/bulan |
| 10M req/hari | ~$200/bulan | ~$60/bulan |
| 100M req/hari | ~$2000/bulan | ~$200/bulan |

> Serverless lebih murah di traffic rendah, container lebih murah di traffic tinggi. Break-even point biasanya di sekitar 5-10M requests/hari.

## Cold Start Mitigation

Cold start adalah keluhan utama serverless. Strategi mitigasi:

- **Provisioned concurrency** — keep instances warm (biaya tambahan)
- **Smaller bundle** — function yang lighter = cold start lebih cepat
- **Runtime choice** — Node.js dan Python cold start lebih cepat dari Java
- **Edge functions** — Cloudflare Workers, Vercel Edge memiliki cold start < 5ms

## Monitoring Differences

**Serverless monitoring focus:**
- Invocation count dan duration
- Cold start frequency dan duration
- Error rate per function
- Concurrent executions

**Container monitoring focus:**
- CPU dan memory utilization
- Pod health dan restart count
- Network throughput
- Container startup time

Pilihan antara serverless dan container bukan binary. Pahami trade-offs masing-masing dan pilih berdasarkan kebutuhan spesifik setiap komponen dalam arsitektur aplikasimu.`,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop',
    categorySlug: 'backend',
    tags: ['Serverless', 'Docker', 'Container', 'AWS Lambda', 'Architecture'],
    readTime: '12 min',
    views: 5890,
    featured: false,
    publishedAt: '2025-02-18',
    metaTitle: 'Serverless vs Container — Decision Framework untuk Arsitektur',
    metaDescription: 'Perbandingan serverless vs container: characteristics, decision framework, cost comparison, hybrid approach, dan monitoring.',
  },
];
