# Feature Development Prompt

Copy this prompt when you want Codex to build or update a feature.

```md
You are working in this realtime chat frontend project.
Read `AGENTS.md` and the relevant files in `rules/` before editing.

## Task

Build/update:
[Feature or task name]

Goal:
[What should the user be able to do?]

Scope:
- [Pages/templates]
- [Components]
- [Hooks/stores/providers]
- [Services/API/socket events]
- [Routes/config, if needed]
- [Tests, if needed]

Do not:
- [Things that must not change]
- Avoid broad refactors.
- Avoid new dependencies unless clearly needed.

## Data

Entities involved:
- [User / Conversation / Message / Participant / Attachment / etc.]

Behavior rules:
- [Validation, optimistic update, socket cleanup, reconnect behavior, query invalidation, etc.]
- [Loading/error/empty/success/disabled states]
- [Mobile responsive and accessibility requirements]

## Implementation Rules

- Keep `src/pages` thin. Pages should render templates from `src/features/<feature>/templates`.
- Put feature-only UI and orchestration in `src/features/<feature>`.
- Put reusable app UI in `src/components/shared`.
- Put raw shadcn/ui primitives in `src/components/ui`.
- Put API and socket functions in `src/services`.
- Put low-level clients in `src/libs` or the established global socket store.
- Put reusable API hooks in `src/hooks/api`.
- Use TanStack Query for server state and Zustand only for client state.
- Use Tailwind CSS and `cn` from `@/utils/cn`.
- Use TypeScript strictly and avoid `any`.
- Clean up socket listeners and avoid duplicate subscriptions.
- Do not log tokens or private message payloads.

## Workflow

1. Inspect existing patterns first.
2. Tell me the files you plan to create/edit.
3. Implement the change.
4. Run:
   - `bun.cmd run check`
   - `bun.cmd run typecheck`
   - `bun.cmd run build` if UI/config/build behavior changed
   - relevant test scripts if they exist or you add tests
5. Final answer: changed files, what works, verification result, and any assumption.
```
