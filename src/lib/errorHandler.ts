import { NextResponse } from 'next/server';
import { logger } from './logger';

export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service unavailable') {
    super(message, 503, 'EXTERNAL_SERVICE_ERROR');
  }
}

export function handleAPIError(error: unknown): NextResponse {
  // Log the error for debugging
  logger.error('API Error', {
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    timestamp: new Date().toISOString(),
  });

  // Handle known application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' &&
          error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Handle validation errors from Zod
  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        ...(process.env.NODE_ENV === 'development' && { details: error }),
      },
      { status: 400 }
    );
  }

  // Handle unexpected errors
  const isDevelopment = process.env.NODE_ENV === 'development';

  return NextResponse.json(
    {
      error: isDevelopment
        ? error instanceof Error
          ? error.message
          : 'Unknown error occurred'
        : 'An unexpected error occurred. Please try again later.',
      code: 'INTERNAL_ERROR',
      ...(isDevelopment && error instanceof Error && { stack: error.stack }),
    },
    { status: 500 }
  );
}

export function createSuccessResponse(
  data: any,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

export function createErrorResponse(error: APIError): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' &&
        error.details && { details: error.details }),
    },
    { status: error.statusCode }
  );
}

// Global error handler for async functions
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error; // Re-throw to be handled by the API route
    }
  };
}
