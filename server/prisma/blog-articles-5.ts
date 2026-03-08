import { BlogArticle } from './blog-articles-1';

export const articles: BlogArticle[] = [
  {
    title: 'CI/CD Pipeline Modern dengan GitHub Actions',
    slug: 'cicd-pipeline-modern-github-actions',
    excerpt: 'Membangun CI/CD pipeline yang robust menggunakan GitHub Actions: automated testing, Docker build, staging deployment, dan production release strategies.',
    content: `CI/CD pipeline yang baik memberikan confidence bahwa setiap perubahan kode yang di-merge telah diuji dan siap deploy. GitHub Actions menjadi pilihan populer karena terintegrasi langsung dengan repository tanpa setup infrastructure terpisah.

## Anatomy of a Good CI/CD Pipeline

Pipeline yang production-ready terdiri dari beberapa tahap:

**CI (Continuous Integration):**
1. Code checkout
2. Dependency installation (with caching)
3. Linting dan code formatting
4. Unit tests
5. Integration tests
6. Build verification
7. Security scanning

**CD (Continuous Deployment):**
1. Docker image build dan push
2. Staging deployment
3. Smoke tests di staging
4. Production deployment (manual approval)
5. Post-deployment verification

## Workflow Configuration

\`\`\`yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test -- --coverage

      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging..."
\`\`\`

## Caching Strategy

Caching dependency installation mengurangi CI time secara signifikan:

- **npm cache** — GitHub Actions built-in caching
- **Docker layer cache** — GitHub Actions cache backend (type=gha)
- **Build artifacts** — cache compiled assets antar jobs

Tanpa caching: 8 menit. Dengan caching: 2 menit. Hemat 75% waktu.

## Testing Strategy dalam CI

**Parallelisasi test:**
\`\`\`yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=\${{ matrix.shard }}/4
\`\`\`

Membagi test suite ke 4 parallel jobs mengurangi test time dari 12 menit ke 3 menit.

## Security Scanning

Integrasikan security scanning otomatis:

- **Dependency scanning** — npm audit, Snyk, atau Dependabot
- **Container scanning** — Trivy untuk Docker image vulnerabilities
- **Secret scanning** — detect credentials yang ter-commit
- **SAST** — static analysis untuk security vulnerabilities

## Environment Management

Gunakan GitHub Environments untuk kontrol deployment:

\`\`\`yaml
deploy-production:
  environment:
    name: production
    url: https://api.example.com
  steps:
    - name: Deploy
      run: echo "Deploying to production..."
\`\`\`

Environments bisa dikonfigurasi dengan:
- Required reviewers (manual approval sebelum production deploy)
- Wait timer (mandatory delay sebelum deploy)
- Deployment branches (hanya main bisa deploy ke production)

## Monitoring Post-Deployment

Setelah deployment, verifikasi otomatis:

\`\`\`yaml
post-deploy-check:
  needs: deploy-production
  steps:
    - name: Health check
      run: |
        for i in {1..10}; do
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health)
          if [ "$STATUS" = "200" ]; then exit 0; fi
          sleep 5
        done
        exit 1

    - name: Smoke tests
      run: npx playwright test tests/smoke/
\`\`\`

## Rollback Strategy

Jika post-deployment checks gagal:

- Automated rollback ke versi sebelumnya
- Alert ke engineering team
- Incident channel otomatis dibuat

CI/CD pipeline yang mature memberikan kecepatan tanpa mengorbankan keamanan. Deploy dengan confidence, rollback dengan kecepatan.`,
    coverUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&h=630&fit=crop',
    categorySlug: 'devops',
    tags: ['CI/CD', 'GitHub Actions', 'DevOps', 'Docker', 'Automation'],
    readTime: '12 min',
    views: 6890,
    featured: true,
    publishedAt: '2025-02-20',
    metaTitle: 'CI/CD Pipeline GitHub Actions — Setup Lengkap Production-Ready',
    metaDescription: 'Membangun CI/CD pipeline: GitHub Actions, Docker build, caching, testing parallelization, security scanning, dan deployment.',
  },
  {
    title: 'Kubernetes untuk Developer: Konsep Fundamental',
    slug: 'kubernetes-developer-konsep-fundamental',
    excerpt: 'Panduan Kubernetes dari perspektif developer: Pods, Services, Deployments, ConfigMaps, dan debugging. Fokus pada apa yang perlu developer ketahui.',
    content: `Kubernetes bisa terasa overwhelming. Dokumentasinya massive, konsepnya banyak, dan terminologinya asing. Artikel ini fokus pada konsep yang developer benar-benar butuhkan sehari-hari — tanpa deep dive ke infrastructure.

## Kenapa Developer Perlu Memahami Kubernetes?

Meskipun tim DevOps mengelola cluster, developer perlu memahami Kubernetes untuk:

- **Debugging** — memahami mengapa aplikasi crash atau slow
- **Configuration** — mengatur environment variables dan secrets
- **Scaling** — memahami bagaimana aplikasi di-scale
- **Logging** — menemukan dan membaca logs

## Pod: Unit Terkecil

Pod adalah satu atau lebih container yang berjalan bersama. Biasanya satu Pod = satu container aplikasi.

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
  - name: app
    image: my-app:1.0.0
    ports:
    - containerPort: 3000
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
\`\`\`

**Resource requests** = minimum yang dijamin. **Limits** = maximum yang diizinkan. Selalu set keduanya — Pod tanpa limits bisa menghabiskan resource node.

## Deployment: Mengelola Pods

Deployment mengelola replicas Pods — buat, update, dan rollback:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:1.0.0
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
\`\`\`

> **Liveness Probe** vs **Readiness Probe:** Liveness menjawab "apakah container masih berjalan?" (restart jika gagal). Readiness menjawab "apakah siap menerima traffic?" (remove dari service jika gagal).

## Service: Network Abstraction

Service memberi stable IP dan DNS name untuk group Pods. Pods bisa datang dan pergi, Service tetap stabil:

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
\`\`\`

Pod lain bisa mengakses via \`http://my-app-service:80\`.

## ConfigMaps dan Secrets

**ConfigMap** untuk konfigurasi non-sensitif:
\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  API_URL: "https://api.example.com"
\`\`\`

**Secret** untuk data sensitif (base64 encoded, idealnya dikelola external secrets manager):
\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  DATABASE_URL: cG9zdGdyZXM6Ly8uLi4=
  JWT_SECRET: bXlfc2VjcmV0X2tleQ==
\`\`\`

## HPA: Horizontal Pod Autoscaler

Auto-scaling berdasarkan metrik:

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
\`\`\`

Ketika CPU utilization melebihi 70%, Kubernetes menambah Pods secara otomatis.

## Debugging untuk Developer

Perintah yang developer paling sering gunakan:

\`\`\`bash
# Lihat status pods
kubectl get pods -l app=my-app

# Lihat logs
kubectl logs -f deployment/my-app

# Masuk ke container
kubectl exec -it pod/my-app-xxx -- /bin/sh

# Describe pod (events, errors)
kubectl describe pod my-app-xxx

# Port forwarding untuk akses lokal
kubectl port-forward svc/my-app-service 3000:80
\`\`\`

## Common Issues dan Solusinya

- **CrashLoopBackOff** — container crash berulang. Cek logs: \`kubectl logs pod-name --previous\`
- **ImagePullBackOff** — gagal pull image. Cek image name, registry auth
- **Pending** — Pod tidak bisa di-schedule. Cek resource availability
- **OOMKilled** — memory limit exceeded. Tingkatkan memory limit atau optimasi aplikasi

Kubernetes memberikan power scaling dan reliability, tapi developer tidak perlu memahami setiap detail. Fokus pada konsep yang langsung berpengaruh ke development dan debugging sehari-hari.`,
    coverUrl: 'https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=1200&h=630&fit=crop',
    categorySlug: 'devops',
    tags: ['Kubernetes', 'Docker', 'DevOps', 'Infrastructure', 'Cloud'],
    readTime: '13 min',
    views: 5340,
    featured: false,
    publishedAt: '2025-01-25',
    metaTitle: 'Kubernetes untuk Developer — Konsep yang Perlu Diketahui',
    metaDescription: 'Panduan Kubernetes developer: Pods, Deployments, Services, ConfigMaps, HPA, dan debugging techniques.',
  },
  {
    title: 'Observability Stack: Logs, Metrics, dan Traces',
    slug: 'observability-stack-logs-metrics-traces',
    excerpt: 'Membangun observability yang komprehensif: structured logging, Prometheus metrics, distributed tracing dengan OpenTelemetry, dan alerting yang actionable.',
    content: `Observability adalah kemampuan memahami internal state sistem dari external outputs. Tanpa observability, debugging production issues menjadi tebak-tebakan. Tiga pilar observability — logs, metrics, dan traces — masing-masing menjawab pertanyaan berbeda.

## Tiga Pilar Observability

**Logs** menjawab: Apa yang terjadi?
**Metrics** menjawab: Seberapa baik/buruknya?
**Traces** menjawab: Di mana bottleneck terjadi?

Ketiganya saling melengkapi. Metrics mendeteksi masalah, logs memberikan detail, traces menunjukkan root cause di mana dalam request chain masalah terjadi.

## Pilar 1: Structured Logging

Log yang baik adalah log yang machine-readable DAN human-readable:

\`\`\`typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Structured log
logger.info({
  event: 'order_created',
  orderId: 'ord_123',
  userId: 'usr_456',
  amount: 1500000,
  itemCount: 3,
  duration: 234,
}, 'Order created successfully');
\`\`\`

Output JSON yang bisa di-parse oleh log aggregation tools:
\`\`\`json
{
  "level": "info",
  "time": "2025-02-15T10:30:00.000Z",
  "event": "order_created",
  "orderId": "ord_123",
  "userId": "usr_456",
  "amount": 1500000,
  "duration": 234,
  "msg": "Order created successfully"
}
\`\`\`

**Log levels yang tepat:**
- **error** — something failed yang membutuhkan attention
- **warn** — unusual tapi dihandle, bisa menjadi masalah di masa depan
- **info** — significant business events (order created, user registered)
- **debug** — detail teknis untuk troubleshooting

> **Jangan log sensitive data:** PII, passwords, token, credit card numbers. Sanitize sebelum logging.

## Pilar 2: Metrics dengan Prometheus

Metrics adalah numerical measurements yang di-aggregate over time:

\`\`\`typescript
import promClient from 'prom-client';

// Counter - hanya naik (request count, errors)
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

// Histogram - distribusi values (latency)
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Gauge - naik dan turun (current connections)
const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});
\`\`\`

**RED Method untuk service metrics:**
- **Rate** — request per second
- **Errors** — error rate percentage
- **Duration** — latency distribution (P50, P95, P99)

## Pilar 3: Distributed Tracing

Tracing mengikuti satu request melintasi multiple services:

\`\`\`
[API Gateway] ──→ [User Service] ──→ [Database]
     │
     └──→ [Order Service] ──→ [Payment Gateway]
                │
                └──→ [Notification Service] ──→ [Email Provider]
\`\`\`

Setiap segment disebut **span**. Kumpulan spans dari satu request membentuk **trace**.

**OpenTelemetry setup:**
\`\`\`typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'order-service',
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
\`\`\`

OpenTelemetry auto-instrumentations secara otomatis menambahkan tracing untuk HTTP requests, database queries, dan message queue operations.

## Grafana Dashboard

Visualisasi yang efektif:

**Service Health Dashboard:**
- Request rate (realtime)
- Error rate percentage
- P95 latency
- Active instances

**Business Metrics Dashboard:**
- Orders per minute
- Revenue per hour
- Active users
- Conversion funnel

## Alerting yang Actionable

Alert yang baik:
- **Specific** — apa yang terjadi dan informasi yang cukup untuk diagnosa
- **Actionable** — penerima tahu apa yang harus dilakukan
- **Relevant** — dikirim ke orang yang tepat
- **Timely** — terdeteksi dalam hitungan menit

**Anti-patterns alerting:**
- Alert untuk setiap error — alert fatigue
- Alert tanpa konteks — "CPU high" tanpa menunjukkan di mana
- Too many alerts — tim mengabaikan semua alert

Rule of thumb: jika alert tidak memerlukan immediate action, itu seharusnya dashboard metric, bukan alert.

Observability yang comprehensive memungkinkan tim menemukan dan memperbaiki masalah production dalam hitungan menit, bukan jam. Investasinya selalu worth it.`,
    coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    categorySlug: 'devops',
    tags: ['Observability', 'Monitoring', 'Prometheus', 'Grafana', 'OpenTelemetry'],
    readTime: '13 min',
    views: 4120,
    featured: false,
    publishedAt: '2025-01-10',
    metaTitle: 'Observability — Logs, Metrics, Traces dengan OpenTelemetry',
    metaDescription: 'Observability stack: structured logging, Prometheus metrics, distributed tracing, Grafana dashboards, dan actionable alerting.',
  },
  {
    title: 'Infrastructure as Code dengan Terraform',
    slug: 'infrastructure-as-code-terraform',
    excerpt: 'Mengelola cloud infrastructure menggunakan Terraform: provider setup, state management, modules, dan best practices untuk tim.',
    content: `Infrastructure as Code mengubah infrastructure management dari proses manual yang rawan error menjadi kode yang versioned, reviewable, dan reproducible. Terraform dari HashiCorp menjadi standar de facto karena mendukung multi-cloud dan ekosistem module yang kaya.

## Mengapa Infrastructure as Code?

**Tanpa IaC:** "Klik ini, isi form itu, pastikan checkbox ini tercentang..." — proses dokumentasinya lebih panjang dari eksekusinya, dan tetap rawan human error.

**Dengan IaC:** Semua infrastructure didefinisikan dalam kode. Reproducible, reviewable, dan auditable.

## Terraform Fundamentals

### Provider

Provider menghubungkan Terraform ke cloud platform:

\`\`\`hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"  # Singapore
}
\`\`\`

### Resources

Resource mendefinisikan infrastructure actual:

\`\`\`hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "main-vpc" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-southeast-1a"
  map_public_ip_on_launch = true
  tags = { Name = "public-subnet" }
}
\`\`\`

### Variables dan Outputs

\`\`\`hcl
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "staging"
}

variable "instance_count" {
  description = "Number of app instances"
  type        = number
  default     = 2
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the VPC"
}
\`\`\`

## State Management

Terraform state menyimpan mapping antara kode dan resource actual:

\`\`\`hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
\`\`\`

**Best practices state:**
- **Remote backend** — S3, GCS, atau Terraform Cloud. Jangan commit state ke Git!
- **State locking** — DynamoDB untuk mencegah concurrent modifications
- **Encryption** — encrypt state at rest karena berisi sensitive data
- **Per-environment state** — separate state files untuk staging dan production

## Modules: Reusable Components

Modules mengenkapsulasi infrastructure patterns yang reusable:

\`\`\`hcl
# modules/ecs-service/main.tf
variable "service_name" { type = string }
variable "image" { type = string }
variable "cpu" { type = number }
variable "memory" { type = number }

resource "aws_ecs_task_definition" "app" {
  family = var.service_name
  container_definitions = jsonencode([{
    name  = var.service_name
    image = var.image
    cpu   = var.cpu
    memory = var.memory
  }])
}

# Usage
module "api_service" {
  source       = "./modules/ecs-service"
  service_name = "api"
  image        = "my-api:1.0.0"
  cpu          = 256
  memory       = 512
}
\`\`\`

## Workflow untuk Tim

### Plan → Review → Apply

\`\`\`bash
# Developer membuat perubahan
terraform plan -out=tfplan

# Plan di-review di Pull Request
# Gunakan atlantis atau spacelift untuk automated plan di PR

# Setelah approved, apply
terraform apply tfplan
\`\`\`

> **Aturan emas:** Tidak ada yang apply tanpa review. Manual apply ke production tanpa PR review adalah resep bencana.

### Environment Separation

\`\`\`
infrastructure/
├── modules/              # Shared reusable modules
│   ├── vpc/
│   ├── ecs/
│   └── rds/
├── environments/
│   ├── staging/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       └── terraform.tfvars
\`\`\`

## Security Best Practices

- **Least privilege** — IAM role Terraform hanya punya permission yang dibutuhkan
- **No hardcoded secrets** — gunakan variables atau AWS Secrets Manager
- **Policy as Code** — Sentinel atau OPA untuk enforce constraints
- **Drift detection** — periodic plan untuk detect manual changes

## Common Pitfalls

- **Editing resources manually** di console — menyebabkan state drift
- **Monolithic state** — satu state file untuk semua infrastructure. Pecah per service/environment
- **Ignoring plan output** — selalu review plan sebelum apply, terutama destroy operations
- **Missing lifecycle blocks** — \`prevent_destroy = true\` untuk resources yang tidak boleh dihapus accidental

Terraform memberikan repeatable, safe, dan auditable infrastructure management. Investasi setup awal menghemat banyak waktu dan mengurangi risiko di kemudian hari.`,
    coverUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=630&fit=crop',
    categorySlug: 'devops',
    tags: ['Terraform', 'IaC', 'AWS', 'DevOps', 'Cloud Infrastructure'],
    readTime: '14 min',
    views: 4560,
    featured: false,
    publishedAt: '2024-12-05',
    metaTitle: 'Infrastructure as Code Terraform — Best Practices untuk Tim',
    metaDescription: 'Terraform: provider setup, state management, modules, environment separation, security, dan workflow untuk tim.',
  },
  {
    title: 'Roadmap Menjadi Fullstack Developer di 2025',
    slug: 'roadmap-fullstack-developer-2025',
    excerpt: 'Panduan learning path terstruktur untuk menjadi fullstack developer: fondasi, frontend, backend, DevOps, dan AI integration. Dengan timeline realistis.',
    content: `Menjadi fullstack developer di 2025 lebih menantang sekaligus lebih rewarding dibanding sebelumnya. Landscape berubah cepat, tapi fondasi yang solid tetap sama. Artikel ini memberikan roadmap pragmatis berdasarkan demand pasar dan pengalaman hiring.

## Fase 1: Fondasi (Bulan 1-3)

### Web Fundamentals

Jangan skip fondasi. Developer yang kuat di fundamental belajar framework lebih cepat:

- **HTML** — semantic markup, accessibility, SEO basics
- **CSS** — Flexbox, Grid, responsive design, animations
- **JavaScript** — ES6+, async/await, closures, prototypes, DOM manipulation
- **TypeScript** — types, interfaces, generics. Ini bukan opsional lagi di 2025.

### Computer Science Basics

- **Data structures** — array, linked list, hash map, tree, graph
- **Algorithms** — sorting, searching, recursion, dynamic programming basics
- **HTTP** — methods, status codes, headers, request/response cycle
- **Git** — branching, merging, rebasing, resolving conflicts

> Fase ini membosankan tapi critical. Setiap jam yang diinvestasikan di fondasi menghemat puluhan jam kebingungan di kemudian hari.

## Fase 2: Frontend (Bulan 4-6)

### React Ecosystem

React masih dominan di 2025. Core skills yang dibutuhkan:

- **React fundamentals** — components, props, state, hooks, context
- **React 19** — Server Components, Server Actions
- **Next.js** — routing, SSR/SSG, API routes, middleware
- **State management** — Zustand atau TanStack Query
- **Styling** — Tailwind CSS (de facto standard)
- **Testing** — Vitest untuk unit tests, Playwright untuk E2E

### Proyek: Bangun Portfolio Website

Implementasikan semua yang dipelajari. Portfolio website sekaligus menjadi bukti skill.

## Fase 3: Backend (Bulan 7-9)

### Node.js + Express/Fastify

- **REST API design** — CRUD, pagination, filtering, error handling
- **Authentication** — JWT, OAuth 2.0, session management
- **Database** — PostgreSQL, Prisma ORM, migration management
- **Validation** — Zod untuk input validation
- **Testing** — Jest/Vitest untuk API testing

### Proyek: Bangun Full API

API lengkap dengan auth, RBAC, file upload, dan deployment. Ini menjadi portfolio piece kedua.

## Fase 4: Advanced Skills (Bulan 10-12)

### DevOps Essentials

- **Docker** — containerization, multi-stage builds
- **CI/CD** — GitHub Actions pipeline
- **Cloud basics** — AWS/GCP — satu cloud provider cukup
- **Monitoring** — logs, metrics, basic alerting

### AI Integration

Skill yang membedakan di 2025:

- **OpenAI API/LangChain** — mengintegrasikan LLM ke aplikasi
- **RAG** — menghubungkan AI dengan data proprietary
- **Prompt engineering** — membuat AI features yang reliable

## Timeline Realistis

| Bulan | Fokus | Milestone |
|-------|-------|-----------|
| 1-3 | Fondasi | Bisa buat website statis responsif |
| 4-6 | Frontend | Bisa buat SPA dengan React/Next.js |
| 7-9 | Backend | Bisa buat REST API lengkap |
| 10-12 | Advanced | Bisa deploy fullstack app ke production |

## Strategi Belajar yang Efektif

**1. Project-based learning**
Belajar teori minimal, langsung bangun sesuatu. Kembali ke teori saat stuck.

**2. Fokus deep, bukan wide**
Kuasai satu stack dulu (React + Node). Jangan sekaligus belajar React, Vue, Angular, Svelte.

**3. Build in public**
Share progres di Twitter/LinkedIn. Ini membangun network dan accountability.

**4. Contribute to open source**
Mulai dari fix documentation, lalu small bugs, lalu features. Ini pengalaman kerja tim yang invaluable.

**5. Jangan perfeksionis**
Ship imperfect projects. Belajar dari feedback. Iterasi. Perfect is the enemy of done.

## Skill yang Overrated vs Underrated

**Overrated:**
- Menghafal leetcode solutions tanpa memahami patterns
- Belajar 5 framework sekaligus
- Mengikuti setiap tech trend baru

**Underrated:**
- Clear communication dan technical writing
- Debugging skill — membaca error messages, using dev tools
- Understanding system design basics
- Kemampuan belajar mandiri dari dokumentasi

## Salary Expectations (Indonesia)

| Level | Remote (IDR) | Jakarta (IDR) |
|-------|-------------|---------------|
| Junior (0-2 tahun) | 5-10 juta | 7-15 juta |
| Mid (2-5 tahun) | 15-30 juta | 15-25 juta |
| Senior (5+ tahun) | 30-60 juta+ | 25-45 juta |

Remote opportunities, terutama dari perusahaan luar negeri, bisa beberapa kali lipat angka ini.

Roadmap ini bukan satu-satunya jalan, tetapi pendekatan yang proven berdasarkan pengalaman di komunitas developer Indonesia.`,
    coverUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop',
    categorySlug: 'career',
    tags: ['Career', 'Fullstack', 'Learning Path', 'Roadmap', 'Developer'],
    readTime: '11 min',
    views: 12430,
    featured: true,
    publishedAt: '2025-02-24',
    metaTitle: 'Roadmap Fullstack Developer 2025 — Panduan Career Lengkap',
    metaDescription: 'Learning path fullstack developer 2025: fondasi, React, Node.js, DevOps, AI integration, timeline realistis, dan salary expectations.',
  },
  {
    title: 'Menulis Technical Documentation yang Efektif',
    slug: 'menulis-technical-documentation-efektif',
    excerpt: 'Skill yang sering diabaikan developer tapi sangat berdampak: menulis README, API docs, architecture decision records, dan internal documentation.',
    content: `Developer hebat yang tidak bisa mendokumentasikan karyanya memberikan impact yang terbatas. Documentation bukan biaya tambahan — itu multiplier untuk seluruh tim. Artikel ini membahas teknik menulis dokumentasi yang benar-benar dibaca dan berguna.

## Mengapa Documentation Penting?

Bayangkan skenario ini:

- Developer baru join tim dan butuh 3 bulan untuk produktif karena tidak ada dokumentasi
- Bug muncul di sistem yang ditulis developer yang sudah resign, tidak ada yang tahu logikanya
- Dua tim membangun solusi yang sama karena tidak tahu solusi sudah ada

Semua masalah ini bisa dicegah (atau sangat dikurangi) dengan dokumentasi yang baik.

## README.md: First Impression

README adalah halaman depan proyek. Developer membentuk opini dalam 30 detik pertama:

\`\`\`markdown
# Project Name

One-line description yang menjelaskan apa dan untuk siapa.

## Quick Start

3-5 langkah untuk menjalankan proyek dari nol:

1. Clone repository
2. Install dependencies: \\\`npm install\\\`
3. Setup environment: \\\`cp .env.example .env\\\`
4. Start development: \\\`npm run dev\\\`
5. Open http://localhost:3000

## Tech Stack

- Frontend: React 19, Next.js 15, Tailwind CSS
- Backend: Node.js, Express, Prisma
- Database: PostgreSQL

## Architecture

Brief overview + link ke architecture doc untuk detail.

## Contributing

Link ke CONTRIBUTING.md.
\`\`\`

**Aturan:** Developer baru harus bisa menjalankan proyek dalam 5 menit setelah membaca README.

## API Documentation

API docs yang baik memberikan contoh, bukan hanya spesifikasi:

**Struktur per endpoint:**
1. URL dan method
2. Deskripsi singkat
3. Request parameters/body dengan tipe data
4. Response format dengan contoh
5. Error responses yang mungkin
6. Contoh curl/fetch request

> Gunakan tools seperti OpenAPI/Swagger atau Postman collections. Auto-generated docs dari kode selalu lebih akurat dari docs yang ditulis manual.

## Architecture Decision Records (ADR)

ADR mendokumentasikan **mengapa** keputusan teknis dibuat. Ini invaluable ketika ada pertanyaan "kenapa kita pakai X bukan Y?" di masa depan:

\`\`\`markdown
# ADR-003: Menggunakan PostgreSQL dibanding MongoDB

## Status
Accepted

## Context
Kita membutuhkan database untuk menyimpan data transaksi
yang memiliki relasi kompleks antar entity.

## Decision
Menggunakan PostgreSQL dengan Prisma ORM.

## Reasoning
- Data highly relational (users, orders, products, payments)
- ACID compliance critical untuk transaksi keuangan
- Prisma provides type-safe queries dan migration management
- Tim sudah familiar dengan SQL databases

## Consequences
- Perlu mengelola schema migrations
- Horizontal scaling lebih complex dibanding MongoDB
- Mitigasi: gunakan read replicas dan connection pooling

## Alternatives Considered
- MongoDB: lebih fleksibel tapi relasi kurang kuat
- MySQL: viable tapi PostgreSQL lebih feature-rich
\`\`\`

## Internal Documentation

### Runbook

Dokumen step-by-step untuk operational tasks:
- Deploy ke production
- Rollback deployment
- Database backup dan restore
- Incident response procedure

### Onboarding Guide

Dokumen untuk new joiner:
- Environment setup
- Codebase overview dan arsitektur
- Development workflow (branching, PR, review)
- Kontak penting dan channel komunikasi

## Prinsip Documentation yang Baik

**1. Write for scanning, not reading**
- Gunakan heading yang descriptive
- Bullet points dan numbered lists
- Bold untuk keywords penting

**2. Keep it close to code**
- Documentation yang terpisah jauh dari code cenderung outdated
- README di root, ADR di docs folder, inline comments di code
- Automated docs dari code annotations > manual docs

**3. Use diagrams**
- Architecture diagrams (Mermaid, Excalidraw)
- Sequence diagrams untuk complex flows
- Database relationship diagrams

**4. Iterate**
- Documentation tidak harus perfect di awal
- Tulis draft, improve over time
- Encourage team contributions via PR

**5. Delete outdated docs**
Documentation yang salah lebih berbahaya dari tidak ada documentation. Review dan update secara berkala. Hapus yang sudah tidak relevan.

## Measuring Documentation Quality

- **Time to first run** — berapa lama developer baru bisa run project?
- **Question frequency** — berapa banyak pertanyaan yang seharusnya bisa dijawab docs?
- **Onboarding time** — berapa lama new joiner menjadi produktif?
- **Incident resolution time** — apakah runbook mempercepat resolution?

Documentation yang baik adalah skill yang membedakan developer yang baik dari developer yang extraordinary.`,
    coverUrl: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=630&fit=crop',
    categorySlug: 'career',
    tags: ['Documentation', 'Technical Writing', 'Developer Skills', 'Career', 'Best Practices'],
    readTime: '11 min',
    views: 5670,
    featured: false,
    publishedAt: '2025-01-30',
    metaTitle: 'Technical Documentation yang Efektif — Skill Developer yang Underrated',
    metaDescription: 'Menulis technical docs: README, API docs, ADR, runbooks, dan prinsip documentation yang benar-benar berguna.',
  },
  {
    title: 'Code Review yang Membangun: Panduan untuk Tim',
    slug: 'code-review-membangun-panduan-tim',
    excerpt: 'Culture code review yang produktif: apa yang di-review, cara memberikan feedback konstruktif, common pitfalls, dan automasi yang membantu.',
    content: `Code review yang baik menangkap bug, menyebarkan knowledge, dan meningkatkan code quality. Code review yang buruk memperlambat delivery, merusak moral, dan menciptakan bottleneck. Perbedaannya terletak pada culture dan proses.

## Tujuan Code Review

Code review punya tiga tujuan utama:

**1. Quality Gate** — menangkap bugs, security issues, dan design flaws sebelum merge.

**2. Knowledge Sharing** — setiap PR adalah learning opportunity. Reviewer belajar tentang area codebase yang mungkin belum familiar, author belajar dari feedback.

**3. Consistency** — memastikan codebase mengikuti patterns dan conventions yang disepakati tim.

## Apa yang Di-Review

Fokus review pada hal-hal yang automation tidak bisa tangkap:

**Review:**
- Logic correctness — apakah kode melakukan apa yang dimaksud?
- Design decisions — apakah approach-nya tepat?
- Edge cases — apa yang terjadi di batas kondisi?
- Error handling — apakah failure modes ditangani?
- Naming — apakah variable dan function names jelas?
- Testability — apakah perubahan bisa ditest?

**Jangan buang waktu review:**
- Formatting — biarkan Prettier handle
- Import ordering — biarkan ESLint handle
- Style preferences — biarkan linter rules menentukan

> Automate apa pun yang bisa diautomate. Waktu reviewer terlalu berharga untuk nitpicking whitespace.

## Cara Memberikan Feedback

### Bahasa yang Konstruktif

\`\`\`
❌ "Ini salah."
✅ "Kita mungkin perlu handle case ketika user belum login. 
    Bagaimana kalau tambah early return di sini?"

❌ "Kenapa pakai cara ini?"
✅ "Saya penasaran dengan approach ini. Apa pertimbangan 
    memilih polling dibanding WebSocket?"

❌ "Harus diubah."
✅ "Saran: gunakan Map O(1) lookup di sini karena array.find() 
    O(n) bisa lambat di 10K+ items. Wdyt?"
\`\`\`

### Kategorisasi Feedback

Labeli feedback agar author tahu prioritas:

- **[blocking]** — harus difix sebelum merge (bug, security issue)
- **[suggestion]** — improvement yang direkomendasikan tapi tidak blocking
- **[nit]** — minor preference, bisa diabaikan
- **[question]** — ingin memahami, bukan meminta ubah
- **[praise]** — apresiasi implementasi yang bagus

### Offer Solutions, Not Just Problems

\`\`\`
❌ "N+1 query di sini."

✅ "N+1 query di sini bisa menjadi masalah di scale. 
    Saran: gunakan Prisma include untuk eager loading:
    
    const users = await prisma.user.findMany({
      include: { posts: true }
    });
    
    Ini mengurangi query dari N+1 menjadi 2."
\`\`\`

## Untuk yang Di-Review (Author)

Tips untuk membuat review process efisien:

**PR yang baik:**
- Kecil dan focused — 200-400 lines ideal, max 600
- Deskripsi yang jelas — apa, kenapa, dan bagaimana
- Self-reviewed — review sendiri sebelum request review
- Tests included — automated proof bahwa kode bekerja

**PR description template:**
\`\`\`markdown
## What
Brief description of changes.

## Why
Context and motivation.

## How
Technical approach taken.

## Testing
How this was tested.

## Screenshots
If UI changes.
\`\`\`

## Review Turnaround Time

Target: review dimulai dalam 4 jam kerja. Ini balance antara:
- Tidak memblokir author terlalu lama
- Memberikan reviewer waktu untuk review dengan thoughtful

Jika butuh review urgent, komunikasikan via Slack/chat — jangan hanya mengandalkan notifikasi tools.

## Common Anti-Patterns

- **Gatekeeping** — reviewer yang selalu menemukan sesuatu untuk diubah
- **Rubber stamping** — approve tanpa benar-benar membaca
- **Bikeshedding** — debat panjang tentang hal trivial (indentation, naming)
- **Heroic PRs** — PR 2000+ lines yang tidak ada yang mau review
- **Review hierarchy** — hanya senior yang bisa review. Everyone should review.

## Metrics yang Berguna

Track untuk continuous improvement:
- **Review turnaround time** — rata-rata waktu dari request sampai first review
- **PR size distribution** — tracking apakah PR tetap small
- **Review iteration count** — berapa round-trips sebelum merge
- **Defect escape rate** — bugs yang lolos review dan ditemukan di production

Code review adalah investment yang compound over time. Tim yang melakukannya dengan baik memiliki code quality yang meningkat, knowledge sharing yang merata, dan onboarding yang lebih cepat.`,
    coverUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop',
    categorySlug: 'career',
    tags: ['Code Review', 'Team Culture', 'Developer Skills', 'Best Practices', 'Collaboration'],
    readTime: '11 min',
    views: 4890,
    featured: false,
    publishedAt: '2025-02-12',
    metaTitle: 'Code Review yang Membangun — Panduan Culture & Best Practices',
    metaDescription: 'Code review: apa yang di-review, feedback konstruktif, PR best practices, anti-patterns, dan metrics untuk improvement.',
  },
  {
    title: 'Mengelola Technical Debt Tanpa Menghentikan Fitur Baru',
    slug: 'mengelola-technical-debt-tanpa-hentikan-fitur',
    excerpt: 'Strategi pragmatis menangani technical debt: identifikasi, prioritisasi, boy scout rule, refactoring incrementally, dan komunikasi dengan stakeholders.',
    content: `Technical debt adalah kenyataan di setiap codebase yang berkembang. Sama seperti financial debt, technical debt tidak selalu buruk — yang buruk adalah debt yang tidak dikelola. Artikel ini membahas pendekatan pragmatis untuk menangani technical debt tanpa mengorbankan delivery fitur baru.

## Apa Itu Technical Debt?

Technical debt terjadi ketika keputusan teknis yang suboptimal diambil untuk kecepatan delivery. Contoh umum:

- **Intentional debt** — "kita tahu ini bukan solusi ideal, tapi deadline mendesak, kita perbaiki setelah launch"
- **Unintentional debt** — design decisions yang ternyata tidak scalable
- **Outdated debt** — dependencies yang sudah deprecated atau framework yang berubah
- **Bit rot** — code quality yang menurun seiring perubahan incremental tanpa refactoring

## Identifikasi Technical Debt

### Quantitative Signals

- **Bug frequency** — area kode yang sering menimbulkan bug
- **Change frequency** — file yang sering diubah (hotspot) kemungkinan perlu refactoring
- **Complexity metrics** — cyclomatic complexity yang tinggi
- **Test coverage** — area tanpa test lebih berisiko
- **Build/deploy time** — semakin lambat, semakin banyak debt

### Qualitative Signals

- **Developer frustration** — "setiap kali aku ubah di sini, sesuatu yang lain rusak"
- **Slow onboarding** — new joiner butuh berminggu-minggu memahami area tertentu
- **Workarounds** — banyak TODO dan hack di kode
- **Fear of change** — tim takut menyentuh area tertentu

## Prioritisasi: Impact vs Effort Matrix

Tidak semua debt sama pentingnya. Prioritaskan berdasarkan:

| | Low Effort | High Effort |
|---|---|---|
| **High Impact** | DO FIRST | Plan carefully |
| **Low Impact** | Boy Scout Rule | Maybe never |

**High impact = mendekati area yang sering diubah + sering menyebabkan bug.**

> Debt yang tidak pernah disentuh lagi bukan prioritas. Debt yang ada di hot path yang diubah setiap sprint adalah prioritas tertinggi.

## Boy Scout Rule

Aturan paling pragmatis: **tinggalkan kode dalam keadaan lebih baik dari saat kamu temui.**

Setiap PR, lakukan small improvement:
- Rename variable yang membingungkan
- Extract function yang terlalu panjang
- Tambah missing type annotation
- Hapus dead code

Kumulatif, ini memberikan improvement besar tanpa dedicated "refactoring sprint."

## Refactoring Incrementally

### Strangler Fig Pattern

Ganti komponen lama secara bertahap, bukan big bang rewrite:

1. Buat abstraksi baru di samping yang lama
2. Route traffic/usage bertahap ke yang baru
3. Setelah 100% pindah, hapus yang lama

Ini memungkinkan refactoring sambil tetap deliver fitur:
- Sprint 1: Buat service baru, 0% traffic
- Sprint 2: Fitur A + 20% traffic ke service baru
- Sprint 3: Fitur B + 50% traffic ke service baru
- Sprint 4: Fitur C + 100% traffic ke service baru
- Sprint 5: Hapus service lama

### Feature Flag Approach

Gunakan feature flags untuk toggle antara implementasi lama dan baru:

\`\`\`typescript
if (featureFlags.isEnabled('new-payment-flow')) {
  return processPaymentV2(order);
} else {
  return processPaymentV1(order);
}
\`\`\`

## Alokasi Waktu

Aturan **80/20** yang pragmatis:

- **80% waktu** — fitur baru dan bug fixes
- **20% waktu** — technical debt reduction

Beberapa tim mengalokasikan 1 hari per sprint untuk tech debt. Tim lain mengalokasikan satu sprint penuh per kuartal. Pilih yang cocok dengan ritme tim.

## Komunikasi dengan Stakeholders

Tech debt sering tidak dipahami non-technical stakeholders. Gunakan analogi:

**"Technical debt seperti utang finansial":**
- Hutang kecil yang dikelola itu normal dan kadang perlu
- Tapi bunga terus menumpuk — setiap fitur baru makin lambat
- Tanpa pembayaran berkala, kita akhirnya hanya membayar bunga (fixing bugs) tanpa progress nyata

**Quantify impact:**
- "Fitur ini seharusnya butuh 3 hari, tapi karena tech debt di module X, estimasi menjadi 2 minggu"
- "Bug di area ini sudah terjadi 5 kali dalam 2 bulan, masing-masing butuh 2 hari untuk fix"
- "Refactoring module ini sekali akan mengurangi waktu development fitur terkait 50%"

## Documentation Debt

Jangan lupa debt yang bukan kode:
- Architectural decisions yang tidak terdokumentasi
- Onboarding guide yang outdated
- API documentation yang tidak akurat
- Missing runbooks dan playbooks

Documentation debt memperlambat tim sama seperti code debt — hanya lebih sulit diukur.

## Tanda-Tanda Debt Sudah Kritikal

Eskalasi segera jika:
- Velocity terus menurun meskipun tim stabil
- Setiap perubahan kecil menyebabkan regresi
- Developer baru butuh lebih dari 1 bulan untuk produktif
- Tim menghindari area tertentu di codebase

Technical debt management bukan proyek satu kali — ini praktik berkelanjutan yang menjadi bagian dari culture engineering.`,
    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop',
    categorySlug: 'career',
    tags: ['Technical Debt', 'Refactoring', 'Engineering Culture', 'Team Management', 'Best Practices'],
    readTime: '12 min',
    views: 6780,
    featured: false,
    publishedAt: '2024-12-15',
    metaTitle: 'Technical Debt Management — Strategi Pragmatis untuk Tim',
    metaDescription: 'Mengelola tech debt: identifikasi, prioritisasi, Boy Scout Rule, incremental refactoring, dan komunikasi stakeholders.',
  },
];
