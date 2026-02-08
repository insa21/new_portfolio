import { NextRequest, NextResponse } from 'next/server';
import {
  uploadFromUrl,
  validateImageUrl,
  hasValidImageExtension,
  isCloudinaryConfigured,
  CloudinaryUploadError,
  ALLOWED_EXTENSIONS,
} from '@/lib/cloudinary';

export const runtime = 'nodejs';

// Rate limiting (simple in-memory)
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 URL uploads per minute (lower than file upload)

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

// Blocked domains for security
const BLOCKED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '10.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '192.168.',
  '169.254.',
];

function isBlockedDomain(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase();
  return BLOCKED_DOMAINS.some(blocked => lowerHostname.startsWith(blocked) || lowerHostname === blocked);
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

    // Parse JSON body
    let body: { imageUrl?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Could not parse request body',
        },
        { status: 400 }
      );
    }

    const { imageUrl } = body;

    // Validate URL exists and is a string
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing URL',
          message: 'Please provide an image URL',
        },
        { status: 400 }
      );
    }

    // Trim and check length
    const trimmedUrl = imageUrl.trim();
    if (trimmedUrl.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Empty URL',
          message: 'Image URL cannot be empty',
        },
        { status: 400 }
      );
    }

    if (trimmedUrl.length > 2048) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL too long',
          message: 'Image URL is too long',
        },
        { status: 400 }
      );
    }

    // Validate URL format
    const urlValidation = validateImageUrl(trimmedUrl);
    if (!urlValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL',
          message: urlValidation.error,
        },
        { status: 400 }
      );
    }

    // Check for blocked domains (SSRF protection)
    try {
      const url = new URL(trimmedUrl);
      if (isBlockedDomain(url.hostname)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Blocked domain',
            message: 'Cannot upload from this domain',
          },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL',
          message: 'Could not parse URL',
        },
        { status: 400 }
      );
    }

    // Validate image extension or content-type
    const hasExtension = hasValidImageExtension(trimmedUrl);

    if (!hasExtension) {
      // Try to validate content-type via HEAD request
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const headResponse = await fetch(trimmedUrl, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Portfolio-Image-Validator/1.0',
          },
        });

        clearTimeout(timeoutId);

        const contentType = headResponse.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Not an image',
              message: 'URL does not point to a valid image',
              hint: `Allowed extensions: ${[...ALLOWED_EXTENSIONS].join(', ')}`,
            },
            { status: 400 }
          );
        }

        // Check content-length if available
        const contentLength = headResponse.headers.get('content-length');
        if (contentLength) {
          const size = parseInt(contentLength, 10);
          if (size > 10 * 1024 * 1024) {
            // 10MB for URL uploads
            return NextResponse.json(
              {
                success: false,
                error: 'File too large',
                message: 'Remote image is too large (maximum 10MB)',
              },
              { status: 400 }
            );
          }
        }
      } catch (error) {
        // If HEAD fails, log but continue (Cloudinary will validate)
        console.warn('Could not validate remote image:', error);
      }
    }

    // Upload to Cloudinary
    const result = await uploadFromUrl(trimmedUrl, {
      folder: 'portfolio/projects/thumbnails',
      tags: ['portfolio', 'project-thumbnail', 'url-import'],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('URL upload error:', error);

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

    // Handle specific Cloudinary error messages
    const errorMessage = error instanceof Error ? error.message : '';

    if (errorMessage.includes('Invalid image')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image',
          message: 'The URL does not point to a valid image file',
        },
        { status: 400 }
      );
    }

    if (errorMessage.includes('Resource not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Could not access the image at the provided URL',
        },
        { status: 400 }
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

// Health check
export async function GET() {
  return NextResponse.json({
    success: true,
    status: isCloudinaryConfigured ? 'ready' : 'not_configured',
    allowedExtensions: [...ALLOWED_EXTENSIONS],
  });
}
