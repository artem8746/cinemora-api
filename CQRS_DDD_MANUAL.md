# CQRS + DDD Architecture Guide

## Обзор

Этот документ описывает архитектурные принципы и подходы, используемые в проекте для построения модулей с применением **CQRS (Command Query Responsibility Segregation)** и **DDD (Domain-Driven Design)**. Эти правила должны соблюдаться всеми членами команды для поддержания консистентности и качества кода.

## Основные принципы

### 1. Строгое разделение слоев (Layered Architecture)

Каждый модуль должен следовать четкой структуре слоев:

```
Presentation Layer (presentation/)
    ↓ HTTP requests/responses
Application Layer (application/)
    ↓ Commands/Queries, Events
Domain Layer (domain/)
    ↓ Interfaces/Ports (pure TypeScript)
Infrastructure Layer (infrastructure/)
    ↓ External services, DB, Storage
```

**Правила:**

- ✅ Контроллеры могут вызывать только Application Services или Command/Query Handlers
- ✅ Application Services зависят только от Domain Ports (интерфейсов)
- ✅ Infrastructure реализует Domain Ports
- ❌ Контроллеры НЕ могут напрямую обращаться к репозиториям
- ❌ Application Layer НЕ должен знать о конкретных реализациях Infrastructure

### 2. Dependency Inversion Principle (DIP)

**Всегда зависейте от абстракций, а не от конкретных реализаций.**

#### Использование Symbol для DI токенов

TypeScript интерфейсы не существуют в runtime, поэтому для Dependency Injection используем Symbol:

```typescript
// domain/file-storage.port.ts
export interface IFileStoragePort {
  uploadFile(...): Promise<string>;
}

export const FILE_STORAGE_PORT = Symbol('IFileStoragePort');

// infrastructure/r2-file-storage.service.ts
@Injectable()
export class R2FileStorageService implements IFileStoragePort { ... }

// application/file-storage.service.ts
@Injectable()
export class FileStorageService {
  constructor(
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStoragePort: IFileStoragePort, // Зависим от интерфейса
  ) {}
}

// module.ts
{
  provide: FILE_STORAGE_PORT,
  useClass: R2FileStorageService, // Конкретная реализация
}
```

**Почему Symbol, а не строка?**

- Уникальность: каждый Symbol уникален, даже с одинаковым описанием
- Безопасность типов: TypeScript видит тип интерфейса
- Избежание коллизий: разные модули могут использовать одинаковые строки
- Явность: токен явно экспортируется и используется

**Альтернатива:** Можно использовать abstract class вместо interface + Symbol, но Symbol более явный и безопасный для больших проектов.

### 3. CQRS Pattern

**Разделение команд (write) и запросов (read).**

#### Структура команд:

```
application/commands/
  └── action-name/
      ├── action-name.command.ts    # Command class
      └── action-name.handler.ts     # Command handler
```

**Command:**

```typescript
export class UploadAvatarCommand {
  constructor(
    public readonly userId: string,
    public readonly file: Express.Multer.File,
  ) {}
}
```

**Handler:**

```typescript
@CommandHandler(UploadAvatarCommand)
export class UploadAvatarHandler implements ICommandHandler<UploadAvatarCommand> {
  constructor(
    private readonly service: ApplicationService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UploadAvatarCommand): Promise<ResponseType> {
    // 1. Вызываем Application Service
    const result = await this.service.doSomething(command);

    // 2. Публикуем событие
    this.eventBus.publish(new SomethingHappenedEvent(...));

    // 3. Возвращаем результат
    return result;
  }
}
```

**Правила:**

- ✅ Команды изменяют состояние (write operations)
- ✅ Queries только читают данные (read operations)
- ✅ Handlers не содержат бизнес-логику, только оркестрацию
- ✅ Бизнес-логика в Application Services
- ✅ Всегда публикуйте события после успешных операций

### 4. Domain-Driven Design (DDD)

#### Domain Layer - Pure TypeScript

```typescript
// domain/file-storage.port.ts
export interface IFileStoragePort {
  uploadFile(...): Promise<string>;
  getPublicUrl(key: string): string;
}

export const FILE_STORAGE_PORT = Symbol('IFileStoragePort');
```

**Правила Domain Layer:**

- ✅ Только интерфейсы, типы, enum'ы
- ✅ Никаких зависимостей от фреймворков
- ✅ Никаких I/O операций
- ✅ Никаких аннотаций декораторов
- ✅ Чистый TypeScript, компилируется в любой среде

#### Application Layer - Бизнес-логика

```typescript
// application/file-storage.service.ts
@Injectable()
export class FileStorageService {
  constructor(
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStoragePort: IFileStoragePort, // Зависим от порта
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async uploadAvatar(...): Promise<string> {
    // 1. Вызываем порт (не знаем про R2/S3)
    const key = await this.fileStoragePort.uploadAvatar(...);

    // 2. Сохраняем метаданные в БД
    await this.fileRepository.save({ key, ... });

    // 3. Формируем публичный URL
    const url = this.fileStoragePort.getPublicUrl(key);

    return url;
  }
}
```

