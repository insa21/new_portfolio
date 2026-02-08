import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';
import { AuthRequest } from '../../middlewares/auth.js';
import { uploadSingle } from '../../middlewares/upload.js';
import { parseQueryInt } from '../../utils/helpers.js';
import { v2 as cloudinary } from 'cloudinary';

// ============================================================================
// Cloudinary Configuration
// ============================================================================

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<{
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
}> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'portfolio/media-library',
      resource_type: 'auto' as const,
      unique_filename: true,
      invalidate: true,
      access_mode: 'public' as const, // Make files publicly accessible
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new Error(error.message || 'Cloudinary upload failed'));
        } else if (result) {
          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            bytes: result.bytes,
          });
        } else {
          reject(new Error('Upload failed - no result returned'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

async function uploadUrlToCloudinary(url: string): Promise<{
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
}> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'portfolio/media-library',
      resource_type: 'auto' as const,
      unique_filename: true,
      invalidate: true,
      access_mode: 'public' as const,
    };

    cloudinary.uploader.upload(url, uploadOptions, (error, result) => {
      if (error) {
        reject(new Error(error.message || 'Cloudinary upload failed'));
      } else if (result) {
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
        });
      } else {
        reject(new Error('Upload failed - no result returned'));
      }
    });
  });
}

async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error);
    return false;
  }
}

// ============================================================================
// Helper: Ensure filename has correct extension
// ============================================================================

/**
 * Ensures the download filename has the correct extension based on format.
 * This fixes issues where uploaded files may have inconsistent extensions.
 * @param filename - Original filename from database
 * @param format - File format from Cloudinary (e.g., 'pdf', 'jpg')
 * @returns Filename with correct extension
 */
function ensureProperFilename(filename: string, format: string | null): string {
  if (!format) return filename;

  const expectedExt = `.${format.toLowerCase()}`;
  const lowerFilename = filename.toLowerCase();

  // Already has correct extension
  if (lowerFilename.endsWith(expectedExt)) {
    return filename;
  }

  // Remove any existing extension and add correct one
  const baseName = filename.replace(/\.[^.]+$/, '');
  return `${baseName}${expectedExt}`;
}

// ============================================================================
// Controller
// ============================================================================

