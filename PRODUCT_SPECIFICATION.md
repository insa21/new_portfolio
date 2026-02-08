# Product Specification
## Portfolio Application

**Version:** 1.0.0  
**Last Updated:** 2026-02-07

---

## 1. Overview

A modern, full-stack portfolio application designed for a Fullstack Engineer & AI Developer. The application features a luxury-tech aesthetic with a premium user experience, complete admin panel for content management, and a robust backend API.

### 1.1 Goals
- Showcase projects, experiments, certifications, and blog posts
- Provide professional services information
- Enable visitors to make contact
- Allow full content management via admin dashboard

---

## 2. Technology Stack

### 2.1 Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.4 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first CSS styling |
| Framer Motion | ^12.28.1 | Animations |
| Three.js | ^0.182.0 | 3D graphics |
| React Three Fiber | ^9.5.0 | React renderer for Three.js |
| Lucide React | ^0.562.0 | Icon library |
| next-themes | ^0.4.6 | Dark/Light mode |

### 2.2 Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | ^4.21.2 | Web framework |
| TypeScript | ^5.7.3 | Type safety |
| Prisma | ^6.3.0 | ORM for PostgreSQL |
| PostgreSQL | - | Database |
| JSON Web Token | ^9.0.2 | Authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| Zod | ^3.24.1 | Schema validation |
| Multer | ^1.4.5 | File uploads |
| Helmet | ^8.0.0 | Security headers |
| express-rate-limit | ^7.5.1 | Rate limiting |

---

## 3. Frontend Specification

### 3.1 Public Pages

#### 3.1.1 Home Page (`/`)
- **Hero Section**: Animated title, subtitle, CTA buttons, badge
- **Stats/Metrics**: Dynamic statistics display
- **Tech Stack**: Showcase of technologies
- **Featured Highlights**: Key accomplishments
- **3D Background**: Three.js animated scene with dark/light mode support

#### 3.1.2 About Page (`/about`)
- Personal introduction
- Professional background
- Skills and expertise

#### 3.1.3 Projects Page (`/projects`)
- Project grid/list view
- Filter by type, technology, status
- Project cards with:
  - Thumbnail/preview
  - Title and tagline
  - Technology stack
  - Status badge (Live, In Progress, Archived)
  - Links to demo/repository

#### 3.1.4 Blog Page (`/blog`)
- Blog post listings
- Category filtering
- Search functionality
- Post cards with:
  - Cover image
  - Title and excerpt
  - Author info
  - Read time
  - Publication date

#### 3.1.5 Blog Detail Page (`/blog/[slug]`)
- Full article content
- Author information
- Related posts
- Social sharing

#### 3.1.6 Certifications Page (`/certifications`)
- License and certification display
- Filter by category
- Credential verification links
- PDF download options

#### 3.1.7 Services Page (`/services`)
- Service offerings display
- Service cards with:
  - Title and description
  - Best for section
  - Deliverables list
  - Process steps

#### 3.1.8 Contact Page (`/contact`)
- Contact form with:
  - Name, email, subject, message fields
  - Form validation
  - Submission feedback
- Rate limiting protection

### 3.2 Admin Dashboard

#### 3.2.1 Authentication (`/admin/login`)
- Email/password login
- JWT-based authentication
- Session management with refresh tokens

#### 3.2.2 Dashboard (`/admin`)
- Overview statistics
- Recent activity
- Quick actions

#### 3.2.3 Projects Management (`/admin/projects`)
- CRUD operations for projects
- Rich text editor for descriptions
- Image upload for thumbnails
- Tag management
- Feature toggle
- Status management

#### 3.2.4 Blog Management (`/admin/posts`)
- CRUD operations for posts
- Category management
- Rich content editor
- Cover image upload
- Publish/draft toggle
- Featured post toggle

#### 3.2.5 Experiments Management (`/admin/experiments`)
- CRUD operations for experiments
- Preview/demo URL management

#### 3.2.6 Certifications Management (`/admin/certifications`)
- CRUD operations for certificates
- PDF upload support
- Credential URL management

#### 3.2.7 Services Management (`/admin/services`)
- CRUD operations for services
- Order/priority management
- Active toggle

#### 3.2.8 Contact Submissions (`/admin/contact`)
- View contact form submissions
- Read/unread status
- Delete functionality

#### 3.2.9 Media Library (`/admin/media`)
- Upload and manage media files
- Image preview
- File metadata

#### 3.2.10 Users Management (`/admin/users`)
- User CRUD (Admin only)
- Role assignment (Admin, Editor)

