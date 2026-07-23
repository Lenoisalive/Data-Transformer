# 🚀 Quick Start Guide

## Prerequisites Checklist ✅

The following environment configurations have been completed:

- ✅ Node.js v20.19.3
- ✅ pnpm (globally installed)
- ✅ Docker & Docker Compose
- ✅ Project dependencies installed (885 packages)

## 📦 Created Project Content

### 1. Infrastructure
- ✅ Monorepo structure (pnpm workspace)
- ✅ Frontend project (React + Vite + TypeScript + Ant Design)
- ✅ Backend project (NestJS + TypeScript + TypeORM)
- ✅ Shared types package (@data-transformer/shared-types)
- ✅ Docker environment configuration

### 2. Development Environment
- ✅ PostgreSQL 15 (System database)
- ✅ Redis 7 (Cache and task queue)
- ✅ MinIO (File storage)
- ✅ MySQL 8 (Test data source)

### 3. Basic Pages
- ✅ Login page (/login)
- ✅ Dashboard page (/dashboard)

---

## 🎯 Start Immediately

### Step 1: Start Infrastructure Services

Docker services are starting in the background, waiting for image pull to complete...

Check Docker service status:
\`\`\`bash
docker ps
\`\`\`

You should see 4 containers running:
- dt-postgres (PostgreSQL)
- dt-redis (Redis)
- dt-minio (MinIO)
- dt-mysql-test (MySQL test DB)

### Step 2: Start Backend Development Server

Open a new terminal:
\`\`\`bash
cd /Users/sulingjie/projects/Data-Transformer
pnpm dev:backend
\`\`\`

Backend will run on: **http://localhost:3001**

### Step 3: Start Frontend Development Server

Open another new terminal:
\`\`\`bash
cd /Users/sulingjie/projects/Data-Transformer
pnpm dev:frontend
\`\`\`

Frontend will run on: **http://localhost:3000**

### Step 4: Access Application

Open in browser: **http://localhost:3000**

You will see the login page!

---

## 📋 Available Commands

\`\`\`bash
# Install dependencies
pnpm install

# Start both frontend and backend
pnpm dev

# Start backend only
pnpm dev:backend

# Start frontend only
pnpm dev:frontend

# Build for production
pnpm build

# Docker operations
pnpm docker:up      # Start all services
pnpm docker:down    # Stop all services
docker ps           # View running containers
docker logs dt-postgres  # View PostgreSQL logs
\`\`\`

---

## 🗄️ Database Access

### PostgreSQL (Main Database)
\`\`\`bash
# Using psql
psql -h localhost -p 5432 -U postgres -d data_transformer

# Default password: postgres123
\`\`\`

### Redis (Cache)
\`\`\`bash
# Using redis-cli
redis-cli -h localhost -p 6379
\`\`\`

### MinIO (Object Storage)
- Console: http://localhost:9001
- Username: minioadmin
- Password: minioadmin123

### MySQL (Test Database)
\`\`\`bash
# Using mysql cli
mysql -h localhost -P 3306 -u root -p

# Default password: mysql123
\`\`\`

---

## 🔧 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Vite will automatically refresh on file changes
- Backend: NestJS watch mode will automatically restart

### API Testing
Backend API runs on http://localhost:3001/api

Test endpoints:
\`\`\`bash
# Health check
curl http://localhost:3001/api/health

# API info
curl http://localhost:3001/api
\`\`\`

### TypeScript
All code is written in TypeScript. Type checking runs automatically during development.

---

## 🎨 Frontend Structure

\`\`\`
apps/frontend/src/
├── components/      # Reusable components
├── pages/          # Page components
│   ├── login/      # Login page
│   ├── dashboard/  # Dashboard
│   ├── datasources/# Data source management
│   ├── workbench/  # Query workbench
│   └── exports/    # Export management
├── services/       # API services
├── store/         # State management (Zustand)
├── types/         # Type definitions
└── utils/         # Utility functions
\`\`\`

---

## 🛠️ Backend Structure

\`\`\`
apps/backend/src/
├── modules/
│   ├── auth/          # Authentication
│   ├── users/         # User management
│   ├── organizations/ # Organization management
│   ├── datasources/   # Data source management
│   ├── explorer/      # Database explorer
│   ├── workbench/     # Query workbench
│   ├── jobs/          # Async jobs
│   └── export/        # Data export
├── common/           # Shared utilities
├── config/          # Configuration
└── main.ts         # Application entry
\`\`\`

---

## 🐛 Troubleshooting

### Port Already in Use
If ports 3000 or 3001 are already in use:
\`\`\`bash
# Find process using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
\`\`\`

### Docker Services Not Starting
\`\`\`bash
# Check Docker status
docker info

# Restart services
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs
\`\`\`

### Module Not Found Errors
\`\`\`bash
# Clean and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm pnpm-lock.yaml
pnpm install
\`\`\`

---

## 📚 Next Steps

1. ✅ Explore the login page UI
2. ✅ Check backend API health endpoint
3. 📝 Read [Architecture Documentation](./ARCHITECTURE.md)
4. 📝 Read [API Documentation](./API.md)
5. 📝 Read [Development Guide](./DEVELOPMENT.md)
6. 🚀 Start implementing features!

---

**Happy Coding! 🎉**
