## Project
- Name: `chat-socket-fe`.
- Purpose: realtime chat frontend for authenticated users. Main flows include sign in, sign up, session refresh, conversation list, direct message draft, group chat, message list/composer, read receipts, friend list/request management, group member management, and current-user profile.
- Frontend type: responsive web app / chat workspace. It is not an admin portal, landing page, public marketing site, or mobile-native app. It behaves like a desktop chat app with mobile web layouts.
- Main users: signed-in chat users who message friends or groups.
- Current status: production status is not confirmed from source. The repo has `vercel.json`, `dist/`, and production build scripts, but no deployment evidence or release metadata in source.
- Long-term maintenance: no explicit source policy found. The current code is structured for maintenance with feature folders, services, hooks, shared types, and reusable UI primitives.

## Tech stack
- Framework: React `^19.2.6`.
- Routing: React Router `^7.15.0`, SPA routes in `src/app.tsx` and route constants in `src/config/routes.ts`.
- Language: TypeScript `^6.0.3`.
- Build tool: Rsbuild `^2.0.5` with Rspack through Rsbuild, React plugin `@rsbuild/plugin-react`.
- UI library: Tailwind CSS `^4.3.0`, shadcn/Radix-style primitives in `src/components/ui`, `radix-ui`, `lucide-react`, `sonner`, `react-virtuoso`, `emoji-mart`.
- State management: TanStack Query `^5.100.10` for server state, Zustand `^5.0.13` for auth/socket client state, local React state for UI workflows.
- API client: Axios `^1.16.1`, configured in `src/libs/axios.ts`.
- Realtime: STOMP/WebSocket via `@stomp/stompjs`.
- Form/validation: React Hook Form `^7.75.0` with Zod `^4.4.3` for auth and group dialogs. Profile edit currently uses controlled React state without a Zod schema.
- Package manager/runtime: Bun. `package.json` requires Bun `>=1.2.3` and Node `>=22.21.0`.
- i18n: not present. UI copy is mostly English.
- Theme/dark mode: CSS tokens include `.dark`, but no theme toggle or persisted theme setting is implemented.

## Structure
FE is at repo root. This is a single app repo, not a monorepo.

```text
chat-socket-fe/
  .env.template
  .gitignore
  .nvmrc
  biome.json
  bun.lock
  components.json
  package.json
  postcss.config.mjs
  public/
    banner-content.jpg
    banner-login.jpg
    favicon.png
  rsbuild.config.ts
  src/
    app.tsx
    env.d.ts
    globals.css
    index.tsx
    components/
      shared/
        detail-field.tsx
        user-item-action-button.tsx
        user-item-avatar.tsx
        user-item-dialog.tsx
        user-item-helpers.tsx
        user-item.tsx
      ui/
        avatar.tsx
        button.tsx
        card.tsx
        dialog.tsx
        dropdown-menu.tsx
        field.tsx
        input.tsx
        label.tsx
        separator.tsx
        sheet.tsx
        skeleton.tsx
        textarea.tsx
    config/
      constant.ts
      env.ts
      routes.ts
    features/
      auth/
        components/
        templates/
        types/
      chat/
        components/
          content/
          mobile/
          sidebar/
          skeleton/
        hooks/
        templates/
      conversation/
        components/
      current-user/
        components/
      friends/
        components/
        hooks/
        templates/
      group/
        components/
    hooks/
      api/
      use-debounce.ts
      use-session-check.ts
      use-throttle.ts
    libs/
      axios.ts
      query-client.ts
      query-key-factory.ts
    pages/
      chat-page.tsx
      sign-in-page.tsx
      sign-up-page.tsx
    providers/
      chat-socket-provider.tsx
      guest-route.tsx
      protected-route.tsx
    services/
      auth-service.ts
      conversation-service.ts
      friend-service.ts
      health-service.ts
      message-service.ts
      socket-service.ts
      user-service.ts
    stores/
      useAuthStore.ts
      useSocketStore.ts
    types/
      auth.ts
      base.ts
      conversation.ts
      friend-status.ts
      friend.ts
      message.ts
      user.ts
    utils/
      cn.ts
      conversation.ts
      date.ts
      display.ts
      error.ts
      string.ts
  tsconfig.json
  vercel.json
```

- Main folders:
  - `src/pages`: thin route page components.
  - `src/features`: product feature modules.
  - `src/components/ui`: low-level shadcn/Radix-style primitives.
  - `src/components/shared`: reusable app-specific UI.
  - `src/hooks/api`: TanStack Query hooks.
  - `src/services`: REST and socket service functions.
  - `src/libs`: Axios, QueryClient, query key helpers.
  - `src/stores`: Zustand stores.
  - `src/types`: shared API/domain contracts.
  - `src/config`: routes, env, constants.
