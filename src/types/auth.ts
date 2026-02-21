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
