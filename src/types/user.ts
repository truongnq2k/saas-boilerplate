import { PaginatedResponse, PaginationMeta, PaginationParams, UserRole, UserStatus } from './common';

export interface ICreateUserDto {
  username: string;
  email?: string;
  password: string;
  name: string;
  role?: UserRole;
  tenant_id?: number;
}

export interface IUpdateUserDto {
  username?: string;
  email?: string;
  name?: string;
  status?: UserStatus;
}

export interface IUserLoginData {
  username: string;
  password: string;
}

export interface UserQuery extends PaginationParams {
  search?: string;
  role?: string;
  status?: string;
  sortBy?: 'created_at' | 'name' | 'username';
  sortOrder?: 'asc' | 'desc';
}

export interface UserPaginatedResponse extends PaginatedResponse<UserProfile> {
  items: UserProfile[];
  pagination: PaginationMeta;
}

export interface IAuthResponse {
  user: UserProfile;
  success: boolean;
  token: string;
  message: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string | null | undefined;
  name: string;
  role: UserRole;
  status: UserStatus;
  tenant_id: number | null | undefined;
  created_at: Date;
  updated_at: Date;
}

export interface IUserWithoutPassword {
  id: number;
  username: string;
  email?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  tenant_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ILoginDto {
  username: string;
  password: string;
}

export interface IRegisterResponse {
  user: UserProfile;
  success: boolean;
  message: string;
}

export interface IUserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export interface IUpdateStatusDto {
  status: UserStatus;
  reason?: string;
}

export interface IPasswordChangeDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