export class MediaController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseQueryInt(req.query.page as string, 1);
      const limit = parseQueryInt(req.query.limit as string, 20);
      const skip = (page - 1) * limit;

      // Search & Filter
      const search = (req.query.q as string) || '';
      const typeFilter = (req.query.type as string) || 'all'; // all | images | documents
      const sort = (req.query.sort as string) || 'newest'; // newest | oldest | name

      // Build where clause
      const where: any = {};

      if (search) {
        where.filename = {
          contains: search,
          mode: 'insensitive',
        };
      }

      if (typeFilter === 'images') {
        where.mimetype = {
          startsWith: 'image/',
        };
      } else if (typeFilter === 'documents') {
        where.mimetype = {
          in: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        };
      }

      // Build orderBy clause
      let orderBy: any;
      switch (sort) {
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'name':
          orderBy = { filename: 'asc' };
          break;
        case 'newest':
        default:
          orderBy = { createdAt: 'desc' };
          break;
      }

      const [media, total] = await Promise.all([
        prisma.media.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.media.count({ where }),
      ]);

      sendPaginated(res, media, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'File tidak ditemukan.' });
        return;
      }

      // Check if Cloudinary is configured
      if (!isCloudinaryConfigured) {
        res.status(503).json({
          success: false,
          message: 'Cloudinary is not configured. Please set environment variables.',
        });
        return;
      }

      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

      // Save to database
      const media = await prisma.media.create({
        data: {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: cloudinaryResult.secureUrl,
          alt: req.body.alt || null,
          publicId: cloudinaryResult.publicId,
          resourceType: cloudinaryResult.resourceType,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
        },
      });

      sendSuccess(res, media, 'File berhasil diupload.', 201);
    } catch (error) {
      next(error);
    }
  }

  async uploadByUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl || typeof imageUrl !== 'string') {
        res.status(400).json({ success: false, message: 'URL gambar tidak valid.' });
        return;
      }

      if (!isCloudinaryConfigured) {
        res.status(503).json({
          success: false,
          message: 'Cloudinary is not configured.',
        });
        return;
      }

      // Upload to Cloudinary
      const cloudinaryResult = await uploadUrlToCloudinary(imageUrl);

      // Get filename from URL or default
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'uploaded-image';

      // Save to database
      const media = await prisma.media.create({
        data: {
          filename: filename,
          mimetype: `image/${cloudinaryResult.format}`, // Best guess
          size: cloudinaryResult.bytes,
          url: cloudinaryResult.secureUrl,
          alt: null,
          publicId: cloudinaryResult.publicId,
          resourceType: cloudinaryResult.resourceType,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
        },
      });

      sendSuccess(res, media, 'File berhasil diimport.', 201);
    } catch (error) {
      next(error);
    }
  }

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await prisma.media.findUnique({
        where: { id: req.params.id as string },
      });

      if (!media) {
        res.status(404).json({ success: false, message: 'Media tidak ditemukan.' });
        return;
      }

      console.log('[Download] Fetching media:', media.id, media.filename);
      console.log('[Download] Resource type:', media.resourceType);
      console.log('[Download] Public ID:', media.publicId);
      console.log('[Download] Original URL:', media.url);

      let downloadUrl = media.url;
      const resourceType = media.resourceType || 'raw';
      const downloadFilename = ensureProperFilename(media.filename, media.format);

      // For raw files (PDFs), use Cloudinary fl_attachment to force download
      // This avoids authentication issues and ensures proper browser download
      if (resourceType === 'raw' && media.publicId && CLOUD_NAME) {
        // Build Cloudinary URL with fl_attachment transformation
        // Format: https://res.cloudinary.com/{cloud_name}/raw/upload/fl_attachment:{filename}/{public_id}
        const sanitizedFilename = downloadFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
        downloadUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/fl_attachment:${sanitizedFilename}/${media.publicId}`;
        console.log('[Download] Using fl_attachment URL for PDF:', downloadUrl);

        // Redirect to Cloudinary download URL
        res.redirect(downloadUrl);
        return;
      }

      // For images/videos, use signed URL approach
      if (media.publicId && isCloudinaryConfigured && resourceType !== 'raw') {
        try {
          downloadUrl = cloudinary.url(media.publicId, {
            resource_type: resourceType as 'image' | 'video',
            type: 'upload',
            sign_url: true,
            secure: true,
          });
          console.log('[Download] Generated signed URL:', downloadUrl.substring(0, 80) + '...');
        } catch (signError) {
          console.log('[Download] Signed URL generation failed, using original URL:', signError);
          downloadUrl = media.url;
        }
      } else {
        console.log('[Download] Using original URL for', resourceType, 'resource');
      }

      // Fetch from Cloudinary
      const response = await fetch(downloadUrl);
      console.log('[Download] Response status:', response.status, response.statusText);

      if (!response.ok) {
        // If signed URL failed, try original URL as fallback
        if (downloadUrl !== media.url) {
          console.log('[Download] Signed URL failed, trying original URL...');
          const fallbackResponse = await fetch(media.url);
          if (fallbackResponse.ok) {
            const arrayBuffer = await fallbackResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            res.setHeader('Content-Type', media.mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
            res.send(buffer);
            return;
          }
        }

        console.error('[Download] All fetch attempts failed');
        res.status(502).json({
          success: false,
          message: `Failed to fetch from Cloudinary: ${response.status} ${response.statusText}`
        });
        return;
      }

      // Set headers for download with proper filename extension
      res.setHeader('Content-Type', media.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);

      // Stream the response body to the client
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log('[Download] Sending buffer size:', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('[Download] Error:', error);
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const media = await prisma.media.findUnique({
        where: { id: req.params.id as string },
      });

      if (!media) {
        res.status(404).json({ success: false, message: 'Media tidak ditemukan.' });
        return;
      }

      // Delete from Cloudinary if publicId exists
      if (media.publicId && isCloudinaryConfigured) {
        const deleted = await deleteFromCloudinary(media.publicId);
        if (!deleted) {
          console.warn(`Failed to delete from Cloudinary: ${media.publicId}`);
          // Continue with database deletion even if Cloudinary delete fails
        }
      }

      // Delete from database
      await prisma.media.delete({ where: { id: req.params.id as string } });

      sendSuccess(res, null, 'Media berhasil dihapus.');
    } catch (error) {
      next(error);
    }
  }
}

export const mediaController = new MediaController();

// Export upload middleware
export const mediaUpload = uploadSingle('file');
