# Project Architecture

## Technical Decisions

### Why Monorepo?

Using pnpm workspace to manage Monorepo provides the following advantages:
- Easier code sharing (shared-types package used by both frontend and backend)
- Unified dependency management, saving disk space
- More efficient building and testing
- Simpler version control

### Why NestJS?

- Modular architecture, suitable for large enterprise applications
- Native TypeScript support
- Built-in enterprise features like dependency injection, middleware, guards
- Active ecosystem and community

### Why React + Vite?

- Vite provides extremely fast development experience (HMR)
- React 18 latest features support
- TypeScript type safety
- Rich component ecosystem

### Why Ant Design?

- Enterprise-grade UI design language
- High-quality components out of the box
- Comprehensive documentation
- Suitable for data-intensive applications

## Core Module Design

### Backend Modules

#### 1. Auth Module
- User registration and login
- JWT token generation and validation
- Password encryption (bcrypt)
- Role-based access control

#### 2. Users Module
- User CRUD operations
- User role management
- User-organization association

#### 3. Organizations Module
- Healthcare institution management
- Multi-tenant data isolation
- Organization-level permission configuration

#### 4. DataSources Module
- Data source connection management (MySQL, PostgreSQL, Oracle, etc.)
- Connection testing
- Encrypted storage of database credentials
- Data source permission control

#### 5. Explorer Module
- Browse database structure (databases, tables, fields)
- Get table schema
- Preview table data
- Cache table structure information

#### 6. Workbench Module (Core)
- Visual query building
- SQL generator
- Data preview
- Query template save and load
- Field transformation logic

#### 7. Jobs Module
- Async task queue (Bull + Redis)
- Task status management
- Task progress tracking
- Failure retry mechanism

#### 8. Export Module
- Multi-format export (CSV, Excel, JSON)
- Large file streaming
- MinIO file storage
- Download link generation

### Frontend Modules

#### Page Structure
\`\`\`
/login          - Login page
/dashboard      - Dashboard
/datasources    - Data source management
  /new          - Add data source
  /:id          - Data source details
/workbench      - Transformation workbench (Core)
  /new          - New query
  /:id          - Edit query
/exports        - Export management
  /history      - Export history
/admin          - Admin panel (Super admin only)
  /users        - User management
  /orgs         - Organization management
\`\`\`

#### State Management (Zustand)

\`\`\`typescript
stores/
├── auth.ts         // Authentication state
├── datasource.ts   // Data source state
├── workbench.ts    // Workbench state
└── export.ts       // Export task state
\`\`\`

#### Component Design Principles

- **Atoms**: Most basic UI elements
- **Molecules**: Combination of multiple atoms
- **Organisms**: Complex business components
- **Templates**: Page layouts
- **Pages**: Complete pages

## Database Design

### Core Tables

#### users
\`\`\`sql
id              UUID PRIMARY KEY
username        VARCHAR(50) UNIQUE
email           VARCHAR(100) UNIQUE
password        VARCHAR(255)
role            ENUM('super_admin', 'org_admin', 'analyst', 'viewer')
organization_id UUID FK -> organizations
created_at      TIMESTAMP
updated_at      TIMESTAMP
\`\`\`

#### organizations
\`\`\`sql
id              UUID PRIMARY KEY
name            VARCHAR(100)
code            VARCHAR(50) UNIQUE
settings        JSONB
created_at      TIMESTAMP
\`\`\`

#### datasources
\`\`\`sql
id              UUID PRIMARY KEY
name            VARCHAR(100)
type            ENUM('mysql', 'postgresql', 'oracle', 'mssql')
config          JSONB (encrypted)
organization_id UUID FK -> organizations
created_by      UUID FK -> users
created_at      TIMESTAMP
\`\`\`

#### query_templates
\`\`\`sql
id              UUID PRIMARY KEY
name            VARCHAR(100)
description     TEXT
datasource_id   UUID FK -> datasources
query_config    JSONB
created_by      UUID FK -> users
is_public       BOOLEAN
created_at      TIMESTAMP
\`\`\`

#### export_jobs
\`\`\`sql
id              UUID PRIMARY KEY
user_id         UUID FK -> users
query_config    JSONB
format          ENUM('csv', 'excel', 'json')
status          ENUM('pending', 'processing', 'completed', 'failed')
file_url        VARCHAR(500)
error_message   TEXT
created_at      TIMESTAMP
completed_at    TIMESTAMP
\`\`\`

#### audit_logs
\`\`\`sql
id              UUID PRIMARY KEY
user_id         UUID FK -> users
action          VARCHAR(50)
resource_type   VARCHAR(50)
resource_id     UUID
details         JSONB
ip_address      VARCHAR(45)
created_at      TIMESTAMP
\`\`\`

## Security Design

### 1. Authentication & Authorization
- JWT + HttpOnly Cookie
- Refresh Token mechanism
- RBAC permission model
- API-level permission guards

### 2. Data Security
- Sensitive data encryption at rest (AES-256)
- Transport layer encryption (HTTPS)
- Database connection encryption (SSL)
- SQL injection protection (parameterized queries)

### 3. Audit & Compliance
- Full operation audit logs
- Sensitive field access records
- Data export records
- User behavior tracking

### 4. Data Masking
- ID number masking: \`330106********1234\`
- Phone number masking: \`138****5678\`
- Name masking: \`J***\`
- Configurable masking rules

## Performance Optimization

### Backend Optimization
- Database connection pooling
- Redis caching for hot data
- Query result pagination
- Async task queue
- Large file streaming

### Frontend Optimization
- Code splitting (React.lazy)
- Virtual scrolling (AG Grid)
- Debounce and throttle
- Image lazy loading
- Build optimization (Vite)

## Deployment Architecture

\`\`\`
                   ┌─────────────┐
                   │   Nginx     │
                   │(Rev. Proxy) │
                   └──────┬──────┘
                          │
              ┌───────────┴───────────┐
              │                       │
         ┌────▼────┐            ┌─────▼─────┐
         │ Frontend│            │  Backend  │
         │ (React) │            │ (NestJS)  │
         └─────────┘            └─────┬─────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
               ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐
               │PostgreSQL│      │   Redis   │    │   MinIO   │
               │ (System) │      │  (Cache)  │    │  (Files)  │
               └─────────┘      └───────────┘    └───────────┘
\`\`\`

## Monitoring & Logging

### Application Monitoring
- Health check endpoints
- Performance metrics collection
- Error tracking (Sentry)

### Log Management
- Structured logging (JSON)
- Log level management
- Centralized log collection

## Testing Strategy

### Unit Tests
- Service layer logic testing
- Utility function testing
- Component testing

### Integration Tests
- API endpoint testing
- Database operation testing

### E2E Tests
- Critical business process testing
- User operation flow testing

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Load balancer support
- Session management via Redis

### Vertical Scaling
- Database query optimization
- Caching strategy
- Resource pooling

## Development Workflow

### Git Workflow
- Feature branches
- Pull request reviews
- Automated CI/CD

### Code Quality
- ESLint + Prettier
- TypeScript strict mode
- Pre-commit hooks
- Code review checklist

## Technology Stack Summary

### Frontend
- React 18
- TypeScript 5
- Vite 5
- Ant Design 5
- Zustand
- AG Grid
- ECharts

### Backend
- NestJS 10
- TypeScript 5
- TypeORM
- PostgreSQL 15
- Redis 7
- Bull
- Passport + JWT

### DevOps
- Docker
- Docker Compose
- MinIO
- Nginx
