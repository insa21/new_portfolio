import { BlogArticle } from './blog-articles-1';

export const articles: BlogArticle[] = [
  {
    title: 'Merancang Sistem yang Mampu Menangani 1 Juta Request per Detik',
    slug: 'merancang-sistem-1-juta-request-per-detik',
    excerpt: 'Teknik dan arsitektur untuk membangun sistem high-throughput: horizontal scaling, load balancing, caching layers, dan database optimization.',
    content: `Merancang sistem untuk 1 juta request per detik membutuhkan pemikiran berbeda dari sistem biasa. Setiap bottleneck harus dieliminasi secara sistematis. Artikel ini membahas pendekatan layer-by-layer.

## Prinsip Fundamental

Tiga prinsip yang harus dipahami sebelum mulai:

**Scale horizontally, bukan vertically.** Server terbesar di dunia tetap memiliki batas. Menambah lebih banyak server memberikan scaling yang hampir linear.

**Bottleneck bergeser.** Setelah menyelesaikan satu bottleneck, bottleneck baru akan muncul di layer lain. Optimasi adalah proses iteratif.

**Measure, don't guess.** Profiling dan monitoring menentukan di mana waktu dihabiskan. Optimasi tanpa data adalah tebakan.

## Layer 1: Load Balancer

Load balancer mendistribusikan traffic ke multiple application servers:

- **L4 (Transport Layer)** — TCP level, sangat cepat, routing berdasarkan IP/port
- **L7 (Application Layer)** — HTTP level, bisa routing berdasarkan URL path, headers
- **Algorithm:** Round-robin untuk distribusi merata, least connections untuk beban seimbang, IP hash untuk session affinity

Untuk 1M req/s, gunakan multi-tier load balancing: DNS round-robin → hardware/cloud load balancer → application load balancer.

## Layer 2: Application Server

**Horizontal Scaling:**

\`\`\`
                    ┌─── App Server 1
                    ├─── App Server 2
Load Balancer ──────├─── App Server 3
                    ├─── ...
                    └─── App Server N
\`\`\`

Setiap server harus **stateless** — tidak menyimpan session di memory. Session disimpan di Redis cluster yang shared.

**Estimasi kapasitas:**
- Satu Node.js instance menangani ~5.000-10.000 req/s
- Untuk 1M req/s, butuh ~100-200 instances
- Dengan Kubernetes, auto-scaling berdasarkan CPU/memory/custom metrics

## Layer 3: Caching

Cache mengurangi beban ke database secara drastis:

- **CDN** — static assets dan semi-static content di edge
- **Redis Cluster** — application cache, session store
- **Local cache** — in-process cache untuk data yang sangat frequent

> Target: 90-95% cache hit rate. Ini berarti hanya 50K-100K req/s yang benar-benar sampai ke database dari 1M req/s total.

## Layer 4: Database

Bahkan dengan caching, database harus mampu menangani 50K-100K req/s:

**Read scaling:**
- Read replicas — distribusi read queries ke multiple replicas
- Connection pooling — PgBouncer dengan 1000+ connections

**Write scaling:**
- Sharding — partisi data berdasarkan shard key
- Write-ahead log optimization
- Batching writes

**Database pilihan:**
- PostgreSQL + Citus untuk SQL sharding
- MongoDB untuk document store yang auto-shards
- DynamoDB untuk key-value at scale

## Layer 5: Async Processing

Tidak semua operasi harus synchronous. Pindahkan operasi non-critical ke background:

- **Email notification** → message queue → worker
- **Analytics tracking** → fire-and-forget ke Kafka
- **Image processing** → queue → dedicated workers
- **Search indexing** → CDC → Elasticsearch

Ini mengurangi latency endpoint utama dan memungkinkan processing yang lebih efisien.

## Monitoring dan Alerting

Sistem 1M req/s tanpa monitoring adalah bom waktu:

- **Request rate dan latency** per endpoint (P50, P95, P99)
- **Error rate** — alert jika melebihi 0.1%
- **Resource utilization** — CPU, memory, disk I/O, network
- **Queue depth** — monitor backpressure di message queues
- **Cache hit ratio** — drop menandakan masalah

## Capacity Planning

Rencanakan kapasitas 6-12 bulan ke depan:

- **Current:** 500K req/s at peak
- **Growth rate:** 15% per bulan
- **6 bulan target:** ~1.15M req/s
- **Buffer:** plan untuk 1.5x target (2.25M req/s)

Jangan menunggu sampai sistem kewalahan. Scaling exercise harus dimulai 2-3 bulan sebelum dibutuhkan.

Sistem 1M req/s bukan tentang satu magic solution, tetapi tentang optimasi di setiap layer secara konsisten. Mulai dari bottleneck terbesar, iterasi, dan monitor terus-menerus.`,
    coverUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=1200&h=630&fit=crop',
    categorySlug: 'system-design',
    tags: ['System Design', 'Scalability', 'Architecture', 'High Performance', 'Infrastructure'],
    readTime: '13 min',
    views: 5890,
    featured: true,
    publishedAt: '2025-02-25',
    metaTitle: 'System Design: 1 Juta Request per Detik — Panduan Arsitektur',
    metaDescription: 'Teknik membangun sistem high-throughput: load balancing, horizontal scaling, caching layers, database optimization, dan async processing.',
  },
  {
    title: 'Database Sharding: Panduan Praktis Horizontal Scaling',
    slug: 'database-sharding-panduan-horizontal-scaling',
    excerpt: 'Kapan dan bagaimana menerapkan database sharding: shard key selection, routing strategies, cross-shard queries, dan migration plan.',
    content: `Ketika tabel database tumbuh hingga ratusan juta rows, vertical scaling mencapai batas. Database sharding memecah data secara horizontal ke beberapa instance, tapi ia datang dengan complexity yang tidak boleh diremehkan.

## Kapan Sharding Dibutuhkan?

Jangan shard terlalu dini. Pertimbangkan sharding ketika:

- Tabel melebihi 100-500 juta rows dengan query yang semakin lambat
- Write throughput melebihi kapasitas single instance
- Data memiliki natural partition key (tenant_id, region)
- Read replicas sudah tidak mampu menangani read scaling

**Sebelum sharding, coba dulu:**
- Optimasi index dan query
- Connection pooling
- Read replicas
- Caching layer
- Archiving data lama

## Memilih Shard Key

Shard key menentukan distribusi data. Pilihan yang buruk = hotspot dan performance yang tidak merata.

**Kriteria shard key yang baik:**
- High cardinality — banyak unique values untuk distribusi merata
- Query alignment — sering digunakan di WHERE clause
- Even distribution — data terdistribusi merata antar shards
- Growth compatibility — tetap balance seiring data bertambah

**Contoh untuk berbagai use case:**
- Multi-tenant SaaS → \`tenant_id\` (natural boundary)
- Social media → \`user_id\` (semua data user di satu shard)
- E-commerce → \`region_id\` atau \`customer_id\`
- IoT → \`device_id\` atau \`timestamp range\`

> **Hindari timestamp sebagai shard key** — semua data baru masuk ke shard terakhir, menyebabkan hotspot.

## Routing Strategies

### Hash-Based Routing

\`\`\`
shard_number = hash(shard_key) % num_shards
\`\`\`

Kelebihan: Distribusi merata, simple.
Kekurangan: Re-sharding (menambah shard) memerlukan data redistribution. Consistent hashing bisa mitigasi ini.

### Range-Based Routing

Shard berdasarkan range nilai. Shard 1: users 1-1M, Shard 2: users 1M-2M, dst.

Kelebihan: Mudah dipahami, range queries efisien.
Kekurangan: Bisa menyebabkan hotspot jika data tidak terdistribusi merata.

### Directory-Based Routing

Lookup table yang memetakan key → shard:

\`\`\`
tenant_123 → shard_2
tenant_456 → shard_1
tenant_789 → shard_3
\`\`\`

Kelebihan: Paling fleksibel, bisa rebalance tanpa data migration.
Kekurangan: Lookup table menjadi single point of failure.

## Cross-Shard Queries

Ini tantangan terbesar. Query yang melibatkan data di multiple shards memerlukan scatter-gather:

\`\`\`
// Query dikirim ke semua shards
SELECT COUNT(*) FROM orders WHERE status = 'pending'

// Setiap shard return count parsialnya
// Application layer meng-aggregate hasilnya
totalCount = sum(shard1_count, shard2_count, ..., shardN_count)
\`\`\`

**Design agar 90%+ queries bisa dilayani oleh single shard.** Ini dimulai dari shard key yang tepat dan API design yang shard-aware.

## Data Consistency

Transaksi cross-shard sangat expensive. Strategi:

- **Avoid cross-shard transactions** — design data model agar related data ada di shard yang sama
- **Saga pattern** — sequence of local transactions dengan compensating actions
- **Eventual consistency** — accept bahwa data antar shard mungkin briefly inconsistent

## Migration Strategy

Migrasi ke sharded database harus zero-downtime:

**Fase 1: Dual Write**
- Write ke database lama DAN baru secara simultan
- Read masih dari database lama
- Verifikasi data consistency

**Fase 2: Shadow Read**
- Read dari database baru (shadow), bandingkan dengan yang lama
- Track discrepancies
- Fix data sync issues

**Fase 3: Cutover**
- Switch reads ke database baru
- Final consistency check
- Keep database lama sebagai backup (2-4 minggu)

## Alternatif Modern

Sebelum implementasi sharding manual, pertimbangkan managed solutions:

- **Citus** — PostgreSQL extension untuk distributed tables. Sharding transparan.
- **CockroachDB** — Distributed SQL, auto-sharding dan rebalancing.
- **PlanetScale** — MySQL-compatible, online schema changes, horizontal scaling.
- **YugabyteDB** — PostgreSQL-compatible distributed database.

Solusi managed mengurangi operational burden signifikan, meskipun dengan biaya yang lebih tinggi.`,
    coverUrl: 'https://images.unsplash.com/photo-1509966756634-9c23dd6e6815?w=1200&h=630&fit=crop',
    categorySlug: 'system-design',
    tags: ['Database', 'Sharding', 'Scalability', 'PostgreSQL', 'System Design'],
    readTime: '14 min',
    views: 4120,
    featured: false,
    publishedAt: '2024-11-10',
    metaTitle: 'Database Sharding — Panduan Horizontal Scaling Praktis',
    metaDescription: 'Panduan sharding: shard key selection, routing strategies, cross-shard queries, consistency, migration, dan alternatif modern.',
  },
  {
    title: 'Distributed Systems: CAP Theorem dalam Praktik',
    slug: 'distributed-systems-cap-theorem-praktik',
    excerpt: 'Memahami CAP Theorem secara praktis: trade-offs antara consistency, availability, dan partition tolerance dalam desain sistem terdistribusi.',
    content: `CAP Theorem menyatakan bahwa dalam distributed system, kamu hanya bisa mendapatkan dua dari tiga: Consistency, Availability, dan Partition Tolerance. Karena network partition pasti terjadi, pilihan sebenarnya adalah antara consistency dan availability saat partition terjadi.

## Memahami CAP

**Consistency (C):** Semua node melihat data yang sama pada waktu yang sama. Setelah write berhasil, semua subsequent reads mengembalikan data terbaru.

**Availability (A):** Setiap request mendapat response (bukan error), meskipun mungkin bukan data terbaru.

**Partition Tolerance (P):** Sistem tetap beroperasi meskipun ada network partition — komunikasi antar node terputus.

## CP Systems: Consistency over Availability

Ketika partition terjadi, sistem mengorbankan availability — menolak request daripada mengembalikan data stale.

**Use cases:** Financial transactions, inventory management, critical data stores.

**Contoh:**
- **PostgreSQL** (single node) — strong consistency, tapi tidak partition tolerant
- **MongoDB** (strong consistency mode) — write ditolak jika majority nodes tidak reachable
- **etcd/ZooKeeper** — consensus-based, availability berkurang saat partisi

\`\`\`
Skenario: Transfer uang Rp 1.000.000 dari akun A ke B

CP approach:
1. Lock akun A dan B
2. Debit A, Credit B
3. Commit — kedua perubahan atomic
4. Jika salah satu node unreachable: REJECT transaksi
   → User harus coba lagi, tapi data SELALU konsisten
\`\`\`

## AP Systems: Availability over Consistency

Ketika partition terjadi, sistem mengorbankan consistency — tetap menerima request meskipun data mungkin stale.

**Use cases:** Social media feeds, product catalogs, logging, analytics.

**Contoh:**
- **Cassandra** — eventual consistency, selalu available
- **DynamoDB** (eventual consistency mode) — setiap node bisa serve reads
- **DNS** — cached records, eventual propagation

\`\`\`
Skenario: User melihat jumlah likes pada postingan

AP approach:
1. Node A menunjukkan 1.523 likes
2. Node B (di region lain) menunjukkan 1.520 likes
3. Setelah beberapa detik, keduanya converge ke 1.523
   → User tetap bisa berinteraksi, meskipun angka briefly berbeda
\`\`\`

## Eventual Consistency dalam Praktik

Sebagian besar sistem production menggunakan eventual consistency untuk non-critical data:

**Patterns:**
- **Read-your-writes consistency** — user selalu melihat data yang baru saja mereka tulis
- **Monotonic reads** — user tidak pernah melihat data yang "mundur" ke versi lama
- **Causal consistency** — jika event A menyebabkan event B, observer selalu melihat A sebelum B

> **Pelajaran penting:** Dalam 90% kasus, eventual consistency "good enough" asalkan convergence window singkat (detik, bukan menit).

## PACELC: Evolusi dari CAP

PACELC memberikan framework yang lebih nuanced:

**When Partitioned:** Choose Availability or Consistency (same as CAP)
**Else (normal operation):** Choose Latency or Consistency

Ini menangkap trade-off yang terjadi bahkan saat tidak ada partition — synchronous replication memberikan consistency tapi menambah latency.

## Consensus Algorithms

Untuk CP systems, consensus algorithms menentukan bagaimana nodes agree:

- **Raft** — mudah dipahami, digunakan di etcd, CockroachDB
- **Paxos** — secara teoritikal optimal, tapi sulit diimplementasi
- **ZAB** — used di ZooKeeper

## Desain Praktis: Hybrid Approach

Sistem yang mature menggunakan approach berbeda untuk data berbeda:

- **Payment data** → Strong consistency (CP), transaksi harus atomic
- **User profiles** → Eventual consistency (AP), stale data acceptable
- **Shopping cart** → Session-based, client-side state dengan sync
- **Search index** → Asynchronous update, eventual consistency

Jangan menerapkan satu pendekatan untuk semua data. Analyze consistency requirements per data type dan pilih yang sesuai.

## Testing Distributed Systems

Verifikasi behavior saat failure:

- **Chaos Engineering** — inject network partitions, node failures
- **Jepsen testing** — formal verification untuk distributed databases
- **Load testing** — verifikasi behavior di bawah tekanan
- **Failure mode analysis** — dokumentasi apa yang terjadi di setiap failure scenario

Distributed systems memerlukan mindset yang berbeda dari single-node applications. CAP Theorem bukan batasan yang harus diatasi, tetapi trade-off yang harus dipahami dan dikelola secara sadar.`,
    coverUrl: 'https://images.unsplash.com/photo-1600267175161-cfaa711b4a81?w=1200&h=630&fit=crop',
    categorySlug: 'system-design',
    tags: ['CAP Theorem', 'Distributed Systems', 'System Design', 'Consistency', 'Architecture'],
    readTime: '14 min',
    views: 3450,
    featured: false,
    publishedAt: '2025-01-15',
    metaTitle: 'CAP Theorem dalam Praktik — Trade-offs Distributed Systems',
    metaDescription: 'Memahami CAP Theorem: CP vs AP systems, eventual consistency patterns, PACELC, consensus algorithms, dan hybrid approach.',
  },
  {
    title: 'CQRS dan Event Sourcing dalam Aplikasi Modern',
    slug: 'cqrs-event-sourcing-aplikasi-modern',
    excerpt: 'Memahami kapan dan bagaimana menggunakan CQRS dan Event Sourcing. Dari konsep dasar, implementasi praktis, hingga trade-offs yang perlu dipertimbangkan.',
    content: `CQRS dan Event Sourcing sering disebutkan bersamaan, tapi keduanya adalah pattern yang berbeda dan bisa digunakan secara independen. Artikel ini menjelaskan keduanya secara terpisah, kapan menggabungkannya, dan kapan overkill.

## CQRS: Command Query Responsibility Segregation

CQRS memisahkan operasi read (query) dan write (command) ke model yang berbeda.

**Tanpa CQRS:**
\`\`\`
┌─────────────┐
│   API       │
│  ┌───────┐  │
│  │ Model │  │  ← Satu model untuk read & write
│  └───────┘  │
│  ┌──────┐   │
│  │  DB  │   │
│  └──────┘   │
└─────────────┘
\`\`\`

**Dengan CQRS:**
\`\`\`
┌───────────┐     ┌───────────┐
│ Command   │     │  Query    │
│ ┌───────┐ │     │ ┌───────┐ │
│ │ Write │ │     │ │ Read  │ │
│ │ Model │ │     │ │ Model │ │
│ └───────┘ │     │ └───────┘ │
│ ┌──────┐  │     │ ┌──────┐  │
│ │Write │  │────→│ │Read  │  │
│ │  DB  │  │sync │ │  DB  │  │
│ └──────┘  │     │ └──────┘  │
└───────────┘     └───────────┘
\`\`\`

**Keuntungan CQRS:**
- Read dan write model bisa di-optimasi secara independen
- Read database bisa denormalized untuk query cepat
- Scaling independen — read biasanya 10-100x lebih banyak dari write

**Kapan CQRS masuk akal:**
- Read patterns sangat berbeda dari write patterns
- Perlu scaling read dan write secara independen
- Query yang complex membutuhkan denormalized views

## Event Sourcing

Alih-alih menyimpan current state, Event Sourcing menyimpan semua event yang mengubah state. Current state dihitung dengan me-replay events.

\`\`\`
Traditional: orders table → {id: 1, status: 'shipped', total: 500000}

Event Sourcing:
  Event 1: OrderCreated {id: 1, items: [...], total: 500000}
  Event 2: PaymentReceived {orderId: 1, amount: 500000}
  Event 3: OrderShipped {orderId: 1, tracking: 'JNE123'}

  Current state = replay(Event 1, Event 2, Event 3)
\`\`\`

**Keuntungan Event Sourcing:**

- **Complete audit trail** — semua perubahan tercatat, tidak ada yang hilang
- **Time-travel debugging** — bisa melihat state di titik waktu manapun
- **Event replay** — bisa rebuild projections atau analytics dari historical events
- **Undo capability** — memungkinkan compensating events

**Kekurangan:**

- **Complexity** — mental model yang berbeda, learning curve tinggi
- **Event versioning** — evolusi event schema challenging
- **Query complexity** — tidak bisa langsung query current state
- **Storage** — menyimpan semua events membutuhkan storage yang besar

## Implementasi Praktis

\`\`\`typescript
// Event Store
interface DomainEvent {
  eventId: string;
  aggregateId: string;
  eventType: string;
  version: number;
  timestamp: Date;
  data: Record<string, unknown>;
}

class EventStore {
  async appendEvents(aggregateId: string, events: DomainEvent[]) {
    await db.events.createMany({ data: events });
    // Publish events untuk projection updates
    for (const event of events) {
      await messageQueue.publish('domain-events', event);
    }
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return db.events.findMany({
      where: { aggregateId },
      orderBy: { version: 'asc' }
    });
  }
}

// Aggregate
class OrderAggregate {
  apply(event: DomainEvent) {
    switch (event.eventType) {
      case 'OrderCreated':
        this.status = 'created';
        this.items = event.data.items;
        break;
      case 'OrderShipped':
        this.status = 'shipped';
        break;
    }
  }
}
\`\`\`

## Projections

Projections mengkonsumsi events dan membangun read-optimized views:

\`\`\`typescript
// Projection builder
class OrderSummaryProjection {
  async handle(event: DomainEvent) {
    switch (event.eventType) {
      case 'OrderCreated':
        await db.orderSummary.create({
          data: {
            orderId: event.aggregateId,
            status: 'created',
            total: event.data.total,
            itemCount: event.data.items.length,
          }
        });
        break;
      case 'OrderShipped':
        await db.orderSummary.update({
          where: { orderId: event.aggregateId },
          data: { status: 'shipped' }
        });
        break;
    }
  }
}
\`\`\`

## Kapan Menggunakan dan Kapan Tidak

**Gunakan CQRS + Event Sourcing jika:**
- Domain bisnis complex dengan banyak rules dan state transitions
- Audit trail lengkap adalah requirement (fintech, healthcare)
- Perlu membangun multiple read models dari data yang sama
- Tim sudah mature dan memahami DDD

**Jangan gunakan jika:**
- Simple CRUD application
- Tim kecil tanpa pengalaman DDD
- Tidak ada requirement audit trail
- Latency minimal lebih penting dari feature richness

> CQRS dan Event Sourcing harus menjadi pilihan sadar berdasarkan kebutuhan, bukan keinginan menggunakan pattern yang keren.`,
    coverUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=630&fit=crop',
    categorySlug: 'system-design',
    tags: ['CQRS', 'Event Sourcing', 'DDD', 'Architecture', 'System Design'],
    readTime: '15 min',
    views: 3210,
    featured: false,
    publishedAt: '2024-12-18',
    metaTitle: 'CQRS & Event Sourcing — Kapan Menggunakan dan Implementasi',
    metaDescription: 'CQRS dan Event Sourcing: konsep, implementasi praktis, projections, trade-offs, dan kapan pattern ini tepat.',
  },
  {
    title: 'Rate Limiting dan Throttling: Melindungi API dari Abuse',
    slug: 'rate-limiting-throttling-melindungi-api',
    excerpt: 'Implementasi rate limiting yang efektif: algoritma token bucket, sliding window, per-user limits, dan graceful degradation.',
    content: `Rate limiting adalah mekanisme pertahanan pertama API terhadap abuse, DDoS, dan konsumsi resource yang tidak wajar. Tanpa rate limiting, satu client yang salah konfigurasi bisa membuat seluruh API tidak bisa diakses oleh semua user.

## Mengapa Rate Limiting Wajib?

Tiga alasan utama:

- **Melindungi dari abuse** — mencegah scraping, brute force, dan spam
- **Fair usage** — memastikan semua user mendapat share resource yang adil
- **Cost control** — mencegah satu user menghabiskan resource API

## Algoritma Rate Limiting

### Token Bucket

Bayangkan ember (bucket) yang diisi token secara berkala. Setiap request mengambil satu token. Jika bucket kosong, request ditolak.

\`\`\`typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  tryConsume(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + elapsed * this.refillRate
    );
    this.lastRefill = now;
  }
}
\`\`\`

**Kelebihan:** Smooth, memungkinkan burst singkat (sampai maxTokens), mudah dipahami.

### Sliding Window Log

Menyimpan timestamp setiap request. Count request dalam window terakhir (misal 1 menit). Jika melebihi limit, tolak.

**Kelebihan:** Akurat, tidak ada boundary issues.
**Kekurangan:** Memory usage tinggi (menyimpan semua timestamps).

### Sliding Window Counter

Kombinasi fixed window dengan interpolasi. Lebih memory-efficient dari log:

\`\`\`
Window saat ini: 30 request (dari menit ini)
Window sebelumnya: 80 request (menit lalu)
Posisi dalam window: 40% (24 detik dari 60 detik)

Estimasi rate = 80 * 60% + 30 * 100% = 78 request/menit
Limit: 100/menit → ALLOW
\`\`\`

## Implementasi di Redis

Redis adalah pilihan natural untuk rate limiting karena atomic operations dan performa tinggi:

\`\`\`typescript
async function checkRateLimit(userId: string, limit: number, windowSec: number) {
  const key = \`ratelimit:\${userId}\`;
  const now = Date.now();

  const pipeline = redis.pipeline();
  pipeline.zadd(key, now, \`\${now}:\${Math.random()}\`);
  pipeline.zremrangebyscore(key, 0, now - windowSec * 1000);
  pipeline.zcard(key);
  pipeline.expire(key, windowSec);

  const results = await pipeline.exec();
  const count = results[2][1];

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: new Date(now + windowSec * 1000),
  };
}
\`\`\`

## Strategi Rate Limiting Per-Tier

Terapkan limits berbeda untuk konteks berbeda:

**Per-User:**
\`\`\`
Free tier:  100 req/menit
Pro tier:   1000 req/menit
Enterprise: 10000 req/menit
\`\`\`

**Per-Endpoint:**
\`\`\`
POST /auth/login:     5 req/menit (brute force protection)
GET  /api/products:   100 req/menit
POST /api/orders:     20 req/menit
GET  /api/search:     30 req/menit
\`\`\`

**Global:**
\`\`\`
Total API:  1M req/menit (infrastructure protection)
\`\`\`

## Response Headers

Sertakan rate limit info di response headers agar client bisa berperilaku dengan baik:

\`\`\`
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 73
X-RateLimit-Reset: 1709384400

HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
\`\`\`

## Graceful Degradation

Ketika limit tercapai, jangan langsung return error. Pertimbangkan:

- **Queueing** — antri request dan proses saat capacity tersedia
- **Degraded response** — return cached/simplified version
- **Priority queuing** — premium users mendapat priority
- **Backoff signaling** — return Retry-After header agar client tahu kapan mencoba lagi

## Distributed Rate Limiting

Dalam multi-server setup, rate limiting harus centralized (Redis) bukan per-server. Per-server limiting mengizinkan total requests menjadi N * limit (N = jumlah servers).

Rate limiting yang baik melindungi API tanpa mengganggu legitimate users. Implementasi yang tepat memberikan keamanan, fairness, dan pengalaman user yang baik sekaligus.`,
    coverUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&h=630&fit=crop',
    categorySlug: 'system-design',
    tags: ['Rate Limiting', 'API Security', 'Redis', 'System Design', 'Backend'],
    readTime: '12 min',
    views: 4780,
    featured: false,
    publishedAt: '2025-02-03',
    metaTitle: 'Rate Limiting API — Algoritma, Redis Implementation, dan Best Practices',
    metaDescription: 'Rate limiting: token bucket, sliding window, Redis implementation, per-tier strategies, dan graceful degradation.',
  },
  {
    title: 'Strategi Zero Downtime Deployment',
    slug: 'strategi-zero-downtime-deployment',
    excerpt: 'Teknik deployment tanpa downtime: blue-green, canary, rolling updates, database migration strategies, dan rollback procedures.',
    content: `Downtime saat deployment adalah hal yang tidak bisa diterima untuk aplikasi production modern. Setiap menit downtime berarti kehilangan revenue, user frustration, dan reputasi yang rusak. Artikel ini membahas teknik deployment tanpa gangguan.

## Biaya Downtime

Berdasarkan industri:

- **E-commerce:** $5.600/menit (rata-rata)
- **Financial services:** $9.000+/menit
- **Healthcare:** $8.000+/menit
- **Brand damage:** tidak terukur tapi berkelanjutan

Dengan deployment 2-3x per hari, teknik zero-downtime bukan luxuri tetapi kebutuhan.

## Blue-Green Deployment

Dua environment identik: Blue (production saat ini) dan Green (versi baru):

\`\`\`
Traffic ──→ Load Balancer ──→ Blue (v1.0) ← ACTIVE
                              Green (v1.1) ← IDLE

// Setelah verifikasi Green
Traffic ──→ Load Balancer ──→ Blue (v1.0) ← IDLE
                              Green (v1.1) ← ACTIVE
\`\`\`

**Kelebihan:**
- Rollback instan — switch kembali ke Blue
- Full testing di environment production-like sebelum cutover
- Confidence tinggi

**Kekurangan:**
- Butuh 2x infrastructure (sementara)
- Database schema harus compatible antara kedua versi

## Canary Deployment

Roll out versi baru ke subset kecil traffic dulu:

\`\`\`
Fase 1: 5% traffic → v1.1, 95% → v1.0
Fase 2: 25% traffic → v1.1, 75% → v1.0
Fase 3: 50% traffic → v1.1, 50% → v1.0
Fase 4: 100% traffic → v1.1
\`\`\`

Monitoring di setiap fase: error rate, latency, user complaints. Jika ada masalah di fase manapun, rollback langsung.

**Kelebihan:**
- Risiko minimal — masalah terdeteksi di subset kecil
- Real traffic testing
- Gradual confidence building

**Kekurangan:**
- Memerlukan sophisticated routing (Kubernetes, Istio)
- Dua versi berjalan bersamaan — harus compatible

## Rolling Update

Update instance satu per satu:

\`\`\`
Instance 1: v1.0 → v1.1 (update)
Instance 2: v1.0 (masih serving traffic)
Instance 3: v1.0 (masih serving traffic)

Instance 1: v1.1 (ready, serving)
Instance 2: v1.0 → v1.1 (update)
Instance 3: v1.0 (masih serving)

...dst
\`\`\`

**Kubernetes rolling update:**
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: app
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
\`\`\`

## Database Migration Strategies

Database migration adalah bagian tersulit dari zero-downtime deployment:

**Aturan emas: Backward compatibility**

Migrasi harus compatible dengan versi aplikasi lama DAN baru.

**Menambah kolom:**
\`\`\`sql
-- Safe: kolom baru nullable atau dengan default
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
\`\`\`

**Menghapus kolom (3 fase):**
1. Deploy v1.1: stop reading column, stop writing column
2. Deploy v1.2: drop column dari database
3. Jeda minimal 1 deployment cycle antara fase

**Rename kolom (4 fase):**
1. Add kolom baru
2. Dual write (tulis ke lama dan baru)
3. Migrate data, switch reads ke kolom baru
4. Drop kolom lama

## Health Checks dan Readiness Probes

Jangan route traffic ke instance yang belum siap:

- **Liveness probe** — "apakah instance masih hidup?" Restart jika gagal.
- **Readiness probe** — "apakah instance siap menerima traffic?" Remove dari rotation jika gagal.
- **Startup probe** — grace period untuk aplikasi yang butuh waktu warm up

## Graceful Shutdown

Saat instance di-terminate, harus menyelesaikan request yang sedang diproses:

\`\`\`typescript
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await database.disconnect();
    await redis.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 30000);
});
\`\`\`

## Checklist Deployment

Sebelum setiap deployment:
- Feature flags untuk fitur baru yang bisa di-toggle
- Database migration backward compatible
- Health checks configured
- Rollback plan documented
- Monitoring dashboards ready
- On-call engineer aware

Zero-downtime deployment memerlukan disiplin dan tooling yang tepat, tetapi investasinya sebanding dengan kepercayaan user dan bisnis yang tidak terganggu.`,
    coverUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=1200&h=630&fit=crop',
    categorySlug: 'system-design',
    tags: ['Deployment', 'Zero Downtime', 'DevOps', 'Kubernetes', 'System Design'],
    readTime: '13 min',
    views: 5670,
    featured: true,
    publishedAt: '2024-12-28',
    metaTitle: 'Zero Downtime Deployment — Blue-Green, Canary, dan Rolling Updates',
    metaDescription: 'Teknik zero-downtime: blue-green, canary, rolling updates, database migration strategies, dan rollback procedures.',
  },
  {
    title: 'Load Balancing Strategies untuk Aplikasi High-Traffic',
    slug: 'load-balancing-strategies-high-traffic',
    excerpt: 'Memahami load balancing: L4 vs L7, algoritma distribusi, health checks, session affinity, dan multi-tier balancing untuk traffic berskala besar.',
    content: `Load balancer adalah komponen kritis yang mendistribusikan traffic ke multiple backend servers, memastikan reliability dan performa yang konsisten. Tanpa load balancing, single server menjadi point of failure dan bottleneck.

## L4 vs L7 Load Balancing

**Layer 4 (Transport Layer):**
- Routing berdasarkan IP address dan TCP/UDP port
- Tidak memahami content HTTP
- Sangat cepat (hardware-level)
- Tidak bisa routing berdasarkan URL path atau headers

**Layer 7 (Application Layer):**
- Routing berdasarkan HTTP content: URL path, headers, cookies
- Bisa melakukan content-based routing: /api → backend servers, /static → CDN
- SSL termination
- Sedikit lebih lambat tapi jauh lebih fleksibel

Dalam praktik, gunakan keduanya: L4 di depan untuk distribusi awal, L7 di belakang untuk intelligent routing.

## Algoritma Distribusi

### Round Robin

Distribusi request secara bergiliran: server 1, 2, 3, 1, 2, 3, ...

Kelebihan: Sederhana, distribusi merata jika semua server identik.
Kekurangan: Tidak mempertimbangkan beban server saat ini.

### Weighted Round Robin

Memberikan bobot berdasarkan kapasitas server:

\`\`\`
Server A (weight 3): menerima 3 dari 6 requests
Server B (weight 2): menerima 2 dari 6 requests
Server C (weight 1): menerima 1 dari 6 requests
\`\`\`

Cocok ketika servers memiliki spesifikasi hardware yang berbeda.

### Least Connections

Mengarahkan request ke server dengan koneksi aktif paling sedikit. Ideal untuk request yang memiliki processing time bervariasi.

### IP Hash

Hash dari client IP menentukan server tujuan. Client yang sama selalu diarahkan ke server yang sama — berguna untuk session affinity.

### Least Response Time

Mengarahkan ke server dengan response time terkecil dan koneksi aktif paling sedikit. Paling intelligent, tapi memerlukan monitoring real-time.

## Health Checks

Load balancer harus mengetahui server mana yang healthy:

\`\`\`nginx
upstream backend {
    server app1:3000;
    server app2:3000;
    server app3:3000;

    # Health check setiap 10 detik
    # 3 failures → mark unhealthy
    # 2 successes → mark healthy
}
\`\`\`

**Active health checks:** Load balancer mengirim probe berkala ke setiap server.

**Passive health checks:** Mendeteksi failures dari actual traffic (timeout, 5xx responses).

Kombinasi keduanya memberikan detection yang cepat dan akurat.

## Session Affinity (Sticky Sessions)

Beberapa aplikasi memerlukan request dari user yang sama selalu ke server yang sama:

**Kapan dibutuhkan:**
- WebSocket connections
- In-memory sessions (meskipun sebaiknya dihindari)
- Stateful processing

**Implementasi:**
- Cookie-based: insert cookie yang mengidentifikasi server
- IP-based: hash client IP
- Header-based: custom header dari application

> **Best practice:** Hindari kebutuhan session affinity dengan membuat aplikasi stateless. Gunakan Redis untuk shared state.

## Multi-Tier Load Balancing

Untuk traffic sangat besar, gunakan multiple tiers:

\`\`\`
DNS Round Robin
    │
    ├─── L4 Load Balancer (Region A)
    │       ├─── L7 LB → App Servers Cluster A
    │       └─── L7 LB → App Servers Cluster B
    │
    └─── L4 Load Balancer (Region B)
            ├─── L7 LB → App Servers Cluster C
            └─── L7 LB → App Servers Cluster D
\`\`\`

## SSL/TLS Termination

Decrypt HTTPS di load balancer level, forward HTTP ke backend servers:

- Mengurangi beban CPU di application servers
- Certificate management terpusat
- Backend servers tidak perlu handle SSL

## Cloud Load Balancers

**AWS:**
- ALB (Application Load Balancer) — L7, feature-rich
- NLB (Network Load Balancer) — L4, ultra-low latency
- GLB (Gateway Load Balancer) — untuk appliances

**GCP:**
- Cloud Load Balancing — global, anycast IP
- Internal Load Balancing — untuk traffic internal

## Monitoring

Metrik load balancer yang wajib dimonitor:
- Active connections per backend
- Request rate per backend
- Error rate (4xx, 5xx) per backend
- Latency distribution per backend
- Health check status

Dashboard load balancer memberikan overview kesehatan seluruh system dan membantu identify masalah sebelum berdampak ke user.`,
    coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop',
    categorySlug: 'system-design',
    tags: ['Load Balancing', 'NGINX', 'Infrastructure', 'System Design', 'High Traffic'],
    readTime: '12 min',
    views: 4350,
    featured: false,
    publishedAt: '2025-01-20',
    metaTitle: 'Load Balancing Strategies — L4 vs L7, Algorithms, dan Multi-Tier',
    metaDescription: 'Load balancing: L4 vs L7, round robin, least connections, health checks, session affinity, dan multi-tier architecture.',
  },
  {
    title: 'Disaster Recovery Planning untuk Cloud Infrastructure',
    slug: 'disaster-recovery-planning-cloud-infrastructure',
    excerpt: 'Merancang strategi disaster recovery: RTO/RPO, backup strategies, multi-region failover, dan regular DR testing untuk cloud infrastructure.',
    content: `Disaster recovery bukan pertanyaan "apakah bencana akan terjadi" — tetapi "kapan." Region outage, data corruption, dan human error sudah pasti akan terjadi suatu saat. Yang menentukan apakah bisnis survive adalah seberapa siap disaster recovery plan-nya.

## Memahami RTO dan RPO

Dua metrik fundamental disaster recovery:

**RPO (Recovery Point Objective):** Berapa banyak data yang boleh hilang? Jika RPO = 1 jam, backup setiap jam sudah cukup. Jika RPO = 0, butuh synchronous replication.

**RTO (Recovery Time Objective):** Berapa lama downtime yang bisa diterima? RTO 4 jam berarti sistem harus kembali online dalam 4 jam setelah disaster.

**Target berdasarkan tier:**

| Tier | RPO | RTO | Strategi |
|------|-----|-----|----------|
| Mission Critical | 0-1 menit | < 15 menit | Multi-region active-active |
| Business Critical | < 1 jam | < 1 jam | Multi-region warm standby |
| Important | < 4 jam | < 4 jam | Cross-region backup + restore |
| Non-Critical | < 24 jam | < 24 jam | Single region backup |

## Backup Strategies

### Database Backup

**Continuous backup (point-in-time recovery):**
- PostgreSQL WAL archiving — continuous, RPO mendekati 0
- Neon database branching — instant database snapshots
- RDS automated backups — configurable retention

**Periodic snapshots:**
\`\`\`bash
# Automated daily backup
pg_dump -Fc mydb > backup_$(date +%Y%m%d).dump

# Verify backup integrity
pg_restore --list backup_20250228.dump
\`\`\`

### Application Backup

- **Infrastructure as Code** — Terraform/Pulumi state di remote backend
- **Container images** — versioned di registry (ECR, GCR)
- **Configuration** — secrets di Vault/AWS Secrets Manager
- **Code** — Git dengan mirrors di multiple locations

## Multi-Region Architecture

### Warm Standby

Primary region menangani semua traffic. Secondary region menerima data replication tapi idle:

\`\`\`
Region A (Primary): App Servers + Primary DB
         │
         └──── Async Replication ────→ Region B (Standby): Standby DB

Saat disaster Region A:
DNS failover → Route traffic ke Region B
Promote Standby DB ke Primary
Start App Servers di Region B
\`\`\`

**Failover time:** 15-30 menit (database promotion + DNS propagation).

### Active-Active

Kedua region menangani traffic secara bersamaan:

\`\`\`
Region A ←──→ Global LB ←──→ Region B
   │                              │
   └───── Data Sync ──────────────┘
\`\`\`

**Kelebihan:** Failover instan, no downtime.
**Komplikasi:** Data consistency antar region, conflict resolution.

## Automated Failover

Manual failover tidak reliable (manusia panik, proses lambat). Automate:

- **Health checking** — monitoring mendeteksi region failure
- **DNS failover** — Route53 health-based routing
- **Database promotion** — automated primary promotion
- **Application scaling** — auto-scaling di standby region

\`\`\`yaml
# Route53 Health Check
Health Check:
  Type: HTTPS
  Endpoint: https://api.example.com/health
  FailureThreshold: 3
  RequestInterval: 10

Routing Policy:
  Type: Failover
  Primary: Region A
  Secondary: Region B
\`\`\`

## DR Testing: Game Days

DR plan yang tidak di-test adalah asumsi, bukan plan. Regular testing:

**Tabletop exercise (bulanan):**
- Simulasikan skenario disaster secara diskusi
- Review runbook dan communication plan
- Identifikasi gaps tanpa actual failover

**Partial failover test (kuartal):**
- Failover satu komponen (database, satu service)
- Verifikasi automated procedures
- Measure actual RTO

**Full DR test (tahunan):**
- Complete region failover
- Operate dari DR site selama beberapa jam
- Verifikasi semua services berfungsi
- Failback ke primary

> **Netflix Chaos Engineering:** Mereka secara rutin mematikan services di production untuk memastikan sistem resilient. Ini extreme, tapi prinsipnya benar — test in production.

## Communication Plan

Saat disaster, komunikasi sama pentingnya dengan technical recovery:

- **Internal:** Alert on-call engineer, incident commander, stakeholders
- **Status page:** Update publik untuk user (statuspage.io, Atlassian Statuspage)
- **Customer notification:** Email/SMS jika downtime signifikan
- **Post-mortem:** Dokumen setelah incident untuk learning

## Cost Optimization

DR tidak harus mahal:

- **Warm standby** dengan minimal instances saat tidak ada disaster
- **Serverless** untuk DR components — bayar hanya saat failover
- **Tiered approach** — hanya critical systems yang mendapat hot standby
- **Neon branching** — database snapshots yang efisien tanpa full replication

Disaster Recovery Planning adalah asuransi. Kamu berharap tidak pernah membutuhkannya, tapi ketika bencana datang, investasinya tidak ternilai.`,
    coverUrl: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=1200&h=630&fit=crop',
    categorySlug: 'system-design',
    tags: ['Disaster Recovery', 'Cloud', 'Infrastructure', 'System Design', 'DevOps'],
    readTime: '14 min',
    views: 3890,
    featured: false,
    publishedAt: '2025-02-08',
    metaTitle: 'Disaster Recovery Cloud — RTO/RPO, Multi-Region, dan DR Testing',
    metaDescription: 'DR planning: RTO/RPO, backup strategies, multi-region failover, automated recovery, Game Days, dan cost optimization.',
  },
];
