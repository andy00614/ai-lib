# Midday Project - Claude Context

## Project Overview

Midday is a modern financial management SaaS application built with a sophisticated monorepo architecture. It provides intelligent financial data processing, automated transaction categorization, and comprehensive business expense management.

### Core Domain
- **Primary Function**: Financial management and expense tracking for businesses
- **Key Features**: AI-powered transaction classification, multi-currency support, team collaboration, automated data synchronization
- **Target Users**: Small to medium businesses, financial professionals, teams managing expenses

## Architecture Summary

### Technology Stack
- **Frontend**: Next.js 14+ with App Router, React Server Components
- **Backend**: Hono framework for APIs, Drizzle ORM for database operations
- **Database**: PostgreSQL with pgvector extension for AI/ML capabilities
- **AI/ML**: Google Gemini via Vercel AI SDK for embeddings and text generation
- **Infrastructure**: Fly.io multi-region deployment, Trigger.dev for background jobs
- **Authentication**: Supabase Auth with MFA support
- **Monorepo**: Turborepo with pnpm workspaces

### Project Structure
```
midday/
├── apps/
│   ├── dashboard/          # Main user dashboard (Next.js)
│   ├── api/               # API server (Hono)
│   ├── website/           # Marketing website
│   ├── docs/              # Documentation site
│   └── engine/            # Financial data processing engine
├── packages/
│   ├── db/                # Database schema, queries, migrations
│   ├── supabase/          # Authentication and real-time features
│   ├── ui/                # Shared UI components and design system
│   ├── categories/        # Transaction categorization logic and AI
│   ├── jobs/              # Background job processing
│   ├── utils/             # Shared utilities and helpers
│   ├── cache/             # Caching abstractions
│   └── encryption/        # Data encryption utilities
```

## Key Architectural Patterns

### 1. Multi-Tenant Architecture
- Team-based data isolation using `team_id` in all tables
- Row-Level Security (RLS) policies for data protection
- Shared infrastructure with tenant-specific data access

### 2. AI-First Design
- Automatic transaction categorization using embeddings
- Semantic search capabilities with pgvector
- Intelligent merchant name recognition and normalization
- Document classification and processing

### 3. Performance Optimization
- Multi-region database replication (Primary in one region, replicas in fra, iad, sjc)
- Intelligent read/write splitting based on operation type
- Multi-layer caching (Application, Redis, PostgreSQL)
- Batch processing for AI operations

### 4. Type Safety
- End-to-end TypeScript with strict configuration
- Database schema generates TypeScript types via Drizzle
- Runtime validation using Zod schemas
- API contract enforcement

## Core Modules

### Authentication (`packages/supabase/`, `apps/dashboard/src/middleware.ts`)
- Supabase Auth integration with OAuth providers (Google, GitHub, Apple)
- Mandatory Multi-Factor Authentication (MFA) for all users
- Session management with secure cookie handling
- Route-level protection via Next.js middleware

### Database (`packages/db/`)
- Drizzle ORM with type-safe queries
- Geographic database routing for performance
- Vector storage for AI embeddings
- Comprehensive indexing strategy
- **Key Files**: `schema.ts`, `client.ts`, `queries/`

### AI Intelligence (`packages/categories/`, `packages/jobs/`)
- Transaction classification using Gemini embeddings
- Automatic merchant name extraction and normalization  
- Semantic search across financial data
- Batch processing with cost optimization
- **Key Files**: `embeddings.ts`, `tasks/transactions/`, `utils/enrichment-helpers.ts`

### UI System (`packages/ui/`)
- Custom design system built on Radix UI
- Accessible components with consistent styling
- Tailwind CSS with custom configuration
- Form handling with React Hook Form + Zod validation

### Background Jobs (`packages/jobs/`)
- Trigger.dev for reliable job processing
- AI processing pipelines (embedding generation, data enrichment)
- Data synchronization with external financial providers
- Automated maintenance tasks

## Development Guidelines

### Code Organization
- **Components**: PascalCase.tsx (e.g., `TransactionList.tsx`)
- **Utilities**: kebab-case.ts (e.g., `format-currency.ts`)
- **Actions**: *-action.ts (e.g., `create-transaction-action.ts`)
- **Types**: Descriptive names with appropriate suffixes

### Adding New Features
1. **Define Types**: Create comprehensive TypeScript interfaces
2. **Database Changes**: Update schema, add migrations, create queries
3. **Business Logic**: Implement in appropriate package
4. **API Layer**: Add endpoints with validation
5. **UI Components**: Build accessible, responsive interfaces
6. **Tests**: Write comprehensive test coverage
7. **Documentation**: Update relevant documentation

