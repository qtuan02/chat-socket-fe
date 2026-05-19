# Naming Rules

These rules apply to source files, rules, prompts, and new folders.

## Core Principle

Names must describe the product concept and responsibility clearly. Prefer chat-domain terms such as `auth`, `user`, `profile`, `conversation`, `message`, `participant`, `attachment`, `presence`, `notification`, `socket`, `settings`, and `session`.

Use `auth`, not `authen`.

## Language

- Use English for code identifiers, file names, folder names, routes, types, functions, and variables.
- Visible UI copy can be Vietnamese or English depending on product direction. Keep it consistent within a screen.
- Do not use Vietnamese without accents in code identifiers.
- Keep backend/API field names only when they are part of a contract. Map unclear backend names before exposing app types.

## Folders

Use lowercase `kebab-case`.

Good:

```text
src/features/auth
src/features/chat
src/features/user-profile
src/components/shared/message-bubble
```

Bad:

```text
src/features/Auth
src/features/authen
src/features/userProfile
src/features/user_profile
```

## Standard Feature Folder Names

Inside `src/features/<feature>/`, use only these folders unless there is a strong reason and project rules are updated:

```text
templates/
components/
hooks/
providers/
stores/
types/
constants/
utils/
```

Do not create duplicate layer names such as `pages`, `views`, `containers`, `models`, `services`, `helpers`, `logic`, `domain`, or `data` inside features.

## Files

Use lowercase `kebab-case` file names. Do not use PascalCase file names for React components.

Good:

```text
sign-in-page.tsx
sign-in-template.tsx
sign-in-form.tsx
conversation-list.tsx
message-composer.tsx
message-bubble.tsx
chat-service.ts
socket-service.ts
socket-client.ts
auth-store.ts
conversation.ts
format-message-time.ts
```

Bad:

```text
SignInPage.tsx
SignInTemplate.tsx
SignInForm.tsx
signInPage.tsx
sign_in_page.tsx
helper.ts
utils.ts
common.ts
new.tsx
```

## File Patterns

| Responsibility | Preferred pattern | Export examples |
|---|---|---|
| Route page | `<screen>-page.tsx` | `SignInPage`, `ChatPage` |
| Feature template | `<screen>-template.tsx` | `SignInTemplate`, `ChatTemplate` |
| Component | `<component-name>.tsx` | `MessageComposer`, `ConversationList` |
| Feature/global hook | `use-<concern>.ts` | `useMessageComposer`, `useLocalStorage` |
| API hook domain module | `<domain>.ts` | `useCurrentUserQuery`, `useSendMessageMutation` |
| Single API hook module | `use-<concern>-query.ts` or `use-<concern>-mutation.ts` | `useCurrentUserQuery` |
| API service | `<domain>-service.ts` | `getConversations`, `sendMessage` |
| Socket service | `<domain>-socket-service.ts` or `socket-service.ts` | `subscribeToMessages` |
| Store | `<domain>-store.ts` for new stores | `useAuthStore`, `useSocketStore` |
| Type module | `<domain>.ts` | `Message`, `Conversation` |
| Utility | `<verb-or-purpose>.ts` | `formatMessageTime`, `parseApiError` |
| Constants | `<domain>-constants.ts` | `messageStatusLabels` |

Existing files that predate these patterns may remain until a scoped refactor is requested. Do not rename files only to satisfy naming rules unless naming/refactor is the task.

## React Components

- Component exports use `PascalCase`.
- Page components end with `Page`.
- Template components end with `Template`.
- Dialog components end with `Dialog`.
- Form components end with `Form`.
- List components end with `List`.
- Item/card components end with `Item` or `Card`.
- Layout components end with `Layout`, `Shell`, `Header`, or another precise layout noun.

Good:

```ts
export function ChatPage() {}
export function ChatTemplate() {}
export function MessageComposer() {}
export function UserMenu() {}
```

Bad:

```ts
export function chatPage() {}
export function Chat() {}
export function Modal() {}
```

## Hooks

