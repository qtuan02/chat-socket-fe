# Provider Rules

Rules for `src/providers`.

This folder owns app-level providers, route guards, and lifecycle boundaries that coordinate app-wide side effects.

## Scope

- `chat-socket-provider.tsx` coordinates chat socket subscriptions and query cache updates.
- `protected-route.tsx` protects authenticated routes.
- `guest-route.tsx` redirects authenticated users away from guest-only routes.
- Providers may coordinate lifecycle, but should delegate detailed work to stores, services, hooks, or utilities.

## Provider Ownership

- Providers may coordinate app-level lifecycle.
- Providers should stay small and readable.
- Keep protocol details in services or stores.
- Keep heavy UI logic in feature templates/components.
- Keep reusable workflows in hooks.
- Do not turn providers into large business-logic containers.

## Side-Effect Rules

- Effects must clean up subscriptions, listeners, and timers.
- Effects must be safe under React StrictMode double mount.
- Effects must use validated ids and required auth/session state.
- Do not create subscriptions during render.
- Keep effect dependency arrays correct.
- Do not mirror query data into provider state unless there is a clear client-state reason.

## Socket Lifecycle Rules

- Do not create duplicate socket subscriptions.
- Socket provider code should use socket service helpers for subscriptions.
- Subscription cleanup must run when active conversation or client changes.
- Cleanup must call every unsubscribe function returned by socket service helpers.
- Do not subscribe to empty or draft conversation ids.
- Socket handlers must be idempotent because socket events, mutation responses, and refetches can duplicate data.
- `markAsSeen` style side effects must guard current user id, active conversation id, and sender identity to avoid self-message loops.
- Do not log raw socket payloads or private message content.

## Route Guard Rules

- Do not bypass route guards for protected screens.
- Preserve session-check behavior unless explicitly requested.
- Do not place API business logic directly in route guard components.
- Use centralized routes from `src/config/routes.ts`.
- Keep guard loading states simple and accessible.

## StrictMode Safety Rules

- Assume effects can mount, clean up, and mount again in development.
- Avoid one-way global mutations that cannot be safely repeated.
- Guard socket connection/subscription creation.
- Cleanup must tolerate already-disconnected or already-unsubscribed resources.
- If an effect intentionally uses a mutable ref to avoid duplicate work, document why it is safe under remount.

## Forbidden Provider Patterns

- Creating socket subscriptions during render.
- Missing cleanup for subscriptions/listeners/timers.
- Duplicating socket lifecycle logic already owned by stores/services.
- Heavy feature UI logic in providers.
- Bypassing `ProtectedRoute` or `GuestRoute`.
- Calling service APIs from providers unless it is truly app lifecycle behavior.
- Logging sensitive payloads from provider-level handlers.

## Provider Verification Checklist

- Follow the root verification matrix first.
- For route/config changes, run `bun run build`.
- Verify route guard behavior for protected and guest routes.
- Verify subscription cleanup when active conversation changes.
- Verify no duplicate subscriptions under StrictMode.
- Verify auth/session reset still clears relevant lifecycle state.
