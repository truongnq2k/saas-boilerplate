import { FastifyRequest } from 'fastify';
import { ListQueryParams, PaginationParams } from './common';

// User interface for authentication
export interface AuthenticatedUser {
  userId: number;
  role: 'ADMIN' | 'USER' | 'STAFF';
  username: string;
}

// Generic Authenticated Request Interface
export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

// Generic Request with Query Parameters
export interface RequestWithQuery<T = any> extends FastifyRequest {
  query: T;
}

// Generic Request with Body
export interface RequestWithBody<T = any> extends FastifyRequest {
  body: T;
}

// Generic Request with Params
export interface RequestWithParams<T = any> extends FastifyRequest {
  params: T;
}

// Combined Interfaces
export interface RequestWithAuthAndQuery<Q = any> extends AuthenticatedRequest {
  query: Q;
}

export interface RequestWithAuthAndBody<B = any> extends AuthenticatedRequest {
  body: B;
}

export interface RequestWithAuthAndParams<P = any> extends AuthenticatedRequest {
  params: P;
}

export interface RequestWithQueryAndBody<Q = any, B = any> extends FastifyRequest {
  query: Q;
  body: B;
}

export interface RequestWithParamsAndBody<P = any, B = any> extends FastifyRequest {
  params: P;
  body: B;
}
