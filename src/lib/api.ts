const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: Array<{ field?: string; message: string }>;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Attempt to refresh the access token
   * Returns true if refresh was successful, false otherwise
   */
  private async tryRefreshToken(): Promise<boolean> {
    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async fetch<T>(endpoint: string, options: FetchOptions = {}, isRetry = false): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 - try refresh once (but not for auth endpoints)
        if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
          const refreshed = await this.tryRefreshToken();
          if (refreshed) {
            // Retry the original request
            return this.fetch<T>(endpoint, options, true);
          }
          // Refresh failed - dispatch session expired event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth-session-expired'));
          }
        }
        throw new ApiError(data.message || 'Request failed', response.status, data.errors);
      }

      return data;
    } catch (error) {
      // Network error - don't logout, just throw
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error. Please check your connection.', 0);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, file: File, fieldName = 'file'): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: (() => {
        const formData = new FormData();
        formData.append(fieldName, file);
        return formData;
      })(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status, data.errors);
    }

    return data;
  }
}

/**
 * Custom API Error class
 * Uses digest property to prevent Next.js error overlay from showing handled errors
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: Array<{ field?: string; message: string }>;
  // This digest property tells Next.js this is a handled error
  digest?: string;

  constructor(message: string, statusCode: number, errors?: Array<{ field?: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    // Mark as handled error to suppress Next.js error overlay
    this.digest = `HANDLED_API_ERROR_${statusCode}`;

    // Prevent the error overlay by not capturing stack trace for expected errors
    if (statusCode >= 400 && statusCode < 500) {
      // Don't capture stack for client errors (expected errors like 404, 400, etc)
      Error.captureStackTrace?.(this, ApiError);
    }
  }
}

/**
 * Extract a user-friendly error message from an error object
 * Handles ApiError with validation errors, standard Errors, and unknown errors
 */
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred"): string {
  if (err instanceof ApiError) {
    // If there are field-level validation errors, combine them
    if (err.errors && err.errors.length > 0) {
      return err.errors.map(e => e.message).join(", ");
    }
    return err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
}

/**
 * Log API errors without triggering Next.js error overlay
 * Uses console.warn for expected errors (4xx) and console.error for unexpected (5xx)
 */
