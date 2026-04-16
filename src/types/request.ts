import { FastifyRequest } from 'fastify';
import { ListQueryParams, PaginationParams, UserRole } from './common';

export interface AuthenticatedUser {
  userId: number;
  role: UserRole;
  username: string;
  tenantId?: number;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

export interface RequestWithQuery<T = any> extends FastifyRequest {
  query: T;
}

export interface RequestWithBody<T = any> extends FastifyRequest {
  body: T;
}

export interface RequestWithParams<T = any> extends FastifyRequest {
  params: T;
}

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
