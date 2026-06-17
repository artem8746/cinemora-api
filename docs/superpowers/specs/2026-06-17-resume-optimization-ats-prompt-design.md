# Resume Optimization Prompt — ATS-First Restructure

**Date:** 2026-06-17
**Branch:** `feat/869dq9xf5-optimize-resume-optimization-prompt`
**Scope:** Guidance-only prompt rewrite. No handler, service, or schema changes.
**Target file:** `src/openai/constants/prompts/resume-optimization.prompt.ts`

## Problem

The current `RESUME_OPTIMIZATION_SYSTEM_PROMPT` is a flat ~85-line list that mixes three concerns: strict JSON output format, ATS-quality guidance, and mode-aware constraints. ATS best practices are scattered across rules 6–9 and the mode addenda, with no top-level category that tells the model "these are the ATS rules." Modern instruction-following models weight categorized rules higher than items buried in a long flat list.

The goal is to maximize ATS pass rate and recruiter engagement of the optimized resume output without touching the handler, service, JSON contract, or types.

## Out of Scope

- Handler changes (`src/openai/commands/parse-text-to-resume/parse-text-to-resume.handler.ts` and `src/openai/openai.service.ts` modifications currently in the working tree are unrelated and will not be touched).
- Multi-pass orchestration (separate vacancy-keyword-extraction call).
- Output JSON schema, field names, scoring weights, delta/merge semantics.
- `WRITING_STYLE_INSTRUCTIONS`, `CONTENT_LANGUAGE_INSTRUCTIONS`, `OPTIMIZATION_MODE_INSTRUCTIONS` blocks (their content stays; they remain wired into `getResumeOptimizationPrompt` unchanged).
- TypeScript exports: `OptimizationMode`, `WritingStyle`, `ContentLanguage`, `ResumeOptimizationOptions`, `NEW_ENTRY_ID_PREFIX`.
- Tests, controllers, DTOs.

## Approach

Rewrite the body of `RESUME_OPTIMIZATION_SYSTEM_PROMPT` into four explicit thematic blocks. The output JSON contract and mode-mechanics content are preserved verbatim or near-verbatim — they only get regrouped. The new material is a dedicated `ATS RULES` block of eight enforced practices with one-line rationales, plus three inline bad→good micro-examples on the practices where LLM instruction-following is weakest.

### New System Prompt Structure

```
1. OUTPUT CONTRACT
   - Current "CRITICAL OUTPUT RULES" (strict JSON, no markdown, integer scores 0–100).
   - Current "CONTENT CHANGES (delta)" rules (merge-by-id, omit-unchanged, exact field names).
   - Current "ANALYSIS REQUIREMENTS" block (scoring formula, keySkillsMatch shape,
     strengths/improvements counts, sectionChanges/entryChanges structure).
   - Current "OUTPUT JSON STRUCTURE" example.

2. ATS RULES
   - Eight enforced ATS practices, each as: rule line + one-line rationale.
   - Three inline bad→good examples embedded under rules #3, #4, #5.

3. OPTIMIZATION MECHANICS
   - Current "OPTIMIZATION RULES" 1–10 (no-fabrication, hiding, no-deletion,
     preserve id/dates/links, preserve HTML, reword profile, reorder skills,
     enhance work bullets, jobTitle adjustment, sectionOrder).

4. MODE-AWARE CONSTRAINTS
   - Current "Mode-specific" Conservative/Aggressive paragraphs.
   - Explicit gate: which ATS rules each mode relaxes.
```

### The 8 ATS Rules (block 2 content)

1. **Exact keyword match** — use vacancy terms in the exact phrasing the vacancy uses (e.g. "React.js" if the vacancy says "React.js", not "React"). *Why: ATS keyword matchers are literal; near-synonyms often miss.*

2. **Acronym + spelled-out form** — when a hard skill has both forms, include both at least once (e.g. "Search Engine Optimization (SEO)"). *Why: ATS parsers may key on either; recruiters scan the spelled form.*

3. **Action verbs first** — every work/project bullet must start with a strong past-tense action verb (led, built, shipped, migrated, owned, reduced…). *Why: weak openings ("Responsible for…") signal low ownership and rank poorly.*

   ```
   bad:  "Responsible for the frontend team and delivery of features."
   good: "Led a 6-engineer frontend team; shipped 4 product features
          across 2 quarters under a fixed deadline."
   ```

4. **Quantification where credible** — prefer concrete numbers, %, scale, throughput, or time-to-X when they exist in the source. Do NOT invent. *Why: quantified bullets pass both ATS scoring heuristics and recruiter skim; fabricated numbers destroy trust if uncovered.*

   ```
   bad:  "Improved page load performance significantly."
   good: "Cut median page load from 4.2s to 1.6s by lazy-loading
          above-the-fold assets and inlining critical CSS."
          (only if 4.2s/1.6s appear in source resume — never invent)
   ```

