# Development Documentation

## Quick Start

### Initialize Project

1. Ensure Node.js 18+ and pnpm 8+ are installed
2. Run \`pnpm install\` to install all dependencies
3. Start Docker services: \`pnpm docker:up\`
4. Configure environment variables (copy \`.env.example\`)
5. Start development server: \`pnpm dev\`

## Backend Development

### Module Development Standards

#### Create New Module

\`\`\`bash
cd apps/backend
nest g module modules/your-module
nest g controller modules/your-module
nest g service modules/your-module
\`\`\`

#### File Structure

\`\`\`
modules/your-module/
├── dto/
│   ├── create-xxx.dto.ts
│   └── update-xxx.dto.ts
├── entities/
│   └── xxx.entity.ts
├── your-module.controller.ts
├── your-module.service.ts
└── your-module.module.ts
\`\`\`

### Database Operations

Using TypeORM, entity definition example:

\`\`\`typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
\`\`\`

### API Response Format

Unified response format:

\`\`\`typescript
{
  success: true,
  data: any,
  message: string,
  timestamp: number
}
\`\`\`

Error response:

\`\`\`typescript
{
  success: false,
  error: string,
  statusCode: number,
  timestamp: number
}
\`\`\`

### Authentication & Authorization

Using JWT and Passport:

\`\`\`typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
\`\`\`

## Frontend Development

### Directory Structure

\`\`\`
src/
├── pages/           # Page components
├── components/      # Reusable components
├── hooks/           # Custom Hooks
├── store/           # Zustand state management
├── services/        # API requests
├── utils/           # Utility functions
├── types/           # Type definitions
└── constants/       # Constants
\`\`\`

### State Management

Using Zustand:

\`\`\`typescript
// store/auth.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    set({ user: response.data.user, token: response.data.token });
    localStorage.setItem('token', response.data.token);
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
\`\`\`

### API Requests

Using axios wrapper:

\`\`\`typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
\`\`\`

### Routing Configuration

\`\`\`typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="datasources" element={<DataSources />} />
          <Route path="workbench" element={<Workbench />} />
          <Route path="exports" element={<Exports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
\`\`\`

### Component Best Practices

\`\`\`typescript
// Use TypeScript for type safety
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button className={variant} onClick={onClick}>
      {text}
    </button>
  );
};
\`\`\`

## Database Design

### Core Table Structures

#### users table

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
\`\`\`

#### datasources table

\`\`\`sql
CREATE TABLE datasources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  database VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL, -- Encrypted
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_datasources_org ON datasources(organization_id);
\`\`\`

#### query_templates table

\`\`\`sql
CREATE TABLE query_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  datasource_id UUID REFERENCES datasources(id),
  query_config JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_datasource ON query_templates(datasource_id);
CREATE INDEX idx_templates_creator ON query_templates(created_by);
\`\`\`

## Testing

### Backend Testing

\`\`\`bash
cd apps/backend

# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov

# Watch mode
pnpm test:watch
\`\`\`

Example unit test:

\`\`\`typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user credentials', async () => {
    const result = await service.validateUser('test@example.com', 'password');
    expect(result).toBeDefined();
  });
});
\`\`\`

### Frontend Testing

\`\`\`bash
cd apps/frontend

# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
\`\`\`

Example component test:

\`\`\`typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button text="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
\`\`\`

## Code Quality

### Linting

\`\`\`bash
# Lint backend
cd apps/backend
pnpm lint

# Lint frontend
cd apps/frontend
pnpm lint

# Auto-fix issues
pnpm lint --fix
\`\`\`

### Formatting

\`\`\`bash
# Format all files
pnpm format

# Check formatting
pnpm format:check
\`\`\`

### Pre-commit Hooks

We use Husky for pre-commit hooks:

\`\`\`json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
\`\`\`

## Deployment

### Docker Deployment

\`\`\`bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
\`\`\`

### Environment Variables

Production environment required variables:

- \`NODE_ENV=production\`
- \`JWT_SECRET\` - Strong secret key
- \`JWT_EXPIRES_IN\` - Token expiration time
- \`DB_HOST\` - Database host
- \`DB_PORT\` - Database port
- \`DB_USERNAME\` - Database username
- \`DB_PASSWORD\` - Database password
- \`DB_DATABASE\` - Database name
- \`REDIS_HOST\` - Redis host
- \`REDIS_PASSWORD\` - Redis password
- \`MINIO_ENDPOINT\` - MinIO endpoint
- \`MINIO_ACCESS_KEY\` - MinIO access key
- \`MINIO_SECRET_KEY\` - MinIO secret key

### Build for Production

\`\`\`bash
# Build all packages
pnpm build

# Build backend only
pnpm build:backend

# Build frontend only
pnpm build:frontend
\`\`\`

## Common Issues

### 1. pnpm install fails

Try cleaning cache:
\`\`\`bash
pnpm store prune
rm -rf node_modules
rm -rf apps/*/node_modules
pnpm install
\`\`\`

### 2. Docker services fail to start

Check port conflicts:
\`\`\`bash
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :9000  # MinIO
lsof -i :3306  # MySQL
\`\`\`

Stop conflicting processes:
\`\`\`bash
kill -9 <PID>
\`\`\`

### 3. Database connection fails

Ensure:
- Docker services are running: \`docker-compose ps\`
- Environment variables are correct
- Network connectivity is normal
- Database credentials are valid

Check database logs:
\`\`\`bash
docker-compose logs postgres
\`\`\`

### 4. Frontend build fails

Clear cache and rebuild:
\`\`\`bash
cd apps/frontend
rm -rf node_modules .vite
pnpm install
pnpm build
\`\`\`

### 5. TypeScript errors

Ensure TypeScript version is consistent:
\`\`\`bash
pnpm add -D typescript@latest
\`\`\`

## Performance Tips

### Backend Performance

1. **Use database indexing** for frequently queried fields
2. **Implement caching** with Redis for hot data
3. **Use connection pooling** for database connections
4. **Paginate large result sets**
5. **Use async operations** for I/O-heavy tasks

### Frontend Performance

1. **Code splitting** with React.lazy()
2. **Memoization** with useMemo and useCallback
3. **Virtual scrolling** for large lists
4. **Debounce** user input
5. **Optimize images** and use lazy loading

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** on API endpoints
4. **Validate all user input**
5. **Use parameterized queries** to prevent SQL injection
6. **Implement CORS** properly
7. **Use HTTPS** in production
8. **Keep dependencies updated**

## Git Workflow

### Branch Naming

- \`feature/feature-name\` - New features
- \`fix/bug-description\` - Bug fixes
- \`refactor/refactor-description\` - Code refactoring
- \`docs/documentation-update\` - Documentation updates

### Commit Messages

Follow conventional commits:

\`\`\`
feat: add user authentication
fix: resolve database connection issue
docs: update API documentation
refactor: improve query builder logic
test: add unit tests for auth service
\`\`\`

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [Ant Design Documentation](https://ant.design/)
- [Vite Documentation](https://vitejs.dev/)
