import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Bypass code is required' },
        { status: 400 }
      );
    }

    // Get the bypass codes from environment variables
    // Support both formats: comma-separated list and individual variables
    const bypassCodes = process.env.MAINTENANCE_BYPASS_CODES?.split(',') || [];
    const hashedCodes = process.env.MAINTENANCE_BYPASS_HASHES?.split(',') || [];

    // Also check individual bypass code variables (server-side only)
    const singleBypassCode = process.env.MAINTENANCE_BYPASS_CODE;
    if (singleBypassCode) bypassCodes.push(singleBypassCode);

    // Check if the provided code matches any of the bypass codes
    const isValidCode = bypassCodes.includes(code);

    // Or check if it matches any hashed versions (for additional security)
    const hashedInput = createHash('sha256').update(code).digest('hex');
    const isValidHash = hashedCodes.includes(hashedInput);

    // Dev fallback: if no codes configured in dev, allow a well-known default
    const isDevFallback =
      process.env.NODE_ENV !== 'production' &&
      bypassCodes.length === 0 &&
      hashedCodes.length === 0 &&
      code === 'dev-bypass';

    if (!isValidCode && !isValidHash && !isDevFallback) {
      return NextResponse.json(
        { error: 'Invalid bypass code' },
        { status: 401 }
      );
    }

    // Create response with bypass cookie
    const response = NextResponse.json({
      success: true,
      message: 'Bypass granted',
    });

    // Set secure bypass cookie
    response.cookies.set('maintenance_bypass', 'true', {
      path: '/',
      maxAge: 86400, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('Maintenance bypass error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check bypass status
export async function GET(request: NextRequest) {
  const bypassCookie = request.cookies.get('maintenance_bypass');
  const isBypassed = bypassCookie?.value === 'true';

  return NextResponse.json({
    bypassed: isBypassed,
    maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
  });
}
