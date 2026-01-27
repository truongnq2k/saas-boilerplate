import {
  BaseApiResponse,
  ErrorCode,
  ErrorResponse,
  PaginatedApiResponse,
  PaginationMeta
} from '../types/common';

/**
 * Create a successful response with data
 */
export const successResponse = <T>(
  data: T,
  message: string = 'Success',
  options: {
    timestamp?: string;
    requestId?: string;
  } = {}
): BaseApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    timestamp: options.timestamp || new Date().toISOString(),
    requestId: options.requestId,
  };
};

/**
 * Create a paginated response for list endpoints
 */
export const paginatedResponse = <T>(
  items: T[],
  pagination: PaginationMeta,
  message: string = 'Items retrieved successfully',
  options: {
    timestamp?: string;
    requestId?: string;
  } = {}
): PaginatedApiResponse<T> => {
  return {
    success: true,
    message,
    data: {
      items,
      pagination,
    },
    timestamp: options.timestamp || new Date().toISOString(),
    requestId: options.requestId,
  };
};

/**
 * Create an error response
 */
export const errorResponse = (
  message: string,
  error?: string,
  options: {
    errorCode?: ErrorCode;
    timestamp?: string;
    requestId?: string;
  } = {}
): ErrorResponse => {
  return {
    success: false,
    message,
    error: error || 'An unexpected error occurred',
    errorCode: options.errorCode || ErrorCode.INTERNAL_ERROR,
    timestamp: options.timestamp || new Date().toISOString(),
    requestId: options.requestId,
  };
};

/**
 * Create a validation error response
 */
export const validationErrorResponse = (
  message: string = 'Validation failed',
  errors: string[] | Record<string, any> = [],
  options: {
    timestamp?: string;
    requestId?: string;
  } = {}
): ErrorResponse => {
  const errorMessage = Array.isArray(errors) ? errors.join(', ') : JSON.stringify(errors);
  return errorResponse(message, errorMessage, {
    errorCode: ErrorCode.VALIDATION_ERROR,
    ...options,
  });
};

/**
 * Create a not found error response
 */
export const notFoundResponse = (
  resource: string = 'Resource',
  options: {
    timestamp?: string;
    requestId?: string;
  } = {}
): ErrorResponse => {
  return errorResponse(`${resource} not found`, undefined, {
    errorCode: ErrorCode.NOT_FOUND,
    ...options,
  });
};

/**
 * Create an unauthorized error response
 */
export const unauthorizedResponse = (
  message: string = 'Unauthorized access',
  options: {
    timestamp?: string;
    requestId?: string;
  } = {}
): ErrorResponse => {
  return errorResponse(message, undefined, {
    errorCode: ErrorCode.UNAUTHORIZED,
    ...options,
  });
};

/**
 * Create a forbidden error response
 */
export const forbiddenResponse = (
  message: string = 'Access forbidden',
  options: {
    timestamp?: string;
    requestId?: string;
  } = {}
): ErrorResponse => {
  return errorResponse(message, undefined, {
    errorCode: ErrorCode.FORBIDDEN,
    ...options,
  });
};

/**
 * Create a conflict error response
 */
export const conflictResponse = (
  message: string = 'Resource conflict',
  options: {
    timestamp?: string;
    requestId?: string;
  } = {}
): ErrorResponse => {
  return errorResponse(message, undefined, {
    errorCode: ErrorCode.CONFLICT,
    ...options,
  });
};

/**
 * Create a database error response
 */
export const databaseErrorResponse = (
  message: string = 'Database operation failed',
  originalError?: string,
  options: {
    timestamp?: string;
    requestId?: string;
  } = {}
): ErrorResponse => {
  return errorResponse(message, originalError, {
    errorCode: ErrorCode.DATABASE_ERROR,
    ...options,
  });
};

export interface ApiResponse<T = any> extends BaseApiResponse<T> { }
export interface PaginatedApiListResponse<T> extends PaginatedApiResponse<T> { }
