/**
 * Frontend configuration module
 * Centralizes environment variables with sensible defaults for development
 */

export const config = {
  /** Backend API base URL */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',

  /** Application environment */
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;
