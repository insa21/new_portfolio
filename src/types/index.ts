// Frontend types
export type ProjectStatus = "Live" | "In Progress" | "Archived" | "IN_PROGRESS" | "LIVE" | "ARCHIVED";
export type PreviewType = "image" | "video" | "gif";

export interface Project {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  type: string;
  featured: boolean;
  status: ProjectStatus;
  year: string;
  stack: string[];
  tags: string[];
  thumbnailUrl?: string;
  previewType?: PreviewType;
  liveUrl?: string;
  repoUrl?: string;
  caseStudyUrl?: string;
  stars?: number;
  views?: number;
  highlights: string[];
  challenges?: string;
  results?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseStudy {
  id?: string;
  title: string;
  slug: string;
  heroImage?: string;
  overview: {
    problem: string;
    solution: string;
    role: string;
    timeline: string;
  };
  aiFlow?: {
    input: string;
    model: string;
    output: string;
  };
  architecture?: string[];
  challenges?: string[];
  results?: {
    metric: string;
    value: string;
  }[];
}

export interface Service {
  id?: string;
  title: string;
  description: string;
  bestFor: string;
  deliverables: string[];
  process: string[];
  active?: boolean;
  order?: number;
}

// API Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
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
  coverUrl?: string;
  published: boolean;
  featured: boolean;
  views: number;
  readTime: number;
  tags: string[];
  categoryId: string;
  category?: BlogCategory;
  authorId: string;
  author?: Pick<User, "id" | "name" | "avatar">;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
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
  previewType?: "pdf" | "image";
  description?: string;
  featured: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Media {
  id: string;
  filename: string;
  originalName?: string;
  mimetype: string;
  size: number;
  url: string;
  alt?: string;
  uploadedById?: string;
  createdAt?: string;
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
