import { FastifyInstance } from "fastify";
import {
  logoutAllHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
  loginHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "../controllers/auth.controller";

const AUTH_RATE_LIMIT = {
  max: 10,
  timeWindow: '1 minute',
  message: { success: false, message: 'Too many requests. Please try again later.' },
};

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    {
      schema: {
        description: "Register a new user",
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["username", "password", "name"],
          properties: {
            username: {
              type: "string",
              description: "Unique username",
            },
            email: {
              type: "string",
              description: "User email (optional)",
            },
            password: {
              type: "string",
              description: "User password (min 8 characters)",
            },
            name: {
              type: "string",
              description: "User full name",
            },
          },
        },
        response: {
          201: {
            description: "User registered successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  user: { type: "object" },
                  accessToken: { type: "string" },
                  refreshToken: { type: "string" },
                  expiresIn: { type: "number" },
                },
              },
            },
          },
        },
      },
      config: {
        rateLimit: AUTH_RATE_LIMIT,
      },
    },
    registerHandler
  );

  fastify.post(
    "/login",
    {
      schema: {
        description: "Login with email or username",
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["login", "password"],
          properties: {
            login: {
              type: "string",
              description: "Email or username",
            },
            password: {
              type: "string",
              description: "User password",
            },
          },
        },
        response: {
          200: {
            description: "Login successful",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  user: { type: "object" },
                  accessToken: { type: "string" },
                  refreshToken: { type: "string" },
                  expiresIn: { type: "number" },
                },
              },
            },
          },
        },
      },
      config: {
        rateLimit: AUTH_RATE_LIMIT,
      },
    },
    loginHandler
  );

  fastify.post(
    "/forgot-password",
    {
      schema: {
        description: "Request password reset",
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              description: "User email",
            },
          },
        },
        response: {
          200: {
            description: "Password reset email sent",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
      config: {
        rateLimit: AUTH_RATE_LIMIT,
      },
    },
    forgotPasswordHandler
  );

  fastify.post(
    "/reset-password",
    {
      schema: {
        description: "Reset password with token",
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["token", "newPassword", "confirmPassword"],
          properties: {
            token: {
              type: "string",
              description: "Password reset token",
            },
            newPassword: {
              type: "string",
              description: "New password (min 8 characters)",
            },
            confirmPassword: {
              type: "string",
              description: "Confirm new password",
            },
          },
        },
        response: {
          200: {
            description: "Password reset successful",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
      config: {
        rateLimit: AUTH_RATE_LIMIT,
      },
    },
    resetPasswordHandler
  );

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
