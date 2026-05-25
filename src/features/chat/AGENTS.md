# Chat Feature Rules

Rules for `src/features/chat`.

This folder owns the chat workspace UI and chat-specific orchestration. It may compose conversation, friends, group, and current-user feature UI when the chat shell owns the screen layout.

## Ownership

- Keep chat screen orchestration in `templates/` and `hooks/`.
- Keep chat-only UI in `components/`.
- Keep message API calls in `src/services/message-service.ts`.
- Keep conversation API calls in `src/services/conversation-service.ts`.
- Keep reusable query hooks in `src/hooks/api`.
- Keep socket subscription helpers in `src/services/socket-service.ts`.
- Do not put route page files in this folder.

## Message Identity Rules

- Use stable server message `id` whenever available.
- Use `clientMessageId` only for designed optimistic/pending messages.
- Never use array index as a message key.
- `MessageList` and row rendering must key messages by `clientMessageId ?? id`.
- Dedupe messages by stable message id. If optimistic sends are added, dedupe by `clientMessageId` first, then server id.

## Message Ordering Rules

- Preserve server ordering and server timestamps.
- Do not rely on client timestamp for committed messages.
- Use client time only for temporary pending messages.
- Do not reorder pages by mutating cached query data.
- When reversing pages for display, copy arrays first.

## Message Dedupe Rules

- Socket event, mutation response, refetch, and reconnect replay can deliver the same message.
- Append only after checking existing ids.
- Preserve existing read receipt state when deduping.
- Keep dedupe logic close to query/cache helpers, not scattered in UI components.

## Infinite Scroll Rules

- Preserve infinite query page shape.
- Messages load older pages from the top.
- Do not reverse or mutate infinite query pages in place.
- Keep `firstItemIndex` logic stable for virtualized lists.
- Do not reset scroll position unless the active conversation changes.

## Virtualization Rules

- Keep long message lists virtualized with `react-virtuoso`.
- Keep conversation lists virtualized when they can grow.
- Keep virtualized row components lightweight.
- Avoid creating expensive objects/functions inside virtualized item renderers.
- Use stable keys for virtualized content.

## Composer State Rules

- Keep composer draft state local to the composer/chat workflow.
- Do not store composer drafts in query cache.
- Do not store one composer draft globally unless the user explicitly asks for cross-route persistence.
- Trim message content before sending.
- Prevent double submit with pending state or throttling.
- Restore content after failed send when retry is expected.

## Read Receipt Rules

- Server event and `markAsSeen` endpoint are source of truth.
- Do not mark a conversation seen for draft conversations.
- Do not mark a conversation seen without a valid conversation id.
- Do not mark a conversation seen for messages sent by the current user.
- Guard read receipt calls until current user identity is known.
- Deduplicate read receipts by user/message ids.
- Keep read receipt derivation memoized when based on message/member lists.

## Mobile Chat Layout Rules

- Preserve mobile route-like screen behavior.
- Keep the top back bar for conversation/profile/friends mobile views.
- Keep bottom nav behavior intact.
- Avoid fixed-height mobile layouts that hide the composer behind the keyboard.
- Verify desktop sidebar, message panel, details panel, and mobile chat screen after UI changes.

## Socket Event Safety Rules

- Do not put socket subscriptions in render.
- Do not create duplicate subscriptions.
- Effects that subscribe must clean up.
- Clean up both message and seen subscriptions when the active conversation changes.
- Subscription handlers must be idempotent.
- Do not subscribe to empty or draft conversation ids.
- Do not log private message content or raw socket payloads.

## Forbidden Chat Patterns

- Array index as message key.
- Mutating query pages in place.
- Storing full message history in Zustand.
- Socket subscriptions inside components without cleanup.
- Optimistic sends without client id, rollback, dedupe, failure state, and reconciliation.
- Logging message content.
- Hardcoding socket destinations in UI components.
- Breaking desktop/mobile chat layout boundaries.

## Chat Verification Checklist

- Follow the root verification matrix first.
- For UI changes, review desktop and mobile layouts.
- For message list changes, verify stable keys and virtualization.
- For cache changes, verify dedupe and infinite query shape.
- For socket changes, verify subscribe/unsubscribe behavior.
- For composer changes, verify disabled/pending/error behavior.
- For read receipt changes, verify own and other-user messages.
