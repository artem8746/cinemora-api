# Project Context - Career Boosty API

## 🏗️ Architecture Overview

**Career Boosty API** is a sophisticated **NestJS streaming platform backend** built with enterprise-grade patterns and comprehensive monitoring.

### Core Technology Stack

- **Framework**: NestJS 11.x with Fastify adapter (high performance)
- **Language**: TypeScript 5.7+ with strict configuration
- **Database**: PostgreSQL with TypeORM (Data Mapper pattern)
- **Authentication**: JWT with refresh token strategy
- **Logging**: Pino with structured logging and file outputs
- **Monitoring**: Sentry integration with profiling
- **Email**: SendGrid integration
- **Documentation**: Swagger/OpenAPI (development only)

## 🎯 Architectural Patterns

### 1. CQRS (Command Query Responsibility Segregation)

- **Commands**: All write operations use command handlers
- **Structure**: `commands/{command-name}/{command-name}.command.ts` and `{command-name}.handler.ts`
- **Examples**:
  - `CreateUserCommand` → `CreateUserHandler`
  - `RegisterCommand` → `RegisterHandler`
  - `GenerateTokensCommand` → `GenerateTokensHandler`

### 2. Module-Based Architecture

- **Feature Modules**: `UsersModule`, `AuthModule`, `TokensModule`, `EmailModule`
- **Shared Modules**: `ConfigModule`, `LoggerModule`, `CqrsModule`
- **Dependency Injection**: Heavy use of NestJS DI container

### 3. Domain-Driven Design Elements

- **Entities**: TypeORM entities with proper relationships
- **Services**: Business logic encapsulated in service classes
- **DTOs**: Data Transfer Objects with validation
- **Guards**: Authentication and authorization logic

## 📁 Project Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application bootstrap
├── instrument.ts              # Sentry initialization
├── config/                    # Configuration management
│   ├── configuration.ts       # Config factory functions
│   ├── environment.dto.ts     # Environment validation
│   └── parseEnvironment.ts    # Environment parsing
├── database/                  # Database configuration
│   ├── data-source.ts         # TypeORM configuration
│   └── migrations/            # Database migrations
├── auth/                      # Authentication module
│   ├── commands/              # CQRS commands
│   ├── dto/                   # Auth DTOs
│   ├── guards/                # Auth guards
│   ├── services/              # Auth services
│   └── strategies/            # Passport strategies
├── users/                     # User management
│   ├── commands/              # User CQRS commands
│   ├── user.entity.ts         # User entity
│   └── users.service.ts       # User business logic
├── tokens/                    # Token management
│   ├── commands/              # Token CQRS commands
│   └── token.entity.ts        # Token entity
├── email/                     # Email service
├── filters/                   # Exception filters
├── utils/                     # Utility functions
└── validators/                # Custom validators
```

## 🔧 Development Configuration

### TypeScript Configuration

- **Target**: ES2022 with CommonJS modules
- **Strict Mode**: Enabled with specific overrides
- **Path Mapping**: `@/*` → `./src/*`
- **Decorators**: Enabled for NestJS
- **Source Maps**: Enabled for debugging

### Code Quality Tools

- **ESLint**: TypeScript ESLint with strict rules
- **Prettier**: Code formatting with single quotes
- **Husky**: Git hooks for quality gates
- **Lint-staged**: Pre-commit linting

### Database Management

- **Migrations**: TypeORM CLI with custom scripts
- **Connection**: PostgreSQL with connection pooling
- **Entities**: Auto-loading enabled
- **Retry Logic**: Built-in connection retry

### Deployment & Infrastructure

- **Containerization**: Multi-stage Docker build
- **Runtime**: Node.js 20 Alpine
- **Security**: Non-root user in container
- **Environment**: Environment-based configuration
- **Backup**: Automated PostgreSQL backup system

## ⚙️ Configuration Management

### Environment Variables

- **Validation**: Joi-based schema validation
- **Structure**: Hierarchical configuration objects
- **Types**: Strongly typed with DTOs
- **Sections**: CORS, Auth, Email, App configs

### Logging Strategy

- **Framework**: Pino with multiple transports
- **Outputs**: Console (dev), File (app.log), Error (error.log)
- **Format**: Structured JSON with pretty printing for dev
- **Serializers**: Custom request/response serializers

### Error Handling

- **Global Filter**: `HttpExceptionFilter` with Sentry integration
- **Validation**: Global validation pipe with custom error formatting
- **Monitoring**: Sentry error tracking and performance monitoring

## 🚀 Available Scripts

- `npm run start:dev` - Development with hot reload
- `npm run build` - Production build with Sentry sourcemaps
- `npm run lint` - ESLint with auto-fix
- `npm run test` - Jest test runner
- `npm run migration:generate` - Generate TypeORM migrations
- `npm run migration:run` - Run pending migrations

## 🔒 Security Features

### Authentication

- JWT with access/refresh token pattern
- Secure cookie handling
- Password hashing with bcrypt

### CORS Configuration

- Environment-based origin control
- Credential support
- Method and header restrictions

### Input Validation

- Global validation pipe
- Custom validators
- DTO-based validation

## 📊 Monitoring & Observability

### Sentry Integration

- Error tracking
- Performance monitoring
- Source map support
- Profiling enabled

### Logging

- Structured logging with Pino
- Multiple log levels
- File-based log rotation
- Request/response serialization

## 🎯 Current State

### Strengths

- ✅ Well-structured CQRS implementation
- ✅ Comprehensive monitoring (Sentry, Pino)
- ✅ Type-safe with strict TypeScript
- ✅ Proper error handling and validation
- ✅ Docker containerization ready

### Areas for Enhancement

- 🔄 **No tests currently** - Jest configured but unused
- 📝 **Limited documentation** - Could benefit from more inline docs
- 🚀 **Performance optimizations** - No caching or rate limiting
- 🔒 **Security hardening** - Could add more security middleware

## 🌐 Environment Setup

- **Development**: `.env.local`
- **Production**: `.env`
- **Docker**: Environment variables in compose

---

> **Note**: This project follows enterprise-grade patterns with a focus on maintainability, type safety, and comprehensive monitoring.
