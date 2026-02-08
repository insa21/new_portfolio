import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

// ============================================================================
// Configuration
// ============================================================================

// Validate environment variables
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Check if Cloudinary is configured
export const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

// Configure Cloudinary only if credentials exist
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

export default cloudinary;

// ============================================================================
// Types
// ============================================================================

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
  tags?: string[];
  transformation?: UploadApiOptions['transformation'];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resourceType: string;
  createdAt: string;
}

export interface CloudinaryError {
  message: string;
  code?: string;
  httpCode?: number;
}

// ============================================================================
// Constants
// ============================================================================

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MIN_FILE_SIZE = 1024; // 1KB minimum

export const DEFAULT_FOLDER = 'portfolio/projects/thumbnails';

// Default transformations for optimization
export const DEFAULT_TRANSFORMATIONS: UploadApiOptions['transformation'] = [
  { width: 1200, crop: 'limit' }, // Max width 1200px, maintain aspect ratio
  { quality: 'auto:good', fetch_format: 'auto' }, // Auto optimize
];

// ============================================================================
// Validation Utilities
// ============================================================================

export function validateMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as typeof ALLOWED_IMAGE_TYPES[number]);
}

export function validateFileSize(size: number): { valid: boolean; error?: string } {
  if (size < MIN_FILE_SIZE) {
    return { valid: false, error: 'File is too small (minimum 1KB)' };
  }
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `File is too large (maximum ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
  }
  return { valid: true };
}

export function validateImageUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);

    // Must be HTTP or HTTPS
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    // Check for basic URL injection patterns
    if (urlString.includes('javascript:') || urlString.includes('data:')) {
      return { valid: false, error: 'Invalid URL format' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export function hasValidImageExtension(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const pathname = url.pathname.toLowerCase();
    return ALLOWED_EXTENSIONS.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

// ============================================================================
// Error Handling
// ============================================================================

export class CloudinaryUploadError extends Error {
  public readonly code: string;
  public readonly httpCode: number;

  constructor(message: string, code: string = 'UPLOAD_ERROR', httpCode: number = 500) {
    super(message);
    this.name = 'CloudinaryUploadError';
    this.code = code;
    this.httpCode = httpCode;
  }
}

function ensureCloudinaryConfigured(): void {
  if (!isCloudinaryConfigured) {
    throw new CloudinaryUploadError(
      'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
      'NOT_CONFIGURED',
      500
    );
  }
}

function mapUploadResult(result: UploadApiResponse): CloudinaryUploadResult {
  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    resourceType: result.resource_type,
    createdAt: result.created_at,
  };
}

// ============================================================================
// Upload Functions
// ============================================================================

/**
 * Upload a buffer to Cloudinary
 */
export async function uploadBuffer(
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      folder: options.folder || DEFAULT_FOLDER,
      resource_type: options.resourceType || 'image',
      transformation: options.transformation || DEFAULT_TRANSFORMATIONS,
      overwrite: options.overwrite ?? false,
      tags: options.tags,
      public_id: options.publicId,
      // Security options
      invalidate: true, // Invalidate CDN cache on overwrite
      unique_filename: true,
      access_mode: 'public', // Make files publicly accessible
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new CloudinaryUploadError(
            error.message || 'Upload failed',
            'CLOUDINARY_ERROR',
            error.http_code || 500
          ));
        } else if (result) {
          resolve(mapUploadResult(result));
        } else {
          reject(new CloudinaryUploadError('Upload failed - no result returned'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload from URL to Cloudinary
 */
export async function uploadFromUrl(
  imageUrl: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  ensureCloudinaryConfigured();

  // Validate URL
  const urlValidation = validateImageUrl(imageUrl);
  if (!urlValidation.valid) {
    throw new CloudinaryUploadError(urlValidation.error!, 'INVALID_URL', 400);
  }

  try {
    const uploadOptions: UploadApiOptions = {
      folder: options.folder || DEFAULT_FOLDER,
      resource_type: options.resourceType || 'image',
      transformation: options.transformation || DEFAULT_TRANSFORMATIONS,
      overwrite: options.overwrite ?? false,
      tags: options.tags,
      public_id: options.publicId,
      invalidate: true,
      unique_filename: true,
      access_mode: 'public', // Make files publicly accessible
    };

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);
    return mapUploadResult(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload from URL failed';
    throw new CloudinaryUploadError(message, 'URL_UPLOAD_ERROR', 500);
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  ensureCloudinaryConfigured();

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true, // Invalidate CDN cache
    });
    return result.result === 'ok';
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    return false;
  }
}

/**
 * Delete multiple images from Cloudinary
 */
export async function deleteImages(publicIds: string[]): Promise<{ deleted: string[]; failed: string[] }> {
  ensureCloudinaryConfigured();

  const deleted: string[] = [];
  const failed: string[] = [];

  await Promise.all(
    publicIds.map(async (publicId) => {
      const success = await deleteImage(publicId);
      if (success) {
        deleted.push(publicId);
      } else {
        failed.push(publicId);
      }
    })
  );

  return { deleted, failed };
}

// ============================================================================
// URL Generation
// ============================================================================

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb';
  quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
}

/**
 * Generate an optimized URL for an image
 */
export function getOptimizedUrl(
  publicIdOrUrl: string,
  options: ImageTransformOptions = {}
): string {
  // If it's already a full URL, return as-is
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    // For Cloudinary URLs, we could parse and add transformations
    // For now, return as-is
    return publicIdOrUrl;
  }

  if (!isCloudinaryConfigured) {
    throw new CloudinaryUploadError('Cloudinary is not configured', 'NOT_CONFIGURED', 500);
  }

  return cloudinary.url(publicIdOrUrl, {
    secure: true,
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.crop || 'limit',
        quality: options.quality || 'auto:good',
        fetch_format: options.format || 'auto',
        gravity: options.gravity,
      },
    ],
  });
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(publicIdOrUrl: string, size: number = 400): string {
  return getOptimizedUrl(publicIdOrUrl, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto:good',
    format: 'auto',
    gravity: 'auto',
  });
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const url = new URL(cloudinaryUrl);

    // Check if it's a Cloudinary URL
    if (!url.hostname.includes('cloudinary.com')) {
      return null;
    }

    // Parse the path to extract public_id
    // Format: /v{version}/{folder}/{public_id}.{format}
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');

    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after 'upload' and version number
    const relevantParts = pathParts.slice(uploadIndex + 2);
    const fullPath = relevantParts.join('/');

    // Remove file extension
    const lastDotIndex = fullPath.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return fullPath.substring(0, lastDotIndex);
    }

    return fullPath;
  } catch {
    return null;
  }
}
