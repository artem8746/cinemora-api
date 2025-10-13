# .cursor Directory

This directory contains Cursor AI-specific configuration and documentation for the **Career Boosty API** project.

## 📁 Contents

### `rules.md`

Core AI assistant rules and guidelines for maintaining consistency with the project's architecture and coding standards.

### `project-context.md`

Comprehensive project overview including technology stack, architectural patterns, and current state.

### `patterns.md`

Detailed code patterns and examples for common development tasks, following the project's CQRS and NestJS conventions.

## 🎯 Purpose

These files serve as a **centralized knowledge base** for AI assistance, ensuring:

- **Consistent architectural patterns** across all code changes
- **Proper CQRS implementation** for new features
- **Type-safe development** with strict TypeScript standards
- **Enterprise-grade practices** for maintainability and scalability

## 🚀 Usage

When working with this project, the AI assistant will:

1. **Reference these files** for architectural decisions
2. **Follow established patterns** for code generation
3. **Maintain consistency** with existing codebase
4. **Apply best practices** for NestJS, TypeORM, and CQRS

## 📋 Quick Reference

### Key Technologies

- **NestJS 11.x** with Fastify adapter
- **TypeScript 5.7+** with strict configuration
- **PostgreSQL** with TypeORM
- **CQRS pattern** for command/query separation
- **JWT authentication** with refresh tokens
- **Pino structured logging**
- **Sentry monitoring**

### Architecture Principles

- **CQRS first** - All write operations use commands
- **Module-based** - Feature separation with clear boundaries
- **Type-safe** - Strict TypeScript with no `any` types
- **Validated inputs** - DTOs with class-validator
- **Structured logging** - Pino with proper context

### File Organization

```
src/{module}/commands/{action}/
├── {action}.command.ts      # Command definition
└── {action}.handler.ts      # Command handler
```

## 🔄 Maintenance

These files should be updated when:

- New architectural patterns are introduced
- Technology stack changes
- Coding standards evolve
- New common patterns emerge

---

> **Note**: This directory is specifically designed for Cursor AI assistance and should be kept up-to-date with the project's evolution.