#### 3.2.11 Settings (`/admin/settings`)
- Home page settings (hero, stats, tech stack)
- SEO configuration
- Site-wide settings

### 3.3 Shared Components

| Component | Description |
|-----------|-------------|
| `Navbar` | Responsive navigation with mobile menu |
| `Footer` | Site footer with links |
| `ThemeProvider` | Dark/Light mode switcher |
| `DataProvider` | Global state and API data management |
| `ProjectCard` | Reusable project display card |
| `CertificationCard` | Reusable certification display card |
| `StartProjectModal` | Contact modal for project inquiries |

---

## 4. Backend Specification

### 4.1 API Architecture

**Base URL:** `http://localhost:3001/api`

### 4.2 Modules & Endpoints

#### 4.2.1 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | User login | No |
| POST | `/register` | User registration | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | User logout | Yes |
| GET | `/me` | Get current user | Yes |

#### 4.2.2 Users (`/api/users`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all users | Admin |
| GET | `/:id` | Get user by ID | Admin |
| POST | `/` | Create user | Admin |
| PUT | `/:id` | Update user | Admin |
| DELETE | `/:id` | Delete user | Admin |

#### 4.2.3 Projects (`/api/projects`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all projects | No |
| GET | `/:id` | Get project by ID | No |
| GET | `/slug/:slug` | Get project by slug | No |
| POST | `/` | Create project | Yes |
| PUT | `/:id` | Update project | Yes |
| DELETE | `/:id` | Delete project | Yes |

#### 4.2.4 Experiments (`/api/experiments`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all experiments | No |
| GET | `/:id` | Get experiment by ID | No |
| POST | `/` | Create experiment | Yes |
| PUT | `/:id` | Update experiment | Yes |
| DELETE | `/:id` | Delete experiment | Yes |

#### 4.2.5 Blog Posts (`/api/posts`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all posts | No |
| GET | `/:id` | Get post by ID | No |
| GET | `/slug/:slug` | Get post by slug | No |
| POST | `/` | Create post | Yes |
| PUT | `/:id` | Update post | Yes |
| DELETE | `/:id` | Delete post | Yes |

#### 4.2.6 Certifications (`/api/certifications`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all certifications | No |
| GET | `/:id` | Get certification by ID | No |
| POST | `/` | Create certification | Yes |
| PUT | `/:id` | Update certification | Yes |
| DELETE | `/:id` | Delete certification | Yes |

#### 4.2.7 Services (`/api/services`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all services | No |
| GET | `/:id` | Get service by ID | No |
| POST | `/` | Create service | Yes |
| PUT | `/:id` | Update service | Yes |
| DELETE | `/:id` | Delete service | Yes |

#### 4.2.8 Contact (`/api/contact`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List submissions | Yes |
| POST | `/` | Submit contact form | No (rate-limited) |
| PATCH | `/:id/read` | Mark as read | Yes |
| DELETE | `/:id` | Delete submission | Yes |

#### 4.2.9 Media (`/api/media`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all media | Yes |
| POST | `/upload` | Upload file | Yes |
| DELETE | `/:id` | Delete media | Yes |

#### 4.2.10 Settings (`/api/settings`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all settings | No |
| GET | `/:key` | Get setting by key | No |
| PUT | `/:key` | Update setting | Admin |

#### 4.2.11 Stats (`/api/stats`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get dashboard stats | Yes |
| GET | `/public` | Get public stats | No |

### 4.3 Database Models

```prisma
// Users & Auth
User {
  id, email, password, name, avatar, role (ADMIN/EDITOR),
  refreshToken, createdAt, updatedAt
}

AuditLog {
  id, userId, action, entity, entityId, oldValue, newValue, createdAt
}

// Projects
Project {
  id, title, slug, tagline, description, type, featured, status,
  year, stack[], thumbnailUrl, previewType, liveUrl, repoUrl,
  caseStudyUrl, stars, views, highlights[], challenges, results,
  publishedAt, createdAt, updatedAt
}

ProjectTag { id, projectId, tag }

// Experiments
Experiment {
  id, title, description, tags[], date, previewUrl, repoUrl, demoUrl,
  createdAt, updatedAt
}

// Blog
BlogCategory { id, name, slug }

BlogPost {
  id, title, slug, excerpt, content, coverUrl, categoryId, authorId,
  tags[], readTime, views, featured, published, publishedAt,
  createdAt, updatedAt
}

// Certifications
Certification {
  id, title, type (LICENSE/CERTIFICATION), issuer, issuerLogo,
  category, skills[], issuedAt, expiresAt, credentialId, credentialUrl,
  pdfUrl, featured, description, previewUrl, previewType,
  createdAt, updatedAt
}

// Services
Service {
  id, title, description, bestFor, deliverables[], process[],
  order, active, createdAt, updatedAt
}

// Case Studies
CaseStudy {
  id, title, slug, heroImage, problem, solution, role, timeline,
  aiFlowInput, aiFlowModel, aiFlowOutput, architecture[], challenges[],
  createdAt, updatedAt
}

CaseStudyResult { id, caseStudyId, metric, value }

// Media
Media { id, filename, mimetype, size, url, alt, createdAt }

// Settings
Setting { id, key, value (JSON) }

// Contact
ContactSubmission {
  id, name, email, subject, message, read, createdAt
}
```

