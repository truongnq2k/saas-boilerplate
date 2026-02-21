import { PaginatedResponse } from './common';

export interface ICreateApiKeyDto {
  name: string;
  permissions?: string[];
  expiresInDays?: number;
}

export interface IApiKeyResponse {
  id: number;
  name: string;
  key: string;
  prefix: string;
  permissions: string[] | null;
  expiresAt: Date | null;
  is_active: boolean;
  is_revoked: boolean;
  created_at: Date;
}

export interface IApiKeyQuery {
  page?: number;
  limit?: number;
  user_id?: number;
  tenant_id?: number;
  is_active?: boolean;
  is_revoked?: boolean;
}

export interface ApiKeyPaginatedResponse extends PaginatedResponse<IApiKeyResponse> {
  items: IApiKeyResponse[];
}
