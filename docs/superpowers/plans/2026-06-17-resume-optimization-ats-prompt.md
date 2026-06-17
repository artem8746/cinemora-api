# Resume Optimization Prompt — ATS-First Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `RESUME_OPTIMIZATION_SYSTEM_PROMPT` in `src/openai/constants/prompts/resume-optimization.prompt.ts` to an ATS-first four-block structure (OUTPUT CONTRACT / ATS RULES / OPTIMIZATION MECHANICS / MODE-AWARE CONSTRAINTS) with 8 enforced ATS practices and 3 inline bad→good micro-examples — without touching the handler, service, JSON contract, or types.

**Architecture:** Single-file edit to one exported constant. The constant remains a `as const` template literal of the same signature; only its body is reorganized and augmented. The `getResumeOptimizationPrompt(resumeJson, vacancyJson, options)` function, all TypeScript exports, the mode/style/language addenda blocks, and the JSON output schema are untouched. A new structural spec file next to the prompt asserts the post-rewrite shape — it is the TDD harness for this task. There is no LLM-call test; the smoke gate is `typecheck` + `lint` + the structural spec.

**Tech Stack:** TypeScript, Jest (ts-jest), ESLint, Prettier. Project scripts: `npm run test`, `npm run typecheck`, `npm run lint`, `npm run format`.

**Spec reference:** `docs/superpowers/specs/2026-06-17-resume-optimization-ats-prompt-design.md` (commit `6c0d7c3`).

**Unrelated working-tree state:** `src/openai/commands/parse-text-to-resume/parse-text-to-resume.handler.ts` and `src/openai/openai.service.ts` may carry uncommitted modifications from prior work. They are explicitly out of scope. If the pre-commit hook fails because of an unused `MOCK_RESPONSE` import in the handler (a known lint error from those unrelated changes), stash them before each commit step using `git stash push --keep-index -- src/openai/commands/parse-text-to-resume/parse-text-to-resume.handler.ts src/openai/openai.service.ts`, perform the commit, then `git stash pop`.

---

## File Structure

**Create:**
- `src/openai/constants/prompts/resume-optimization.prompt.spec.ts` — Jest unit spec that asserts the post-rewrite shape of `RESUME_OPTIMIZATION_SYSTEM_PROMPT` (presence of all four block headers, all 8 rule lead-phrases, the 3 bad→good example markers, the mode-interaction gate cross-references). Lives next to the prompt file so refactors keep them colocated.

**Modify:**
- `src/openai/constants/prompts/resume-optimization.prompt.ts` — replace the body of the `RESUME_OPTIMIZATION_SYSTEM_PROMPT` template literal (lines 7–85) with the new four-block layout. Imports, exports, `NEW_ENTRY_ID_PREFIX`, `OptimizationMode`, `WritingStyle`, `ContentLanguage`, `ResumeOptimizationOptions`, `WRITING_STYLE_INSTRUCTIONS`, `CONTENT_LANGUAGE_INSTRUCTIONS`, `OPTIMIZATION_MODE_INSTRUCTIONS`, and `getResumeOptimizationPrompt` are not touched.

**Do not touch:**
- Any other file in the repository.

---

### Task 1: Add structural spec asserting the post-rewrite prompt shape

**Files:**
- Create: `src/openai/constants/prompts/resume-optimization.prompt.spec.ts`

**Why TDD here:** there is no semantic test we can run on a prompt change without an LLM-call eval harness. The next-best objective gate is a structural spec that asserts the new prompt contains every named element from the design doc (block headers, rule lead-phrases, examples, mode-gate cross-references). It will fail until the prompt is rewritten in Task 2.

- [ ] **Step 1: Write the failing spec**

Create `src/openai/constants/prompts/resume-optimization.prompt.spec.ts` with this exact content:

