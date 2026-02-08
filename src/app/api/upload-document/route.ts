import { NextRequest, NextResponse } from 'next/server';
import {
  uploadBuffer,
  isCloudinaryConfigured,
  CloudinaryUploadError,
} from '@/lib/cloudinary';

export const runtime = 'nodejs';

// Allowed document types
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
] as const;

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Rate limiting helper (simple in-memory)
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 uploads per minute

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
          message: 'Document upload service is not configured',
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

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
          message: 'Please select a document file to upload',
        },
        { status: 400 }
      );
    }

    // Validate file name (prevent path traversal)
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
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as typeof ALLOWED_DOCUMENT_TYPES[number])) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type',
          message: 'Only PDF files are allowed',
          allowedTypes: [...ALLOWED_DOCUMENT_TYPES],
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_DOCUMENT_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too large',
          message: `Maximum file size is ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_DOCUMENT_SIZE,
        },
        { status: 400 }
      );
    }

    if (file.size < 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too small',
          message: 'File appears to be empty or corrupted',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify PDF magic bytes: %PDF
    if (buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid PDF',
          message: 'File does not appear to be a valid PDF',
        },
        { status: 400 }
      );
    }

    // Upload to Cloudinary as raw resource
    const result = await uploadBuffer(buffer, {
      folder: 'portfolio/documents',
      resourceType: 'raw',
      tags: ['portfolio', 'document', 'resume'],
    });

    return NextResponse.json({
      success: true,
      data: {
        secureUrl: result.secureUrl,
        publicId: result.publicId,
        resourceType: result.resourceType,
        bytes: result.bytes,
        format: 'pdf',
        originalName: file.name,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);

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

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    status: isCloudinaryConfigured ? 'ready' : 'not_configured',
    allowedTypes: [...ALLOWED_DOCUMENT_TYPES],
    maxSize: MAX_DOCUMENT_SIZE,
    maxSizeHuman: `${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
  });
}
