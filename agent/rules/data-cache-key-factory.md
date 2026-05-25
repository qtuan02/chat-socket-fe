---
title: Cache-Key Factory Pattern
impact: HIGH
impactDescription: Prevents cache-key drift; makes invalidation surgical; keeps keys typed.
tags: cache, query-key, factory, data-cache
---

## Cache-Key Factory Pattern

**Impact: HIGH (Reliable cache invalidation and typed cache keys across the app)**

Every cache key in this project must be built through a typed factory (e.g., `queryKeysFactory` from `@/libs/query-key-factory`). Never assemble cache-key arrays inline — drift between the call site and the invalidation site silently breaks caching. Extend the factory in the same file as the data hooks for that entity, and re-export it as `<entity>QueryKeys`.

This rule applies to any data-cache library that uses array-shaped keys (TanStack Query, SWR with array keys, RTK Query tags, etc.).

**Incorrect:**

```typescript
useQuery({
  queryKey: ["example", "list", ownerId, type, limit],
  queryFn: () => exampleService.list({ ownerId, type, limit }),
});
queryClient.invalidateQueries({ queryKey: ["examples", "list"] });

useQuery({ queryKey: "examples", queryFn: ... });

const queryKey = ["example", "detail", exampleId, { include: "profile" }];

export const exampleQueryKeys = {
  list: (ownerId: string) => ["example", "list", ownerId],
};

useQuery({ queryKey: ["example", "list", { ownerId, type }], ... });
queryClient.invalidateQueries({ queryKey: ["example", "list", ownerId] });
```

**Correct:**

```typescript
import { queryKeysFactory } from "@/libs/query-key-factory";

const exampleQueryKeyFactory = queryKeysFactory<"example">("example");

export const exampleQueryKeys = {
  ...exampleQueryKeyFactory,
  list: (ownerId: string, type?: ExampleTypeEnum, limit = 30) =>
    exampleQueryKeyFactory.list({ ownerId, type, limit }),
};

export function useExamplesQuery(params: GetExamplesParams) {
  return useInfiniteQuery({
    queryKey: exampleQueryKeys.list(params.ownerId, params.type, params.limit),
    queryFn: ({ pageParam }) =>
      exampleService.list({ ...params, cursor: pageParam }),
    initialPageParam: INITIAL_CURSOR_PAGE_PARAM,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

queryClient.invalidateQueries({ queryKey: exampleQueryKeys.all });
queryClient.invalidateQueries({ queryKey: exampleQueryKeys.lists() });
queryClient.invalidateQueries({ queryKey: exampleQueryKeys.detail(exampleId) });
```

**Conventions:**
- One factory per entity, declared at the top of `src/hooks/api/<entity>.ts`.
- Naming: factory variable is `<entity>QueryKeyFactory`, public export is `<entity>QueryKeys`.
- The exported `<entity>QueryKeys` is the only source of cache keys for that entity. Components and other hooks import from it.
- Use the built-in levels for invalidation: `all` → `lists()` / `details()` → `list(...)` / `detail(...)`.
- Custom list/detail wrappers should forward their arguments as a single object to `factory.list({...})` / `factory.detail(id, {...})` so the cache key has a stable shape regardless of how it is called.
- When in doubt about invalidation scope, prefer the highest level that still scopes correctly — e.g., invalidate `lists()` after a create, not `all`.

Reference: [TkDodo — Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
