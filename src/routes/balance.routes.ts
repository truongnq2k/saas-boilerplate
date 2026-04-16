import { FastifyInstance } from "fastify";
import {
  getUserBalanceHandler,
  getUserTransactionsHandler,
  addBalanceHandler,
  subtractBalanceHandler,
  getAllTransactionsHandler,
} from "../controllers/balance.controller";
import { authMiddleware, requireRole } from "../middleware/auth";

export default async function balanceRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/balance",
    {
      schema: {
        description: "Get current user balance",
        tags: ["Balance"],
        security: [{ bearerAuth: [] }],
      },
      preHandler: authMiddleware,
    },
    getUserBalanceHandler
  );

  fastify.get(
    "/transactions",
    {
      schema: {
        description: "Get current user transactions",
        tags: ["Balance"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1 },
            limit: { type: "number", default: 10 },
            type: { type: "string", enum: ["CREDIT", "DEBIT"] },
            status: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"] },
            sortBy: { type: "string", enum: ["created_at", "amount"] },
            sortOrder: { type: "string", enum: ["asc", "desc"] },
          },
        },
      },
      preHandler: authMiddleware,
    },
    getUserTransactionsHandler
  );

  fastify.post(
    "/admin/add-balance",
    {
      schema: {
        description: "Add balance to user (Admin only)",
        tags: ["Balance"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["userId", "amount"],
          properties: {
            userId: { type: "number", description: "User ID" },
            amount: { type: "number", description: "Amount to add" },
            description: { type: "string", description: "Description (optional)" },
          },
        },
      },
      preHandler: [authMiddleware, requireRole('ADMIN')],
    },
    addBalanceHandler
  );

  fastify.post(
    "/admin/subtract-balance",
    {
      schema: {
        description: "Subtract balance from user (Admin only)",
        tags: ["Balance"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["userId", "amount"],
          properties: {
            userId: { type: "number", description: "User ID" },
            amount: { type: "number", description: "Amount to subtract" },
            description: { type: "string", description: "Description (optional)" },
          },
        },
      },
      preHandler: [authMiddleware, requireRole('ADMIN')],
    },
    subtractBalanceHandler
  );

  fastify.get(
    "/admin/transactions",
    {
      schema: {
        description: "Get all transactions (Admin only)",
        tags: ["Balance"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1 },
            limit: { type: "number", default: 10 },
            userId: { type: "number" },
            type: { type: "string", enum: ["CREDIT", "DEBIT"] },
            status: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"] },
            sortBy: { type: "string", enum: ["created_at", "amount"] },
            sortOrder: { type: "string", enum: ["asc", "desc"] },
          },
        },
      },
      preHandler: [authMiddleware, requireRole('ADMIN')],
    },
    getAllTransactionsHandler
  );
}
