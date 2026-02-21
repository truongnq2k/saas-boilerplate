import { FastifyInstance } from "fastify";
import {
  logoutAllHandler,
  logoutHandler,
  refreshTokenHandler,
} from "../controllers/auth.controller";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/refresh",
    {
      schema: {
        description: "Refresh access token",
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              description: "Valid refresh token",
            },
          },
        },
        response: {
          200: {
            description: "Token refreshed successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string" },
                  refreshToken: { type: "string" },
                  expiresIn: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    refreshTokenHandler
  );

  fastify.post(
    "/logout",
    {
      schema: {
        description: "Logout and revoke refresh token",
        tags: ["Auth"],
        body: {
          type: "object",
          properties: {
            refreshToken: {
              type: "string",
              description: "Refresh token to revoke",
            },
          },
        },
      },
    },
    logoutHandler
  );

  fastify.post(
    "/logout-all",
    {
      schema: {
        description: "Logout from all devices",
        tags: ["Auth"],
      },
    },
    logoutAllHandler
  );
}
