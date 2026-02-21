---
name: "prisma-migration"
description: "Manages Prisma database migrations. Invoke when user wants to create migration, push schema, or reset database."
---

# Prisma Migration

This skill handles Prisma database operations.

## When to Invoke

- User asks "create migration", "run migration"
- User asks "push schema", "sync database"
- User asks "reset database", "rollback"
- Schema changes required for new feature

## Commands

### 1. Create Migration
```bash
npx prisma migrate dev --name <migration_name>
```
Creates new migration with SQL diff.

### 2. Apply Migrations
```bash
npx prisma migrate deploy
```
Applies pending migrations (production).

### 3. Push Schema (Dev)
```bash
npx prisma db push
```
Syncs Prisma schema to database (no migration files).

### 4. Reset Database
```bash
npx prisma migrate reset
```
Drops all tables and re-runs all migrations.

### 5. Generate Client
```bash
npx prisma generate
```
Regenerates Prisma Client after schema changes.

### 6. View Status
```bash
npx prisma migrate status
```
Shows pending migrations.

## Workflow

### When Adding New Entity
1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma migrate dev --name add_<entity>`
4. Verify with `npx prisma migrate status`

### When Modifying Entity
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Fix any conflicts

### Quick Sync (Development Only)
```bash
npx prisma db push
```
Use only in development, not production.

## Important Notes

- Always backup database before migration in production
- Migration files are in `prisma/migrations/`
- Never edit migration files manually
- Use meaningful migration names

## Common Issues

### "Database is not clean"
Run `npx prisma migrate reset` first (dev only).

### "Migration failed"
Check database connection in `.env`

### "Prisma Client out of sync"
Run `npx prisma generate`
