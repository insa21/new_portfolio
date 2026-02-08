import { NextRequest, NextResponse } from 'next/server';
import {
  uploadBuffer,
  validateMimeType,
  validateFileSize,
  isCloudinaryConfigured,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  CloudinaryUploadError,
} from '@/lib/cloudinary';

export const runtime = 'nodejs';

// Allowed types for upload (Images + PDF + SVG)
const VALID_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "application/pdf"
];

// Rate limiting helper
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 uploads per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = uploadAttempts.get(ip);

  if (!attempt || now > attempt.resetTime) {
    uploadAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (attempt.count >= RATE_LIMIT_MAX) {
    return false;
  }

  attempt.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service unavailable',
          message: 'Image upload service is not configured',
        },
        { status: 503 }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          message: 'Please wait before uploading again',
        },
        { status: 429 }
      );
    }

    // Parse form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Could not parse form data',
        },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;
    const tagsStr = formData.get('tags') as string | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
          message: 'Please select a file to upload',
        },
        { status: 400 }
      );
    }

    // Validate file name
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid filename',
          message: 'Filename contains invalid characters',
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!VALID_UPLOAD_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type',
          message: 'Allowed types: JPEG, PNG, WebP, GIF, AVIF, PDF',
          allowedTypes: VALID_UPLOAD_TYPES,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file size',
          message: sizeValidation.error,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify buffer starts with valid signatures (Image or PDF)
    if (!isValidFileBuffer(buffer)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file',
          message: 'File does not appear to be a valid image or PDF',
        },
        { status: 400 }
      );
    }

    // Determine folder and tags
    const uploadFolder = folder || 'portfolio/projects/thumbnails';
    const uploadTags = tagsStr ? tagsStr.split(',') : ['portfolio', 'project-thumbnail'];

    // Upload to Cloudinary
    const result = await uploadBuffer(buffer, {
      folder: uploadFolder,
      tags: uploadTags,
      resourceType: file.type === 'application/pdf' ? 'auto' : 'image',
      // Skip transformation for SVG to preserve vector quality
      transformation: file.type === 'image/svg+xml' ? undefined : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Handle known errors
    if (error instanceof CloudinaryUploadError) {
      return NextResponse.json(
        {
          success: false,
          error: error.code,
          message: error.message,
        },
        { status: error.httpCode }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'UPLOAD_FAILED',
        message: 'An unexpected error occurred while uploading',
      },
      { status: 500 }
    );
  }
}

// Verify file buffer has valid magic bytes
function isValidFileBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // PDF: %PDF (25 50 44 46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return true;
  }

  if (buffer.length < 8) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length > 11 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  // AVIF: starts with ftyp
  if (buffer.length > 11) {
    const ftypCheck =
      buffer[4] === 0x66 && // f
      buffer[5] === 0x74 && // t
      buffer[6] === 0x79 && // y
      buffer[7] === 0x70; // p
    if (ftypCheck) {
      return true;
    }
  }

  // SVG: starts with <?xml or <svg
  const textStart = buffer.slice(0, 100).toString('utf-8').trim().toLowerCase();
  if (textStart.startsWith('<?xml') || textStart.startsWith('<svg')) {
    return true;
  }

  return false;
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    status: isCloudinaryConfigured ? 'ready' : 'not_configured',
    allowedTypes: VALID_UPLOAD_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxSizeHuman: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
  });
}
