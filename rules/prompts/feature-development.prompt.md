# Feature Development Prompt

Copy this prompt when you want Codex to build or update a feature.

```md
You are working in this chat frontend project.
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

Do not:
- [Things that must not change]
- Avoid broad refactors.
- Avoid new dependencies unless clearly needed.

## Data

Entities involved:
- [User / Conversation / Message / Participant / Attachment / etc.]

Behavior rules:
- [Rule 1]
- [Rule 2]
- [Validation, optimistic update, socket cleanup, reconnect behavior, etc.]

Required states:
- Loading
- Error
- Empty
- Success
- Disabled/submitting
- Mobile responsive

## Implementation Rules

- Keep `src/pages` thin. Pages should render templates from `src/features/<feature>/templates`.
- Put feature-only UI in `src/features/<feature>/components`.
- Put reusable app UI in `src/components/shared`.
- Put raw shadcn primitives in `src/components/ui`.
- Put API and socket functions in `src/services`.
- Put low-level clients in `src/libs`.
- Put reusable API hooks in `src/hooks/api`.
- Use Tailwind CSS and `cn` from `@/utils/cn`.
- Use TypeScript strictly and avoid `any`.
- Clean up socket listeners.
- Do not log tokens or private message payloads.

## Workflow

1. Inspect existing patterns first.
2. Tell me the files you plan to create/edit.
3. Implement the change.
4. Run:
   - `bun.cmd run check`
   - `bun.cmd run typecheck`
   - `bun.cmd run build` if UI/config/build behavior changed
5. Final answer: changed files, what works, verification result, and any assumption.
```
