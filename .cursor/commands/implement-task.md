# Implement task — full pipeline

Run the full implementation pipeline for the task description provided by the user. The user's message after `/implement-task` is the **task description**. Do not assume anything beyond that; run the pipeline step by step.

## Pipeline order (sequential, foreground)

Execute these subagents **in this order**. Use **foreground** execution so each step completes and returns a result before the next starts. Pass the previous step's output (and any user answers) into the next subagent's prompt, since subagents do not see prior conversation.

### Step 1 — Clarify (PM)

Invoke the **senior-project-manager** subagent with the task description.

- Prompt it with: the user's task description and ask it to clarify scope, ask questions, and surface assumptions.
- **Stop and wait for the user** to answer the PM's clarifying questions in chat.
- Once the user has responded, treat their answers plus the PM's summary as the **clarified scope** for the next step.

### Step 2 — Plan (Architect)

Invoke the **senior-backend-architect** subagent with the clarified scope.

- In the prompt, include: the original task description, the PM's questions and summary, and the user's answers (clarified scope).
- Ask for: plan summary, architecture overview, and task breakdown with acceptance criteria and dependencies.
- Use the architect's output as the **plan** for the next step.

### Step 3 — Implement (Dev)

Invoke the **senior-backend-developer** subagent with the plan.

- In the prompt, include: the plan summary, architecture overview, and full task breakdown from the architect.
- Ask it to implement tasks in dependency order and to report what was done against the acceptance criteria.
- Use the developer's output (and any code/artifacts) as the **implementation result** for the next step.

### Step 4 — Test (QA)

Invoke the **manual-senior-qa** subagent with the scope and implementation summary.

- In the prompt, include: the clarified scope, what was implemented (from the developer), and the acceptance criteria.
- Ask for: test cases, exploratory focus areas, and release-readiness assessment.
- Summarize for the user what was tested and what remains or is at risk.

## Handoffs

- Each subagent gets a **clean prompt** that contains everything it needs: task/scope, previous step's output, and what you want from it.
- Do not skip steps. If the user says "skip PM" or "we already have a plan", you may start from the Architect step and state that you are doing so.
- After Step 1, do not proceed to Step 2 until the user has answered the PM's questions (unless the user explicitly says to use default assumptions and continue).

## Final output

After Step 4, give the user a short summary: what was clarified, what was planned, what was implemented, and what QA recommended. List any follow-ups or risks.
