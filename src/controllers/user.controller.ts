import { FastifyReply, FastifyRequest } from "fastify";
import {
  changePassword,
  createUser,
  deleteUser,
  getAllUsers,
  getUserProfile,
  getUserStats,
  loginUser,
  updateUser,
  updateUserStatus
} from "@/services/user.service";
import { AuthenticatedRequest } from "@/types/request";
import {
  ICreateUserDto,
  IPasswordChangeDto,
  IUpdateUserDto,
  IUserLoginData
} from "@/types/user";
import { extractPaginationParams } from "@/utils/pagination";
import { errorResponse, paginatedResponse, successResponse, unauthorizedResponse } from "@/utils/response";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await createUser(request.body as ICreateUserDto);
    return reply.status(201).send(successResponse(result, 'User registered successfully'));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(401).send(
        unauthorizedResponse(error.message)
      );
    }
    return reply.status(500).send(errorResponse("Internal Server Error", "Failed to register user"));
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const loginData = request.body as IUserLoginData;

  try {
    const result = await loginUser(loginData);
    return reply.status(200).send(
      successResponse(result, 'Login successful')
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(401).send(
        unauthorizedResponse(error.message)
      );
    }
    return reply.status(500).send(errorResponse("Internal Server Error", "Failed to login"));
  }
}

export async function getAllUsersHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  const query = request.query as any;
  const { page, limit } = extractPaginationParams(query);

  let tenantId: number | undefined;
  if (authRequest.user.role !== 'ADMIN' && authRequest.user.tenantId) {
    tenantId = authRequest.user.tenantId;
  } else if (query.tenantId) {
    tenantId = parseInt(query.tenantId);
  }

  try {
    const result = await getAllUsers({
      page,
      limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      role: query.role,
      status: query.status,
      tenantId
    });

    return reply.status(200).send(
      paginatedResponse(result.items, result.pagination, 'Users retrieved successfully')
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse('Failed to get users', error.message)
      );
    }
    return reply.status(500).send(errorResponse('Internal Server Error', 'Failed to get users'));
  }
}

export async function getUserByIdHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  const { id } = request.params as { id: string };
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return reply.status(400).send(
      errorResponse("Invalid user ID", "ID must be a number")
    );
  }

  try {
    const user = await getUserProfile(userId);

    if (!user) {
      return reply.status(404).send(
        errorResponse("User not found", `User with ID ${userId} does not exist`)
      );
    }

    return reply.status(200).send(successResponse(user, 'User retrieved successfully'));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse('Failed to get user', error.message)
      );
    }
  }
}

export async function updateUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  const { id } = request.params as { id: string };
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return reply.status(400).send(
      errorResponse("Invalid user ID", "ID must be a number")
    );
  }

  try {
    const updatedUser = await updateUser(userId, request.body as IUpdateUserDto);

    return reply.status(200).send(successResponse(updatedUser, 'User updated successfully'));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse('Failed to update user', error.message)
      );
    }
  }
}

export async function getProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  try {
    const userProfile = await getUserProfile(authRequest.user.userId);

    if (!userProfile) {
      return reply.status(404).send(
        errorResponse('User profile not found', 'User does not exist')
      );
    }

    return reply.status(200).send(
      successResponse(userProfile, 'Profile retrieved successfully')
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse('Failed to get profile', error.message)
      );
    }
  }
}

export async function updateProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  try {
    const updatedUser = await updateUser(authRequest.user.userId, request.body as IUpdateUserDto);

    return reply.status(200).send(
      successResponse(updatedUser, 'Profile updated successfully')
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse('Failed to update profile', error.message)
      );
    }
  }
}

export async function changePasswordHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  try {
    const result = await changePassword(authRequest.user.userId, request.body as IPasswordChangeDto);

    return reply.status(200).send(
      successResponse(result, 'Password changed successfully')
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse('Failed to change password', error.message)
      );
    }
  }
}

export async function deleteUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  const { id } = request.params as { id: string };
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return reply.status(400).send(
      errorResponse("Invalid user ID", "ID must be a number")
    );
  }

  try {
    await deleteUser(userId);

    return reply.status(200).send(
      successResponse(null, 'User deleted successfully')
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse('Failed to delete user', error.message)
      );
    }
  }
}

export async function getUserStatsHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  try {
    const stats = await getUserStats();

    return reply.status(200).send(
      successResponse(stats, 'User stats retrieved successfully')
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse('Failed to get user stats', error.message)
      );
    }
  }
}

export async function updateUserStatusHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  const { id } = request.params as { id: string };
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return reply.status(400).send(
      errorResponse("Invalid user ID", "ID must be a number")
    );
  }

  const body = request.body as { status: string; reason?: string };

  try {
    const updatedUser = await updateUserStatus(userId, { status: body.status as any, reason: body.reason });

    return reply.status(200).send(
      successResponse(updatedUser, 'User status updated successfully')
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send(
        errorResponse('Failed to update user status', error.message)
      );
    }
  }
}
