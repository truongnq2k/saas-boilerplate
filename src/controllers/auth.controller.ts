import { FastifyReply, FastifyRequest } from "fastify";
import { refreshAccessToken, revokeRefreshToken, revokeAllUserTokens } from "@/services/auth.service";
import { IRefreshTokenDto } from "@/types/auth";
import { errorResponse, successResponse, unauthorizedResponse } from "@/utils/response";

export async function refreshTokenHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = request.body as IRefreshTokenDto;

    if (!data.refreshToken) {
      return reply.status(400).send(
        errorResponse("Bad Request", "Refresh token is required")
      );
    }

    const tokens = await refreshAccessToken(data);

    return reply.status(200).send(
      successResponse(tokens, "Token refreshed successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(401).send(
        unauthorizedResponse(error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to refresh token")
    );
  }
}

export async function logoutHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = request.body as IRefreshTokenDto;

    if (data.refreshToken) {
      await revokeRefreshToken(data.refreshToken);
    }

    return reply.status(200).send(
      successResponse(null, "Logged out successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to logout", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to logout")
    );
  }
}

export async function logoutAllHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authRequest = request as any;
    if (!authRequest.user) {
      return reply.status(401).send(
        unauthorizedResponse("Authentication required")
      );
    }

    await revokeAllUserTokens(authRequest.user.userId);

    return reply.status(200).send(
      successResponse(null, "Logged out from all devices successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to logout", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to logout")
    );
  }
}
