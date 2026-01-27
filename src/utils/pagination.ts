import { PaginationMeta, PaginationOptions, PaginationParams } from '../types/common';

export const extractPaginationParams = (query: {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: string;
}): PaginationOptions => {
  const page = Math.max(1, parseInt(String(query.page)) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit)) || 10));
  const sortBy = query.sortBy || 'created_at';
  const sortOrder = (query.sortOrder && query.sortOrder.toLowerCase() === 'asc') ? 'asc' : 'desc';

  return {
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

/**
 * Build pagination metadata
 */
export const buildPaginationMeta = (
  options: {
    page: number;
    limit: number;
    total: number;
  }
): PaginationMeta => {
  const totalPages = Math.ceil(options.total / options.limit);

  return {
    currentPage: options.page,
    itemsPerPage: options.limit,
    totalItems: options.total,
    totalPages,
    hasNextPage: options.page < totalPages,
    hasPrevPage: options.page > 1,
  };
};

/**
 * Calculate skip value for database queries
 */
export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Validate pagination parameters
 */
export const validatePaginationParams = (params: PaginationParams): {
  isValid: boolean;
  errors: string[];
  normalized?: PaginationOptions;
} => {
  const errors: string[] = [];

  // Validate page
  if (params.page !== undefined) {
    if (!Number.isInteger(params.page) || params.page < 1) {
      errors.push('Page must be a positive integer');
    }
  }

  // Validate limit
  if (params.limit !== undefined) {
    if (!Number.isInteger(params.limit) || params.limit < 1) {
      errors.push('Limit must be a positive integer');
    } else if (params.limit > 100) {
      errors.push('Limit cannot exceed 100 items per page');
    }
  }

  // Validate sortOrder
  if (params.sortOrder !== undefined) {
    if (params.sortOrder !== 'asc' && params.sortOrder !== 'desc') {
      errors.push('Sort order must be either "asc" or "desc"');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Return normalized pagination options
  return {
    isValid: true,
    errors: [],
    normalized: extractPaginationParams(params),
  };
};

/**
 * Create default pagination options
 */
export const createDefaultPaginationOptions = (): PaginationOptions => {
  return {
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  };
};

/**
 * Build order by clause for Prisma queries
 */
export const buildOrderBy = (sortBy?: string, sortOrder?: 'asc' | 'desc'): Record<string, 'asc' | 'desc'> => {
  return {
    [sortBy || 'created_at']: sortOrder || 'desc',
  };
};

/**
 * Generate pagination links for API responses (optional enhancement)
 */
export const generatePaginationLinks = (
  baseUrl: string,
  currentPage: number,
  totalPages: number,
  limit: number,
  queryParams: Record<string, string | number> = {}
): {
  first?: string;
  prev?: string;
  current: string;
  next?: string;
  last?: string;
} => {
  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });
  searchParams.set('limit', limit.toString());

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const links: {
    first?: string;
    prev?: string;
    current: string;
    next?: string;
    last?: string;
  } = {
    current: buildUrl(currentPage),
  };

  if (currentPage > 1) {
    links.first = buildUrl(1);
    links.prev = buildUrl(currentPage - 1);
  }

  if (currentPage < totalPages) {
    links.next = buildUrl(currentPage + 1);
    links.last = buildUrl(totalPages);
  }

  return links;
};
