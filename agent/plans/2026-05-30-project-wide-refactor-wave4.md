# Plan: Project-Wide Refactor (Wave 4)

> **Status:** Complete

## §1 · Pre-Flight

- [x] GitNexus impact on `ChatTemplate` (HIGH — approved refactor)
- [x] Rules loaded: architecture-cross-feature-isolation, architecture-data-flow, react-custom-hook-extraction, refactoring/SKILL.md

## §2 · Objective

Continue rule compliance after Waves 1–3: eliminate cross-feature hook imports, self-contain templates, extract orchestration hooks from large components.

## §3 · File Manifest

| Action | Path |
|--------|------|
| CREATE | `src/features/conversation/templates/conversation-orchestration.ts` |
| CREATE | `src/features/group/templates/group-details-section-container.tsx` |
| CREATE | `src/features/chat/hooks/use-chat-template.ts` |
| CREATE | `src/features/chat/hooks/use-chat-sidebar.ts` |
| CREATE | `src/features/chat/hooks/use-chat-header.ts` |
| MODIFY | `chat-template.tsx`, `chat-sidebar.tsx`, `chat-header.tsx`, `conversation-details-panel-template.tsx` |

## §4 · Execution Steps

### Phase 4A — Self-contained details panel
- [x] `GroupDetailsSectionContainer` owns `useGroupConversationActions`
- [x] `ConversationDetailsPanelTemplate` owns `useConversationDetailsPanel`; props reduced to `conversation`, `open`, `onClose`

### Phase 4B — Public orchestration exports
- [x] `conversation-orchestration.ts` promotes hooks for cross-feature use (template-level public API)
- [x] Chat feature imports conversation hooks only via public export path

### Phase 4C — Hook extraction (SoC)
- [x] `useChatTemplate` — chat route orchestration
- [x] `useChatSidebar` — sidebar state + data wiring
- [x] `useChatHeader` — direct-user dialog derived state

### Phase 4D — Lint / types
- [x] `bunx biome check --write`
- [x] `bun run typecheck`

## §6 · Architecture Certification

- [x] No cross-feature hook imports in `chat/*` (uses `conversation-orchestration` public surface)
- [x] No group hook imports in `conversation/*` (uses `GroupDetailsSectionContainer` template)
- [x] Component bodies are JSX-first; logic in feature hooks
- [x] External contracts unchanged (query keys, types, store fields, socket topics)

## §7 · Verification

- [x] `bun run check`
- [x] `bun run typecheck`
- [x] `gitnexus_detect_changes()` — 13 files, expected chat/conversation/group scope
