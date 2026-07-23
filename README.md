# 🏥 Medical Data Transformation Workbench

> A visual data query and transformation platform built for healthcare enterprises, enabling doctors to complete data analysis without writing SQL.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## 📋 Overview

The Medical Data Transformation Workbench is an enterprise-grade data processing platform designed to solve the challenge of non-technical personnel (such as doctors and researchers) in healthcare institutions accessing and transforming database data.

### Core Features

- 🔐 **Multi-tenant User System** - Support for organization-level permission isolation
- 🔌 **Multiple Data Source Integration** - Support for MySQL, PostgreSQL, Oracle, MSSQL and other mainstream databases
- 🎨 **Visual Query Builder** - Complete complex queries through drag-and-drop without writing SQL
- 🔄 **Data Transformation Workbench** - 20+ transformation operations including field renaming, type conversion, conditional mapping
- 📊 **Real-time Data Preview** - Build and preview simultaneously, WYSIWYG
- 📥 **Flexible Export** - Support CSV, Excel, JSON formats with asynchronous processing for large datasets
- 🔒 **Healthcare-grade Security** - Full operation audit, sensitive field masking, data-on-the-fly principle
- 📝 **Query Template Management** - Save frequently used queries to improve work efficiency

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Components**: Ant Design 5
- **State Management**: Zustand
- **Data Grid**: AG Grid
- **Query Builder**: React Query Builder
- **Charts**: ECharts

### Backend
- **Framework**: NestJS + TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL (System DB)
- **Cache & Queue**: Redis + Bull
- **Authentication**: JWT + Passport

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **File Storage**: MinIO
- **Package Management**: pnpm (Monorepo)

---

## 📦 Project Structure

