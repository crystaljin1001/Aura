/**
 * Error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class GitHubApiError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, 'GITHUB_API_ERROR');
    this.name = 'GitHubApiError';
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = 'GitHub API rate limit exceeded',
    public resetAt?: Date
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class EncryptionError extends AppError {
  constructor(message: string = 'Encryption operation failed') {
    super(message, 500, 'ENCRYPTION_ERROR');
    this.name = 'EncryptionError';
  }
}

/**
 * Formats error messages for API responses
 */
export function formatError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
