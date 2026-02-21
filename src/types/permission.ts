import { UserRole } from './common';

export type Role = UserRole;

export interface IPermission {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  module: string;
  is_active: boolean;
}

export interface IRolePermission {
  role: Role;
  permissions: string[];
}

export interface IPermissionGrouped {
  module: string;
  permissions: IPermission[];
}
