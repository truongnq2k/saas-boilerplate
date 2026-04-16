import { ErrorCode, UserRole } from "@/types/common";
import { FastifyReply, FastifyRequest } from "fastify";
import * as jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response";
import { prisma } from "../utils/prisma";
import { JWT_CONFIG, API_CONFIG } from "../utils/config";

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: number;
      role: UserRole;
      username: string;
      tenantId?: number;
    };
  }
}

export interface AuthPayload {
  userId: number;
  role: UserRole;
  username: string;
  tenantId?: number;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.accessTokenExpiry });
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      return reply
        .status(401)
        .send(errorResponse("Missing Authorization header", "No authorization token provided", { errorCode: ErrorCode.UNAUTHORIZED }));
    }
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as AuthPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, status: true, role: true, username: true, tenant_id: true }
    });

    if (!user) {
      return reply
        .status(401)
        .send(errorResponse("User not found", "Account does not exist", { errorCode: ErrorCode.UNAUTHORIZED }));
    }

    if (user.role !== 'ADMIN') {
      if (user.status === 'SUSPENDED') {
        return reply
          .status(403)
          .send(errorResponse("Account suspended", "Your account has been temporarily suspended. Please contact support.", { errorCode: ErrorCode.FORBIDDEN }));
      }

      if (user.status === 'INACTIVE') {
        return reply
          .status(403)
          .send(errorResponse("Account inactive", "Your account has been deactivated.", { errorCode: ErrorCode.FORBIDDEN }));
      }
    }

    request.user = {
      ...decoded,
      tenantId: user.tenant_id || undefined
    };
  } catch (error) {
    return reply
      .status(401)
      .send(
        errorResponse('Invalid or expired token', error instanceof Error ? error.message : "Token verification failed", { errorCode: ErrorCode.UNAUTHORIZED })
      );
  }
}

export function requireRole(role: UserRole) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply
        .status(401)
        .send(errorResponse("Unauthorized", "Authentication required", { errorCode: ErrorCode.UNAUTHORIZED }));
    }

    if (request.user.role === 'ADMIN' || request.user.role === role) {
      return;
    }

    return reply
      .status(403)
      .send(errorResponse("Forbidden: insufficient role", "User lacks required permissions", { errorCode: ErrorCode.UNAUTHORIZED }));
  };
}

export async function headerKeyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const headerKey = request.headers["x-api-key"];

  if (!headerKey) {
    return reply
      .status(401)
      .send(errorResponse("Missing X-API-KEY header", "API key is required for this endpoint", { errorCode: ErrorCode.UNAUTHORIZED }));
  }

  if (headerKey !== API_CONFIG.headerKey) {
    return reply.status(403).send(
      errorResponse("Invalid API key", "The provided API key is incorrect", { errorCode: ErrorCode.UNAUTHORIZED })
    );
  }
}
