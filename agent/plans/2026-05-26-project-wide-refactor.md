# Plan: Project-Wide Refactor (Wave 1 + Wave 2)

> **Status:** Wave 1–3 committed (`859d6ae`, `914c161`, `6775345`).

## §1 · Pre-Flight

- [x] Preflight commit: agent rules migration (`9f389c6` / `a216c0d`)
- [x] GitNexus impact run on `useChatCurrentUserSection` (CRITICAL — approved refactor)
- [x] Rules loaded: architecture-cross-feature-isolation, architecture-data-flow, react-custom-hook-extraction

## §2 · Objective

Restore feature isolation and strict data-flow (Config → Service → Hook → Component) without changing API/type/query-key/socket contracts.

## §3 · File Manifest (Wave 1)

| Action | Path |
|--------|------|
| CREATE | `src/features/current-user/hooks/use-current-user-section.ts` |
| CREATE | `src/features/current-user/templates/current-user-profile-template.tsx` |
| CREATE | `src/features/current-user/templates/current-user-sidebar-section.tsx` |
| CREATE | `src/features/group/templates/group-details-section.tsx` |
| CREATE | `src/features/group/templates/create-group-dialog-container.tsx` |
| CREATE | `src/features/group/hooks/use-group-conversation-actions.ts` |
| CREATE | `src/features/group/hooks/use-create-group-dialog.ts` |
| CREATE | `src/features/group/hooks/use-group-member-picker.ts` |
| CREATE | `src/features/conversation/hooks/use-conversation-details-panel.ts` |
| CREATE | `src/features/conversation/hooks/use-conversation-sidebar.ts` |
| CREATE | `src/features/conversation/templates/conversation-sidebar-template.tsx` |
| CREATE | `src/features/auth/hooks/use-auth-session-success.ts` |
| CREATE | `src/features/auth/hooks/use-sign-in-flow.ts` |
| CREATE | `src/features/auth/hooks/use-sign-up-flow.ts` |
| CREATE | `src/components/shared/conversation-avatar.tsx` |
| DELETE | `src/features/chat/hooks/use-chat-current-user.ts` |
| DELETE | `src/features/chat/hooks/use-conversation-details-actions.ts` |
| DELETE | `src/features/chat/templates/chat-profile-template.tsx` |
| DELETE | `src/features/conversation/components/conversation-avatar.tsx` |
| MODIFY | `chat-template.tsx`, `chat-sidebar.tsx`, `chat-header.tsx`, `conversation-details-panel.tsx`, auth forms, group components, `auth.ts`, `use-session-check.ts` |

## §4 · Execution Steps (Wave 1)

### Phase 1A — current-user ↔ chat decoupling
- [x] Move hook + profile template to `current-user` feature
- [x] Update `chat-template` to consume public template

### Phase 1B — conversation ↔ group decoupling
- [x] `GroupDetailsSection` template + slot on `ConversationDetailsPanel`

### Phase 1C — orchestration relocation
- [x] Split into `useGroupConversationActions` + `useConversationDetailsPanel`
- [x] Delete `useConversationDetailsActions`

### Phase 1D — auth + session data-flow
- [x] Extract auth flow hooks; route session check through `refreshSessionOnce` in `hooks/api/auth`

### Phase 1E — group component data-flow
- [x] Extract `useCreateGroupDialog` + `useGroupMemberPicker`

### Phase 1F — sidebar/header decoupling
- [x] Promote `ConversationAvatar` to shared
- [x] `ConversationSidebarTemplate` + template-based sidebar composition

## §6 · Architecture Certification

- [x] No HTTP in components
- [x] No service imports in components/feature hooks
- [x] No cross-feature component imports in `conversation-details-panel`
- [x] No cross-feature component imports in `conversation-details-panel`
- [x] `chat-template` uses `ConversationDetailsPanelTemplate` (Wave 2)

## §7 · Verification (Wave 1)

- [x] `npx biome check src/`
- [x] `npx tsc --noEmit`
- [x] `gitnexus_detect_changes()`
- [x] Manual smoke test (2026-05-26 — `node scripts/smoke-test.mjs`, 11/11)

## Wave 2

### Phase 2A — thin routes + ChatTemplate split
- [x] `FriendsPage`, `ProfilePage` thin route wrappers
- [x] `ChatShellLayout` shared sidebar shell for non-chat routes
- [x] `ChatTemplate` route branching removed (friends/profile)
- [x] `ConversationDetailsPanelTemplate` composes group section

### Phase 2B — socket provider extraction
- [x] `useChatSocketSync` in chat feature
- [x] `chat-socket-provider` thinned to hook call

### Phase 2C — user-item friend cluster
- [x] Moved to `features/friends/components/`
- [x] Public surface: `features/friends/templates/user-item-template.tsx`
- [x] Consumers updated via template imports (chat, group, friends)

### Phase 2D — API view-model split
- [x] `mapConversationToUiModel` → `features/conversation/utils/`
- [x] `useConversationsView` wraps API hook + mapping
- [x] `mapMessageToUiModel` → `features/chat/utils/`
- [x] `useMessagesView` wraps API hook + mapping
- [x] `hooks/api/conversation.ts` and `message.ts` return raw query data only

## §7 · Verification (Wave 2)

- [x] `npx biome check src/`
- [x] `npx tsc --noEmit`
- [x] `gitnexus_detect_changes()` before commit
- [x] Manual smoke test (2026-05-26 — shared run with Wave 3)

## Wave 3

### Phase 3A — React 19 ref-as-prop
- [x] `Skeleton` — drop `forwardRef`, use `ref` prop
- [x] `CurrentUserTrigger` — drop `forwardRef`, use `ref` prop

### Phase 3B — Virtuoso footer extraction
- [x] `ConversationListLoadMoreFooter` extracted from inline Virtuoso `Footer`
- [x] Stable Virtuoso `components` reference via module-level slot

### Phase 3C — Named export conventions
- [x] `axiosClient` — named export from `@/libs/axios`
- [x] `useAuthStore` — named export (aligned with `useSocketStore`)

## §7 · Verification (Wave 3)

- [x] `npx biome check src/`
- [x] `npx tsc --noEmit`
- [x] Manual smoke test (2026-05-26 — shared run with Wave 2)

## Smoke test log (2026-05-26)

Automated via `scripts/smoke-test.mjs` against `localhost:3000` + backend `localhost:8089`.

| Check | Result |
|-------|--------|
| Backend health-check | PASS |
| Dev server index | PASS |
| Sign-in flow | PASS |
| Chat home `/` | PASS |
| Friends route `/friends` | PASS |
| Profile route `/profile` (mobile back bar) | PASS |
| CurrentUserTrigger dropdown (React 19 ref) | PASS |
| Friends template render | PASS |
| Session refresh (cookie-based) | PASS |
| Conversation route | SKIP (new user, no conversations) |
| Production build (`npm run build`) | PASS |

**Not covered:** Virtuoso infinite-scroll footer (needs existing conversations + scroll), group details panel, socket reconnect under disconnect.
