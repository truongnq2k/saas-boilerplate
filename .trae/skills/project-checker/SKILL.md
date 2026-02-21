---
name: "project-checker"
description: "Verifies TypeScript code quality and pattern consistency. Invoke when user asks to check, verify, or review the codebase."
---

# Project Checker

This skill checks the codebase for consistency, TypeScript errors, and pattern violations.

## When to Invoke

- User asks "check project", "verify code", "review codebase"
- User asks "còn gì không", "có vấn đề gì không"
- Before submitting changes
- After writing new service/controller code

## Checklist

### 1. TypeScript TypeCheck
```bash
npm run typecheck
```
Must pass with exit code 0.

### 2. Lint Check
```bash
npm run lint
```
Must pass with no errors.

### 3. Import Path Consistency
Check for relative imports in service files:
```bash
grep -r "from '\.\./" src/services/
grep -r "from '\.\." src/services/
```
All should use `@/` alias.

### 4. No "?." Operator
Check for optional chaining in service files:
```bash
grep -r "?." src/services/
```
Should have none (except in types).

### 5. Error Handling Pattern
Check catch blocks throw original error:
```bash
grep -A3 "catch (error)" src/services/
```
Should have `throw error`, not `throw new Error()`.

### 6. SELECT_FIELDS Defined
Each service should have `<ENTITY>_SELECT_FIELDS` constant.

### 7. Shared Types Used
- `UserRole` from `@/types/common`
- `PaginatedResponse<T>` for pagination
- No inline role/status types

## Common Fixes

### Fix Import Paths
```typescript
// Before
import { Something } from '../types/common';

// After
import { Something } from '@/types/common';
```

### Fix "?." Usage
```typescript
// Before
options?.entity_id

// After
const opt = options || {};
opt.entity_id
```

### Fix Error Handling
```typescript
// Before
catch (error) {
  console.error('Error:', error);
  throw new Error('Something failed');
}

// After
catch (error) {
  console.error('Error:', error);
  throw error;
}
```

## Output Format

When checking, report:
1. TypeScript status (pass/fail)
2. Lint status (pass/fail)
3. Import consistency issues found
4. Any "?." operators found
5. Error handling issues
6. Summary: "Project OK" or list of fixes needed
