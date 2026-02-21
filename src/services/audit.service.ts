import { Prisma } from '@prisma/client';
import { prisma } from '@/utils/prisma';
import {
    ICreateAuditLogDto,
    IAuditLogQuery,
    AuditLogPaginatedResponse,
    AuditLogProfile,
} from '@/types/audit';
import { extractPaginationParams, buildPaginationMeta, calculateSkip } from '@/utils/pagination';

const AUDIT_LOG_SELECT_FIELDS = {
    id: true,
    action: true,
    entity: true,
    entity_id: true,
    description: true,
    old_value: true,
    new_value: true,
    ip_address: true,
    user_agent: true,
    user_id: true,
    tenant_id: true,
    created_at: true,
} as const;

export const createAuditLog = async (data: ICreateAuditLogDto): Promise<void> => {
    try {
        await prisma.auditLog.create({
            data: {
                action: data.action,
                entity: data.entity,
                entity_id: data.entity_id,
                description: data.description,
                old_value: data.old_value as Prisma.InputJsonValue,
                new_value: data.new_value as Prisma.InputJsonValue,
                ip_address: data.ip_address,
                user_agent: data.user_agent,
                user_id: data.user_id,
                tenant_id: data.tenant_id,
            },
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
};

export const getAuditLogs = async (query: IAuditLogQuery = {}): Promise<AuditLogPaginatedResponse> => {
    try {
        const pagination = extractPaginationParams(query);
        const skip = calculateSkip(pagination.page, pagination.limit);

        const where: Prisma.AuditLogWhereInput = {};

        if (query.user_id) where.user_id = query.user_id;
        if (query.tenant_id) where.tenant_id = query.tenant_id;
        if (query.action) where.action = query.action;
        if (query.entity) where.entity = query.entity;

        if (query.startDate || query.endDate) {
            where.created_at = {};
            if (query.startDate) (where.created_at as any).gte = query.startDate;
            if (query.endDate) (where.created_at as any).lte = query.endDate;
        }

        let orderBy: Prisma.AuditLogOrderByWithRelationInput = {};
        if (query.sortBy) {
            orderBy = { [query.sortBy]: query.sortOrder || 'desc' } as any;
        } else {
            orderBy = { created_at: 'desc' };
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy,
                skip,
                take: pagination.limit,
                select: AUDIT_LOG_SELECT_FIELDS,
            }),
            prisma.auditLog.count({ where }),
        ]);

        return {
            items: logs as AuditLogProfile[],
            pagination: buildPaginationMeta({
                page: pagination.page,
                limit: pagination.limit,
                total,
            }),
        };
    } catch (error) {
        console.error('Error getting audit logs:', error);
        throw error;
    }
};

export const getAuditLogById = async (id: number): Promise<AuditLogProfile | null> => {
    try {
        const log = await prisma.auditLog.findUnique({
            where: { id },
            select: AUDIT_LOG_SELECT_FIELDS,
        });

        return log as AuditLogProfile | null;
    } catch (error) {
        console.error('Error getting audit log by id:', error);
        throw error;
    }
};

export const logUserAction = async (
    userId: number | undefined,
    tenantId: number | undefined,
    action: string,
    entity: string,
    options?: {
        entity_id?: number;
        description?: string;
        old_value?: Record<string, any>;
        new_value?: Record<string, any>;
        ip_address?: string;
        user_agent?: string;
    }
): Promise<void> => {
    const opt = options || {};
    await createAuditLog({
        action: action as any,
        entity,
        entity_id: opt.entity_id,
        description: opt.description,
        old_value: opt.old_value,
        new_value: opt.new_value,
        ip_address: opt.ip_address,
        user_agent: opt.user_agent,
        user_id: userId,
        tenant_id: tenantId,
    });
};