**Правила Application Layer:**

- ✅ Содержит бизнес-логику и оркестрацию
- ✅ Зависит только от Domain Ports
- ✅ Может использовать репозитории для сохранения данных
- ✅ Публикует события через EventBus
- ❌ Не знает о конкретных реализациях Infrastructure

#### Infrastructure Layer - Адаптеры

```typescript
// infrastructure/r2-file-storage.service.ts
@Injectable()
export class R2FileStorageService implements IFileStoragePort {
  constructor(private readonly configService: ConfigService) {
    // Инициализация R2 клиента
  }

  async uploadAvatar(...): Promise<string> {
    // Конкретная реализация для R2
    const key = `users/${userId}/avatar-${timestamp}.jpg`;
    await this.uploadToR2(key, file, mimeType);
    return key; // Возвращаем ключ, не URL
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
```

**Правила Infrastructure Layer:**

- ✅ Реализует Domain Ports
- ✅ Содержит все детали работы с внешними сервисами
- ✅ Возвращает ключи/идентификаторы, не полные URL
- ✅ URL формируются через отдельный метод `getPublicUrl()`

### 5. Хранение данных: ключи вместо URL

**Важно:** В базе данных храним **ключи файлов**, а не полные URL.

**Почему?**

- Гибкость: можно изменить CDN/домен без миграции БД
- Независимость: ключ не зависит от конфигурации
- Переносимость: легко переключиться между storage провайдерами

**Пример:**

```typescript
// Entity
@Entity('files')
export class File {
  @Column({ type: 'varchar', length: 500 })
  key: string; // ✅ Храним ключ: "users/123/avatar-1234567890.jpg"

  // ❌ НЕ храним: "https://cdn.example.com/users/123/avatar-1234567890.jpg"
}

// Infrastructure возвращает ключ
async uploadAvatar(...): Promise<string> {
  const key = `users/${userId}/avatar-${timestamp}.jpg`;
  await this.uploadToR2(key, file, mimeType);
  return key; // Возвращаем ключ
}

// Application Service формирует URL для ответа
async uploadAvatar(...): Promise<string> {
  const key = await this.fileStoragePort.uploadAvatar(...);
  await this.fileRepository.save({ key, ... });
  const url = this.fileStoragePort.getPublicUrl(key); // Формируем URL
  return url; // Возвращаем URL клиенту
}
```

### 6. События (Domain Events)

**Все побочные эффекты через события, не прямые вызовы.**

```typescript
// application/events/avatar-uploaded.event.ts
export class AvatarUploadedEvent {
  constructor(
    public readonly userId: string,
    public readonly url: string,
    public readonly uploadedAt: Date,
  ) {}
}

// В Handler
async execute(command: UploadAvatarCommand): Promise<string> {
  const url = await this.service.uploadAvatar(...);

  // Публикуем событие
  this.eventBus.publish(
    new AvatarUploadedEvent(userId, url, new Date())
  );

  return url;
}
```

**Правила:**

- ✅ Публикуйте события после успешных операций
- ✅ События содержат всю необходимую информацию
- ✅ Другие модули подписываются на события, не вызывают напрямую
- ✅ События делают систему слабо связанной

### 7. Валидация и обработка ошибок

#### Валидация в контроллере:

```typescript
@Post('avatar')
async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
  // 1. Проверка наличия файла
  if (!file) {
    throw new BadRequestException('File is required');
  }

  // 2. Проверка MIME типа
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    throw new BadRequestException('Invalid file type');
  }

  // 3. Проверка размера (используем helper функции)
  if (file.size > MAX_SIZE) {
    throw new BadRequestException(
      `File size exceeds the limit of ${bytesToMegabytes(MAX_SIZE)}MB`
    );
  }

  // 4. Вызов команды
  return this.commandBus.execute(new UploadAvatarCommand(...));
}
```

**Правила валидации:**

- ✅ Валидация на уровне контроллера (граница приложения)
- ✅ Используйте helper функции для форматирования (bytesToMegabytes)
- ✅ Разные лимиты для разных типов файлов
- ✅ Четкие сообщения об ошибках

#### Helper функции:

```typescript
// presentation/utils/file-size.helper.ts
export function bytesToMegabytes(bytes: number): number {
  return bytes / 1024 / 1024;
}

export function formatFileSize(bytes: number): string {
  const mb = bytesToMegabytes(bytes);
  return `${mb.toFixed(2)}MB`;
}
```

### 8. Структура модуля

