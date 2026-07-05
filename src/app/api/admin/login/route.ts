import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { AuthService } from '@/lib/auth';
import { CSRFService } from '@/lib/csrf';
import {
  handleAPIError,
  createSuccessResponse,
  ValidationError,
  AuthenticationError,
} from '@/lib/errorHandler';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  csrfToken: z.string().min(1, 'CSRF token is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ipHeader = request.headers.get('x-forwarded-for') || '';
    const ip = ipHeader.split(',')[0]?.trim() || '';
    const rl = rateLimit('admin_login_POST', ip, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per 15 minutes
    });

    if (!rl.allowed) {
      throw new AuthenticationError(
        'Too many login attempts. Please try again later.'
      );
    }

    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !CSRFService.validateToken(csrfToken)) {
      throw new AuthenticationError('Invalid CSRF token');
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        'Invalid input data',
        validation.error.flatten()
      );
    }

    const { email, password } = validation.data;

    // Verify admin credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Database configuration missing');
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // Check if admin exists
    const { data: adminRows, error: adminError } = await adminClient
      .from('admins')
      .select('email, role, password_hash')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (adminError) {
      throw new Error('Database query failed');
    }

    if (!adminRows || adminRows.length === 0) {
      throw new AuthenticationError('Invalid credentials');
    }

    const admin = adminRows[0];

    // In a real implementation, you would verify the password hash here
    // For now, we'll use a simple check (replace with proper bcrypt verification)
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = AuthService.generateTokens(
      admin.email,
      admin.email,
      'admin'
    );

    // Create response with tokens
    const response = createSuccessResponse({
      message: 'Login successful',
      user: {
        email: admin.email,
        role: admin.role || 'admin',
      },
    });

    // Set secure cookies
    return AuthService.setTokenCookies(response, accessToken, refreshToken);
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Generate CSRF token for login form
    const csrfToken = CSRFService.generateToken();
    const response = NextResponse.json({ csrfToken });

    return CSRFService.setCSRFCookie(response, csrfToken);
  } catch (error) {
    return handleAPIError(error);
  }
}
