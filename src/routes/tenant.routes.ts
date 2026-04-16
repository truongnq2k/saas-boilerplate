import { FastifyInstance } from "fastify";
import {
  createTenantHandler,
  deleteTenantHandler,
  getAllTenantsHandler,
  getTenantByIdHandler,
  getTenantStatsHandler,
  updateTenantHandler,
} from "../controllers/tenant.controller";
import { authMiddleware, requireRole } from "../middleware/auth";

export default async function tenantRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.post(
    "/",
    {
      schema: {
        description: "Create a new tenant",
        tags: ["Tenants"],
        body: {
          type: "object",
          required: ["name", "slug"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              description: "Tenant name",
            },
            slug: {
              type: "string",
              minLength: 2,
              pattern: "^[a-z0-9-]+$",
              description: "Tenant slug (URL-friendly)",
            },
            settings: {
              type: "object",
              description: "Tenant settings",
            },
          },
        },
        response: {
          201: {
            description: "Tenant created successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                  slug: { type: "string" },
                  status: { type: "string" },
                  settings: { type: "object" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
        },
      },
      preHandler: [requireRole('ADMIN')],
    },
    createTenantHandler
  );

  fastify.get(
    "/",
    {
      schema: {
        description: "Get all tenants",
        tags: ["Tenants"],
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 10 },
            search: { type: "string" },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE", "SUSPENDED"] },
            sortBy: { type: "string", enum: ["name", "created_at"] },
            sortOrder: { type: "string", enum: ["asc", "desc"] },
          },
        },
      },
      preHandler: [requireRole('ADMIN')],
    },
    getAllTenantsHandler
  );

  fastify.get(
    "/:id",
    {
      schema: {
        description: "Get tenant by ID",
        tags: ["Tenants"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
      preHandler: [requireRole('ADMIN')],
    },
    getTenantByIdHandler
  );

  fastify.put(
    "/:id",
    {
      schema: {
        description: "Update tenant",
        tags: ["Tenants"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 2 },
            settings: { type: "object" },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE", "SUSPENDED"] },
          },
        },
      },
      preHandler: [requireRole('ADMIN')],
    },
    updateTenantHandler
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Delete tenant",
        tags: ["Tenants"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
      preHandler: [requireRole('ADMIN')],
    },
    deleteTenantHandler
  );

  fastify.get(
    "/:id/stats",
    {
      schema: {
        description: "Get tenant statistics",
        tags: ["Tenants"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
      preHandler: [requireRole('ADMIN')],
    },
    getTenantStatsHandler
  );
}