```typescript
import { RESUME_OPTIMIZATION_SYSTEM_PROMPT } from './resume-optimization.prompt';

describe('RESUME_OPTIMIZATION_SYSTEM_PROMPT', () => {
  const prompt = RESUME_OPTIMIZATION_SYSTEM_PROMPT;

  describe('four-block structure', () => {
    it('contains the OUTPUT CONTRACT block header', () => {
      expect(prompt).toContain('### OUTPUT CONTRACT');
    });

    it('contains the ATS RULES block header', () => {
      expect(prompt).toContain('### ATS RULES');
    });

    it('contains the OPTIMIZATION MECHANICS block header', () => {
      expect(prompt).toContain('### OPTIMIZATION MECHANICS');
    });

    it('contains the MODE-AWARE CONSTRAINTS block header', () => {
      expect(prompt).toContain('### MODE-AWARE CONSTRAINTS');
    });

    it('orders the blocks OUTPUT CONTRACT → ATS RULES → OPTIMIZATION MECHANICS → MODE-AWARE CONSTRAINTS', () => {
      const oc = prompt.indexOf('### OUTPUT CONTRACT');
      const ar = prompt.indexOf('### ATS RULES');
      const om = prompt.indexOf('### OPTIMIZATION MECHANICS');
      const mc = prompt.indexOf('### MODE-AWARE CONSTRAINTS');
      expect(oc).toBeGreaterThan(-1);
      expect(ar).toBeGreaterThan(oc);
      expect(om).toBeGreaterThan(ar);
      expect(mc).toBeGreaterThan(om);
    });
  });

  describe('ATS RULES content', () => {
    it.each([
      ['Exact keyword match'],
      ['Acronym + spelled-out form'],
      ['Action verbs first'],
      ['Quantification where credible'],
      ['Anti-stuffing'],
      ['Skill–vacancy priority order'],
      ['JobTitle alignment'],
      ['Recency-and-relevance density'],
    ])('lists ATS rule lead-phrase %s', (phrase) => {
      expect(prompt).toContain(phrase);
    });
  });

  describe('bad→good micro-examples', () => {
    it('includes the Responsible-for action-verb example', () => {
      expect(prompt).toContain('Responsible for the frontend team');
      expect(prompt).toContain('Led a 6-engineer frontend team');
    });

    it('includes the page-load quantification example', () => {
      expect(prompt).toContain('Improved page load performance significantly');
      expect(prompt).toContain('Cut median page load from 4.2s to 1.6s');
    });

    it('includes the React anti-stuffing example', () => {
      expect(prompt).toContain('React, React.js, ReactJS, React Hooks');
      expect(prompt).toContain('Built SPA on React (Hooks + Router + Query)');
    });
  });

  describe('mode-interaction gate', () => {
    it('places a mode-interaction gate at the top of MODE-AWARE CONSTRAINTS', () => {
      const mc = prompt.indexOf('### MODE-AWARE CONSTRAINTS');
      const gate = prompt.indexOf('Mode-interaction gate');
      expect(mc).toBeGreaterThan(-1);
      expect(gate).toBeGreaterThan(mc);
    });

    it('the gate cross-references the rules conservative relaxes (#1, #2, #4, #6, #8)', () => {
      const mc = prompt.indexOf('### MODE-AWARE CONSTRAINTS');
      const tail = prompt.slice(mc);
      expect(tail).toMatch(/#1/);
      expect(tail).toMatch(/#2/);
      expect(tail).toMatch(/#4/);
      expect(tail).toMatch(/#6/);
      expect(tail).toMatch(/#8/);
    });
  });

  describe('preserved invariants from the old prompt', () => {
    it('keeps the strict-JSON output rule', () => {
      expect(prompt).toContain('Output **ONLY valid JSON**');
    });

    it('keeps the STRICT DELTA RULE', () => {
      expect(prompt).toContain('STRICT DELTA RULE');
    });

    it('keeps the __new__ placeholder convention', () => {
      expect(prompt).toContain('__new__1');
    });

    it('keeps the scoring formula', () => {
      expect(prompt).toContain('Skills 40%, Experience 30%, Projects 15%, Education 10%, Other 5%');
    });

    it('keeps the merge-by-id semantics line', () => {
      expect(prompt).toContain('backend merges by entry id');
    });
  });
});
```

