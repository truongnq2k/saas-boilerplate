# SaaS Base Boilerplate

A clean, production-ready SaaS base boilerplate built with Fastify, Prisma, and JWT authentication. Ready for building any SaaS application.

## Features

- **Fastify Framework** - High-performance HTTP server
- **Prisma ORM** - Type-safe database access with MySQL
- **JWT Authentication** - Secure token-based authentication
- **Multi-tenancy Support** - Built-in tenant model for SaaS applications
- **Role-based Access Control** - USER, ADMIN, STAFF roles
- **API Documentation** - Auto-generated Swagger/OpenAPI docs
- **Redis Integration** - Ready for caching and session management
- **Rate Limiting** - Built-in API protection
- **CORS Support** - Configurable cross-origin requests
- **File Upload** - Multipart support with size limits
- **Response Compression** - Gzip/Deflate compression
- **Job Scheduler** - Cron job support for background tasks
- **TypeScript** - Full type safety
- **ESLint** - Code linting and formatting

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
├── controllers/     # Request handlers
├── middleware/      # Auth and custom middleware
├── routes/         # API route definitions
├── services/        # Business logic
├── types/          # TypeScript interfaces
├── utils/          # Helper functions
├── jobs/           # Scheduled tasks
└── server.ts        # Application entry point

prisma/
├── schema.prisma  # Database schema
└── migrations/     # Database migrations
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

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login and get JWT token

### User Routes

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `POST /api/users/change-password` - Change password

### Admin Routes

- `GET /api/admin/users` - Get all users (with pagination, search, filters)
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user

### Health

- `GET /health` - Health check with performance metrics

## API Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "message": "string",
  "data": object|array,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **USER** - Regular user
- **ADMIN** - Administrator with full access
- **STAFF** - Staff member with limited admin access

## User Status

- **ACTIVE** - Account is active
- **INACTIVE** - Account is deactivated
- **SUSPENDED** - Account is suspended

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Run TypeScript type check
- `npm run clean` - Remove build directory
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Database Schema

### User

- `id` - Primary key
- `username` - Unique username
- `email` - Unique email (optional)
- `password` - Hashed password
- `name` - Full name
- `role` - USER, ADMIN, STAFF
- `status` - ACTIVE, INACTIVE, SUSPENDED
- `tenant_id` - Foreign key to Tenant (for multi-tenancy)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Tenant

- `id` - Primary key
- `name` - Tenant name
- `slug` - Unique tenant slug
- `status` - ACTIVE, INACTIVE, SUSPENDED
- `settings` - JSON settings
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token expiration (7 days)
- Rate limiting (100 requests/minute)
- CORS configuration
- Input validation
- SQL injection prevention (Prisma ORM)
- Role-based access control

## Multi-tenancy

The boilerplate includes a Tenant model for multi-tenant SaaS applications. Users can be associated with a tenant using the `tenant_id` field.

## Deployment

### Environment Variables

Make sure to set these in production:

- `NODE_ENV=production`
- `DATABASE_URL` - Your production database URL
- `JWT_SECRET` - Strong random secret key
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
