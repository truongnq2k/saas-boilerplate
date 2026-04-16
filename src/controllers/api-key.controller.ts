import { FastifyReply, FastifyRequest } from "fastify";
import {
  createApiKey,
  deleteApiKey,
  getApiKeys,
  revokeApiKey,
} from "@/services/api-key.service";
import { AuthenticatedRequest } from "@/types/request";
import { ICreateApiKeyDto } from "@/types/api-key";
import { extractPaginationParams } from "@/utils/pagination";
import { errorResponse, successResponse } from "@/utils/response";

export async function createApiKeyHandler(
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

    const tenantId = (authRequest.user as any).tenant_id;
    const result = await createApiKey(
      authRequest.user.userId,
      tenantId,
      request.body as ICreateApiKeyDto
    );

    return reply.status(201).send(
      successResponse(result, "API key created successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to create API key", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to create API key")
    );
  }
}

export async function getApiKeysHandler(
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

    const tenantId = authRequest.user.tenantId;

    const result = await getApiKeys(
      authRequest.user.userId,
      tenantId,
      {
        page,
        limit,
        is_active: query.is_active,
        is_revoked: query.is_revoked,
      }
    );

    const sanitizedItems = result.items.map(item => ({
      ...item,
      key: undefined,
    }));

    return reply.status(200).send(
      successResponse(
        { ...result, items: sanitizedItems },
        "API keys retrieved successfully"
      )
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to get API keys", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to get API keys")
    );
  }
}

export async function revokeApiKeyHandler(
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
    const keyId = parseInt(id);

    if (isNaN(keyId)) {
      return reply.status(400).send(
        errorResponse("Invalid ID", "API key ID must be a number")
      );
    }

    const tenantId = authRequest.user.tenantId;
    await revokeApiKey(authRequest.user.userId, tenantId, keyId);

    return reply.status(200).send(
      successResponse(null, "API key revoked successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to revoke API key", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to revoke API key")
    );
  }
}

export async function deleteApiKeyHandler(
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
    const keyId = parseInt(id);

    if (isNaN(keyId)) {
      return reply.status(400).send(
        errorResponse("Invalid ID", "API key ID must be a number")
      );
    }

    const tenantId = authRequest.user.tenantId;
    await deleteApiKey(authRequest.user.userId, tenantId, keyId);

    return reply.status(200).send(
      successResponse(null, "API key deleted successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to delete API key", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to delete API key")
    );
  }
}
