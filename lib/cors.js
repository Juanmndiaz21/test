import { NextResponse } from 'next/server';

function isAllowedOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    // Allow localhost and loopback in development
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return true;
    }
    if (process.env.NEXTAUTH_URL) {
      const appUrl = new URL(process.env.NEXTAUTH_URL);
      if (url.origin === appUrl.origin) return true;
    }
    if (process.env.VERCEL_URL) {
      if (url.hostname === process.env.VERCEL_URL || url.hostname.endsWith('.vercel.app')) {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

export function applyCorsHeaders(response, request) {
  const headers = new Headers(response.headers);
  const origin = request?.headers?.get?.('origin');

  if (origin && isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Max-Age', '86400');
    headers.set('Vary', 'Origin');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function handleOptions(request) {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    const headers = new Headers();
    if (origin && isAllowedOrigin(origin)) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      headers.set('Access-Control-Max-Age', '86400');
      headers.set('Vary', 'Origin');
    }
    return new NextResponse(null, { status: 204, headers });
  }
  return null;
}

