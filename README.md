<p align="center">
  <img src="public/images/logo.png" alt="Portfolio Logo" width="120" height="120" />
</p>

<h1 align="center">Portfolio</h1>

<p align="center">
  <strong>A modern, full-stack portfolio application with luxury-tech aesthetic</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#api-reference">API</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## ✨ Features

### 🌐 Public Pages
- **Home** - Hero section with 3D animated background, stats, tech stack showcase
- **Projects** - Filterable project gallery with detailed case studies
- **Blog** - Full-featured blog with categories, search, and pagination
- **Certifications** - Professional credentials with PDF download & verification links
- **Services** - Service offerings with detailed deliverables
- **Contact** - Rate-limited contact form

### 🔐 Admin Dashboard
- **Authentication** - JWT-based secure login with refresh tokens
- **Content Management** - Full CRUD for projects, posts, experiments, certifications, services
- **Media Library** - Upload and manage images, PDFs, and documents via Cloudinary
- **User Management** - Role-based access (Admin/Editor)
- **Settings** - Configure homepage content, SEO, and site-wide settings

### 🎨 Design & UX
- **Dark/Light Mode** - Seamless theme switching
- **Responsive Design** - Mobile-first approach
- **3D Backgrounds** - Three.js animated scenes
- **Micro-animations** - Smooth Framer Motion transitions
- **Premium Aesthetic** - Luxury tech studio design

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Animations |
| **Three.js / R3F** | 3D graphics |
| **Lucide React** | Icon library |
| **next-themes** | Theme management |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express.js** | Web framework |
| **TypeScript** | Type safety |
| **Prisma** | PostgreSQL ORM |
| **PostgreSQL** | Database (Neon) |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Zod** | Schema validation |
| **Multer** | File uploads |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **PostgreSQL** database (or [Neon](https://neon.tech))
- **Cloudinary** account (for media storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/insa21/new_portfolio.git
   cd new_portfolio
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Configure environment variables**

   Create `.env.local` in root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   Create `.env` in `/server`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Setup database**
   ```bash
   cd server
   npm run db:push    # Push schema to database
   npm run db:seed    # Seed initial data (optional)
   ```

6. **Run development servers**

   Terminal 1 - Backend:
   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 - Frontend:
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001/api](http://localhost:3001/api)
   - Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📁 Project Structure

```
portfolio/
├── public/                 # Static assets
│   ├── images/            # Images
│   └── placeholders/      # Placeholder images
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── about/         # About page
│   │   ├── admin/         # Admin dashboard
│   │   ├── api/           # API routes (uploads)
│   │   ├── blog/          # Blog pages
│   │   ├── certifications/
│   │   ├── contact/
│   │   ├── projects/
│   │   └── services/
│   ├── components/        # React components
│   │   ├── 3d/           # Three.js components
│   │   ├── admin/        # Admin UI components
│   │   ├── home/         # Homepage sections
│   │   ├── layout/       # Navbar, Footer
│   │   ├── providers/    # Context providers
│   │   └── ui/           # UI primitives
│   ├── data/             # Static data
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (api, cloudinary)
│   └── types/            # TypeScript types
├── server/
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   ├── migrations/   # Database migrations
│   │   └── seed.ts       # Seed data
│   └── src/
│       ├── config/       # App configuration
│       ├── middlewares/  # Express middlewares
│       ├── modules/      # API modules
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
│       ├── types/
│       └── utils/
└── package.json
```

---

## 📡 API Reference

**Base URL:** `http://localhost:3001/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | User logout |
| GET | `/auth/me` | Get current user |

### Content Endpoints
| Resource | Endpoints | Auth Required |
|----------|-----------|---------------|
| Projects | `GET/POST /projects`, `GET/PUT/DELETE /projects/:id` | Write: Yes |
| Posts | `GET/POST /posts`, `GET/PUT/DELETE /posts/:id` | Write: Yes |
| Experiments | `GET/POST /experiments`, `GET/PUT/DELETE /experiments/:id` | Write: Yes |
| Certifications | `GET/POST /certifications`, `GET/PUT/DELETE /certifications/:id` | Write: Yes |
| Services | `GET/POST /services`, `GET/PUT/DELETE /services/:id` | Write: Yes |
| Contact | `GET /contact`, `POST /contact` (rate-limited) | Read: Yes |
| Media | `GET/POST /media`, `DELETE /media/:id` | Yes |
| Settings | `GET/PUT /settings/:key` | Write: Admin |
| Users | `GET/POST/PUT/DELETE /users` | Admin only |

---

## 🧪 Development Commands

### Frontend
```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend
```bash
cd server
npm run dev       # Start development server (port 3001)
npm run build     # Compile TypeScript
npm run start     # Start production server
npm run db:migrate  # Run Prisma migrations
npm run db:push     # Push schema to database
npm run db:seed     # Seed database
npm run db:studio   # Open Prisma Studio
```

---

## 🔒 Security Features

- **JWT Authentication** - Access tokens (15 min) + Refresh tokens (7 days)
- **Password Hashing** - bcrypt with secure salt rounds
- **Rate Limiting** - 5 requests per 10 minutes for contact form
- **CORS Protection** - Configured origin restrictions
- **Helmet** - Security HTTP headers
- **Input Validation** - Zod schema validation for all inputs
- **Role-based Access** - Admin and Editor roles

---

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend (Railway / Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with build command: `npm run build`
4. Start command: `npm run start`

### Database (Neon)
1. Create a Neon PostgreSQL database
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `npm run db:push`

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Indra**
- GitHub: [@insa21](https://github.com/insa21)

---

<p align="center">
  Made with ❤️ using Next.js and Express.js
</p>
