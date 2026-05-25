# Plan: Project-Wide Refactor (Wave 1)

> **Status:** Wave 1 executed 2026-05-26. Wave 2+ deferred.

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
- [ ] `chat-template` still imports `ConversationDetailsPanel` component (Wave 2: thin routes)

## §7 · Verification

- [ ] `npx biome check src/`
- [ ] `npx tsc --noEmit`
- [ ] `gitnexus_detect_changes()`
- [ ] Manual smoke test

## Wave 2 (deferred)

- Thin routes (`FriendsPage`, `ProfilePage`)
- `ChatTemplate` route split
- `chat-socket-provider` → chat feature hook
- `user-item-*` friend cluster move
- API hook view-model split (`conversation.ts`, `message.ts`)
