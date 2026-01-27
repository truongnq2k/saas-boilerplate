import { FastifyReply, FastifyRequest } from "fastify";
import {
  changePassword,
  createUser,
  getAllUsers,
  getUserProfile,
  loginUser,
  updateUser
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
    return reply.status(201).send(successResponse(result, result.message));
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(401).send(
        unauthorizedResponse(error.message)
      );
    }
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const loginData = request.body as IUserLoginData;

  try {
    const result = await loginUser(loginData);
    return reply.status(200).send(
      successResponse(result, result.message)
    );
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(401).send(
        unauthorizedResponse(error.message)
      );
    }
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

  const result = await getAllUsers({
    page,
    limit,
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    role: query.role,
    status: query.status
  });

  return reply.status(200).send(
    paginatedResponse(result.items, result.pagination, 'Users retrieved successfully')
  );
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

  const user = await getUserProfile(userId);

  if (!user) {
    return reply.status(404).send(
      errorResponse("User not found", `User with ID ${userId} does not exist`)
    );
  }

  return reply.status(200).send(successResponse(user, 'User retrieved successfully'));
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

  const updatedUser = await updateUser(userId, request.body as IUpdateUserDto);

  return reply.status(200).send(successResponse(updatedUser, 'User updated successfully'));
}

export async function getProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  const userProfile = await getUserProfile(authRequest.user.userId);

  if (!userProfile) {
    return reply.status(404).send(
      errorResponse('User profile not found', 'User does not exist')
    );
  }

  return reply.status(200).send(
    successResponse(userProfile, 'Profile retrieved successfully')
  );
}

export async function updateProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  const updatedUser = await updateUser(authRequest.user.userId, request.body as IUpdateUserDto);

  return reply.status(200).send(
    successResponse(updatedUser, 'Profile updated successfully')
  );
}

export async function changePasswordHandler(request: FastifyRequest, reply: FastifyReply) {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user) {
    return reply.status(401).send(
      unauthorizedResponse('Authentication required')
    );
  }

  const result = await changePassword(authRequest.user.userId, request.body as IPasswordChangeDto);

  return reply.status(200).send(
    successResponse(result, result.message)
  );
}