- Hook exports use `useXxx`.
- Reusable/feature hook files start with `use-`.
- API query hooks end with `Query`.
- API mutation hooks end with `Mutation`.
- Feature hooks should include the feature/workflow when useful.

Good:

```ts
useMessageComposer
useChatRoom
useCurrentUserQuery
useSendMessageMutation
useLocalStorage
```

Bad:

```ts
messageHook
getMessages
useData
useFetch
```

## Variables And Functions

Use `camelCase`.

Good:

```ts
const conversationId = "conversation-1";
const unreadMessageCount = 3;
function formatMessageTime(value: Date) {}
```

Bad:

```ts
const conversation_id = "conversation-1";
const ConversationId = "conversation-1";
function handleData() {}
```

## Booleans

Boolean names should read like yes/no questions. Prefer:

```text
is, has, can, should, did, will
```

Good:

```ts
isConnected
isSending
hasUnreadMessages
canSendMessage
shouldShowTypingIndicator
didReconnect
```

Library props such as `disabled`, `checked`, `open`, and `selected` are allowed.

## Events And Actions

- Props passed from parent: `on<Verb><Noun>`.
- Local handlers: `handle<Verb><Noun>`.
- Service/domain actions: direct verbs such as `get`, `create`, `update`, `delete`, `send`, `subscribe`, `connect`, `disconnect`, `mark`, `upload`.

Good:

```ts
interface MessageComposerProps {
  onSendMessage: (content: string) => void;
}

const handleSendMessage = () => {};
const sendMessage = async () => {};
const subscribeToConversation = () => {};
```

Bad:

```ts
const click = () => {};
const doThing = () => {};
const submit2 = () => {};
```

## Types

- Types and interfaces use `PascalCase`.
- Component props: `<ComponentName>Props`.
- Hook options: `Use<HookNameWithoutUse>Options`.
- Hook result: `Use<HookNameWithoutUse>Result`.
- Form values: `<ActionOrFeature>FormValues`.
- Zod schemas: `<actionOrFeature>Schema`.
- DTOs: `<Entity>Dto`.
- Requests: `<Action><Entity>Request`.
- Responses: `<Entity>Response` or `<Entity>ListResponse`.
- Do not use `I` prefixes such as `IUser`, `IProps`, or `IService`.

## Constants

Use `UPPER_CASE` only for true module-level constants.

Good:

```ts
const RECONNECT_DELAY_MS = 1000;
export const MESSAGE_STATUSES = ["pending", "sent", "failed"] as const;
```

Use `camelCase` for exported config objects and options consumed by UI/domain code.

Good:

```ts
export const messageStatusLabels = {...};
export const conversationFilterOptions = [...];
```

## Chat Field Names

Use consistent suffixes:

| Concept | Pattern | Examples |
|---|---|---|
| Identifier | `<entity>Id` | `userId`, `messageId`, `conversationId` |
| Display name | `<entity>Name` | `userName`, `conversationName` |
| Count | `<purpose>Count` | `unreadCount`, `participantCount` |
| Date only | `<purpose>Date` | `birthDate` |
| Timestamp | `<purpose>At` | `createdAt`, `sentAt`, `readAt` |
| Status | `<entity>Status` or `status` | `messageStatus`, `presenceStatus` |
| URL | `<purpose>Url` | `avatarUrl`, `attachmentUrl` |
| Temporary id | `client<entity>Id` | `clientMessageId` |

## Acronyms

Treat acronyms as normal words.

Good:

```ts
apiUrl
httpClient
idToken
webSocketUrl
messageDto
```

Bad:

```ts
APIUrl
HTTPClient
IDToken
WebSocketURL
MessageDTO
```

## Avoid Vague Names

Avoid these for exported symbols and important variables:

```text
data, item, obj, temp, tmp, value, result, helper, manager, processor, common, misc, util, newData, oldData
```

Small callback scopes may use obvious short names:

```ts
messages.map((message) => message.id)
setMessages((prev) => [...prev, nextMessage])
```
