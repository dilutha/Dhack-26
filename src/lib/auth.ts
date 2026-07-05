import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export class AuthService {
  static generateTokens(userId: string, email: string, role: 'admin' | 'user') {
    const payload: JWTPayload = {
      userId,
      email,
      role,
    };

    const refreshPayload: RefreshTokenPayload = {
      userId,
      email,
      tokenVersion: Date.now(), // Simple versioning
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'dhack26',
      audience: 'dhack26-users',
    });

    const refreshToken = jwt.sign(refreshPayload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'dhack26',
      audience: 'dhack26-refresh',
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'dhack26',
        audience: 'dhack26-users',
      }) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'dhack26',
        audience: 'dhack26-refresh',
      }) as RefreshTokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  static setTokenCookies(
    response: Response,
    accessToken: string,
    refreshToken: string
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token cookie (shorter expiry)
    response.headers.set(
      'Set-Cookie',
      `access_token=${accessToken}; Path=/; HttpOnly; Secure=${isProduction}; SameSite=Strict; Max-Age=${24 * 60 * 60}`
    );

    // Refresh token cookie (longer expiry)
    response.headers.set(
      'Set-Cookie',
      `refresh_token=${refreshToken}; Path=/; HttpOnly; Secure=${isProduction}; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  }

  static clearTokenCookies(response: Response) {
    const isProduction = process.env.NODE_ENV === 'production';

    response.headers.set(
      'Set-Cookie',
      `access_token=; Path=/; HttpOnly; Secure=${isProduction}; SameSite=Strict; Max-Age=0`
    );

    response.headers.set(
      'Set-Cookie',
      `refresh_token=; Path=/; HttpOnly; Secure=${isProduction}; SameSite=Strict; Max-Age=0`
    );

    return response;
  }
}
