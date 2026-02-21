---
name: "ts-backend-conventions"
description: "Enforces TypeScript backend coding conventions for this Fastify+Prisma project. Invoke when writing or modifying service/controller/route files."
---

# TypeScript Backend Conventions

This skill enforces coding conventions for the Fastify + Prisma TypeScript backend project.

## Import Rules

- **Always use `@/` alias** for imports (e.g., `import { UserRole } from '@/types/common'`)
- **Static imports only** - No dynamic imports
- **All imports at top of file** - Never use inline imports

## Type Rules

- Use shared types from `@/types/common.ts`:
  - `UserRole` - for role types (ADMIN, USER, STAFF)
  - `UserStatus` - for user status
  - `TenantStatus` - for tenant status
  - `PaginatedResponse<T>` - for paginated responses
- Never define role/status types inline in services

## Service Layer Rules

### SELECT_FIELDS Constant
- Define `const <ENTITY>_SELECT_FIELDS = { ... }` at top of each service file
- Use in Prisma queries: `select: <ENTITY>_SELECT_FIELDS`

### Error Handling
```typescript
try {
  // database operations
} catch (error) {
  console.error('Error doing X:', error);
  throw error;  // throw original error, NOT new Error()
}
```

### Response Messages
- Use static strings in controllers:
```typescript
return reply.send(success(res, data, 'User created successfully'));
```

## Code Style Rules

- **NO `?.` operator** - Use explicit null checks:
```typescript
// Bad
options?.entity_id

// Good
const opt = options || {};
opt.entity_id
```

- **NO nested functions** - All functions should be at module level
- **NO class-based components** - Use functional patterns only
- **try-catch for ALL database operations** - Always wrap Prisma calls in try-catch

## File Structure

- Services: `src/services/*.service.ts`
- Types: `src/types/*.ts`
- Utils: `src/utils/*.ts`
- Routes: `src/routes/*.routes.ts`
- Controllers: `src/controllers/*.controller.ts`

## Verification

After any changes, always run:
```bash
npm run typecheck
npm run lint
```

## Quick Reference

| Pattern | Correct | Incorrect |
|---------|---------|-----------|
| Import | `from '@/types/common'` | `from '../types/common'` |
| Role | `UserRole.ADMIN` | `'ADMIN' \| 'USER' \| 'STAFF'` |
| Error | `throw error` | `throw new Error(msg)` |
| Null check | `const opt = x \|\| {}` | `x?.prop` |
| Prisma select | `select: USER_SELECT_FIELDS` | inline select |