- Generated / do not edit manually:
  - `node_modules/`
  - `dist/`
  - `bun.lock` should be changed through Bun dependency commands, not hand-edited.
- Import alias: `@/*` maps to `src/*` in `tsconfig.json` and `rsbuild.config.ts`. shadcn aliases are also configured in `components.json`.

## Commands
- install: `bun install`
- dev: `bun run dev`
- build: `bun run build`
- preview production build: `bun run preview`
- lint: `bun run lint`
- lint fix: `bun run lint:fix`
- format check: `bun run format`
- format fix: `bun run format:fix`
- typecheck: `bun run typecheck`
- full Biome check: `bun run check`
- full Biome check with writes: `bun run check:fix`
- test unit: not configured in `package.json`.
- test e2e: not configured in `package.json`.
- environment-specific commands: not configured. Vercel uses `bun install`, `bun run build`, and `dist` as output.

## Conventions
- Folder convention: current source uses a feature-based structure plus shared layers: `components`, `config`, `features`, `hooks`, `libs`, `pages`, `providers`, `services`, `stores`, `types`, `utils`.
- Naming convention:
  - Most source files use lowercase kebab-case, e.g. `sign-in-form.tsx`, `message-list.tsx`, `conversation-service.ts`.
  - Component exports use PascalCase.
  - Hook exports use `useXxx`.
  - Stores currently use `useAuthStore.ts` and `useSocketStore.ts`, which are exceptions to the kebab-case pattern.
  - No barrel export pattern is used.
