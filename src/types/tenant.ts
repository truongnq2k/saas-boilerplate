import { PaginatedResponse } from './common';

export interface ITenantDto {
  name: string;
  slug: string;
  settings?: Record<string, any>;
}

export interface IUpdateTenantDto {
  name?: string;
  settings?: Record<string, any>;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface ITenantQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface TenantProfile {
  id: number;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  settings: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

export interface TenantPaginatedResponse extends PaginatedResponse<TenantProfile> {
  items: TenantProfile[];
}

export interface ITenantResponse {
  success: boolean;
  message: string;
  data?: TenantProfile;
}
