import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/utils/prisma';
import { IAuthTokens, IRefreshTokenDto, IRegisterDto, ILoginDto, IForgotPasswordDto, IResetPasswordDto, IAuthResponse } from '@/types/auth';
import { UserRole, UserStatus } from '@/types/common';
import { emailService } from '@/services/email.service';
import { UserProfile } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || "tradingsystem";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "tradingsystem-refresh-secret";
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

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

export const register = async (data: IRegisterDto): Promise<IAuthResponse> => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role as UserRole,
      username: user.username,
    });

    const refreshToken = await generateRefreshToken(user.id);

    if (user.email) {
      await emailService.sendWelcomeEmail(user.email, user.name);
    }

    const expiresIn = 15 * 60;

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      tenant_id: user.tenant_id,
      balance: user.balance.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return {
      user: userProfile,
      accessToken,
      refreshToken,
      expiresIn,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginWithEmailOrUsername = async (data: ILoginDto): Promise<IAuthResponse> => {
  try {
    const login = data.login.trim();
    const isEmail = login.includes('@');

    let user = null;

    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: login },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: login },
      });
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('User account is not active');
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role as UserRole,
      username: user.username,
    });

    const refreshToken = await generateRefreshToken(user.id);

    const expiresIn = 15 * 60;

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      tenant_id: user.tenant_id,
      balance: user.balance.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return {
      user: userProfile,
      accessToken,
      refreshToken,
      expiresIn,
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const forgotPassword = async (data: IForgotPasswordDto): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return;
    }

    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      JWT_SECRET,
      { expiresIn: `${PASSWORD_RESET_TOKEN_EXPIRY_HOURS}h` }
    );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS);

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        expiresAt,
        user_id: user.id,
      },
    });

    if (user.email) {
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    }
  } catch (error) {
    console.error('Error in forgot password:', error);
    throw error;
  }
};

export const resetPassword = async (data: IResetPasswordDto): Promise<void> => {
  try {
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const decoded = jwt.verify(data.token, JWT_SECRET) as { userId: number; type: string };

    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid token');
    }

    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        token: data.token,
        user_id: decoded.userId,
      },
    });

    if (!resetTokenRecord) {
      throw new Error('Invalid token');
    }

    if (resetTokenRecord.used) {
      throw new Error('Token has already been used');
    }

    if (new Date() > resetTokenRecord.expiresAt) {
      throw new Error('Token has expired');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { used: true, usedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { user_id: decoded.userId, revoked: false },
        data: { revoked: true, revokedAt: new Date() },
      }),
    ]);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
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
