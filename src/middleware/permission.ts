import { FastifyReply, FastifyRequest } from "fastify";
import { errorResponse } from "@/utils/response";
import { getPermissionsByRole } from "@/services/permission.service";
import { Role } from "@/types/permission";
import { ErrorCode } from "@/types/common";

export function checkPermission(requiredPermission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) {
        return reply
          .status(401)
          .send(
            errorResponse(
              "Unauthorized",
              "User not authenticated",
              { errorCode: ErrorCode.UNAUTHORIZED }
            )
          );
      }

      const userRole = request.user.role as Role;
      const { permissions } = await getPermissionsByRole(userRole);

      if (!permissions.includes(requiredPermission)) {
        return reply
          .status(403)
          .send(
            errorResponse(
              "Forbidden",
              "You do not have permission to perform this action",
              { errorCode: ErrorCode.FORBIDDEN }
            )
          );
      }
    } catch (error) {
      console.error("Permission check error:", error);
      return reply
        .status(500)
        .send(
          errorResponse(
            "Internal server error",
            "Failed to verify permissions",
            { errorCode: ErrorCode.INTERNAL_ERROR }
          )
        );
    }
  };
}