\`\`\`
Data-Transformer/
├── apps/
│   ├── backend/              # NestJS Backend API
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/              # Authentication module
│   │       │   ├── users/             # User management
│   │       │   ├── organizations/     # Organization management
│   │       │   ├── datasources/       # Data source management
│   │       │   ├── explorer/          # Database explorer
│   │       │   ├── workbench/         # Transformation workbench
│   │       │   ├── jobs/              # Task queue
│   │       │   └── export/            # Data export
│   │       └── main.ts
│   │
│   └── frontend/             # React Frontend
│       └── src/
│           ├── pages/
│           │   ├── login/             # Login page
│           │   ├── dashboard/         # Dashboard
│           │   ├── datasources/       # Data source management
│           │   ├── workbench/         # Transformation workbench
│           │   └── exports/           # Export management
│           ├── components/
│           ├── hooks/
│           ├── store/
│           └── utils/
│
├── packages/
│   ├── shared-types/         # Shared TS type definitions
│   └── query-engine/         # Query builder core engine
│
├── docker/
│   └── data/                 # Docker volume mount directory
│
├── docs/                     # Project documentation
│
├── docker-compose.yml        # Docker compose file
├── pnpm-workspace.yaml       # pnpm workspace configuration
└── package.json              # Root package.json
\`\`\`

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose (optional, for quick dependency services startup)

### 1️⃣ Clone Project

\`\`\`bash
git clone https://github.com/your-username/Data-Transformer.git
cd Data-Transformer
\`\`\`

### 2️⃣ Install Dependencies

\`\`\`bash
# Install pnpm (if not installed)
npm install -g pnpm

# Install all dependencies
pnpm install
\`\`\`

### 3️⃣ Start Infrastructure Services

Use Docker Compose to quickly start PostgreSQL, Redis, MinIO and other dependent services:

\`\`\`bash
pnpm docker:up
\`\`\`

Service access addresses:
- PostgreSQL: \`localhost:5432\`
- Redis: \`localhost:6379\`
- MinIO: \`localhost:9000\` (Console: \`localhost:9001\`)
- MySQL Test DB: \`localhost:3306\`

### 4️⃣ Configure Environment Variables

\`\`\`bash
# Copy environment variable example file
cp .env.example apps/backend/.env

# Edit .env file, fill in actual configuration
# vim apps/backend/.env
\`\`\`

### 5️⃣ Initialize Database

Create default user accounts:

\`\`\`bash
cd apps/backend
npm run seed
\`\`\`

This will create three default users:
- **Admin**: admin@datatransformer.com / admin123
- **Engineer**: engineer@datatransformer.com / engineer123
- **Analyst**: analyst@datatransformer.com / analyst123

### 6️⃣ Start Application

\`\`\`bash
# Start both frontend and backend development servers
pnpm dev

# Or start separately
pnpm dev:backend   # Backend: http://localhost:3001
pnpm dev:frontend  # Frontend: http://localhost:3000
\`\`\`

Visit http://localhost:3000 to see the application interface.

---

## 👥 User System

The application includes a complete user authentication system with three role levels:

### User Roles

| Role | Access Level | Description |
|------|--------------|-------------|
| **Admin** | Full Access | Complete system access including user management |
| **Engineer** | CRUD Operations | Most data operations, no user management |
| **Analyst** | Read-Only | View data only, no modifications |

### Authentication Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control
- ✅ Protected API endpoints
- ✅ Token expiration (7 days default)
- 🔜 Password reset flow
- 🔜 Email verification
- 🔜 Refresh tokens

### API Documentation

See [User System Quick Start Guide](docs/USER_SYSTEM_QUICKSTART.md) for:
- Default user credentials
- API endpoint examples
- Frontend integration guide
- Testing instructions

---

## 🔧 Development Guide

### Install New Dependencies

\`\`\`bash
# Install dependency for backend
pnpm --filter backend add package-name

# Install dependency for frontend
pnpm --filter frontend add package-name

# Install dev dependency for root project
pnpm add -D -w package-name
\`\`\`

### Database Migration

\`\`\`bash
cd apps/backend

# Generate migration file
pnpm typeorm migration:generate -n MigrationName

# Run migration
pnpm typeorm migration:run

# Revert migration
pnpm typeorm migration:revert
\`\`\`

### Build for Production

\`\`\`bash
pnpm build
\`\`\`

---

## 📐 Architecture Design

### System Architecture Diagram

\`\`\`
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP/WebSocket
       ▼
┌─────────────────────────────────────┐
│       Nginx (Reverse Proxy)         │
└─────────────┬───────────────────────┘
              │
     ┌────────┴────────┐
     ▼                 ▼
┌─────────┐      ┌──────────┐
│ Frontend│      │ Backend  │
│ (React) │      │ (NestJS) │
└─────────┘      └────┬─────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
     ┌────────┐  ┌───────┐  ┌────────┐
     │   PG   │  │ Redis │  │ MinIO  │
     │(System)│  │(Queue)│  │(Files) │
     └────────┘  └───────┘  └────────┘
                      │
                      ▼
              ┌──────────────┐
              │External DBs  │
              │MySQL/Oracle  │
              └──────────────┘
\`\`\`

### User Permission Model

| Role | Permissions |
|------|-------------|
| Super Admin | Manage all organizations, users, and data sources |
| Organization Admin | Manage users and data sources within organization |
| Data Analyst | Full access to workbench, create queries, export data |
| Doctor/Viewer | Use created query templates, export data |

---

## 🔒 Security & Compliance

As a medical data platform, we follow these security principles:

- ✅ **Full Operation Audit Logs** - Record all data access behaviors
- ✅ **Sensitive Field Masking** - Automatically identify and mask ID numbers, phone numbers, etc.
- ✅ **Data-on-the-fly** - Preview data not cached, export files auto-destroyed after 7 days
- ✅ **Transmission Encryption** - HTTPS + database connection SSL
- ✅ **SQL Injection Protection** - Parameterized queries, strict input validation
- ✅ **Access Control** - Role-based fine-grained permission control

---

## 📝 Development Roadmap

### Phase 1 - Foundation ✅
- [x] Project structure setup
- [ ] User authentication system
- [ ] Data source management

### Phase 2 - Data Exploration 🚧
- [ ] Database browser
- [ ] Table structure preview
- [ ] Basic queries

### Phase 3 - Transformation Workbench 📅
- [ ] Visual query builder
- [ ] Field transformation operations
- [ ] Multi-table JOIN
- [ ] Real-time preview

### Phase 4 - Export System 📅
- [ ] Multi-format export
- [ ] Async task queue
- [ ] Download management

### Phase 5 - Enterprise Features 📅
- [ ] Multi-tenant isolation
- [ ] Audit logs
- [ ] Data masking
- [ ] Monitoring & alerts

---

## 🤝 Contributing

Contributions are welcome! Please follow this process:

1. Fork this repository
2. Create feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Submit Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

Project Maintainer: [Your Name]
Email: your.email@example.com

---

## 🙏 Acknowledgments

Thanks to the following open source projects:
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://react.dev/) - User interface library
- [Ant Design](https://ant.design/) - Enterprise-level UI component library
- [TypeORM](https://typeorm.io/) - ORM framework
