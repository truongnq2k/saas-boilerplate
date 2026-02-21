export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  status?: string;
  search?: string;
  transactionType?: string;
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface BaseApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
  requestId?: string;
}

export interface PaginatedApiResponse<T> extends BaseApiResponse<PaginatedResponse<T>> {
  // Inherits all BaseApiResponse properties with data typed as PaginatedResponse<T>
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  errorCode?: string;
  timestamp?: string;
  requestId?: string;
}

// Sorting options
export type SortOrder = 'asc' | 'desc';
export type SortField = string;

// Common query parameters for list endpoints
export interface ListQueryParams extends PaginationParams {
  search?: string;
  filter?: Record<string, any>;
}

// HTTP status codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

// Common error codes
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export type UserRole = 'ADMIN' | 'USER' | 'STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';