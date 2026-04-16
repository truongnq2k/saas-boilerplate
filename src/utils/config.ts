export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "tradingsystem",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "tradingsystem-refresh-secret",
  accessTokenExpiry: '15m',
  refreshTokenExpiryDays: 7,
  passwordResetTokenExpiryHours: 1,
} as const;

export const PASSWORD_CONFIG = {
  saltRounds: 10,
  minLength: 6,
} as const;

export const API_CONFIG = {
  headerKey: process.env.X_HEADER_KEY || "tradingsystem-header-key",
  rateLimitMax: 100,
  rateLimitTimeWindow: '1 minute',
} as const;

export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
} as const;