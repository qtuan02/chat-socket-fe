# Service Rules

These rules apply to `src/services`.

## Purpose

`src/services` contains API and socket communication functions.

Services own server communication details. They should stay framework-light and must not contain React components or React hooks.

## HTTP Services

- Use configured clients from `src/libs`, such as `http-client.ts`.
- Return typed data, not raw Axios responses, unless there is a clear reason.
- Keep request/response mapping close to the service.
- Keep service modules grouped by domain.
- API hooks in `src/hooks/api` should call services from this folder.

Examples:

- `auth-service.ts`
- `user-service.ts`
- `chat-service.ts`

## Socket Services

- Use socket client setup from `src/libs/socket-client.ts`.
- Service functions may emit events, subscribe to events, and return cleanup functions.
- Keep event names centralized when possible.
- Return unsubscribe/cleanup functions for listeners.
- Do not bind UI state directly in services.

Example shape:

```ts
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void,
) {
  socket.on(`conversation:${conversationId}:message`, onMessage);

  return () => {
    socket.off(`conversation:${conversationId}:message`, onMessage);
  };
}
```

## Avoid

- Do not import React components.
- Do not call hooks.
- Do not import from `pages`.
- Do not put Zustand store mutation logic here unless the service is explicitly designed as an adapter and the rule is documented.
- Do not log tokens, private messages, or raw sensitive payloads.
