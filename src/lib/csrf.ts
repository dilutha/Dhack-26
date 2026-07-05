import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_SECRET =
  process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

interface CSRFToken {
  token: string;
  expires: number;
}

// In-memory store for CSRF tokens (in production, use Redis)
const csrfTokens = new Map<string, CSRFToken>();

export class CSRFService {
  static generateToken(): string {
    const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
    const expires = Date.now() + CSRF_TOKEN_EXPIRY;

    csrfTokens.set(token, { token, expires });

    // Clean up expired tokens
    this.cleanupExpiredTokens();

    return token;
  }

  static validateToken(token: string): boolean {
    const storedToken = csrfTokens.get(token);

    if (!storedToken) {
      return false;
    }

    if (Date.now() > storedToken.expires) {
      csrfTokens.delete(token);
      return false;
    }

    return true;
  }

  static cleanupExpiredTokens(): void {
    const now = Date.now();
    const entries = Array.from(csrfTokens.entries());
    for (const [token, data] of entries) {
      if (now > data.expires) {
        csrfTokens.delete(token);
      }
    }
  }

  static setCSRFCookie(response: NextResponse, token: string): NextResponse {
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('csrf-token', token, {
      httpOnly: false, // CSRF token needs to be accessible to JavaScript
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
