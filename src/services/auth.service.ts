import * as jwt from 'jsonwebtoken';
import { prisma } from '@/utils/prisma';
import { IAuthTokens, IRefreshTokenDto } from '@/types/auth';
import { UserRole } from '@/types/common';

const JWT_SECRET = process.env.JWT_SECRET || "tradingsystem";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "tradingsystem-refresh-secret";
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export const generateAccessToken = (payload: {
  userId: number;
  role: UserRole;
  username: string;
}): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = async (userId: number): Promise<string> => {
  const token = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      token,
      expiresAt,
      user_id: userId,
    },
  });

  return token;
};

export const refreshAccessToken = async (data: IRefreshTokenDto): Promise<IAuthTokens> => {
  try {
    const decoded = jwt.verify(data.refreshToken, JWT_REFRESH_SECRET) as { userId: number };

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: data.refreshToken },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.revoked) {
      throw new Error('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new Error('Refresh token has expired');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true, status: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('User account is not active');
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true, revokedAt: new Date() },
    });

    const newAccessToken = generateAccessToken({
      userId: user.id,
      role: user.role as UserRole,
      username: user.username,
    });

    const newRefreshToken = await generateRefreshToken(user.id);

    const expiresIn = 15 * 60;

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true, revokedAt: new Date() },
    });
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    throw error;
  }
};

export const revokeAllUserTokens = async (userId: number): Promise<void> => {
  try {
    await prisma.refreshToken.updateMany({
      where: { user_id: userId, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });
  } catch (error) {
    console.error('Error revoking all user tokens:', error);
    throw error;
  }
};
