# Cursor AI Rules for Career Boosty API

> **Context**: NestJS streaming platform API using CQRS, TypeScript, PostgreSQL, Fastify
> **Architecture**: Enterprise-grade with comprehensive monitoring and structured logging

## 🎯 Core Principles

### Architecture-First Approach

- **Always follow CQRS pattern** for new features
- **Use NestJS conventions** (decorators, DI, modules)
- **Maintain separation of concerns** (controllers, services, entities)
- **Leverage existing patterns** rather than creating new ones

### Type Safety & Quality

- **Strict TypeScript**: No `any` types, use proper interfaces
- **DTO Validation**: All endpoints must have validated DTOs
- **Error Handling**: Use existing global error handling patterns
- **Logging**: Use structured logging with appropriate levels

### Code Organization

- **Feature Modules**: Group related functionality in modules
- **Command Structure**: Follow `commands/{name}/{name}.command.ts` and `{name}.handler.ts`
- **Entity Placement**: Keep entities with their respective modules
- **Shared Code**: Place utilities in appropriate shared directories

## 📁 File Structure & Naming

### Commands & Handlers

```
src/{module}/commands/{action}/
├── {action}.command.ts      # Command definition
└── {action}.handler.ts      # Command handler
```

### Examples

- `create-user.command.ts` → `CreateUserCommand`
- `create-user.handler.ts` → `CreateUserHandler`
- `user-create.dto.ts` → `CreateUserDto`

## 🏗️ Code Patterns

### Command Pattern

```typescript
// Command Definition
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

// Command Handler
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  async execute(command: CreateUserCommand): Promise<User> {
    return this.usersService.create(command);
  }
}

export type CreateUserCommandResponse = User;
```

### DTO Pattern

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
```

### Service Pattern

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(command: CreateUserCommand): Promise<User> {
    // Business logic implementation
  }
}
```

## 🔧 Development Workflow

### Before Making Changes

1. **Understand existing patterns** by examining similar features
2. **Check module structure** to understand dependencies
3. **Review configuration** to understand environment setup
4. **Examine error handling** to maintain consistency

### During Development

1. **Follow existing code style** (Prettier, ESLint)
2. **Use dependency injection** consistently
3. **Add proper logging** with structured format
4. **Handle errors gracefully** using existing patterns
5. **Validate inputs** with DTOs and class-validator

### After Making Changes

1. **Run linting** to ensure code quality
2. **Check TypeScript compilation** for type errors
3. **Verify module imports** are correct
4. **Test functionality** manually if possible
5. **Update documentation** if needed

## 🛠️ Technology Guidelines

### NestJS Best Practices

- **Use decorators** for metadata and configuration
- **Leverage dependency injection** for all dependencies
- **Follow module organization** for feature separation
- **Use guards, interceptors, and pipes** appropriately

### TypeORM Guidelines

- **Use Data Mapper pattern** (not Active Record)
- **Define proper relationships** between entities
- **Use migrations** for schema changes
- **Leverage repository pattern** for data access

### CQRS Implementation

- **Commands for writes**, queries for reads (when implemented)
- **Single responsibility** for each command handler
- **Use command bus** for cross-module communication
- **Maintain command/response type safety**

### Authentication & Security

- **Use existing JWT patterns** for authentication
- **Follow token refresh** mechanism
- **Validate permissions** with guards
- **Sanitize inputs** to prevent injection

### Error Handling

- **Use existing HttpExceptionFilter** for consistency
- **Provide meaningful error messages** to clients
- **Log errors appropriately** with context
- **Handle validation errors** gracefully

### Logging Standards

- **Use structured logging** with Pino
- **Include request context** (user ID, request ID)
- **Log at appropriate levels** (info, warn, error)
- **Avoid logging sensitive data**

## 🚀 Common Tasks

### Creating New Features

1. **Start with Command/Handler**: Create command and handler first
2. **Add to Module**: Register command handler in appropriate module
3. **Create DTOs**: Add request/response DTOs with validation
4. **Add Controller**: Create controller endpoint if needed
5. **Update Tests**: Add corresponding tests (when test framework is established)

### Adding New Endpoints

1. Create command and handler
2. Add DTOs for request/response
3. Create controller method
4. Add authentication/authorization guards
5. Update Swagger documentation

### Creating New Entities

1. Define entity with TypeORM decorators
2. Create migration for schema changes
3. Add to appropriate module's TypeORM imports
4. Create repository interface if needed

### Database Operations

1. Use repository pattern
2. Implement proper error handling
3. Use transactions for multi-entity operations
4. Add appropriate indexes
5. Consider performance implications

## ✅ Quality Checklist

### Functionality

- [ ] Feature works as expected
- [ ] Error handling is appropriate
- [ ] Input validation is complete
- [ ] Security considerations addressed

### Code Quality

- [ ] Follows existing patterns
- [ ] TypeScript types are correct
- [ ] Code is properly formatted
- [ ] No linting errors

### Architecture

- [ ] Follows CQRS pattern
- [ ] Proper module organization
- [ ] Dependency injection used correctly
- [ ] Separation of concerns maintained

### Testing

- [ ] Unit tests added (when framework available)
- [ ] Integration tests considered
- [ ] Error scenarios tested
- [ ] Performance impact assessed

## 🔒 Security & Performance

### Input Validation

- **Validate all inputs** with DTOs
- **Sanitize user data** before processing
- **Use parameterized queries** to prevent SQL injection
- **Implement rate limiting** for API endpoints

### Authentication

- **Secure token storage** and transmission
- **Implement proper session management**
- **Use HTTPS** in production
- **Validate JWT signatures** properly

### Performance

- **Use proper indexes** for queries
- **Implement pagination** for large datasets
- **Use transactions** for multi-entity operations
- **Avoid N+1 queries** with proper relations

## 📊 Monitoring & Observability

### Logging

- **Use structured logging** consistently
- **Include correlation IDs** for request tracing
- **Log business events** and user actions
- **Monitor error rates** and patterns

### Error Tracking

- **Use Sentry** for error monitoring
- **Include context** in error reports
- **Track error trends** and patterns
- **Implement proper error recovery**

---

> **Remember**: This project follows enterprise-grade patterns. Always prioritize consistency, type safety, and maintainability over quick fixes.