- Coding style:
  - Biome is used, not ESLint/Prettier.
  - Formatter uses spaces and double quotes.
  - Source currently uses semicolons and trailing commas in multiline structures.
  - Import organization is handled by Biome assist.
  - `noExplicitAny` is disabled in Biome, and `src/app.tsx` uses `(window as any).toggleDevtools`.
  - `tsconfig.json` enables `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, and `moduleResolution: "bundler"`. It does not explicitly enable `strict`.
- Architecture convention:
  - Pages are thin and import feature templates.
  - Business/UI orchestration usually lives in feature hooks/templates.
  - API calls are in `src/services`.
  - Reusable API hooks are in `src/hooks/api`.
  - Third-party client setup is in `src/libs`.
  - Global client state is small and stored in Zustand.
  - Server data is handled by TanStack Query.
- API convention:
  - REST endpoints are centralized in `src/config/routes.ts`.
  - Axios base URL is `${PUBLIC_API_BASE_URL}/api`.
  - Services return typed data, usually unwrapped from Axios responses.
  - API wrapper shape is `BaseResponse<T> = { data, message, status }`.
  - Pagination uses `messages` plus `nextCursor` or `nextOffset`.
  - Query keys are arrays produced by `queryKeysFactory`, then extended per domain.
  - Mutations invalidate or patch query cache for conversations, messages, friends, and user profile.
- Auth/session convention:
  - Custom JWT-like auth: access token is stored in in-memory Zustand state.
  - Axios sends `Authorization: Bearer <token>` for private endpoints.
  - Axios uses `withCredentials: true`, so refresh/sign-out likely depend on backend cookies.
  - 401/403 triggers one refresh attempt through `/v1/auth/refresh`.
  - Refresh failure clears query cache and auth state.
  - `ProtectedRoute` and `GuestRoute` guard authenticated and guest-only screens.
  - No multi-tenant or organization model is visible.
- Realtime convention:
  - `useSocketStore` creates a STOMP client using `PUBLIC_SOCKET_URL`.
  - Auth is sent through STOMP `connectHeaders.Authorization`.
  - Socket subscriptions are in `src/services/socket-service.ts`.
  - `ChatSocketProvider` subscribes to conversation updates, messages, and seen events, then patches React Query cache.
  - Online users are stored in socket store as user id strings.
- Form convention:
  - Auth and group forms use React Hook Form plus Zod.
  - Errors are shown inline near fields or as submit-level text/toasts.
  - Group create/add-member dialogs reset form state when closed.
  - Profile edit is currently manual controlled state and trims values before submit.
  - Upload is not implemented; message attachment UI is commented out and API request types set `attachmentUrl: null`.
- Table/filter convention:
  - No table library is used.
  - Conversation and message lists use `react-virtuoso`.
  - Friends and group member picker use custom scroll/load-more behavior.
  - Conversation filter is local state, not stored in URL.
  - User/friend search debounce is 500 ms.
  - Conversation/message pagination uses cursor. Friend/user search uses offset.
  - No export/import or bulk-action flows are visible.
- UI/UX convention:
  - Uses Tailwind utility classes and CSS variables in `src/globals.css`.
  - Loading states use `Skeleton` or `Loader2`.
  - Empty states are inline muted blocks/text.
  - Error states are inline destructive blocks with Retry where relevant; write success/failure often uses Sonner toasts.
  - Dialogs use `src/components/ui/dialog`; group destructive confirms currently use `window.confirm`.
  - Accessibility basics are present: labels, `aria-label`, `aria-invalid`, `role="tablist"`, `role="alert"`, screen-reader-only text.
- Date/time convention:
  - Locale: `en-US`.
  - Time zone: `Asia/Ho_Chi_Minh`.
  - Date utilities live in `src/utils/date.ts`.
- Testing convention:
  - No test framework, unit test command, e2e command, mock server, coverage threshold, or snapshot convention is present.
  - For future changes, at minimum use `bun run check` and `bun run typecheck`; add `bun run build` for UI/config/build changes.
- Error/logging convention:
  - Axios normalizes backend `message` into `Error.message`.
  - UI maps errors with `getErrorMessage`.
  - No global error boundary is visible.
  - No Sentry/Datadog/logging service is configured.
  - `console.error` is used in session refresh, STOMP error handling, and JSON parse failure.
- Security convention:
  - `.env` and `.env.local` are gitignored.
  - Client env variables use `PUBLIC_*` names.
  - No `dangerouslySetInnerHTML` usage was found.
  - React rendering is relied on for escaping user content.
  - No sanitizer library or CSP config is present.
  - Tokens are not persisted to localStorage/sessionStorage in current source.
- Performance convention:
  - `react-virtuoso` handles large conversation/message lists.
  - `useMemo`/`useCallback` are used in cache-derived view models and UI handlers.
  - React Query Devtools are lazy-loaded.
  - Routes are not lazy-loaded.
  - No explicit bundle size budget or image optimization setup is present.

## Must follow
- Keep frontend code under `src/` and preserve the current layer responsibilities.
- Keep route pages thin; put screen logic in feature templates/hooks.
- Use existing `@/` alias imports for source modules.
- Use `src/services` for HTTP/socket requests and `src/hooks/api` for reusable React Query hooks.
- Keep server state in TanStack Query; use Zustand only for auth/socket/client UI state.
- Use existing UI primitives/shared components before adding new UI.
- Use React Hook Form + Zod for non-trivial validated forms.
- Preserve auth refresh behavior in `src/libs/axios.ts` and route guards in `src/providers`.
- Preserve STOMP lifecycle cleanup and query cache updates when touching realtime code.
- Use `PUBLIC_API_BASE_URL` and `PUBLIC_SOCKET_URL` through `src/config/env.ts`; do not read env variables ad hoc across source.
- Run `bun run check` and `bun run typecheck` before finishing meaningful source changes. Run `bun run build` for UI/config/routing/build-related changes.
- Update shared types when API contracts change.
- Manually verify responsive behavior for chat screens after UI changes because there is no e2e setup.

## Must not do
- Do not edit `node_modules/`, `dist/`, or `.env`.
- Do not hand-edit `bun.lock`; use Bun dependency commands.
- Do not hardcode tokens, private message payloads, API secrets, or user-sensitive data.
- Do not put access tokens in URLs or browser storage without an explicit security decision.
- Do not log tokens, auth headers, raw private messages, raw socket payloads, or full sensitive API responses.
- Do not call Axios directly from feature UI when a service/hook boundary already exists.
- Do not move server data into Zustand.
- Do not put business logic or socket lifecycle directly in route pages.
- Do not replace the current UI stack, routing stack, build tool, or API contract as part of a small feature.
- Do not add dependencies for capabilities already covered by the current stack.
- Do not bypass lint/typecheck/build by weakening TypeScript or tool config.
- Do not assume production status, PR rules, coverage requirements, or backend contracts that are not present in source.

## Pain points with AI/Codex
- No automated tests are configured, so source changes rely on typecheck/build plus manual review.
- Production status, deployment environments, branch naming, commit convention, PR template, and release workflow are not documented in source.
- TypeScript is not explicitly `strict`, and Biome allows explicit `any`; AI should avoid loosening types further.
- Some source naming is inconsistent with the dominant kebab-case pattern, especially store filenames.
- API response contracts are inferred from TypeScript types and service usage; without backend/OpenAPI docs, contract changes are risky.
- Refresh-token storage is inferred from `withCredentials`; the exact backend cookie/session contract is not visible.
- Dark-mode tokens exist, but no actual theme toggle/persistence is implemented.
- Permission logic is minimal and local to auth routes/group participant roles; there is no centralized permission model.
- Confirm dialogs still use `window.confirm`, while most modal UX uses shadcn/Radix dialogs.
- No global error boundary or observability integration exists.
- User-facing copy is English only and no i18n framework is present.
- AI should prefer minimal scoped changes, list changed files and commands run, and ask when requirements touch undocumented backend/API/deployment behavior.