- [ ] **Step 2: Run the spec to verify it fails**

Run:
```bash
npm run test -- resume-optimization.prompt.spec.ts
```

Expected: multiple FAIL — the existing prompt has `### CRITICAL OUTPUT RULES`, `### OPTIMIZATION RULES`, `### ANALYSIS REQUIREMENTS`, `### CONTENT CHANGES`, `### OUTPUT JSON STRUCTURE`, but none of `### OUTPUT CONTRACT`, `### ATS RULES`, `### OPTIMIZATION MECHANICS`, `### MODE-AWARE CONSTRAINTS`, no rule lead-phrases, no examples, no mode gate. The "preserved invariants" group will PASS (those substrings already exist).

- [ ] **Step 3: Commit the failing spec**

Stash unrelated working-tree changes if present, commit, then restore:
```bash
if ! git diff --quiet -- src/openai/commands/parse-text-to-resume/parse-text-to-resume.handler.ts src/openai/openai.service.ts; then
  git stash push --keep-index -m "wip: unrelated handler/service" -- src/openai/commands/parse-text-to-resume/parse-text-to-resume.handler.ts src/openai/openai.service.ts
  STASHED=1
else
  STASHED=0
fi
git add src/openai/constants/prompts/resume-optimization.prompt.spec.ts
git commit -m "test: add structural spec for resume optimization prompt rewrite

Asserts the post-rewrite shape: four block headers in order, eight ATS rule
lead-phrases, three bad→good examples, mode-interaction gate, and the
preserved invariants from the old prompt. Fails on current prompt as
expected — turns green after the rewrite in the next commit.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
if [ "$STASHED" = "1" ]; then git stash pop; fi
```

---

### Task 2: Rewrite `RESUME_OPTIMIZATION_SYSTEM_PROMPT` body to the four-block layout

**Files:**
- Modify: `src/openai/constants/prompts/resume-optimization.prompt.ts` — replace lines 7–85 (the body of the `RESUME_OPTIMIZATION_SYSTEM_PROMPT` template literal, between the opening `` ` `` and closing `` ` `` of the `as const` literal).

**Approach:** atomic swap of the prompt body. The new body is shown in full in Step 1. Everything outside the template literal — imports, `NEW_ENTRY_ID_PREFIX`, all type exports, the mode/style/language records, and `getResumeOptimizationPrompt` — stays exactly as is.

- [ ] **Step 1: Replace the prompt body**

In `src/openai/constants/prompts/resume-optimization.prompt.ts`, locate the existing constant:

```typescript
export const RESUME_OPTIMIZATION_SYSTEM_PROMPT =
  `You are an expert ATS (Applicant Tracking System) optimizer and career advisor. Your task is to optimize a candidate's resume for a specific job vacancy to maximize ATS pass rate and recruiter engagement.

### CRITICAL OUTPUT RULES
... existing body through the closing backtick ...
}` as const;
```

