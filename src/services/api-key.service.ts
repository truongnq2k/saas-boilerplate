import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/utils/prisma';
import { ICreateApiKeyDto, IApiKeyResponse, IApiKeyQuery, ApiKeyPaginatedResponse } from '@/types/api-key';
import { extractPaginationParams, buildPaginationMeta, calculateSkip } from '@/utils/pagination';

const API_KEY_LENGTH = 32;
const API_KEY_PREFIX = 'sk';

const API_KEY_SELECT_FIELDS = {
  id: true,
  name: true,
  prefix: true,
  permissions: true,
  expiresAt: true,
  last_used_at: true,
  is_active: true,
  is_revoked: true,
  created_at: true,
} as const;

const generateApiKey = (): { key: string; hash: string; prefix: string } => {
  const rawKey = randomBytes(API_KEY_LENGTH).toString('hex');
  const hash = createHash('sha256').update(rawKey).digest('hex');
  const prefix = `${API_KEY_PREFIX}_${rawKey.substring(0, 8)}`;

  return {
    key: `${prefix}_${rawKey}`,
    hash,
    prefix,
  };
};

const hashApiKey = (key: string): string => {
  return createHash('sha256').update(key).digest('hex');
};

export const createApiKey = async (
  userId: number,
  tenantId: number | undefined,
  data: ICreateApiKeyDto
): Promise<IApiKeyResponse> => {
  try {
    const { key, hash, prefix } = generateApiKey();

    let expiresAt: Date | null = null;
    if (data.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        name: data.name,
        key_hash: hash,
        prefix,
        permissions: data.permissions as any,
        expiresAt,
        user_id: userId,
        tenant_id: tenantId,
      },
      select: API_KEY_SELECT_FIELDS,
    });

    return {
      ...apiKey,
      key,
      permissions: apiKey.permissions as string[] | null,
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
};

export const getApiKeys = async (
  userId: number,
  query: IApiKeyQuery = {}
): Promise<ApiKeyPaginatedResponse> => {
  try {
    const pagination = extractPaginationParams(query);
    const skip = calculateSkip(pagination.page, pagination.limit);

    const where: any = {
      user_id: userId,
    };

    if (query.is_active !== undefined) where.is_active = query.is_active;
    if (query.is_revoked !== undefined) where.is_revoked = query.is_revoked;

    const [keys, total] = await Promise.all([
      prisma.apiKey.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: pagination.limit,
        select: API_KEY_SELECT_FIELDS,
      }),
      prisma.apiKey.count({ where }),
    ]);

    return {
      items: keys as any,
      pagination: buildPaginationMeta({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  } catch (error) {
    console.error('Error getting API keys:', error);
    throw error;
  }
};

export const verifyApiKey = async (key: string): Promise<{
  valid: boolean;
  apiKey?: IApiKeyResponse;
}> => {
  try {
    const keyHash = hashApiKey(key);

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        key_hash: keyHash,
        is_active: true,
        is_revoked: false,
      },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            role: true,
          },
        },
      },
    });

    if (!apiKey) {
      return { valid: false };
    }

    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return { valid: false };
    }

    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { last_used_at: new Date() },
    });

    return {
      valid: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: '',
        prefix: apiKey.prefix,
        permissions: apiKey.permissions as string[] | null,
        expiresAt: apiKey.expiresAt,
        is_active: apiKey.is_active,
        is_revoked: apiKey.is_revoked,
        created_at: apiKey.created_at,
      },
    };
  } catch (error) {
    console.error('Error verifying API key:', error);
    return { valid: false };
  }
};

export const revokeApiKey = async (userId: number, keyId: number): Promise<void> => {
  try {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        user_id: userId,
      },
    });

    if (!apiKey) {
      throw new Error('API key not found');
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { is_revoked: true, is_active: false },
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    throw error;
  }
};

export const deleteApiKey = async (userId: number, keyId: number): Promise<void> => {
  try {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        user_id: userId,
      },
    });

    if (!apiKey) {
      throw new Error('API key not found');
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};
