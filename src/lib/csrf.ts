import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_SECRET =
  process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

// Helper to sign the token payload
function signToken(payload: string): string {
  return createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');
}

export class CSRFService {
  static generateToken(): string {
    const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
    const expires = Date.now() + CSRF_TOKEN_EXPIRY;
    const payload = `${token}.${expires}`;
    const signature = signToken(payload);
    
    return `${payload}.${signature}`;
  }

  static validateToken(tokenStr: string): boolean {
    if (!tokenStr) return false;
    
    const parts = tokenStr.split('.');
    if (parts.length !== 3) return false;
    
    const [token, expiresStr, signature] = parts;
    const payload = `${token}.${expiresStr}`;
    const expectedSignature = signToken(payload);
    
    if (signature.length !== expectedSignature.length) return false;
    
    const isValidSignature = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    
    if (!isValidSignature) {
      return false;
    }
    
    const expires = parseInt(expiresStr, 10);
    if (isNaN(expires) || Date.now() > expires) {
      return false;
    }
    
    return true;
  }

  static setCSRFCookie(response: NextResponse, token: string): NextResponse {
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('csrf-token', token, {
      httpOnly: false, // CSRF token needs to be accessible to JavaScript if they read it from cookies
      secure: isProduction,
      sameSite: 'lax', // Changed from 'strict' to 'lax' to help with third-party cookie issues
      maxAge: CSRF_TOKEN_EXPIRY / 1000,
      path: '/',
    });

    return response;
  }

  static async getCSRFTokenFromRequest(
    request: NextRequest
  ): Promise<string | null> {
    // Try to get from header first
    const headerToken = request.headers.get('x-csrf-token');
    if (headerToken) {
      return headerToken;
    }

    // Try to get from form data
    try {
      const formData = await request.formData();
      if (formData) {
        const formToken = formData.get('csrf-token') as string;
        if (formToken) {
          return formToken;
        }
      }
    } catch (error) {
      // Form data parsing failed, continue without it
    }

    return null;
  }

  static async validateCSRFToken(request: NextRequest): Promise<boolean> {
    // In development, bypass CSRF validation if you want, but since it's stateless now,
    // it will work perfectly fine in dev with hot reloading. We'll still bypass to match old behavior,
    // or remove it so it's tested in dev too. Let's keep it to avoid breaking dev workflow if any.
    if (process.env.NODE_ENV !== 'production') {
      // We can actually return true here if we want to bypass, but since our new implementation
      // is stateless, hot reloads will no longer break it!
      // But we will respect the original code's intention.
      // return true; 
    }

    const token = await this.getCSRFTokenFromRequest(request);

    if (!token) {
      console.warn('No CSRF token found in request');
      return false;
    }

    const isValid = this.validateToken(token);
    if (!isValid) {
      console.warn('Invalid or expired CSRF token');
    }

    return isValid;
  }
}
