# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Install all dependencies (root + frontend + backend)
npm run install:all

# Start full dev environment (frontend on :3000, backend on :3333)
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev
```

### Build & Production
```bash
# Full production build (frontend → copy to backend/public → backend compile)
npm run build

# Start production server
npm start   # runs node backend/dist/server.js

# Seed database
cd backend && npm run seed
```

### No test suite is configured in this project.

## Architecture

This is a monorepo with `frontend/` (React + Vite) and `backend/` (Express + Prisma) packages. In production, the backend serves the compiled frontend as static files — there is no separate frontend host.

### Request Flow
1. All frontend API calls go through `frontend/src/lib/api.ts` (Axios with JWT interceptor)
2. In dev: `VITE_API_URL=http://localhost:3333` → requests hit Express directly
3. In production: `VITE_API_URL` is empty → requests use relative `/api` paths → Express serves both static files and API from one process
4. The SPA fallback in `backend/src/server.ts` (line ~89) catches all non-`/api` requests and returns `index.html`

### Authentication & Multi-Profile (SSO)
- A single `Account` (identified by CPF) can own multiple `User` profiles across different roles and different `Commerce` entities
- Login flow: POST `/api/auth/login` → returns list of available profiles → user selects one → gets role-scoped JWT
- JWT payload includes `userId`, `role`, and `commerceId`
- Token stored in `localStorage` as `@MarketSystem:token`
- 401 responses auto-redirect to `/login?expired=true`

### Role-Based Access
Five roles: `ADMIN`, `COMERCIANTE`, `ENTREGADOR`, `CLIENTE`, `FUNCIONARIO`
- `authMiddleware` validates JWT
- `roleMiddleware` guards routes by role
- Frontend modules are split by role: `src/modules/{cliente,comerciante,entregador,admin}/`

### Backend Structure
- `backend/src/controllers/` — one file per domain (auth, pedidos, entregas, produtos, comercios, etc.)
- `backend/src/routes/` — registers controllers on Express Router
- `backend/src/middlewares/` — auth, role, maintenance
- `backend/src/lib/prisma.ts` — singleton Prisma client

### Key Prisma Models
- `Account` → SSO identity (CPF + password)
- `User` → role-scoped profile (belongs to Account + optionally a Commerce)
- `Commerce` → merchant with subscription plan
- `Order` / `OrderItem` → customer orders with frozen pricing at time of purchase
- `Delivery` → 1:1 with Order; tracks driver assignment and GPS history via `DeliveryGPS`
- `PlatformConfig` → singleton row for global settings (maintenance mode, app name)

## Critical Rules (from GEMINI.md)

### Prisma Schema
Never use fallback values in `env()` — Prisma 6+ does not support them:
```prisma
# WRONG
url = env("DATABASE_URL", "postgresql://...")

# CORRECT
url = env("DATABASE_URL")
```

### Build Process
`build.js` sets `SKIP_ENV_VALIDATION=true` and a dummy PostgreSQL URL during `prisma generate` because Railway does not provide `DATABASE_URL` at build time. Do not remove this.

### Frontend Environment Variables
`frontend/.env.production` must NOT define `VITE_API_URL`. Leaving it empty makes Axios use relative `/api` paths, which is required for the single-server deployment model.

### Server Binding
The Express server must listen on `0.0.0.0` with `process.env.PORT` (not hardcoded `localhost`). This is required by Railway.

### Deployment Artifact
`backend/public/` is deleted and recreated on every deploy (it holds the compiled frontend). Do not store permanent files there.

### Database URLs
- Local development: use `DATABASE_PUBLIC_URL` (Railway's externally accessible URL) in `.env`
- Railway production: uses `DATABASE_URL` (internal private network URL)
