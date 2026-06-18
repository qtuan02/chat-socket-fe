# chat-socket-fe

Real-time chat web app built with React 19, TypeScript, and WebSocket (STOMP). Messenger-style UI — conversations, direct messages, group chats, friend management.

## Tech Stack

| Category | Library / Tool |
|---|---|
| Framework | React 19, TypeScript 6 |
| Build | Rsbuild 2 |
| Router | React Router v7 |
| Styling | Tailwind CSS v4 (CSS-first), shadcn/ui (new-york) |
| State — server | TanStack Query v5 |
| State — client | Zustand v5 |
| WebSocket | @stomp/stompjs |
| HTTP client | Axios |
| Forms | React Hook Form + Zod |
| Virtualised lists | react-virtuoso |
| Notifications | Sonner |
| Linter / Formatter | Biome |

## Features

- Sign in / Sign up with JWT (access token + refresh via interceptor)
- Real-time messaging via STOMP WebSocket
- Direct conversations and group chats
- Friend requests — send, accept, decline, cancel, unfriend
- User search
- Group management — create group, add / remove members, leave group
- Conversation info panel — direct profile, group members with roles
- Online presence status
- Infinite-scroll message history (virtualised)
- Emoji picker
- Responsive layout — mobile and desktop

## Prerequisites

- **Node.js** ≥ 22.21.0
- **Bun** ≥ 1.2.3

## Setup

```bash
# 1. Install dependencies
bun install

# 2. Copy the environment template and fill in values
cp .env.template .env
```

Edit `.env`:

```env
NODE_ENV=development
PUBLIC_API_BASE_URL=http://localhost:8089   # REST API base URL
PUBLIC_SOCKET_URL=ws://localhost:8089/api/ws  # WebSocket endpoint
```

## Development

```bash
bun run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Other Scripts

```bash
bun run build       # Production build
bun run preview     # Preview production build locally
bun run typecheck   # Type-check without emitting (tsc --noEmit)
bun run check       # Biome lint + format check
bun run check:fix   # Biome auto-fix
bun run lint        # Biome lint only
bun run format      # Biome format check only
```

## Project Structure

```
src/
├── app.tsx                  # Route tree + providers
├── globals.css              # Tailwind v4 theme tokens (CSS-first)
│
├── config/                  # Constants, env, route/API path tables
├── libs/                    # axios client, query-key factory
├── services/                # HTTP service layer (one file per entity)
├── hooks/api/               # TanStack Query hooks (one file per entity)
├── stores/                  # Zustand stores (useAuthStore, useSocketStore)
├── providers/               # React context providers (QueryClient, etc.)
├── types/                   # Shared TypeScript types (server contract types)
├── utils/                   # Pure utilities (cn, date, error, display, string)
│
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   └── shared/              # Reusable app-level components (UserItem, ConversationAvatar, …)
│
├── features/
│   ├── auth/                # Sign in / sign up forms
│   ├── chat/                # Chat window, message list, composer, header
│   ├── conversation/        # Conversation list, filters, details panel
│   ├── current-user/        # Current user profile page
│   ├── friends/             # Friend list, friend requests, user search
│   └── group/               # Group creation, member management
│
└── pages/                   # Thin route wrappers (one template per page)
```

### Architecture principles

- **Strict data flow**: `config → services → hooks/api → feature hooks → components → pages`
- **Feature-sliced**: each feature is self-contained; cross-feature coupling only through shared types or `src/components/shared/`
- **Server state in TanStack Query, client state in Zustand** — never mirror server data into a store
- Route guards (`ProtectedRoute`, `GuestRoute`) live at the route tree, not inside pages

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Node environment |
| `PUBLIC_API_BASE_URL` | `http://localhost:8089` | Base URL for REST API |
| `PUBLIC_SOCKET_URL` | `ws://localhost:8089/api/ws` | WebSocket endpoint |
