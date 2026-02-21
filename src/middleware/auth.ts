import { ErrorCode, UserRole } from "@/types/common";
import { FastifyReply, FastifyRequest } from "fastify";
import * as jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response";
import { prisma } from "../utils/prisma";

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: number;
      role: UserRole;
      username: string;
    };
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "tradingsystem";
const HEADER_KEY = process.env.X_HEADER_KEY || "tradingsystem-header-key";

export interface AuthPayload {
  userId: number;
  role: UserRole;
  username: string;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
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
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, status: true, role: true, username: true }
    });

    if (!user) {
      return reply
        .status(401)
        .send(errorResponse("User not found", "Tài khoản không tồn tại", { errorCode: ErrorCode.UNAUTHORIZED }));
    }

    if (user.role !== 'ADMIN') {
      if (user.status === 'SUSPENDED') {
        return reply
          .status(403)
          .send(errorResponse("Tài khoản đã bị khóa", "Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.", { errorCode: ErrorCode.FORBIDDEN }));
      }

      if (user.status === 'INACTIVE') {
        return reply
          .status(403)
          .send(errorResponse("Tài khoản không hoạt động", "Tài khoản của bạn đã bị vô hiệu hóa.", { errorCode: ErrorCode.FORBIDDEN }));
      }
    }

    request.user = decoded;
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
    if (!request.user || request.user.role !== role) {
      return reply
        .status(403)
        .send(errorResponse("Forbidden: insufficient role", "User lacks required permissions", { errorCode: ErrorCode.UNAUTHORIZED }));
    }
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

  if (headerKey !== HEADER_KEY) {
    return reply.status(403).send(
      errorResponse("Invalid API key", "The provided API key is incorrect", { errorCode: ErrorCode.UNAUTHORIZED })
    );
  }
}
