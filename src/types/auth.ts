import { UserProfile } from './user';

export interface IRefreshTokenDto {
  refreshToken: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IRefreshTokenResponse {
  success: boolean;
  message: string;
  data?: IAuthTokens;
}

export interface ILogoutResponse {
  success: boolean;
  message: string;
}

export interface ILoginDto {
  login: string;
  password: string;
}

export interface IRegisterDto {
  username: string;
  email?: string;
  password: string;
  name: string;
}

export interface IAuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IForgotPasswordDto {
  email: string;
}

export interface IResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
