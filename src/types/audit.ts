import { PaginatedResponse } from './common';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGED'
  | 'EMAIL_VERIFIED'
  | 'ROLE_CHANGED'
  | 'STATUS_CHANGED'
  | 'API_KEY_CREATED'
  | 'API_KEY_REVOKED'
  | 'TENANT_CREATED'
  | 'TENANT_UPDATED'
  | 'TENANT_DELETED';

export interface ICreateAuditLogDto {
  action: AuditAction;
  entity: string;
  entity_id?: number;
  description?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  user_id?: number;
  tenant_id?: number;
}

export interface IAuditLogQuery {
  page?: number;
  limit?: number;
  user_id?: number;
  tenant_id?: number;
  action?: string;
  entity?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogProfile {
  id: number;
  action: string;
  entity: string;
  entity_id: number | null;
  description: string | null;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  user_id: number | null;
  tenant_id: number | null;
  created_at: Date;
}

export interface AuditLogPaginatedResponse extends PaginatedResponse<AuditLogProfile> {
  items: AuditLogProfile[];
}
