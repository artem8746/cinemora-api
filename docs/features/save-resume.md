# Save resume

## Purpose

Persist resume content for the authenticated user, either as a general resume or as a vacancy-specific optimized resume linked to an analysis.

## Business rules

- `vacancyId` and `analysisId` are optional but must be sent together or omitted together; partial pairs are rejected with `400 Bad Request`.
- When both are omitted, the resume is saved as a general user resume (`resume.id` from payload is used).
- When both are provided, the resume is saved as vacancy-specific optimized content (`resume.id` is ignored).

## Architecture and dependencies

- `POST /resume` → `SaveResumeHandler` → `ResumeService.saveResume`.
- Command: `SaveResumeCommand` (`userId`, `resume`, optional `vacancyId`, optional `analysisId`).

## API/contracts

- DTO: `SaveResumeDto` (`resume`, optional `vacancyId`, optional `analysisId`).
- Validation error: `vacancyId and analysisId must be provided together or omitted together`.

## Data model and migrations

No schema changes.

## Edge cases and known limitations

- Empty string IDs are treated as absent (`Boolean('') === false`).

## How to change safely in future

- Keep handler invariant and DTO Swagger descriptions in sync.
- If a third optional context field is added, define explicit pairing rules in the handler.

## Related files

- `src/resume/application/commands/save-resume/save-resume.handler.ts`
- `src/resume/presentation/dto/save-resume.dto.ts`
- `src/resume/application/resume.service.ts`
