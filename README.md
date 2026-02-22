# SaaS Base Boilerplate

A clean, production-ready SaaS base boilerplate built with Fastify, Prisma, and JWT authentication. Ready for building any SaaS application.

## Features

- **Fastify Framework** - High-performance HTTP server
- **Prisma ORM** - Type-safe database access with MySQL
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Multi-tenancy Support** - Built-in tenant model for SaaS applications
- **Role-based Access Control** - USER, ADMIN, STAFF roles with granular permissions
- **API Documentation** - Auto-generated Swagger/OpenAPI docs
- **Redis Integration** - Ready for caching and session management
- **Rate Limiting** - Built-in API protection
- **CORS Support** - Configurable cross-origin requests
- **File Upload** - Multipart support with size limits
- **Response Compression** - Gzip/Deflate compression
- **Job Scheduler** - Cron job support for background tasks
- **Audit Logging** - Track all user actions
- **API Keys** - Support for API key authentication
- **Transaction Management** - Balance and transaction tracking
- **TypeScript** - Full type safety

## Tech Stack

- **Runtime**: Node.js >= 18.0.0
- **Language**: TypeScript 5.9+
- **Framework**: Fastify 5.6+
- **Database**: MySQL with Prisma ORM
- **Cache**: Redis (ioredis)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Job Scheduling**: node-cron

## Project Structure

```
src/
├── controllers/      # Request handlers
├── middleware/       # Auth, permission middleware
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript interfaces
├── utils/           # Helper functions
├── jobs/            # Scheduled tasks
└── server.ts        # Application entry point

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MySQL database
- Redis (optional, for caching)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=8888
DATABASE_URL="mysql://root:password@localhost:3306/saas_db"
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"
CORS_ORIGINS=http://localhost:3000,http://localhost:8888
X_HEADER_KEY="your-api-key"

NODE_ENV=development
HOST=localhost
API_BASE_URL=api.example.com

REDIS_URL="redis://localhost:6379"

LOG_LEVEL=info
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (optional)
npm run prisma:studio
```

### Development

```bash
npm run dev
```

Server will start at `http://localhost:8888`

- API Docs: `http://localhost:8888/docs`
- Health Check: `http://localhost:8888/health`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| POST   | `/api/users/register` | Register new user       |
| POST   | `/api/users/login`    | Login and get JWT token |
| POST   | `/api/auth/refresh`   | Refresh access token    |
| POST   | `/api/auth/logout`    | Logout and revoke token |

### User Routes

| Method | Endpoint                     | Description                 |
| ------ | ---------------------------- | --------------------------- |
| GET    | `/api/users/profile`         | Get current user profile    |
| PUT    | `/api/users/profile`         | Update current user profile |
| POST   | `/api/users/change-password` | Change password             |

### Admin - Users

| Method | Endpoint                      | Description                                 |
| ------ | ----------------------------- | ------------------------------------------- |
| GET    | `/api/admin/users`            | Get all users (pagination, search, filters) |
| GET    | `/api/admin/users/:id`        | Get user by ID                              |
| PUT    | `/api/admin/users/:id`        | Update user                                 |
| DELETE | `/api/admin/users/:id`        | Delete user                                 |
| PUT    | `/api/admin/users/:id/status` | Update user status                          |
| GET    | `/api/admin/users/stats`      | Get user statistics                         |

### Admin - Tenants

| Method | Endpoint                 | Description       |
| ------ | ------------------------ | ----------------- |
| GET    | `/api/admin/tenants`     | Get all tenants   |
| POST   | `/api/admin/tenants`     | Create new tenant |
| GET    | `/api/admin/tenants/:id` | Get tenant by ID  |
| PUT    | `/api/admin/tenants/:id` | Update tenant     |
| DELETE | `/api/admin/tenants/:id` | Delete tenant     |

### Balance & Transactions

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/api/balance`      | Get current user balance       |
| GET    | `/api/transactions` | Get transaction history        |
| POST   | `/api/transactions` | Create new transaction (admin) |

### API Keys

| Method | Endpoint        | Description        |
| ------ | --------------- | ------------------ |
| GET    | `/api/keys`     | List user API keys |
| POST   | `/api/keys`     | Create new API key |
| DELETE | `/api/keys/:id` | Revoke API key     |

### Permissions

| Method | Endpoint                       | Description             |
| ------ | ------------------------------ | ----------------------- |
| GET    | `/api/admin/permissions`       | List all permissions    |
| GET    | `/api/admin/roles/permissions` | Get role permissions    |
| PUT    | `/api/admin/roles/permissions` | Update role permissions |

### Health

| Method | Endpoint  | Description                           |
| ------ | --------- | ------------------------------------- |
| GET    | `/health` | Health check with performance metrics |

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Paginated response:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    "items": [],
    "pagination": {
      "currentPage": 1,
      "itemsPerPage": 20,
      "totalItems": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info"
}
```

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Some endpoints also support API Key authentication:

```
X-API-Key: <your-api-key>
```

## User Roles

- **USER** - Regular user with basic access
- **STAFF** - Staff member with extended access
- **ADMIN** - Administrator with full access

## User Status

- **ACTIVE** - Account is active
- **INACTIVE** - Account is deactivated
- **SUSPENDED** - Account is suspended

