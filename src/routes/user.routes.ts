import { FastifyInstance } from "fastify";
import {
  changePasswordHandler,
  deleteUserHandler,
  getAllUsersHandler,
  getProfileHandler,
  getUserStatsHandler,
  getUserByIdHandler,
  updateProfileHandler,
  updateUserHandler,
  updateUserStatusHandler
} from "../controllers/user.controller";
import { authMiddleware, requireRole } from "../middleware/auth";

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
  fastify.get('/profile', {
    schema: profileSchema,
    preHandler: authMiddleware
  }, getProfileHandler);

  fastify.put('/profile', {
    schema: updateProfileSchema,
    preHandler: authMiddleware
  }, updateProfileHandler);

  fastify.post('/change-password', {
    schema: changePasswordSchema,
    preHandler: authMiddleware
  }, changePasswordHandler);

  fastify.get('/admin', {
    schema: adminUsersListSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, getAllUsersHandler);

  fastify.get('/admin/:id', {
    schema: adminUserByIdSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, getUserByIdHandler);

  fastify.put('/admin/:id', {
    schema: adminUpdateUserSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, updateUserHandler);

  fastify.delete('/admin/:id', {
    schema: deleteUserSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, deleteUserHandler);

  fastify.get('/admin/stats', {
    schema: userStatsSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, getUserStatsHandler);

  fastify.put('/admin/:id/status', {
    schema: updateUserStatusSchema,
    preHandler: [authMiddleware, requireRole('ADMIN')]
  }, updateUserStatusHandler);
}
