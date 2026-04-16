import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/utils/prisma';
import { PASSWORD_CONFIG } from '@/utils/config';
import { ICreateUserDto, IUpdateUserDto, IUpdateStatusDto, IUserLoginData, IPasswordChangeDto, UserQuery, UserPaginatedResponse, UserProfile } from '@/types/user';
import { extractPaginationParams, buildPaginationMeta, calculateSkip } from '@/utils/pagination';
import { signToken } from '@/middleware/auth';
import { UserRole } from '@/types/common';

const USER_SELECT_FIELDS = {
  id: true,
  username: true,
  email: true,
  name: true,
  role: true,
  status: true,
  tenant_id: true,
  balance: true,
  created_at: true,
  updated_at: true,
} as const;

export const createUser = async (data: ICreateUserDto): Promise<UserProfile> => {
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

    const hashedPassword = await bcrypt.hash(data.password, PASSWORD_CONFIG.saltRounds);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role || 'USER',
        tenant_id: data.tenant_id,
        status: 'ACTIVE',
      },
      select: USER_SELECT_FIELDS,
    });

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status,
      tenant_id: user.tenant_id,
      balance: user.balance.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return userProfile;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getAllUsers = async (query: UserQuery = {}): Promise<UserPaginatedResponse> => {
  try {
    const pagination = extractPaginationParams(query);
    const skip = calculateSkip(pagination.page, pagination.limit);

    const where: Prisma.UserWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { username: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    if (query.role) {
      where.role = query.role as any;
    }

    if (query.status) {
      where.status = query.status as any;
    }

    if (query.tenantId) {
      where.tenant_id = query.tenantId;
    }

    let orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy = { [query.sortBy]: query.sortOrder || 'desc' } as any;
    } else {
      orderBy = { created_at: 'desc' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: pagination.limit,
        select: USER_SELECT_FIELDS,
      }),
      prisma.user.count({ where }),
    ]);

    const items: UserProfile[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status,
      tenant_id: user.tenant_id,
      balance: user.balance.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));

    return {
      items,
      pagination: buildPaginationMeta({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<UserProfile | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT_FIELDS,
    });

    if (!user) {
      return null;
    }

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status,
      tenant_id: user.tenant_id,
      balance: user.balance.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return userProfile;
  } catch (error) {
    console.error('Error getting user by id:', error);
    throw error;
  }
};

export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        ...USER_SELECT_FIELDS,
        password: true,
      },
    });

    return user as (UserProfile & { password: string }) | null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
};

export const updateUser = async (id: number, data: IUpdateUserDto): Promise<UserProfile> => {
  try {
    if (data.username || data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(data.username ? [{ username: data.username }] : []),
            ...(data.email ? [{ email: data.email }] : []),
          ],
        },
      });

      if (existingUser) {
        if (existingUser.username === data.username) {
          throw new Error('Username already exists');
        }
        if (existingUser.email === data.email) {
          throw new Error('Email already exists');
        }
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
      },
      select: USER_SELECT_FIELDS,
    });

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status,
      tenant_id: user.tenant_id,
      balance: user.balance.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return userProfile;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserStatus = async (id: number, data: IUpdateStatusDto): Promise<UserProfile> => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: data.status,
      },
      select: USER_SELECT_FIELDS,
    });

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status,
      tenant_id: user.tenant_id,
      balance: user.balance.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return userProfile;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const getUserStats = async (): Promise<{
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}> => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({
        where: {
          created_at: { gte: firstDayOfMonth },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

export const loginUser = async (data: IUserLoginData): Promise<{ user: UserProfile; token: string }> => {
  try {
    const login = data.login.trim();
    const isEmail = login.includes('@');

    let user = null;

    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: login },
        select: {
          ...USER_SELECT_FIELDS,
          password: true,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: login },
        select: {
          ...USER_SELECT_FIELDS,
          password: true,
        },
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

    const token = signToken({
      userId: user.id,
      role: user.role as UserRole,
      username: user.username,
    });

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status,
      tenant_id: user.tenant_id,
      balance: user.balance.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return {
      user: userProfile,
      token,
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT_FIELDS,
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status,
      tenant_id: user.tenant_id,
      balance: user.balance.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return userProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const changePassword = async (userId: number, data: IPasswordChangeDto): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new Error('New passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, PASSWORD_CONFIG.saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};
