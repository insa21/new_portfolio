// Shared types between frontend and backend

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  type: string;
  status: "IN_PROGRESS" | "LIVE" | "ARCHIVED";
  year: string;
  stack: string[];
  tags: string[];
  thumbnailUrl?: string;
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
  highlights: string[];
  challenges?: string;
  results?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnailUrl?: string;
  published: boolean;
  featured: boolean;
  views: number;
  readTime: number;
  tags: string[];
  categoryId: string;
  category: BlogCategory;
  authorId: string;
  author: Pick<User, "id" | "name" | "avatar">;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  title: string;
  type: "CERTIFICATION" | "LICENSE";
  issuer: string;
  issuerLogo?: string;
  category: string;
  skills: string[];
  issuedAt: string;
  expiresAt?: string;
  credentialId?: string;
  credentialUrl?: string;
  pdfUrl?: string;
  previewUrl?: string;
  description?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  bestFor: string;
  deliverables: string[];
  process: string[];
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Experiment {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  previewUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  alt?: string;
  uploadedById: string;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface HeroStats {
  projects: string;
  aiModels: string;
  successRate: string;
}

export interface DashboardStats {
  projectsCount: number;
  postsCount: number;
  certificationsCount: number;
  experimentsCount: number;
  unreadContactsCount: number;
  heroStats?: HeroStats;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  errors?: ApiError[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  field?: string;
  message: string;
}

// Query params types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  q?: string;
}

export interface ProjectsQuery extends SearchParams {
  type?: string;
  status?: string;
  featured?: boolean;
}

export interface PostsQuery extends SearchParams {
  category?: string;
  featured?: boolean;
  published?: boolean;
}

export interface CertificationsQuery extends SearchParams {
  type?: string;
  category?: string;
  featured?: boolean;
}
