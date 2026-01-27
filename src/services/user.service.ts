import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth';
import type {
  IAuthResponse,
  ICreateUserDto,
  IPasswordChangeDto,
  IUpdateUserDto,
  IUserLoginData,
  UserPaginatedResponse,
  UserQuery
} from '../types/user';
import {
  buildPaginationMeta,
  calculateSkip,
  extractPaginationParams
} from '../utils/pagination';
import { prisma } from '../utils/prisma';

const USER_SELECT_FIELDS = {
  id: true,
  username: true,
  email: true,
  name: true,
  role: true,
  status: true,
  tenant_id: true,
  created_at: true,
  updated_at: true
} as const;

const validatePassword = (password: string): void => {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
};

const validateUsername = (username: string): void => {
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters');
  }
};

export const createUser = async (userData: ICreateUserDto): Promise<IAuthResponse> => {
  try {
    validateUsername(userData.username);
    validatePassword(userData.password);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: userData.username },
          ...(userData.email ? [{ email: userData.email }] : [])
        ]
      }
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 12),
        name: userData.name,
        role: userData.role || 'USER',
        tenant_id: userData.tenant_id
      },
      select: USER_SELECT_FIELDS
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
      username: user.username
    });

    return {
      user,
      success: true,
      token,
      message: 'User created successfully'
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const loginUser = async (loginData: IUserLoginData): Promise<IAuthResponse> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: loginData.username },
          ...(loginData.username.includes('@') ? [{ email: loginData.username }] : [])
        ]
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      throw new Error('Account is inactive or suspended');
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: USER_SELECT_FIELDS
    });

    if (!userProfile) {
      throw new Error('Failed to retrieve user profile');
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      username: user.username
    });

    return {
      user: userProfile,
      success: true,
      token,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const getUserProfile = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT_FIELDS
    });

    return user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to retrieve user profile');
  }
};

export const updateUser = async (
  id: number,
  updateData: IUpdateUserDto
) => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT_FIELDS
    });

    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};

export const changePassword = async (
  id: number,
  passwordData: IPasswordChangeDto
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      passwordData.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('New password confirmation does not match');
    }

    validatePassword(passwordData.newPassword);

    await prisma.user.update({
      where: { id },
      data: {
        password: await bcrypt.hash(passwordData.newPassword, 12)
      }
    });

    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const getAllUsers = async (query: UserQuery = {}): Promise<UserPaginatedResponse> => {
  try {
    const pagination = extractPaginationParams(query);
    const skip = calculateSkip(pagination.page, pagination.limit);

    const where: Record<string, any> = {};

    if (query.search) {
      where.OR = [
        { username: { contains: query.search } },
        { name: { contains: query.search } },
        { email: { contains: query.search } }
      ];
    }

    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;

    let orderBy = {};
    if (query.sortBy) {
      orderBy = { [query.sortBy]: query.sortOrder || 'desc' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: pagination.limit,
        select: USER_SELECT_FIELDS
      }),
      prisma.user.count({ where })
    ]);

    return {
      items: users,
      pagination: buildPaginationMeta({
        page: pagination.page,
        limit: pagination.limit,
        total
      })
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw new Error('Failed to retrieve users');
  }
};
