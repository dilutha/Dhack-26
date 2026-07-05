import { NextRequest, NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Content Security Policy (aligned with next.config.js)
  const csp = isProduction
    ? [
        "default-src 'self'",
        "object-src 'none'",
        // Allow reCAPTCHA and Counter.dev Analytics
        "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.counter.dev",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        // Allow HTTPS and WebSocket connections
        "connect-src 'self' https: wss:",
        "frame-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
        // Allow data URIs for media
        "media-src 'self' data: https:",
      ].join('; ')
    : [
        "default-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "object-src 'none'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
        "style-src 'self' 'unsafe-inline' https:",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https: wss:",
        "frame-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
        "media-src 'self' data: https:",
      ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Strict Transport Security (only over HTTPS in production)
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export function createSecureResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response);
}

export function sanitizeHeaders(request: NextRequest): NextRequest {
  // Remove potentially dangerous headers
  const dangerousHeaders = [
    'x-forwarded-host',
    'x-original-url',
    'x-rewrite-url',
  ];

  dangerousHeaders.forEach(header => {
    if (request.headers.has(header)) {
      request.headers.delete(header);
    }
  });

  return request;
}

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin) {
    return true; // Allow requests without origin (e.g., direct API calls)
  }

  const allowedOrigins = [
    'https://dhack.lk',
    'https://www.dhack.lk',
    'http://localhost:3000',
    'http://localhost:9002',
  ];

  return allowedOrigins.includes(origin);
}
