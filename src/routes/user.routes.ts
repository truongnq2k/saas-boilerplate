import { FastifyInstance } from "fastify";
import {
  changePasswordHandler,
  deleteUserHandler,
  getAllUsersHandler,
  getProfileHandler,
  getUserStatsHandler,
  getUserByIdHandler,
  login,
  register,
  updateProfileHandler,
  updateUserHandler,
  updateUserStatusHandler
} from "../controllers/user.controller";
import { authMiddleware, requireRole } from "../middleware/auth";

const registerSchema = {
  description: 'Register a new user',
  tags: ['Users'],
  body: {
    type: 'object',
    required: ['username', 'password', 'name'],
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        description: 'Username'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Email address'
      },
      password: {
        type: 'string',
        minLength: 8,
        description: 'Password (minimum 8 characters)'
      },
      name: {
        type: 'string',
        minLength: 2,
        description: 'Full name'
      },
    },
  },
  response: {
    201: {
      description: 'Registration successful',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: {
                  type: 'string',
                  enum: ['USER', 'ADMIN', 'STAFF']
                },
                status: {
                  type: 'string',
                  enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED']
                },
                created_at: { type: 'string' },
                updated_at: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};

const loginSchema = {
  description: 'Login and return JWT token',
  tags: ['Users'],
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
        description: 'Username or email'
      },
      password: {
        type: 'string',
        description: 'Password'
      },
    },
  },
  response: {
    200: {
      description: 'Login successful',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: {
                  type: 'string',
                  enum: ['USER', 'ADMIN', 'STAFF']
                },
                status: {
                  type: 'string',
                  enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED']
                },
                created_at: { type: 'string' },
                updated_at: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};

const adminUsersListSchema = {
  description: 'Get all users (Admin)',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        default: 1,
        minimum: 1,
        description: 'Page number'
      },
      limit: {
        type: 'number',
        default: 20,
        minimum: 1,
        maximum: 100,
        description: 'Items per page'
      },
      search: {
        type: 'string',
        description: 'Search by name, username, or email'
      },
      role: {
        type: 'string',
        enum: ['ADMIN', 'USER', 'STAFF'],
        description: 'Filter by role'
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        description: 'Filter by status'
      },
      sortBy: {
        type: 'string',
        default: 'created_at',
        enum: ['created_at', 'name', 'username'],
        description: 'Sort field'
      },
      sortOrder: {
        type: 'string',
        default: 'desc',
        enum: ['asc', 'desc'],
        description: 'Sort order'
      }
    }
  }
};

const adminUserByIdSchema = {
  description: 'Get user by ID (Admin)',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        description: 'User ID',
        pattern: '^[0-9]+$'
      },
    },
  }
};

const adminUpdateUserSchema = {
  description: 'Update user (Admin)',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        description: 'User ID',
        pattern: '^[0-9]+$'
      },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        description: 'Full name'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Email address'
      },
      role: {
        type: 'string',
        enum: ['USER', 'ADMIN', 'STAFF'],
        description: 'User role'
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        description: 'Account status'
      },
    },
  }
};

const profileSchema = {
  description: 'Get current user profile',
  tags: ['Users'],
  security: [{ bearerAuth: [] }]
};

const updateProfileSchema = {
  description: 'Update current user profile',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        description: 'Full name'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Email address'
      },
    },
  }
};

const changePasswordSchema = {
  description: 'Change password',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['currentPassword', 'newPassword', 'confirmPassword'],
    properties: {
      currentPassword: {
        type: 'string',
        description: 'Current password'
      },
      newPassword: {
        type: 'string',
        minLength: 8,
        description: 'New password (minimum 8 characters)'
      },
      confirmPassword: {
        type: 'string',
        description: 'Confirm new password'
      },
    },
  }
};

const deleteUserSchema = {
  description: 'Delete user (Admin)',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        description: 'User ID',
        pattern: '^[0-9]+$'
      },
    },
  }
};

const userStatsSchema = {
  description: 'Get user statistics (Admin)',
  tags: ['Users'],
  security: [{ bearerAuth: [] }]
};

const updateUserStatusSchema = {
  description: 'Update user status (Admin)',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        description: 'User ID',
        pattern: '^[0-9]+$'
      },
    },
  },
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        description: 'Account status'
      },
      reason: {
        type: 'string',
        description: 'Reason for status change'
      },
    },
  }
};

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post("/users/register", { schema: registerSchema }, register);

  fastify.post("/users/login", { schema: loginSchema }, login);

  fastify.get('/users/profile', {
    schema: profileSchema,
    preHandler: authMiddleware
  }, getProfileHandler);

  fastify.put('/users/profile', {
    schema: updateProfileSchema,
    preHandler: authMiddleware
  }, updateProfileHandler);

  fastify.post('/users/change-password', {
    schema: changePasswordSchema,
    preHandler: authMiddleware
  }, changePasswordHandler);

  fastify.get('/admin/users', {
    schema: adminUsersListSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, getAllUsersHandler);

  fastify.get('/admin/users/:id', {
    schema: adminUserByIdSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, getUserByIdHandler);

  fastify.put('/admin/users/:id', {
    schema: adminUpdateUserSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, updateUserHandler);

  fastify.delete('/admin/users/:id', {
    schema: deleteUserSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, deleteUserHandler);

  fastify.get('/admin/users/stats', {
    schema: userStatsSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, getUserStatsHandler);

  fastify.put('/admin/users/:id/status', {
    schema: updateUserStatusSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, updateUserStatusHandler);
}
