---
title: Query Key Factory Pattern
impact: HIGH
impactDescription: Prevents cache key drift, makes invalidation surgical, and keeps query keys typed.
tags: tanstack-query, query-key, cache, factory
---

## Query Key Factory Pattern

**Impact: HIGH (Reliable cache invalidation and typed query keys)**

Every query key in this project must be built through `queryKeysFactory` from `@/libs/query-key-factory`. Never assemble query-key arrays inline — drift between the call site and the invalidation site silently breaks caching. Extend the factory in the same file as the hooks for that entity, and re-export it as `xxxQueryKeys`.

**Incorrect:**

```typescript
// ❌ Inline array — typo here vs. invalidateQueries elsewhere = silent cache miss
useQuery({
  queryKey: ["conversation", "list", userId, type, limit],
  queryFn: () => conversationService.getConversations({ userId, type, limit }),
});
// ...somewhere else, the invalidation drifts:
queryClient.invalidateQueries({ queryKey: ["conversations", "list"] }); // ← plural, won't match

// ❌ String query key — TanStack Query v5 requires arrays
useQuery({ queryKey: "conversations", queryFn: ... });

// ❌ Building keys ad-hoc inside components
const queryKey = ["friend", "detail", friendId, { include: "profile" }];

// ❌ Overriding factory methods instead of extending
export const conversationQueryKeys = {
  list: (userId: string) => ["conversation", "list", userId],  // lost `all`, `lists`, `details`, `detail`
};

// ❌ Different argument shape per call site — invalidate vs. read will not match
useQuery({ queryKey: ["conversation", "list", { userId, type }], ... });
queryClient.invalidateQueries({ queryKey: ["conversation", "list", userId] });
```

**Correct:**

```typescript
// src/hooks/api/conversation.ts
import { queryKeysFactory } from "@/libs/query-key-factory";

const conversationQueryKeyFactory =
  queryKeysFactory<"conversation">("conversation");

// ✅ Extend, never replace — keep `all`, `lists`, `details`, `detail`
export const conversationQueryKeys = {
  ...conversationQueryKeyFactory,
  list: (userId: string, type?: ConversationTypeEnum, limit = 30) =>
    conversationQueryKeyFactory.list({ userId, type, limit }),
};

// ✅ Read with the factory
export function useConversationsQuery(params: GetConversationsParams) {
  return useInfiniteQuery({
    queryKey: conversationQueryKeys.list(params.userId, params.type, params.limit),
    queryFn: ({ pageParam }) =>
      conversationService.getConversations({ ...params, cursor: pageParam }),
    initialPageParam: INITIAL_CURSOR_PAGE_PARAM,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

// ✅ Invalidate hierarchically — `all` invalidates everything for the entity,
//    `lists()` only the list queries, `detail(id)` a specific record
queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
queryClient.invalidateQueries({ queryKey: conversationQueryKeys.lists() });
queryClient.invalidateQueries({ queryKey: conversationQueryKeys.detail(conversationId) });
```

### Conventions

- One factory per entity, declared at the top of `src/hooks/api/<entity>.ts`.
- Naming: factory variable is `xxxQueryKeyFactory`, public export is `xxxQueryKeys`.
- The exported `xxxQueryKeys` is the **only** source of query keys for that entity. Components and other hooks import from it.
- Use the built-in levels for invalidation: `all` → `lists()` / `details()` → `list(...)` / `detail(...)`.
- Custom list/detail wrappers should forward their arguments as a single object to `factory.list({...})` / `factory.detail(id, {...})` so the cache key has a stable shape regardless of how it is called.
- When in doubt about invalidation scope, prefer the highest level that still scopes correctly — e.g. invalidate `lists()` after a create, not `all`.

Reference: [`src/libs/query-key-factory.ts`](../../src/libs/query-key-factory.ts), [TkDodo — Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
