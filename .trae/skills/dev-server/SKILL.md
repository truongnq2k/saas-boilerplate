---
name: "dev-server"
description: "Manages development server lifecycle. Invoke when user wants to start, stop, restart server, or check server status."
---

# Dev Server

This skill manages the development server lifecycle.

## When to Invoke

- User asks "start server", "run dev"
- User asks "stop server", "restart"
- User asks "check server status"
- Need to run server in background for testing

## Commands

### Start Development Server
```bash
npm run dev
```
Starts server with hot reload.

### Start Production Server
```bash
npm start
```
Runs compiled JavaScript.

### Stop Server
- Find process: `Get-Process -Name node` (Windows)
- Kill: `Stop-Process -Id <PID> -Force`

### Check Server Status
```bash
curl http://localhost:<PORT>/health
```
Default port: 3000 or check package.json.

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
PORT=3000
```

## Common Issues

### Port Already in Use
```bash
# Windows - kill process on port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Failed
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Run `npx prisma db push`

### Module Not Found
```bash
npm install
npm run build
```

## Testing API

### Using cURL
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Using Playwright
See `mcp_Playwright_*` tools for browser automation.

## Best Practices

1. Always run `npm run typecheck` before starting
2. Check lint: `npm run lint`
3. Use `npm run dev` for development
4. Check `.env` exists before starting