Replace the entire constant (from `export const RESUME_OPTIMIZATION_SYSTEM_PROMPT =` through the closing `` ` as const;``) with:

```typescript
export const RESUME_OPTIMIZATION_SYSTEM_PROMPT =
  `You are an expert ATS (Applicant Tracking System) optimizer and career advisor. Your task is to optimize a candidate's resume for a specific job vacancy to maximize ATS pass rate and recruiter engagement.

### OUTPUT CONTRACT
- Output **ONLY valid JSON** matching the specified response structure.
- Do NOT add comments, explanations, markdown, or code blocks.
- Do NOT wrap the JSON in markdown code blocks.
- All scores must be integers between 0 and 100.
- ALL fields must be filled — never return empty arrays or zero scores unless truly no match exists.
- Return **ONLY changed fields** in suggestedContent — omit any section or entry that was not modified. Use the EXACT same field names and nesting as the input resume.
- **STRICT DELTA RULE**: If an entry's content is identical to the original resume, do NOT include it in suggestedContent. This applies to ALL sections including skills. Only include entries where at least one field value differs from the original, or entries whose position changed (for ordered sections like skills). If no entries in a section changed, omit that section entirely.

#### Analysis Requirements
1. **Initial Scores** — Calculate initialAtsScore and initialMatchScore based on the ORIGINAL resume as-is (before any optimization). These reflect the current state. Score formula: Skills 40%, Experience 30%, Projects 15%, Education 10%, Other 5%.
2. **Key Skills Match** — Extract key skills from the vacancy. For each: "match" | "partial" | "missing". Analyze at least the top 5-10 skills.
3. **Strengths** — 3-5 specific strengths.
4. **Improvements** — 3-5 actionable recommendations.
5. **Section Changes** — For each modified section: summary and entryChanges[] where each entry has:
   - entryId: matching an entry id from suggestedContent
   - description: explaining the impact of the change (do NOT repeat the suggested text — explain WHY and HOW the change improves the resume)
   - atsScoreImpact: integer points this specific change adds to ATS score (can be negative for hiding)
   - matchScoreImpact: integer points this specific change adds to Match score (can be negative for hiding)
   The client computes final scores as initialScore + sum(all impacts), so ensure each impact value is realistic and proportional.

#### Content Changes (delta — same field names as resume)
Include in suggestedContent ONLY what changed. Omit a key entirely if nothing changed there. Field names and nesting MUST exactly match the input resume structure.
- personalDetails: include only changed keys (e.g. { "jobTitle": "...", "fullName": "..." }). Field names: phone, photo, social, address, fullName, jobTitle, detailsOrder, displayEmail.
- content.<section>.entries: array of only changed or added entries (each entry must include ALL fields for its type). Section key names match the input: profile, work, skill, project, education.
  - profile entry fields: id, text, isHidden.
  - work entry fields: id, employer, jobTitle, location, startDate, endDate, description, employerLink, isHidden.
  - skill entry fields: id, skill, infoHtml, isHidden. **IMPORTANT**: Only include skill entries where content actually changed (skill name, infoHtml, or isHidden differs from original) or that are newly added. Do NOT include skills just because they exist — unchanged skills must be omitted. If you want to reorder skills, include ONLY the skills whose position changed along with a note in sectionChanges.
  - project entry fields: id, projectTitle, projectTitleLink, subTitle, startDate, endDate, description, isHidden.
  - education entry fields: id, degree, school, schoolLink, location, startDate, endDate, description, isHidden.
- customization.sectionOrder: include only if section order changed (full array).

Merge semantics: backend merges by entry id (replace existing, append new). For ALL sections including skills, only send entries that actually changed. Do NOT send the full list just for reordering — only include entries with changed content or position.

#### Output JSON Structure
{
  "analysis": {
    "initialAtsScore": 52,
    "initialMatchScore": 45,
    "keySkillsMatch": [{ "skill": "React", "status": "match", "message": "Strongly demonstrated" }],
    "strengths": ["..."],
    "improvements": ["..."]
  },
  "suggestedContent": {
    "personalDetails": { "jobTitle": "Senior Frontend Engineer" },
    "content": {
      "profile": { "entries": [{ "id": "existing-uuid-or-__new__1", "text": "...", "isHidden": false }] },
      "work": { "entries": [{ "id": "existing-uuid-or-__new__2", "employer": "...", "jobTitle": "...", "location": "...", "startDate": "...", "endDate": "...", "description": "...", "employerLink": "...", "isHidden": false }] },
      "skill": { "entries": [{ "id": "only-changed-skill-id", "skill": "React", "infoHtml": "", "isHidden": false }] },
      "project": { "entries": [{ "id": "existing-uuid-or-__new__4", "projectTitle": "...", "projectTitleLink": "...", "subTitle": "...", "startDate": "...", "endDate": "...", "description": "...", "isHidden": false }] },
      "education": { "entries": [{ "id": "existing-uuid-or-__new__5", "degree": "...", "school": "...", "schoolLink": "...", "location": "...", "startDate": "...", "endDate": "...", "description": "...", "isHidden": false }] }
    },
    "customization": { "sectionOrder": ["profile", "work", "skill", "project", "education"] }
  },
  "sectionChanges": {
    "personalDetails": { "summary": "...", "entryChanges": [{ "entryId": "jobTitle", "description": "...", "atsScoreImpact": 3, "matchScoreImpact": 2 }] },
    "profile": { "summary": "...", "entryChanges": [{ "entryId": "existing-uuid-or-__new__1", "description": "Explains impact", "atsScoreImpact": 5, "matchScoreImpact": 4 }] },
    "work": { "summary": "...", "entryChanges": [{ "entryId": "hidden-entry-id", "description": "Hidden: irrelevant to target role", "atsScoreImpact": 2, "matchScoreImpact": 1 }] }
  }
}

### ATS RULES
These eight practices define the quality bar of an ATS-optimized resume. Apply every rule that the active mode permits (see MODE-AWARE CONSTRAINTS).

1. **Exact keyword match** — use vacancy terms in the exact phrasing the vacancy uses (e.g. "React.js" if the vacancy says "React.js", not "React"). *Why: ATS keyword matchers are literal; near-synonyms often miss.*
2. **Acronym + spelled-out form** — when a hard skill has both forms, include both at least once (e.g. "Search Engine Optimization (SEO)"). *Why: ATS parsers may key on either; recruiters scan the spelled form.*
3. **Action verbs first** — every work/project bullet must start with a strong past-tense action verb (led, built, shipped, migrated, owned, reduced…). *Why: weak openings ("Responsible for…") signal low ownership and rank poorly.*
   - bad: "Responsible for the frontend team and delivery of features."
   - good: "Led a 6-engineer frontend team; shipped 4 product features across 2 quarters under a fixed deadline."
4. **Quantification where credible** — prefer concrete numbers, %, scale, throughput, or time-to-X when they exist in the source. Do NOT invent. *Why: quantified bullets pass both ATS scoring heuristics and recruiter skim; fabricated numbers destroy trust if uncovered.*
   - bad: "Improved page load performance significantly."
   - good: "Cut median page load from 4.2s to 1.6s by lazy-loading above-the-fold assets and inlining critical CSS." (only if 4.2s/1.6s appear in source resume — never invent)
5. **Anti-stuffing** — keywords must read naturally in context. No comma-separated keyword dumps, no repeating the same term in adjacent bullets just to inflate density. *Why: modern ATS flag stuffing; recruiters discard obvious spam.*
   - bad: "Used React, React.js, ReactJS, React Hooks, React Components, React Router, React Query for frontend development."
   - good: "Built SPA on React (Hooks + Router + Query) — owned state layer and data-fetching architecture."
6. **Skill–vacancy priority order** — when reordering skills, visible skills (isHidden: false) lead the array sorted by vacancy fit: must-haves, then nice-to-haves, then the rest. Hidden skills (isHidden: true) follow the visible block; their internal order is irrelevant. *Why: ATS often weight position; recruiters skim the first 5–8 skills.*
7. **JobTitle alignment** — adjust personalDetails.jobTitle toward the vacancy's title only when it remains truthful for the candidate's actual seniority and domain (no Senior→Staff jumps, no domain shifts). *Why: title match is one of the strongest ATS signals; lying gets filtered downstream at the interview.*
8. **Recency-and-relevance density** — concentrate the strongest action verbs, the densest vacancy-keyword coverage, and the longest bullet list on the most recent and most vacancy-relevant work entry. Older or off-target entries should be terse (fewer bullets, shorter) or hidden via isHidden. Do not reorder by date — entry order is determined by startDate/endDate; this rule is about content weight per entry, not array position. *Why: ATS weight recent experience more; recruiters read top-down.*

### OPTIMIZATION MECHANICS (apply according to mode)
1. **DO NOT fabricate** employers, companies, schools, or dates that don't exist. In aggressive mode you MAY add plausible entries inferred from context; in conservative mode do NOT add new entries. When adding new entries in aggressive mode, mark any unverifiable details as NDA: set employer to "NDA", leave employerLink and projectTitleLink empty, and omit school names. This applies to any detail that cannot be confirmed from the original resume.
2. **Hiding irrelevant entries**: You MAY hide entries that are irrelevant to the target vacancy and waste space by setting "isHidden": true. This is preferred over keeping irrelevant content visible. Include the hidden entry in suggestedContent with its id and isHidden: true (other fields can stay the same). Add a corresponding entryChange explaining why hiding this entry improves the resume.
3. **DO NOT delete** any entries — only reword, reorder, hide, and enhance existing content (and in aggressive mode, add new entries where allowed).
4. **Preserve structural fields** for existing entries: id, dates, links. Keep the same "id" for existing entries so the frontend can match original vs optimized. New entries MUST use sequentially numbered placeholders as their "id": "__new__1", "__new__2", "__new__3", etc. — do NOT generate UUIDs. Use the SAME placeholder in both suggestedContent entry "id" and sectionChanges entryChanges "entryId" to link them.
5. **Preserve HTML formatting** in description fields (<ul><li>, <p>, <strong>, etc.).
6. **Reword** profile/summary to target the role and incorporate vacancy keywords (apply ATS rules #1, #2, #5).
7. **Reorder skills** to prioritize vacancy-relevant ones first (apply ATS rule #6; in suggestedContent.content.skill.entries list only the reordered/changed entries).
8. **Enhance work experience** bullet points with relevant keywords without changing meaning (apply ATS rules #3, #4, #5, #8).
9. **Adjust jobTitle** in personalDetails only when it better matches the target role (apply ATS rule #7).
10. **sectionOrder**: include in suggestedContent.customization only if you reorder sections.

### MODE-AWARE CONSTRAINTS
**Mode-interaction gate (which ATS rules each mode relaxes):**
- Conservative relaxes #1, #2, #4: do NOT add keywords, acronyms, or numbers absent from the source resume; only reuse what is already there.
- Conservative restricts #6 to reorder/hide of existing skills — never add new ones.
- Conservative restricts #8 to rebalancing bullet density within existing entries (reword, hide); do NOT add new bullets or new work entries to amplify recency weight.
- Conservative preserves #3 (action verbs — applies even when rewording existing bullets), #5 (anti-stuffing — universal), #7 (jobTitle — tightened: only trivially close synonyms).
- Aggressive applies all eight rules in full, bounded by the no-fabrication safety rules in OPTIMIZATION MECHANICS.

**Conservative:** Only reword/reorder existing content. Do NOT add new skills, work entries, projects, or education. You MAY hide irrelevant entries (isHidden: true). Include in suggestedContent only the sections and entries you actually changed or hid.

**Aggressive:** May add plausible skills, work experience bullets, or project/education entries that are clearly implied by existing content or that best fit the vacancy. You MAY hide irrelevant entries (isHidden: true). New entries MUST use sequentially numbered "__new__1", "__new__2", etc. as their "id" — use the same placeholder in suggestedContent and sectionChanges. For any new entry, set unverifiable details under NDA: employer → "NDA", employerLink → "", projectTitleLink → "", school → omit. Only use real names/links if they already appear in the resume. Include in suggestedContent every section you changed, hid, or added new entries to.` as const;
```

Notes for the executor:
- The opening line (`You are an expert ATS…`) is preserved verbatim.
- The four `### …` headers replace the previous five (`### CRITICAL OUTPUT RULES`, `### OPTIMIZATION RULES`, `### ANALYSIS REQUIREMENTS`, `### CONTENT CHANGES`, `### OUTPUT JSON STRUCTURE`).
- `### OUTPUT CONTRACT` absorbs the contents of the old `CRITICAL OUTPUT RULES`, `ANALYSIS REQUIREMENTS`, `CONTENT CHANGES`, and `OUTPUT JSON STRUCTURE` sections via `####` sub-headers.
- `### ATS RULES` is new.
- `### OPTIMIZATION MECHANICS` replaces the old `### OPTIMIZATION RULES` header verbatim in content (rules 1–10), with `(apply ATS rule #X)` cross-references appended to rules 6/7/8/9 to bind mechanics to ATS practices.
- `### MODE-AWARE CONSTRAINTS` opens with the new mode-interaction gate paragraph, then preserves the original `**Conservative:**` and `**Aggressive:**` paragraphs.
- The closing `` ` as const;`` syntax is preserved.

- [ ] **Step 2: Run the structural spec to verify it passes**

Run:
```bash
npm run test -- resume-optimization.prompt.spec.ts
```

Expected: all groups PASS — `four-block structure` (5 specs), `ATS RULES content` (8 specs), `bad→good micro-examples` (3 specs), `mode-interaction gate` (2 specs), `preserved invariants from the old prompt` (5 specs). 23 specs total, all green.

- [ ] **Step 3: Run typecheck**

Run:
```bash
npm run typecheck
```

Expected: no output (tsc exit 0). The `as const` literal type of the constant is preserved; no other module reads its narrow type, so consumers compile unchanged.

- [ ] **Step 4: Run lint and format on the changed file**

Run:
```bash
npx prettier --write src/openai/constants/prompts/resume-optimization.prompt.ts src/openai/constants/prompts/resume-optimization.prompt.spec.ts
npx eslint src/openai/constants/prompts/resume-optimization.prompt.ts src/openai/constants/prompts/resume-optimization.prompt.spec.ts --fix
```

Expected: no errors. Prettier may reformat indentation inside the template literal — that is fine; the structural spec doesn't pin whitespace.

- [ ] **Step 5: Re-run the structural spec after format/lint**

Run:
```bash
npm run test -- resume-optimization.prompt.spec.ts
```

Expected: still 23 PASS. Re-run because Prettier could in principle reflow long lines; the spec uses substring assertions so it tolerates whitespace changes — but verify.

- [ ] **Step 6: Commit**

Stash unrelated working-tree changes if present, commit, then restore:
```bash
if ! git diff --quiet -- src/openai/commands/parse-text-to-resume/parse-text-to-resume.handler.ts src/openai/openai.service.ts; then
  git stash push --keep-index -m "wip: unrelated handler/service" -- src/openai/commands/parse-text-to-resume/parse-text-to-resume.handler.ts src/openai/openai.service.ts
  STASHED=1
else
  STASHED=0
fi
git add src/openai/constants/prompts/resume-optimization.prompt.ts
git commit -m "feat: restructure resume-optimization prompt to ATS-first layout

Reorganizes RESUME_OPTIMIZATION_SYSTEM_PROMPT into four thematic blocks
(OUTPUT CONTRACT / ATS RULES / OPTIMIZATION MECHANICS / MODE-AWARE
CONSTRAINTS), adds an explicit ATS RULES block of 8 enforced practices
with one-line rationales, embeds 3 bad→good micro-examples under rules
#3/#4/#5, and adds a mode-interaction gate that cross-references which
ATS rules conservative mode relaxes. Output JSON schema, mode/style/
language addenda, getResumeOptimizationPrompt signature, all TypeScript
exports, and the handler/service surface are unchanged.

Spec: docs/superpowers/specs/2026-06-17-resume-optimization-ats-prompt-design.md

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
if [ "$STASHED" = "1" ]; then git stash pop; fi
```

---

### Task 3: Acceptance gates and final verification

**Files:**
- Touch: none (verification only).

- [ ] **Step 1: Run the full test suite**

Run:
```bash
npm run test
```

Expected: all suites PASS. The new `resume-optimization.prompt.spec.ts` adds 23 specs. No other suite touches the prompt constant; no regressions expected.

- [ ] **Step 2: Run typecheck**

Run:
```bash
npm run typecheck
```

Expected: clean exit. Confirms the `as const` literal type is preserved and no consumer of the constant broke.

- [ ] **Step 3: Run lint**

Run:
```bash
npm run lint
```

Expected: 0 errors. Pre-existing warnings (unsafe-any in `puppeteer-pdf-generator.service.ts`, `vacancy-data.dto.ts`, `fastify-file.interceptor.ts`) are out of scope. If the `'MOCK_RESPONSE' is assigned a value but never used` error appears, it is from the unrelated working-tree change to `parse-text-to-resume.handler.ts` — not introduced by this task. Note it in the final report; do not fix it.

- [ ] **Step 4: Verify prompt length is within target**

Run:
```bash
awk '/^export const RESUME_OPTIMIZATION_SYSTEM_PROMPT/,/^\} as const;$/' src/openai/constants/prompts/resume-optimization.prompt.ts | wc -l
```

Expected: approximately 100–130 lines (spec target: ~110–120 lines, +30–40% over the previous ~85). Treat this as a sanity check, not a hard gate — Prettier formatting may shift the count by ±10. If the count is wildly outside this range (e.g. <80 or >160), inspect for accidental content loss or duplication before declaring done.

- [ ] **Step 5: Verify scope discipline**

Run (the two commits added by Tasks 1 and 2 are the last two on this branch):
```bash
git diff --stat HEAD~2..HEAD
```

Expected: exactly two files changed —
```
src/openai/constants/prompts/resume-optimization.prompt.ts        | ~50 +-
src/openai/constants/prompts/resume-optimization.prompt.spec.ts   | ~80 +
```
If any other source file appears, abort and investigate before merging.

- [ ] **Step 6: Done**

No additional commit. Report:
- Two commits added to `feat/869dq9xf5-optimize-resume-optimization-prompt` (test, then implementation).
- Spec file `docs/superpowers/specs/2026-06-17-resume-optimization-ats-prompt-design.md` (committed earlier as `6c0d7c3`) is the source of truth.
- Unrelated working-tree changes in `src/openai/commands/parse-text-to-resume/parse-text-to-resume.handler.ts` and `src/openai/openai.service.ts` remain uncommitted and untouched.

---

## Plan Self-Review Notes

- Spec coverage: every section of the design doc maps to a task.
  - Four-block structure → Task 1 (assertions) + Task 2 (implementation).
  - 8 ATS rules → Task 1 `it.each` block + Task 2 prompt body.
  - 3 micro-examples → Task 1 example assertions + Task 2 prompt body.
  - Mode-interaction gate → Task 1 gate assertions + Task 2 MODE-AWARE CONSTRAINTS opening.
  - Preserved invariants (JSON contract, delta rules, scoring formula, `__new__` placeholders, merge semantics) → Task 1 "preserved invariants" block + Task 2 OUTPUT CONTRACT block.
  - Single-file edit + no handler/service/types/tests touches → Task 3 Step 5 (git diff scope check).
  - Length target ~110–120 lines → Task 3 Step 4.
- Placeholder scan: no TBD/TODO/"similar to"/"add appropriate" patterns; every code/command step shows the actual content or command.
- Type consistency: the structural spec uses substring assertions only; no TS types are introduced beyond importing the existing exported constant. The constant's `as const` type is preserved.
- Out-of-scope guard: the unrelated handler/service working-tree changes are called out in the header and at every commit step with the exact stash command.
