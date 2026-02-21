import { FastifyInstance } from "fastify";
import {
  createApiKeyHandler,
  deleteApiKeyHandler,
  getApiKeysHandler,
  revokeApiKeyHandler,
} from "../controllers/api-key.controller";
import { authMiddleware } from "../middleware/auth";

export default async function apiKeyRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.post(
    "/",
    {
      schema: {
        description: "Create a new API key",
        tags: ["API Keys"],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              description: "API key name",
            },
            permissions: {
              type: "array",
              items: { type: "string" },
              description: "List of permission slugs",
            },
            expiresInDays: {
              type: "integer",
              minimum: 1,
              maximum: 365,
              description: "Days until expiration",
            },
          },
        },
      },
    },
    createApiKeyHandler
  );

  fastify.get(
    "/",
    {
      schema: {
        description: "Get all API keys for current user",
        tags: ["API Keys"],
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 10 },
            is_active: { type: "boolean" },
            is_revoked: { type: "boolean" },
          },
        },
      },
    },
    getApiKeysHandler
  );

  fastify.delete(
    "/:id/revoke",
    {
      schema: {
        description: "Revoke an API key",
        tags: ["API Keys"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    revokeApiKeyHandler
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Delete an API key",
        tags: ["API Keys"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    deleteApiKeyHandler
  );
}