## Tenant Status

- **ACTIVE** - Tenant is active
- **INACTIVE** - Tenant is deactivated
- **SUSPENDED** - Tenant is suspended

## Transaction Types

- **CREDIT** - Add funds to balance
- **DEBIT** - Deduct funds from balance

## Transaction Status

- **PENDING** - Transaction is pending
- **COMPLETED** - Transaction completed successfully
- **FAILED** - Transaction failed
- **CANCELLED** - Transaction cancelled

## Scripts

| Script                    | Description               |
| ------------------------- | ------------------------- |
| `npm run dev`             | Start development server  |
| `npm run build`           | Build for production      |
| `npm start`               | Start production server   |
| `npm run lint`            | Run ESLint                |
| `npm run lint:fix`        | Fix ESLint issues         |
| `npm run typecheck`       | Run TypeScript type check |
| `npm run clean`           | Remove build directory    |
| `npm run format`          | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma client    |
| `npm run prisma:migrate`  | Run database migrations   |
| `npm run prisma:studio`   | Open Prisma Studio        |
| `npm run prisma:seed`     | Seed database             |

## Database Schema

### User

| Field      | Type       | Description                 |
| ---------- | ---------- | --------------------------- |
| id         | Int        | Primary key                 |
| username   | String     | Unique username             |
| email      | String?    | Unique email (optional)     |
| password   | String     | Hashed password             |
| name       | String     | Full name                   |
| role       | Role       | USER, ADMIN, STAFF          |
| status     | UserStatus | ACTIVE, INACTIVE, SUSPENDED |
| balance    | Decimal    | User balance                |
| tenant_id  | Int?       | Foreign key to Tenant       |
| created_at | DateTime   | Creation timestamp          |
| updated_at | DateTime   | Update timestamp            |

### Tenant

| Field      | Type         | Description                 |
| ---------- | ------------ | --------------------------- |
| id         | Int          | Primary key                 |
| name       | String       | Tenant name                 |
| slug       | String       | Unique tenant slug          |
| status     | TenantStatus | ACTIVE, INACTIVE, SUSPENDED |
| settings   | Json?        | Custom settings             |
| created_at | DateTime     | Creation timestamp          |
| updated_at | DateTime     | Update timestamp            |

### Transaction

| Field       | Type              | Description                           |
| ----------- | ----------------- | ------------------------------------- |
| id          | Int               | Primary key                           |
| amount      | Decimal           | Transaction amount                    |
| type        | TransactionType   | CREDIT, DEBIT                         |
| status      | TransactionStatus | PENDING, COMPLETED, FAILED, CANCELLED |
| description | String?           | Transaction description               |
| reference   | String?           | Unique reference                      |
| user_id     | Int               | Foreign key to User                   |
| created_at  | DateTime          | Creation timestamp                    |
| updated_at  | DateTime          | Update timestamp                      |

### Permission

| Field       | Type    | Description            |
| ----------- | ------- | ---------------------- |
| id          | Int     | Primary key            |
| name        | String  | Permission name        |
| slug        | String  | Unique slug            |
| description | String? | Permission description |
| module      | String  | Module name            |
| is_active   | Boolean | Active status          |

### ApiKey

| Field       | Type      | Description                   |
| ----------- | --------- | ----------------------------- |
| id          | Int       | Primary key                   |
| name        | String    | API key name                  |
| key_hash    | String    | Hashed API key                |
| prefix      | String    | Key prefix for identification |
| permissions | Json?     | Custom permissions            |
| expiresAt   | DateTime? | Expiration date               |
| is_active   | Boolean   | Active status                 |
| is_revoked  | Boolean   | Revoked status                |
| user_id     | Int       | Foreign key to User           |
| tenant_id   | Int?      | Foreign key to Tenant         |

### AuditLog

| Field       | Type    | Description           |
| ----------- | ------- | --------------------- |
| id          | Int     | Primary key           |
| action      | String  | Action performed      |
| entity      | String  | Entity type           |
| entity_id   | Int?    | Entity ID             |
| description | String? | Action description    |
| old_value   | Json?   | Previous value        |
| new_value   | Json?   | New value             |
| ip_address  | String? | Client IP             |
| user_agent  | String? | Client user agent     |
| user_id     | Int?    | Foreign key to User   |
| tenant_id   | Int?    | Foreign key to Tenant |

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT access token (15 minutes) + refresh token (7 days)
- Rate limiting (100 requests/minute)
- CORS configuration
- Input validation with Fastify schema
- SQL injection prevention (Prisma ORM)
- Role-based access control
- Granular permission system
- API key authentication
- Audit logging

## Multi-tenancy

The boilerplate includes a Tenant model for multi-tenant SaaS applications:

- Users can be associated with a tenant using the `tenant_id` field
- API keys can be scoped to tenants
- Audit logs track tenant-specific actions

## Deployment

### Environment Variables

Make sure to set these in production:

- `NODE_ENV=production`
- `DATABASE_URL` - Your production database URL
- `JWT_SECRET` - Strong random secret key
- `JWT_REFRESH_SECRET` - Strong random refresh secret
- `CORS_ORIGINS` - Your production domains
- `REDIS_URL` - Your Redis instance

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
