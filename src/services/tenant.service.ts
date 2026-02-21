import { Prisma } from '@prisma/client';
import { prisma } from '@/utils/prisma';
import { ITenantDto, ITenantQuery, IUpdateTenantDto, TenantPaginatedResponse, TenantProfile } from '@/types/tenant';
import { extractPaginationParams, buildPaginationMeta, calculateSkip } from '@/utils/pagination';
import { TenantStatus } from '@/types/common';

const TENANT_SELECT_FIELDS = {
  id: true,
  name: true,
  slug: true,
  status: true,
  settings: true,
  created_at: true,
  updated_at: true,
} as const;

const transformTenant = (tenant: any): TenantProfile => {
  return {
    ...tenant,
    settings: tenant.settings as Record<string, any> | null,
  };
};

export const createTenant = async (data: ITenantDto): Promise<TenantProfile> => {
  try {
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: data.slug },
          { name: data.name },
        ],
      },
    });

    if (existingTenant) {
      throw new Error('Tenant with this name or slug already exists');
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        settings: data.settings || {},
      },
      select: TENANT_SELECT_FIELDS,
    });

    return transformTenant(tenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
};

export const getAllTenants = async (query: ITenantQuery = {}): Promise<TenantPaginatedResponse> => {
  try {
    const pagination = extractPaginationParams(query);
    const skip = calculateSkip(pagination.page, pagination.limit);

    const where: Prisma.TenantWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { slug: { contains: query.search } },
      ];
    }

    if (query.status) where.status = query.status as TenantStatus;

    let orderBy: Prisma.TenantOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy = { [query.sortBy]: query.sortOrder || 'desc' } as any;
    } else {
      orderBy = { created_at: 'desc' };
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy,
        skip,
        take: pagination.limit,
        select: TENANT_SELECT_FIELDS,
      }),
      prisma.tenant.count({ where }),
    ]);

    return {
      items: tenants.map(transformTenant),
      pagination: buildPaginationMeta({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  } catch (error) {
    console.error('Error getting all tenants:', error);
    throw error;
  }
};

export const getTenantById = async (id: number): Promise<TenantProfile | null> => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: TENANT_SELECT_FIELDS,
    });

    return tenant ? transformTenant(tenant) : null;
  } catch (error) {
    console.error('Error getting tenant by id:', error);
    throw error;
  }
};

export const updateTenant = async (id: number, data: IUpdateTenantDto): Promise<TenantProfile> => {
  try {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        name: data.name,
        settings: data.settings,
        status: data.status,
      },
      select: TENANT_SELECT_FIELDS,
    });

    return transformTenant(tenant);
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
};

export const deleteTenant = async (id: number): Promise<void> => {
  try {
    await prisma.tenant.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    throw error;
  }
};

export const getTenantStats = async (id: number): Promise<{
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}> => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
      prisma.user.count({ where: { tenant_id: id } }),
      prisma.user.count({ where: { tenant_id: id, status: 'ACTIVE' } }),
      prisma.user.count({
        where: {
          tenant_id: id,
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
    console.error('Error getting tenant stats:', error);
    throw error;
  }
};