### Performance Considerations
- Use database queries optimized for the read/write split
- Implement appropriate caching strategies
- Consider AI cost optimization for new AI features
- Leverage batch processing for bulk operations

## Key Integrations

### Financial Data Providers
- **Plaid**: US banking data aggregation
- **GoCardless**: European banking data (via Open Banking)
- **Teller**: Alternative US banking data source
- **EnableBanking**: Additional European banking support

### AI Services
- **Google Gemini**: Primary LLM for text processing and embeddings
- **Vercel AI SDK**: Abstraction layer for AI operations
- **pgvector**: Vector database for semantic search

### Infrastructure
- **Fly.io**: Multi-region deployment with automatic scaling
- **Supabase**: Authentication, real-time features, and some data storage
- **Trigger.dev**: Background job processing and scheduling

## Security Practices

### Data Protection
- All sensitive data encrypted at rest and in transit
- API keys and secrets managed through environment variables
- Row-level security policies enforcing team boundaries
- Regular security audits and dependency updates

### Authentication Security
- Mandatory MFA for all user accounts
- OAuth provider integration with proper scope management
- Session rotation and secure cookie configuration
- API authentication via Bearer tokens

## Common Development Tasks

### Adding a New API Endpoint
```typescript
// 1. Define schema in apps/api/src/schemas/
export const createTransactionSchema = z.object({
  name: z.string(),
  amount: z.number(),
  // ... other fields
});

// 2. Create database query in packages/db/src/queries/
export async function createTransaction(db: Database, data: NewTransaction) {
  // Implementation
}

// 3. Implement route in apps/api/src/routes/
app.post('/transactions', async (c) => {
  // Implementation with validation and error handling
});
```

### Adding a New UI Component
```typescript
// 1. Create component in packages/ui/src/components/
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline';
  // ... other props
}

export function Button({ variant = 'default', ...props }: ButtonProps) {
  // Implementation
}

// 2. Export from packages/ui/src/index.ts
export { Button } from './components/button';
```

### Adding a Background Job
```typescript
// In packages/jobs/src/tasks/
export const processTransactionData = schemaTask({
  id: "process-transaction-data",
  schema: z.object({
    transactionIds: z.array(z.string()),
    teamId: z.string(),
  }),
  run: async ({ transactionIds, teamId }) => {
    // Job implementation
  },
});
```

## Testing Strategy

### Unit Tests
- All utility functions have comprehensive test coverage
- Component testing using React Testing Library
- Database query testing with test databases

### Integration Tests
- API endpoint testing with real database
- Authentication flow testing
- AI model testing with golden datasets

### Performance Tests
- Database query performance monitoring
- AI operation cost and latency tracking
- Frontend bundle size and loading time analysis

## Monitoring and Observability

### Logging
- Structured logging throughout the application
- Request/response logging for API endpoints
- Background job status and performance logging

### Metrics
- Database query performance metrics
- AI operation costs and accuracy tracking
- User authentication success rates
- API response times and error rates

## Common Issues and Solutions

### Database Performance
- Use appropriate indexes for query patterns
- Leverage read replicas for read-heavy operations
- Monitor and optimize slow queries
- Consider connection pooling adjustments

### AI Cost Management
- Implement caching for expensive embedding operations
- Use batch processing to reduce API calls
- Monitor token usage and optimize prompts
- Consider model selection based on task complexity

### Authentication Debugging
- Check MFA setup and configuration
- Verify OAuth provider settings
- Monitor session expiration and refresh logic
- Test authentication middleware edge cases

## Recent Major Changes

### Authentication System Overhaul
- Implemented mandatory MFA for all users
- Added support for multiple OAuth providers
- Enhanced session management with geographic awareness

### AI Integration Enhancement
- Upgraded to Gemini 2.5 for better performance
- Implemented sophisticated caching for embeddings
- Added batch processing optimization for cost reduction

### Database Architecture Updates
- Implemented multi-region read/write splitting
- Added comprehensive vector storage capabilities
- Optimized connection pooling for Fly.io deployment

## Future Architecture Considerations

### Scalability Improvements
- Consider microservices extraction for heavy AI workloads
- Implement event-driven architecture for better decoupling
- Add message queuing for high-volume operations

### Performance Enhancements
- Explore CDN integration for static assets
- Consider edge computing for geographic optimization
- Implement more sophisticated caching strategies

### Security Enhancements
- Regular security audits and penetration testing
- Enhanced monitoring and alerting for security events
- Consider zero-trust architecture principles

---

*This document should be updated as the project evolves. Last updated: [Current Date]*