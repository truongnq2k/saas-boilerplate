---
name: "api-docs"
description: "Generates and manages API documentation with Swagger/OpenAPI. Invoke when user wants to view, update, or generate API docs."
---

# API Documentation

This skill manages API documentation using Swagger/OpenAPI.

## When to Invoke

- User asks "view API docs", "open swagger"
- User asks "update API docs", "add endpoint docs"
- User wants to test API endpoints
- Generate API documentation

## Project Setup

This project already has `@fastify/swagger` and `@fastify/swagger-ui` configured.

### Accessing API Docs

Server must be running first:
```bash
npm run dev
```

Then open in browser:
- Swagger UI: `http://localhost:<PORT>/docs`
- OpenAPI JSON: `http://localhost:<PORT>/json`

Default port: Check `package.json` or `.env` (PORT)

## Documenting Routes

This project uses Fastify schema for API documentation.

### Route Schema Pattern

```typescript
export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', {
    schema: {
      tags: ['Users'],
      summary: 'Create new user',
      description: 'Create a new user in the system',
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['ADMIN', 'USER', 'STAFF'] },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, createUserHandler);
};
```

### Schema Properties

| Property | Description |
|----------|-------------|
| `tags` | Group endpoints in Swagger UI |
| `summary` | Short endpoint description |
| `description` | Detailed endpoint info |
| `body` | Request body schema |
| `params` | URL parameters schema |
| `querystring` | Query string schema |
| `response` | Response schema by status code |
| `security` | Auth requirements |

### Type References

Use `$ref` for reusable schemas:

```typescript
schema: {
  body: {
    type: 'object',
    properties: {
      user: { $ref: '#/components/schemas/UserDto' }
    }
  }
}
```

## Common Schemas

Add reusable schemas in `src/utils/swagger-schemas.ts`:

```typescript
export const userSchemas = {
  UserDto: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: { type: 'string', minLength: 3 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      role: { type: 'string', enum: ['ADMIN', 'USER', 'STAFF'] },
    },
  },
  UserResponse: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      username: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
    },
  },
};
```

## Best Practices

1. **Always document new endpoints** with tags, summary, description
2. **Use proper HTTP methods**: GET (read), POST (create), PUT (update), DELETE (remove)
3. **Document error responses** for 400, 401, 403, 404, 500
4. **Use meaningful summaries** - this shows in Swagger UI
5. **Group related endpoints** with same tags

## Tools

### Test API with cURL
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Test with Swagger UI
1. Start server: `npm run dev`
2. Open: `http://localhost:3000/docs`
3. Click endpoint → Try it out → Execute
