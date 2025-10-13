# Code Patterns & Examples

## 🏗️ CQRS Command Pattern

### Basic Command Structure

```typescript
// commands/create-user/create-user.command.ts
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

// commands/create-user/create-user.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const newUser = await this.usersService.create(command);
    return newUser;
  }
}

export type CreateUserCommandResponse = User;
```

### Complex Command with Dependencies

```typescript
// commands/register/register.handler.ts
@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: RegisterCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = command;

    // Check if user exists
    const user = await this.commandBus.execute<GetUserByEmailCommand, User>(
      new GetUserByEmailCommand(email),
    );

    if (user) {
      throw new BadRequestException('User already exists');
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const newUser = await this.commandBus.execute<
      CreateUserCommand,
      CreateUserCommandResponse
    >(new CreateUserCommand(email, hashedPassword));

    // Generate tokens
    const { accessToken, refreshToken } = await this.commandBus.execute<
      GenerateTokensCommand,
      GenerateTokensCommandResponse
    >(new GenerateTokensCommand(newUser));

    // Register refresh token
    await this.commandBus.execute<
      RegisterTokenCommand,
      RegisterTokenCommandResponse
    >(
      new RegisterTokenCommand({
        userId: newUser.id,
        token: refreshToken,
      }),
    );

    return { accessToken, refreshToken };
  }
}
```

## 📝 DTO Patterns

### Request DTO with Validation

```typescript
// dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    description: 'User password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
```

### Response DTO

```typescript
// dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: false })
  isConfirmed: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
```

### Update DTO (Partial)

```typescript
// dto/update-user.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: true, required: false })
  isConfirmed?: boolean;
}
```

## 🏢 Service Patterns

### Basic Service with Repository

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserCommand } from './commands/create-user/create-user.command';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(command: CreateUserCommand): Promise<User> {
    const user = this.userRepository.create({
      email: command.email,
      password: command.password,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

### Service with External Dependencies

```typescript
// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { CreateUserCommand } from '@/users/commands/create-user/create-user.command';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await this.comparePasswords(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    // Implementation for password comparison
    return true; // Placeholder
  }
}
```

## 🗄️ Entity Patterns

### Basic Entity

```typescript
// user.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false, name: 'is_confirmed' })
  isConfirmed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Entity with Relationships

```typescript
// token.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/user.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

## 🎮 Controller Patterns

### Basic CRUD Controller

```typescript
// users.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserCommand } from './commands/create-user/create-user.command';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.commandBus.execute(
      new CreateUserCommand(createUserDto.email, createUserDto.password),
    );

    return {
      id: user.id,
      email: user.email,
      isConfirmed: user.isConfirmed,
      createdAt: user.createdAt,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    // Implementation
  }
}
```

### Controller with Custom Guards

```typescript
// auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterCommand } from './commands/register/register.command';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.commandBus.execute(
      new RegisterCommand(registerDto.email, registerDto.password),
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    // User is attached to request by LocalAuthGuard
    return req.user;
  }
}
```

## 🛡️ Guard Patterns

### JWT Authentication Guard

```typescript
// guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

### Local Strategy Guard

```typescript
// guards/local-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

## 🔧 Module Patterns

### Feature Module

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { GetUserByEmailHandler } from './commands/get-user-by-email/get-user-by-email.handler';
import { CreateUserHandler } from './commands/create-user/create-user.handler';

export const CommandHandlers = [GetUserByEmailHandler, CreateUserHandler];

@Module({
  imports: [TypeOrmModule.forFeature([User]), CqrsModule],
  controllers: [UsersController],
  providers: [UsersService, ...CommandHandlers],
  exports: [UsersService], // Export for use in other modules
})
export class UsersModule {}
```

## 🚨 Error Handling Patterns

### Custom Exception

```typescript
// exceptions/user-not-found.exception.ts
import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}
```

### Service Error Handling

```typescript
// users.service.ts
async findById(id: string): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id } });

  if (!user) {
    throw new UserNotFoundException(id);
  }

  return user;
}
```

## 📊 Logging Patterns

### Structured Logging

```typescript
// users.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async create(command: CreateUserCommand): Promise<User> {
    this.logger.log(`Creating user with email: ${command.email}`);

    try {
      const user = await this.userRepository.save({
        email: command.email,
        password: command.password,
      });

      this.logger.log(`User created successfully with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

## 🧪 Testing Patterns (Future Implementation)

### Unit Test Example

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserCommand } from './commands/create-user/create-user.command';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const command = new CreateUserCommand('test@example.com', 'password123');
    const mockUser = {
      id: '1',
      email: command.email,
      password: command.password,
    };

    jest.spyOn(repository, 'create').mockReturnValue(mockUser as User);
    jest.spyOn(repository, 'save').mockResolvedValue(mockUser as User);

    const result = await service.create(command);

    expect(result).toEqual(mockUser);
    expect(repository.create).toHaveBeenCalledWith({
      email: command.email,
      password: command.password,
    });
  });
});
```

---

> **Note**: These patterns should be followed consistently throughout the project to maintain code quality and architectural coherence.