5. **Anti-stuffing** — keywords must read naturally in context. No comma-separated keyword dumps, no repeating the same term in adjacent bullets just to inflate density. *Why: modern ATS flag stuffing; recruiters discard obvious spam.*

   ```
   bad:  "Used React, React.js, ReactJS, React Hooks, React Components,
          React Router, React Query for frontend development."
   good: "Built SPA on React (Hooks + Router + Query) — owned state
          layer and data-fetching architecture."
   ```

6. **Skill–vacancy priority order** — when reordering skills, visible skills (`isHidden: false`) lead the array sorted by vacancy fit: must-haves, then nice-to-haves, then the rest. Hidden skills (`isHidden: true`) follow the visible block; their internal order is irrelevant. *Why: ATS often weight position; recruiters skim the first 5–8 skills.*

7. **JobTitle alignment** — adjust `personalDetails.jobTitle` toward the vacancy's title only when it remains truthful for the candidate's actual seniority and domain (no Senior→Staff jumps, no domain shifts). *Why: title match is one of the strongest ATS signals; lying gets filtered downstream at the interview.*

8. **Recency-and-relevance density** — concentrate the strongest action verbs, the densest vacancy-keyword coverage, and the longest bullet list on the most recent and most vacancy-relevant work entry. Older or off-target entries should be terse (fewer bullets, shorter) or hidden via `isHidden`. Do not reorder by date — entry order is determined by `startDate`/`endDate`; this rule is about *content weight per entry*, not array position. *Why: ATS weight recent experience more; recruiters read top-down.*

### Mode Interaction Gate (block 4 content)

- **Conservative** mode relaxes/forbids:
  - Rules #1, #2, #4: do NOT add keywords or numbers absent from the source resume; only reuse what is already there.
  - Rule #6: act only through reorder/hide of existing skills — never add new ones.
  - Rule #8: rebalance bullet density only within existing entries (reword, hide); do NOT add new bullets or new work entries to amplify recency weight.
- **Conservative** mode preserves: #3 (action verbs — applies even when rewording existing bullets), #5 (anti-stuffing — universal), #7 (jobTitle — but tightened: only trivially close synonyms).
- **Aggressive** mode applies all eight rules in full, bounded by existing safety rules (no fabricated employers/schools/dates, NDA-marking for unverifiable details).

## What Stays Unchanged

- `getResumeOptimizationPrompt(resumeJson, vacancyJson, options)` signature.
- User-prompt construction (the function-level template literal): same blocks injected in the same order — `OPTIMIZATION_MODE_INSTRUCTIONS[mode]`, `WRITING_STYLE_INSTRUCTIONS[style]`, `CONTENT_LANGUAGE_INSTRUCTIONS[lang]`, then resume JSON, vacancy JSON, `CRITICAL INSTRUCTIONS` tail.
- JSON output schema: every field name, nesting, scoring formula (`Skills 40% / Experience 30% / Projects 15% / Education 10% / Other 5%`), `initialScore + sum(impacts)` semantics.
- Delta and merge rules: `__new__N` placeholders, merge-by-id, omit-unchanged, skill-reorder-only-changed.
- NDA semantics for new aggressive-mode entries (`employer = "NDA"`, empty `employerLink`/`projectTitleLink`, omit `school`).
- Hide-vs-delete (`isHidden: true`; entries are never deleted).
- HTML preservation in `description` fields.
- TypeScript exports and types.

## Acceptance Criteria

- ESLint and Prettier pass.
- TypeScript compiles; the `as const` literal type of `RESUME_OPTIMIZATION_SYSTEM_PROMPT` is preserved.
- System-prompt length grows by ≈30–40% (target ~110–120 lines vs current ~85).
- A single smoke run of the existing optimization service on a sample resume + vacancy produces a response whose JSON structure parses against the existing `ResumeOptimizationResult` type without errors.
- No file other than `src/openai/constants/prompts/resume-optimization.prompt.ts` is modified by this work.

## Implementation Notes for the Plan Phase

- Single-file edit. Suggest landing as one commit on the current feature branch.
- The four block headings (`### OUTPUT CONTRACT`, `### ATS RULES`, `### OPTIMIZATION MECHANICS`, `### MODE-AWARE CONSTRAINTS`) become the visible section markers inside the template literal.
- The eight ATS rules render as a numbered list inside `### ATS RULES`. Examples render as fenced code blocks (Markdown-style, kept as raw text inside the template literal — the LLM reads them, they are never rendered).
- Mode-interaction gate is appended at the top of `### MODE-AWARE CONSTRAINTS`, before the existing Conservative/Aggressive paragraphs, as a short explicit cross-reference to the eight rules.
- The current `### ANALYSIS REQUIREMENTS` heading moves under `### OUTPUT CONTRACT` as a subsection — same text, regrouped placement.