```
src/modules/{module-name}/
├── domain/
│   └── {name}.port.ts              # Domain interfaces
├── infrastructure/
│   └── {provider}-{name}.service.ts  # Конкретные реализации
├── application/
│   ├── {name}.service.ts           # Application service
│   ├── commands/
│   │   └── {action}/
│   │       ├── {action}.command.ts
│   │       └── {action}.handler.ts
│   ├── queries/
│   │   └── {query}/
│   │       ├── {query}.query.ts
│   │       └── {query}.handler.ts
│   └── events/
│       └── {event}.event.ts
├── presentation/
│   ├── dto/
│   │   └── {name}-response.dto.ts
│   ├── utils/
│   │   └── {helper}.helper.ts
│   └── {name}.controller.ts
├── {name}.entity.ts                # TypeORM entity (если нужна БД)
└── {name}.module.ts                # NestJS module
```

### 9. Конфигурация и Environment

**Всегда используйте строгую типизацию для конфигурации:**

```typescript
// config/environment.dto.ts
export class EnvironmentDto {
  @IsString()
  @IsNotEmpty()
  R2_ACCOUNT_ID!: string;

  // ... другие переменные
}

// config/configuration.ts
function getR2Config(env: EnvironmentDto) {
  return {
    accountId: env.R2_ACCOUNT_ID,
    // ...
  } as const;
}

export function configuration(env: EnvironmentDto) {
  return {
    r2: getR2Config(env),
    // ...
  } as const;
}
```

**Правила:**

- ✅ Все env переменные в EnvironmentDto с валидацией
- ✅ Группировка по функциональности в configuration.ts
- ✅ Использование `as const` для type safety
- ✅ Доступ через ConfigService с типизацией

### 10. Типизация и Type Safety

**Строгие правила TypeScript:**

```typescript
// ✅ Правильно
const key: string = await this.port.uploadFile(...);
const url: string = this.port.getPublicUrl(key);

// ❌ НЕПРАВИЛЬНО
const result: any = await this.port.uploadFile(...);
const url = this.port.getPublicUrl(result); // any
```

**Правила:**

- ✅ Никаких `any` типов
- ✅ Используйте `unknown` + type guards если нужно
- ✅ Явные типы возвращаемых значений
- ✅ TypeScript strict mode всегда включен

### 11. Логирование

**Структурированное логирование через nestjs-pino:**

```typescript
@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  async uploadAvatar(...) {
    this.logger.log(`Uploading avatar for user: ${userId}`);
    // ...
    this.logger.log(`Avatar uploaded and saved to DB: ${key}`);
  }
}
```

**Правила:**

- ✅ Используйте Logger из @nestjs/common
- ✅ Логируйте начало и конец операций
- ✅ Включайте контекст (userId, key, etc.)
- ✅ Используйте правильные уровни (log, error, warn)

## Чеклист для нового модуля

При создании нового модуля убедитесь:

- [ ] Создана структура слоев (domain, infrastructure, application, presentation)
- [ ] Domain порты определены как интерфейсы с Symbol токенами
- [ ] Infrastructure реализует Domain порты
- [ ] Application Services зависят только от портов
- [ ] Команды/Queries разделены на отдельные папки
- [ ] Handlers публикуют события после операций
- [ ] Контроллеры валидируют входные данные
- [ ] В БД хранятся ключи, а не полные URL
- [ ] Helper функции вынесены в utils
- [ ] Конфигурация типизирована через EnvironmentDto
- [ ] Нет использования `any` типов
- [ ] Логирование добавлено в критические места
- [ ] Модуль зарегистрирован в AppModule

## Анти-паттерны (чего избегать)

❌ **Прямой вызов из контроллера в репозиторий:**

```typescript
// ❌ ПЛОХО
@Controller('files')
export class FilesController {
  constructor(private readonly fileRepo: Repository<File>) {}

  @Post('upload')
  async upload() {
    await this.fileRepo.save(...); // Нарушение слоев!
  }
}
```

❌ **Зависимость Application от Infrastructure:**

```typescript
// ❌ ПЛОХО
@Injectable()
export class FileStorageService {
  constructor(
    private readonly r2Service: R2FileStorageService, // Конкретная реализация!
  ) {}
}
```

❌ **Хранение URL в БД:**

```typescript
// ❌ ПЛОХО
@Entity()
export class File {
  @Column()
  url: string; // "https://cdn.example.com/..." - хрупко!
}
```

❌ **Бизнес-логика в Handler:**

```typescript
// ❌ ПЛОХО
@CommandHandler(UploadCommand)
export class UploadHandler {
  async execute(command: UploadCommand) {
    // Вся бизнес-логика здесь - должно быть в Service!
    const key = this.generateKey(...);
    await this.uploadToR2(...);
    await this.saveToDB(...);
  }
}
```

## Примеры правильной реализации

См. `src/modules/files/` для полного примера реализации всех принципов.

---

**Последнее обновление:** Ноябрь 2025  
**Версия:** 1.0  
**Статус:** Активные правила команды
