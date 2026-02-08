import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[Download Proxy] Media ID:', id);

    // Get cookies from the incoming request
    const cookieHeader = request.headers.get('cookie');
    console.log('[Download Proxy] Has cookies:', !!cookieHeader);

    if (!cookieHeader) {
      console.log('[Download Proxy] No cookies found in request');
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No cookies' },
        { status: 401 }
      );
    }

    // Proxy the request to the backend with cookies
    const backendUrl = `${API_BASE}/media/${id}/download`;
    console.log('[Download Proxy] Backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    });

    console.log('[Download Proxy] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[Download Proxy] Backend error:', errorText);
      return NextResponse.json(
        { success: false, message: errorText || 'Download failed' },
        { status: response.status }
      );
    }

    // Get the content type and disposition from backend response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || 'attachment';

    console.log('[Download Proxy] Content-Type:', contentType);
    console.log('[Download Proxy] Content-Disposition:', contentDisposition);

    // Stream the response body
    const buffer = await response.arrayBuffer();
    console.log('[Download Proxy] Buffer size:', buffer.byteLength);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('[Download Proxy] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