export function logApiError(context: string, err: unknown): void {
  if (err instanceof ApiError && err.statusCode >= 400 && err.statusCode < 500) {
    // Expected client errors - use warn to avoid error overlay
    console.warn(`[API] ${context}:`, err.message);
  } else {
    // Unexpected server errors - use error
    console.error(`[API] ${context}:`, err);
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: unknown; tokens: unknown }>('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  refresh: () => api.post<{ accessToken: string }>('/auth/refresh'),

  me: () => api.get<unknown>('/auth/me'),
};

// Projects API
export const projectsApi = {
  list: (params?: { q?: string; page?: number; limit?: number; type?: string; status?: string; featured?: boolean }) =>
    api.get<unknown[]>('/projects', params as Record<string, string | number | boolean>),

  get: (slug: string) => api.get<unknown>(`/projects/${slug}`),

  getById: (id: string) => api.get<unknown>(`/projects/id/${id}`),

  create: (data: unknown) => api.post<unknown>('/projects', data),

  update: (id: string, data: unknown) => api.put<unknown>(`/projects/${id}`, data),

  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Posts API
export const postsApi = {
  list: (params?: { q?: string; page?: number; limit?: number; category?: string; featured?: boolean; published?: boolean }) =>
    api.get<unknown[]>('/posts', params as Record<string, string | number | boolean>),

  get: (id: string) => api.get<unknown>(`/posts/id/${id}`), // Get by ID for admin

  getBySlug: (slug: string) => api.get<unknown>(`/posts/${slug}`), // Get by slug for public

  create: (data: unknown) => api.post<unknown>('/posts', data),

  update: (id: string, data: unknown) => api.put<unknown>(`/posts/${id}`, data),

  delete: (id: string) => api.delete(`/posts/${id}`),
};

// Categories API
export const categoriesApi = {
  list: () => api.get<unknown[]>('/categories'),

  create: (data: { name: string }) => api.post<unknown>('/categories', data),

  update: (id: string, data: { name?: string }) => api.put<unknown>(`/categories/${id}`, data),

  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Certifications API
export const certificationsApi = {
  list: (params?: { q?: string; page?: number; limit?: number; type?: string; category?: string; featured?: boolean }) =>
    api.get<unknown[]>('/certifications', params as Record<string, string | number | boolean>),

  get: (id: string) => api.get<unknown>(`/certifications/${id}`),

  create: (data: unknown) => api.post<unknown>('/certifications', data),

  update: (id: string, data: unknown) => api.put<unknown>(`/certifications/${id}`, data),

  delete: (id: string) => api.delete(`/certifications/${id}`),
};

// Services API
export const servicesApi = {
  list: () => api.get<unknown[]>('/services'),

  get: (id: string) => api.get<unknown>(`/services/${id}`),

  create: (data: unknown) => api.post<unknown>('/services', data),

  update: (id: string, data: unknown) => api.put<unknown>(`/services/${id}`, data),

  delete: (id: string) => api.delete(`/services/${id}`),

  reorder: (ids: string[]) => api.post('/services/reorder', { ids }),
};

// Experiments API
export const experimentsApi = {
  list: (params?: { q?: string; page?: number; limit?: number }) =>
    api.get<unknown[]>('/experiments', params as Record<string, string | number | boolean>),

  get: (id: string) => api.get<unknown>(`/experiments/${id}`),

  create: (data: unknown) => api.post<unknown>('/experiments', data),

  update: (id: string, data: unknown) => api.put<unknown>(`/experiments/${id}`, data),

  delete: (id: string) => api.delete(`/experiments/${id}`),
};

// Media API
export const mediaApi = {
  list: (params?: { page?: number; limit?: number; q?: string; type?: string; sort?: string }) =>
    api.get<unknown[]>('/media', params as Record<string, string | number | boolean>),

  upload: (file: File) => api.uploadFile<unknown>('/media/upload', file),

  uploadByUrl: (imageUrl: string) => api.post<unknown>('/media/upload-by-url', { imageUrl }),

  delete: (id: string) => api.delete(`/media/${id}`),
};

// Settings API
export const settingsApi = {
  getAll: () => api.get<Record<string, unknown>>('/settings'),

  get: (key: string) => api.get<unknown>(`/settings/${key}`),
  update: (key: string, value: unknown) => api.put<unknown>(`/settings/${key}`, { value }),

  // Contact settings
  getContactSettings: () => api.get<ContactSettings>('/settings/contact'),

  updateContactSettings: (data: ContactSettings) => api.put<ContactSettings>('/settings/contact', data),

  // Home settings
  getHomeSettings: () => api.get<HomeSettings>('/settings/home'),

  updateHomeSettings: (data: HomeSettings) => api.put<HomeSettings>('/settings/home', data),

  // About settings
  getAboutSettings: () => api.get<AboutSettings>('/settings/about'),

  updateAboutSettings: (data: AboutSettings) => api.put<AboutSettings>('/settings/about', data),

  // Branding settings
  getBrandingSettings: () => api.get<BrandingSettings>('/settings/branding'),

  updateBrandingSettings: (data: Partial<BrandingSettings>) =>
    api.put<BrandingSettings>('/settings/branding', data),

  // Footer settings
  getFooterSettings: () => api.get<FooterSettings>('/settings/footer'),

  updateFooterSettings: (data: FooterSettings) =>
    api.put<FooterSettings>('/settings/footer', data),
};

// Contact Settings Type
export interface ContactSettings {
  email: string | null;
  whatsapp: string | null;
  location: string | null;
  availabilityStatus: string | null;
  availabilityDate: string | null;
  responseTime: string | null;
  socialLinks: {
    github: string | null;
    linkedin: string | null;
    instagram: string | null;
  } | null;
}

// Home Settings Types
export interface HeroSettings {
  title: string | null;
  subtitle: string | null;
  badge: {
    enabled: boolean;
    text: string | null;
  } | null;
  ctaButtons: {
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'outline';
  }[] | null;
}

export interface StatItem {
  id?: string;
  value: string;
  label: string;
  icon?: string | null;
  mode?: 'auto' | 'manual';
  autoSource?: 'projects' | 'posts' | 'experiments' | null;
}

export interface TechStackItem {
  id?: string;
  name: string;
  icon?: string | null;
  category?: string | null;
  orderIndex?: number | null;
}

export interface FeaturedHighlight {
  id: string;
  type: 'project' | 'post';
}

export interface SEOSettings {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  keywords: string | null;
}

export interface HomeSettings {
  hero?: HeroSettings | null;
  stats?: StatItem[] | null;
  techStack?: TechStackItem[] | null;
  featuredHighlights?: {
    enabled: boolean;
    items: FeaturedHighlight[];
  } | null;
  seo?: SEOSettings | null;
}

// About Settings Types
export interface AboutParagraph {
  id: string;
  content: string;
  order?: number;
}

export interface AboutToolkitItem {
  id: string;
  name: string;
  category?: string | null;
  order?: number;
}

export interface AboutSettings {
  headline?: {
    text: string | null;
    highlightText: string | null;
  } | null;
  paragraphs?: AboutParagraph[] | null;
  toolkit?: AboutToolkitItem[] | null;
  resume?: {
    enabled: boolean;
    label: string | null;
    url: string | null;
    publicId: string | null;
    resourceType: string | null;
    format: string | null;
    downloadName: string | null;
  } | null;
  media?: {
    type: 'image' | 'video';
    imageUrl: string | null;
    imagePublicId: string | null;
    imageAlt: string | null;
    showPlaceholder: boolean;
    enabled: boolean;
  } | null;
  seo?: {
    metaTitle: string | null;
    metaDescription: string | null;
  } | null;
}

// Contact API
export const contactApi = {
  submit: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post<{ id: string }>('/contact', data),

  list: (params?: { page?: number; limit?: number; read?: boolean }) =>
    api.get<unknown[]>('/contact', params as Record<string, string | number | boolean>),

  get: (id: string) => api.get<unknown>(`/contact/${id}`),

  markAsRead: (id: string) => api.put(`/contact/${id}/read`),

  markAsUnread: (id: string) => api.put(`/contact/${id}/unread`),

  delete: (id: string) => api.delete(`/contact/${id}`),

  getUnreadCount: () => api.get<{ count: number }>('/contact/unread-count'),
};

// Stats API
export const statsApi = {
  get: () => api.get<{
    projectsCount: number;
    postsCount: number;
    certificationsCount: number;
    experimentsCount: number;
    unreadContactsCount: number;
    heroStats: unknown;
  }>('/stats'),
};

// Users API
export const usersApi = {
  list: (params?: { q?: string; page?: number; limit?: number; role?: string }) =>
    api.get<unknown[]>('/users', params as Record<string, string | number | boolean>),

  get: (id: string) => api.get<unknown>(`/users/${id}`),

  create: (data: unknown) => api.post<unknown>('/users', data),

  update: (id: string, data: unknown) => api.put<unknown>(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),
};

// Branding Settings Type
export interface BrandingSettings {
  siteName: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  logoAltText: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  darkLogoUrl: string | null;
  darkLogoPublicId: string | null;
  faviconUrl: string | null;
  faviconPublicId: string | null;
  desktopLogoHeight: number | null;
  mobileLogoHeight: number | null;
  updatedAt: string | null;
}

// Footer Settings Type
export interface FooterSitemapLink {
  id: string;
  label: string;
  href: string;
  order?: number;
}

export interface FooterSettings {
  logoUrl: string | null;
  logoPublicId: string | null;
  logoDarkUrl: string | null;
  logoDarkPublicId: string | null;
  logoAltText: string | null;
  showLogo: boolean | null;
  siteName: string | null;
  description: string | null;
  copyright: string | null;
  sitemapLinks: FooterSitemapLink[] | null;
  showSitemap: boolean | null;
  showConnect: boolean | null;
}