### 4.4 Middlewares

| Middleware | File | Description |
|------------|------|-------------|
| Authentication | `auth.ts` | JWT verification, token refresh |
| Role Guard | `role.ts` | Role-based access control |
| Rate Limiter | `rate-limit.ts` | Request rate limiting (5 req/10 min for contact) |
| Validation | `validate.ts` | Zod schema validation |
| Upload | `upload.ts` | Multer file upload handling |
| Error Handler | `error.ts` | Global error handling |
| Logger | `logger.ts` | Request logging |

### 4.5 Security Features

- **JWT Authentication**: Access tokens (15 min) + Refresh tokens (7 days)
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Configurable per-endpoint limits
- **CORS**: Configured origin restrictions
- **Helmet**: Security HTTP headers
- **Input Validation**: Zod schema validation for all inputs

---

## 5. Environment Configuration

### 5.1 Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 5.2 Backend (`.env`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

---

## 6. Development Commands

### 6.1 Frontend
```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### 6.2 Backend
```bash
npm run dev       # Start development server (port 3001)
npm run build     # Compile TypeScript
npm run start     # Start production server
npm run db:migrate  # Run Prisma migrations
npm run db:push     # Push schema to database
npm run db:seed     # Seed database
npm run db:studio   # Open Prisma Studio
```

---

## 7. File Structure

```
portfolio/
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js pages (App Router)
│   │   ├── about/
│   │   ├── admin/      # Admin dashboard pages
│   │   ├── api/        # API routes (if any)
│   │   ├── blog/
│   │   ├── certifications/
│   │   ├── contact/
│   │   ├── projects/
│   │   └── services/
│   ├── components/     # Reusable components
│   │   ├── 3d/         # Three.js components
│   │   ├── admin/      # Admin-specific components
│   │   ├── home/       # Homepage sections
│   │   ├── layout/     # Layout components
│   │   ├── providers/  # Context providers
│   │   └── ui/         # UI primitives
│   ├── data/           # Static data files
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   └── types/          # TypeScript type definitions
├── server/
│   ├── prisma/         # Prisma schema & migrations
│   └── src/
│       ├── config/     # Configuration files
│       ├── middlewares/ # Express middlewares
│       ├── modules/    # API modules
│       │   ├── auth/
│       │   ├── certifications/
│       │   ├── contact/
│       │   ├── experiments/
│       │   ├── media/
│       │   ├── posts/
│       │   ├── projects/
│       │   ├── services/
│       │   ├── settings/
│       │   ├── stats/
│       │   └── users/
│       ├── types/      # TypeScript types
│       └── utils/      # Utility functions
└── testsprite_tests/   # Automated tests
```

---

## 8. Features Summary

### 8.1 Visitor Features
- ✅ Browse projects with filtering
- ✅ Read blog posts with categories
- ✅ View certifications and credentials
- ✅ Explore services offered
- ✅ Contact form submission
- ✅ Dark/Light theme toggle
- ✅ Responsive design
- ✅ 3D animated backgrounds

### 8.2 Admin Features
- ✅ Secure authentication
- ✅ Dashboard with analytics
- ✅ Full CRUD for all content types
- ✅ Media library management
- ✅ User management (Admin only)
- ✅ Settings configuration
- ✅ Contact submission management

### 8.3 Security Features
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Rate limiting
- ✅ Input validation
- ✅ Secure password hashing
- ✅ CORS protection
- ✅ Security headers (Helmet)

---

## 9. Future Considerations

- [ ] Newsletter subscription
- [ ] Comment system for blog posts
- [ ] Analytics dashboard
- [ ] SEO optimization tools
- [ ] Social media integration
- [ ] Multi-language support
- [ ] PWA support
