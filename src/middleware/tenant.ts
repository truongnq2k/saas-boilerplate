import { ErrorCode, UserRole } from "@/types/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { errorResponse } from "../utils/response";

declare module 'fastify' {
  interface FastifyRequest {
    tenantId?: number;
  }
}

export function requireTenant() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply
        .status(401)
        .send(errorResponse("Unauthorized", "Authentication required", { errorCode: ErrorCode.UNAUTHORIZED }));
    }

    if (request.user.role === 'ADMIN') {
      return;
    }

    const tenantId = request.headers["x-tenant-id"];
    if (tenantId) {
      const parsedTenantId = parseInt(tenantId as string);
      if (!isNaN(parsedTenantId)) {
        request.tenantId = parsedTenantId;
        return;
      }
    }

    if (!request.user.tenantId) {
      return reply
        .status(403)
        .send(errorResponse("Forbidden", "Tenant context required. Set X-Tenant-Id header or user must belong to a tenant.", { errorCode: ErrorCode.FORBIDDEN }));
    }

    request.tenantId = request.user.tenantId;
  };
}

export function extractTenantId(request: FastifyRequest): number | undefined {
  return request.tenantId;
}

export function isAdmin(request: FastifyRequest): boolean {
  return request.user?.role === 'ADMIN';
}

export function canAccessTenant(request: FastifyRequest, targetTenantId: number): boolean {
  if (request.user?.role === 'ADMIN') {
    return true;
  }
  return request.tenantId === targetTenantId;
}