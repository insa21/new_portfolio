# Portfolio Backend

Express.js API untuk Portfolio Website dengan PostgreSQL dan Prisma ORM.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Zod
- **File Upload**: Multer

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio_db?schema=public"
```

Update JWT secrets with secure random strings:

```env
JWT_SECRET=your-secure-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-key
```

### 3. Setup Database

Create the database:

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE portfolio_db;"
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

Seed the database with sample data:

```bash
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed database with sample data |
| `npm run prisma:studio` | Open Prisma Studio |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:slug` | Get project by slug |
| POST | `/api/projects` | Create project (auth required) |
| PUT | `/api/projects/:id` | Update project (auth required) |
| DELETE | `/api/projects/:id` | Delete project (admin only) |

### Blog Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all posts |
| GET | `/api/posts/:slug` | Get post by slug |
| POST | `/api/posts` | Create post (auth required) |
| PUT | `/api/posts/:id` | Update post (auth required) |
| DELETE | `/api/posts/:id` | Delete post (admin only) |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category (admin only) |
| PUT | `/api/categories/:id` | Update category (admin only) |
| DELETE | `/api/categories/:id` | Delete category (admin only) |

### Certifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/certifications` | List all certifications |
| GET | `/api/certifications/:id` | Get certification by ID |
| POST | `/api/certifications` | Create certification (auth required) |
| PUT | `/api/certifications/:id` | Update certification (auth required) |
| DELETE | `/api/certifications/:id` | Delete certification (admin only) |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all services |
| GET | `/api/services/:id` | Get service by ID |
| POST | `/api/services` | Create service (admin only) |
| PUT | `/api/services/:id` | Update service (admin only) |
| DELETE | `/api/services/:id` | Delete service (admin only) |
| POST | `/api/services/reorder` | Reorder services (admin only) |

### Experiments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiments` | List all experiments |
| GET | `/api/experiments/:id` | Get experiment by ID |
| POST | `/api/experiments` | Create experiment (auth required) |
| PUT | `/api/experiments/:id` | Update experiment (auth required) |
| DELETE | `/api/experiments/:id` | Delete experiment (admin only) |

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | List all media (auth required) |
| POST | `/api/media/upload` | Upload file (auth required) |
| DELETE | `/api/media/:id` | Delete media (admin only) |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings |
| GET | `/api/settings/:key` | Get setting by key |
| PUT | `/api/settings/:key` | Update setting (admin only) |

### Contact

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contact` | List submissions (admin only) |
| PUT | `/api/contact/:id/read` | Mark as read (admin only) |
| DELETE | `/api/contact/:id` | Delete submission (admin only) |

### Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get dashboard statistics |

## Default Admin Credentials

After running the seed script, you can login with:

- **Email**: `admin@portfolio.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── src/
│   ├── config/            # Configuration
│   │   ├── database.ts    # Prisma client
│   │   └── env.ts         # Environment variables
│   ├── middlewares/       # Express middlewares
│   │   ├── auth.ts        # JWT authentication
│   │   ├── error.ts       # Error handling
│   │   ├── logger.ts      # Request logging
│   │   ├── role.ts        # Role-based access
│   │   ├── upload.ts      # File upload
│   │   └── validate.ts    # Zod validation
│   ├── modules/           # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── projects/
│   │   ├── posts/
│   │   ├── certifications/
│   │   ├── services/
│   │   ├── experiments/
│   │   ├── media/
│   │   ├── settings/
│   │   ├── contact/
│   │   └── stats/
│   ├── utils/             # Utility functions
│   ├── app.ts             # Express app
│   └── server.ts          # Entry point
├── uploads/               # Uploaded files
├── .env                   # Environment variables
├── package.json
└── tsconfig.json
```

## License

MIT
