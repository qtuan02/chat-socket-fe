# Service Rules

These rules apply to `src/services`.

## Purpose

`src/services` contains HTTP and socket communication functions. Services own protocol details and stay framework-light. They must not contain React components or React hooks.

## HTTP Services

- Use configured clients from `src/libs`, such as the existing Axios client.
- Return typed data, not raw Axios responses, unless there is a clear reason.
- Keep request/response DTO mapping close to the service.
- Keep service modules grouped by domain.
- API hooks in `src/hooks/api` should call services from this folder.
- Normalize backend quirks before exposing app-wide types when practical.

Examples:

- `auth-service.ts`
- `user-service.ts`
- `conversation-service.ts`
- `message-service.ts`

## Socket Services

- Use socket client setup from `src/libs` or the established global socket store.
- Service functions may publish events, subscribe to events, parse payloads, and return cleanup functions.
- Keep event destinations centralized when possible.
- Return unsubscribe/cleanup functions for listeners.
- Do not bind UI state directly in services.
- Also follow `rules/realtime.md`.

Example shape:

```ts
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void,
) {
  const subscription = client.subscribe(
    buildConversationMessageTopic(conversationId),
    (frame) => {
      onMessage(parseMessageFrame(frame));
    },
  );

  return () => subscription.unsubscribe();
}
```

## Errors

- Throw normalized errors that UI code can display safely.
- Avoid leaking raw backend payloads through thrown messages.
- Do not swallow errors unless the caller has a documented fallback path.

## Avoid

- Do not import React components.
- Do not call hooks.
- Do not import from `pages`.
- Do not put Zustand store mutation logic here unless the service is explicitly designed as an adapter and the rule is documented.
- Do not log tokens, private messages, auth headers, or raw sensitive payloads.
