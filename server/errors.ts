import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string = 'GENERIC_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
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
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  timestamp: string;
  path: string;
  details?: any;
  stack?: string;
}

// Development vs Production error details
function getErrorDetails(error: Error, isDevelopment: boolean) {
  const details: any = {};
  
  if (error instanceof ZodError) {
    details.validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
  }
  
  if (isDevelopment) {
    details.stack = error.stack;
  }
  
  return Object.keys(details).length > 0 ? details : undefined;
}

// Main error handler middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log error
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (error.message?.includes('duplicate key')) {
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE_RESOURCE';
  } else if (error.message?.includes('foreign key')) {
    statusCode = 400;
    message = 'Invalid reference';
    code = 'INVALID_REFERENCE';
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    path: req.path,
    details: getErrorDetails(error, isDevelopment)
  };

  // Don't expose stack traces in production
  if (isDevelopment && !(error instanceof AppError)) {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
  const error = new NotFoundError('Endpoint');
  res.status(404).json({
    success: false,
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    path: req.path
  });
}

// Validation helper
export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Success response helper
export function successResponse(
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

// Pagination response helper
export function paginatedResponse(
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
) {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  res.json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null
    },
    timestamp: new Date().toISOString()
  });
}