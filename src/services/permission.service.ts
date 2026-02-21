import { Prisma } from '@prisma/client';
import { prisma } from '@/utils/prisma';
import { IPermission, IPermissionGrouped, IRolePermission, Role } from '@/types/permission';
import { UserRole } from '@/types/common';

const PERMISSION_SELECT_FIELDS = {
  id: true,
  name: true,
  slug: true,
  description: true,
  module: true,
  is_active: true,
} as const;

export const getAllPermissions = async (): Promise<IPermission[]> => {
  try {
    const permissions = await prisma.permission.findMany({
      select: PERMISSION_SELECT_FIELDS,
    });

    return permissions;
  } catch (error) {
    console.error('Error getting all permissions:', error);
    throw error;
  }
};

export const getPermissionById = async (id: number): Promise<IPermission | null> => {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id },
      select: PERMISSION_SELECT_FIELDS,
    });

    return permission;
  } catch (error) {
    console.error('Error getting permission by id:', error);
    throw error;
  }
};

export const getPermissionsByRole = async (role: Role): Promise<IRolePermission> => {
  try {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role },
      include: {
        permission: {
          select: PERMISSION_SELECT_FIELDS,
        },
      },
    });

    const permissions = rolePermissions
      .filter((rp) => rp.permission.is_active)
      .map((rp) => rp.permission.slug);

    return {
      role,
      permissions,
    };
  } catch (error) {
    console.error('Error getting permissions by role:', error);
    throw error;
  }
};

export const getPermissionsGroupedByModule = async (role: Role): Promise<IPermissionGrouped[]> => {
  try {
    const allPermissions = await prisma.permission.findMany({
      where: { is_active: true },
      select: PERMISSION_SELECT_FIELDS,
    });

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role },
      include: {
        permission: {
          select: PERMISSION_SELECT_FIELDS,
        },
      },
    });

    const rolePermissionSlugs = rolePermissions.map((rp) => rp.permission.slug);

    const grouped = allPermissions.reduce((acc: Record<string, IPermissionGrouped>, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = {
          module: permission.module,
          permissions: [],
        };
      }

      acc[permission.module].permissions.push({
        ...permission,
        is_active: rolePermissionSlugs.includes(permission.slug),
      });

      return acc;
    }, {});

    return Object.values(grouped);
  } catch (error) {
    console.error('Error getting permissions grouped by module:', error);
    throw error;
  }
};

export const createPermission = async (data: { name: string; slug: string; description?: string; module: string }): Promise<IPermission> => {
  try {
    const permission = await prisma.permission.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        module: data.module,
        is_active: true,
      },
      select: PERMISSION_SELECT_FIELDS,
    });

    return permission;
  } catch (error) {
    console.error('Error creating permission:', error);
    throw error;
  }
};

export const assignPermissionsToRole = async (role: Role, permissionIds: number[]): Promise<void> => {
  try {
    await prisma.rolePermission.deleteMany({
      where: { role },
    });

    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map((permissionId) => ({
        role,
        permission_id: permissionId,
      }));

      await prisma.rolePermission.createMany({
        data: rolePermissions,
      });
    }
  } catch (error) {
    console.error('Error assigning permissions to role:', error);
    throw error;
  }
};

const DEFAULT_PERMISSIONS = [
  { name: 'View Users', slug: 'view_users', module: 'user', description: 'View user list and profiles' },
  { name: 'Create Users', slug: 'create_users', module: 'user', description: 'Create new users' },
  { name: 'Edit Users', slug: 'edit_users', module: 'user', description: 'Edit user information' },
  { name: 'Delete Users', slug: 'delete_users', module: 'user', description: 'Delete users' },
  { name: 'View Tenants', slug: 'view_tenants', module: 'tenant', description: 'View tenant list and profiles' },
  { name: 'Create Tenants', slug: 'create_tenants', module: 'tenant', description: 'Create new tenants' },
  { name: 'Edit Tenants', slug: 'edit_tenants', module: 'tenant', description: 'Edit tenant information' },
  { name: 'Delete Tenants', slug: 'delete_tenants', module: 'tenant', description: 'Delete tenants' },
  { name: 'View Permissions', slug: 'view_permissions', module: 'permission', description: 'View permissions' },
  { name: 'Manage Permissions', slug: 'manage_permissions', module: 'permission', description: 'Manage role permissions' },
  { name: 'View Audit Logs', slug: 'view_audit_logs', module: 'audit', description: 'View audit logs' },
  { name: 'View API Keys', slug: 'view_api_keys', module: 'api_key', description: 'View API keys' },
  { name: 'Create API Keys', slug: 'create_api_keys', module: 'api_key', description: 'Create API keys' },
  { name: 'Revoke API Keys', slug: 'revoke_api_keys', module: 'api_key', description: 'Revoke API keys' },
];

export const initializePermissions = async (): Promise<void> => {
  try {
    for (const perm of DEFAULT_PERMISSIONS) {
      const existing = await prisma.permission.findFirst({
        where: { slug: perm.slug },
      });

      if (!existing) {
        await prisma.permission.create({
          data: {
            name: perm.name,
            slug: perm.slug,
            module: perm.module,
            description: perm.description,
            is_active: true,
          },
        });
      }
    }

    const adminPermissions = await prisma.permission.findMany({
      select: { id: true },
    });

    const adminPermissionIds = adminPermissions.map((p) => p.id);

    const existingAdminRole = await prisma.rolePermission.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!existingAdminRole && adminPermissionIds.length > 0) {
      const rolePermissions = adminPermissionIds.map((permissionId) => ({
        role: 'ADMIN' as UserRole,
        permission_id: permissionId,
      }));

      await prisma.rolePermission.createMany({
        data: rolePermissions as any,
      });
    }

    console.log('Permissions initialized successfully');
  } catch (error) {
    console.error('Error initializing permissions:', error);
    throw error;
  }
};
