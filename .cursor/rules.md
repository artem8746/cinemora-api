# Cursor Rules Index

Rules are split into `.cursor/rules/*.mdc`. Each file has YAML frontmatter with `description`, optional `globs`, and optional `alwaysApply`.

| File                 | Globs                                                                                        | When it applies                                                    |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **architecture.mdc** | `src/**/*.ts`                                                                                | Editing app structure, layers, modules, or backend entry points    |
| **conventions.mdc**  | `**/*.ts`                                                                                    | Any TypeScript; naming, style, typing, formatting                  |
| **product.mdc**      | `src/**/dto/**/*.ts`                                                                         | API surface, DTOs, domain terms                                    |
| **decisions.mdc**    | `src/config/**/*.ts`, `src/**/infrastructure/**/*.ts`, `src/database/**/*.ts`, `src/main.ts` | Config, env, DB, auth, logging, infra                              |
| **rules.mdc**        | —                                                                                            | Always (`alwaysApply: true`). Imports, workflow, pitfalls, scripts |

## Token optimization tips

- **Split rules**: Use the file above that matches your task so only relevant rules load.
- **@-mention only what you need**: Reference specific files or folders instead of the whole repo.
- **Keep rules short**: Rule content is concise; see `.cursor/rules/*.mdc` for details.
- **Narrow scope**: Globs limit which rules apply to opened files.
- **Use .cursorignore**: Exclude large/generated paths so they are not sent as context.

Full rule content lives in `.cursor/rules/`; this index is for reference only.
