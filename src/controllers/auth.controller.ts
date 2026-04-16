import { FastifyReply, FastifyRequest } from "fastify";
import { refreshAccessToken, revokeRefreshToken, revokeAllUserTokens, register, loginWithEmailOrUsername, forgotPassword, resetPassword } from "@/services/auth.service";
import { IRefreshTokenDto, IRegisterDto, ILoginDto, IForgotPasswordDto, IResetPasswordDto } from "@/types/auth";
import { errorResponse, successResponse, unauthorizedResponse } from "@/utils/response";
import { validatePassword, PASSWORD_CONFIG } from "@/utils/config";

export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = request.body as IRegisterDto;

    if (!data.username || !data.password || !data.name) {
      return reply.status(400).send(
        errorResponse("Bad Request", "Username, password, and name are required")
      );
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      return reply.status(400).send(
        errorResponse("Bad Request", passwordValidation.errors.join('. '))
      );
    }

    const result = await register(data);

    return reply.status(201).send(
      successResponse(result, "User registered successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return reply.status(409).send(
          errorResponse("Conflict", error.message)
        );
      }
      return reply.status(400).send(
        errorResponse("Failed to register", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to register user")
    );
  }
}

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = request.body as ILoginDto;

    if (!data.login || !data.password) {
      return reply.status(400).send(
        errorResponse("Bad Request", "Login and password are required")
      );
    }

    const result = await loginWithEmailOrUsername(data);

    return reply.status(200).send(
      successResponse(result, "Login successful")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(401).send(
        unauthorizedResponse(error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to login")
    );
  }
}

export async function forgotPasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = request.body as IForgotPasswordDto;

    if (!data.email) {
      return reply.status(400).send(
        errorResponse("Bad Request", "Email is required")
      );
    }

    await forgotPassword(data);

    return reply.status(200).send(
      successResponse(null, "If the email exists, a password reset link has been sent")
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse("Failed to process request", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to process request")
    );
  }
}

export async function resetPasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = request.body as IResetPasswordDto;

    if (!data.token || !data.newPassword || !data.confirmPassword) {
      return reply.status(400).send(
        errorResponse("Bad Request", "Token, new password, and confirm password are required")
      );
    }

    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.valid) {
      return reply.status(400).send(
        errorResponse("Bad Request", passwordValidation.errors.join('. '))
      );
    }

    await resetPassword(data);

    return reply.status(200).send(
      successResponse(null, "Password reset successfully")
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired') || error.message.includes('Invalid')) {
        return reply.status(400).send(
          errorResponse("Invalid Token", error.message)
        );
      }
      return reply.status(400).send(
        errorResponse("Failed to reset password", error.message)
      );
    }
    return reply.status(500).send(
      errorResponse("Internal Server Error", "Failed to reset password")
    );
  }
}

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
