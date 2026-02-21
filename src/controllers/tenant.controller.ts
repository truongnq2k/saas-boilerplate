import { FastifyReply, FastifyRequest } from "fastify";
import {
  createTenant,
  deleteTenant,
  getAllTenants,
  getTenantById,
  getTenantStats,
  updateTenant,
} from "@/services/tenant.service";
import { AuthenticatedRequest } from "@/types/request";
import { ITenantDto, IUpdateTenantDto } from "@/types/tenant";
import { extractPaginationParams } from "@/utils/pagination";
import { errorResponse, successResponse } from "@/utils/response";

export async function createTenantHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as AuthenticatedRequest;
    if (!authRequest.user) {
      return reply.status(401).send(
        errorResponse("Unauthorized", "Authentication required")
      );
    }

    if (authRequest.user.role !== "ADMIN") {
      return reply.status(403).send(
        errorResponse("Forbidden", "Only admins can create tenants")
      );
    }

    const result = await createTenant(request.body as ITenantDto);
    return reply.status(201).send(successResponse(result, "Tenant created successfully"));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(errorResponse("Failed to create tenant", error.message));
    }
    return reply.status(500).send(errorResponse("Internal Server Error", "Failed to create tenant"));
  }
}

export async function getAllTenantsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as AuthenticatedRequest;
    if (!authRequest.user) {
      return reply.status(401).send(
        errorResponse("Unauthorized", "Authentication required")
      );
    }

    const query = request.query as any;
    const { page, limit } = extractPaginationParams(query);

    const result = await getAllTenants({
      page,
      limit,
      search: query.search,
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return reply.status(200).send(successResponse(result, "Tenants retrieved successfully"));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(errorResponse("Failed to get tenants", error.message));
    }
    return reply.status(500).send(errorResponse("Internal Server Error", "Failed to get tenants"));
  }
}

export async function getTenantByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as AuthenticatedRequest;
    if (!authRequest.user) {
      return reply.status(401).send(
        errorResponse("Unauthorized", "Authentication required")
      );
    }

    const { id } = request.params as { id: string };
    const tenantId = parseInt(id);

    if (isNaN(tenantId)) {
      return reply.status(400).send(errorResponse("Invalid ID", "Tenant ID must be a number"));
    }

    const tenant = await getTenantById(tenantId);

    if (!tenant) {
      return reply.status(404).send(errorResponse("Not Found", "Tenant not found"));
    }

    return reply.status(200).send(successResponse(tenant, "Tenant retrieved successfully"));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(errorResponse("Failed to get tenant", error.message));
    }
    return reply.status(500).send(errorResponse("Internal Server Error", "Failed to get tenant"));
  }
}

export async function updateTenantHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as AuthenticatedRequest;
    if (!authRequest.user) {
      return reply.status(401).send(
        errorResponse("Unauthorized", "Authentication required")
      );
    }

    if (authRequest.user.role !== "ADMIN") {
      return reply.status(403).send(
        errorResponse("Forbidden", "Only admins can update tenants")
      );
    }

    const { id } = request.params as { id: string };
    const tenantId = parseInt(id);

    if (isNaN(tenantId)) {
      return reply.status(400).send(errorResponse("Invalid ID", "Tenant ID must be a number"));
    }

    const result = await updateTenant(tenantId, request.body as IUpdateTenantDto);
    return reply.status(200).send(successResponse(result, "Tenant updated successfully"));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(errorResponse("Failed to update tenant", error.message));
    }
    return reply.status(500).send(errorResponse("Internal Server Error", "Failed to update tenant"));
  }
}

export async function deleteTenantHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as AuthenticatedRequest;
    if (!authRequest.user) {
      return reply.status(401).send(
        errorResponse("Unauthorized", "Authentication required")
      );
    }

    if (authRequest.user.role !== "ADMIN") {
      return reply.status(403).send(
        errorResponse("Forbidden", "Only admins can delete tenants")
      );
    }

    const { id } = request.params as { id: string };
    const tenantId = parseInt(id);

    if (isNaN(tenantId)) {
      return reply.status(400).send(errorResponse("Invalid ID", "Tenant ID must be a number"));
    }

    const result = await deleteTenant(tenantId);
    return reply.status(200).send(successResponse(result, "Tenant deleted successfully"));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(errorResponse("Failed to delete tenant", error.message));
    }
    return reply.status(500).send(errorResponse("Internal Server Error", "Failed to delete tenant"));
  }
}

export async function getTenantStatsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as AuthenticatedRequest;
    if (!authRequest.user) {
      return reply.status(401).send(
        errorResponse("Unauthorized", "Authentication required")
      );
    }

    const { id } = request.params as { id: string };
    const tenantId = parseInt(id);

    if (isNaN(tenantId)) {
      return reply.status(400).send(errorResponse("Invalid ID", "Tenant ID must be a number"));
    }

    const stats = await getTenantStats(tenantId);
    return reply.status(200).send(successResponse(stats, "Tenant stats retrieved successfully"));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(errorResponse("Failed to get tenant stats", error.message));
    }
    return reply.status(500).send(errorResponse("Internal Server Error", "Failed to get tenant stats"));
  }
}
