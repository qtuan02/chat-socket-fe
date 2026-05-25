---
title: Strict Data Flow (Config → Service → Hook → Component)
impact: CRITICAL
impactDescription: Locks dependency direction; no HTTP in components, no JSX in services.
tags: architecture, layering, data-flow, dependency-direction
---

## Strict Data Flow (Config → Service → Hook → Component)

**Impact: CRITICAL (Reversing this direction is the #1 cause of "where do I fix this?" confusion)**

Data flows in exactly one direction from the network layer up to the view:

```
src/config/*               (URLs, constants, env)
        │
        ▼
src/libs/<http-client>     (transport + interceptors)
        │
        ▼
src/services/*             (request/response mapping; returns plain data)
        │
        ▼
src/hooks/api/*            (cache wrapper around services; one file per entity)
        │
        ▼
src/features/*/hooks/*     (orchestration: combine queries, mutations, local state)
        │
        ▼
src/features/*/components, templates  (render only)
        │
        ▼
src/pages/*                (route → template)
```

Each layer may only import from layers above it (closer to the network) plus shared utilities. Reversing the arrow — a service importing a component, a hook importing a template, an HTTP client called from JSX — is forbidden and a hard review block.

**Incorrect (HTTP in a component; JSX in a service):**

```tsx
import axios from "axios";
import { useEffect, useState } from "react";

export function ExampleList() {
  const [items, setItems] = useState<Example[]>([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.PUBLIC_API_BASE_URL}/v1/example`)
      .then((response) => setItems(response.data.data));
  }, []);

  return items.map((item) => <ExampleRow key={item.id} item={item} />);
}
```

```typescript
import { exampleService } from "@/services/example-service";

useEffect(() => {
  exampleService.markSeen(id);
}, [id]);

import { ExampleRow } from "@/features/example/components/example-row";

export const exampleService = {
  send: (payload: SendExamplePayload) => {
    const preview = <ExampleRow … />;
    return httpClient.post(…);
  },
};
```

**Correct (each layer does its one job):**

```typescript
import { EXAMPLE_API } from "@/config/routes";
import httpClient from "@/libs/http-client";

export const exampleService = {
  list: async (): Promise<Example[]> => {
    const response = await httpClient.get<BaseResponse<Example[]>>(
      `${EXAMPLE_API.v1.base}${EXAMPLE_API.v1.example.list}`,
    );
    return response.data.data;
  },
};

export function useExamplesQuery() {
  return useQuery({
    queryKey: exampleQueryKeys.list(),
    queryFn: exampleService.list,
  });
}

export function ExampleList() {
  const { data: items = [] } = useExamplesQuery();
  return items.map((item) => <ExampleRow key={item.id} item={item} />);
}
```

**Conventions:**
- Components never import from `@/libs/<http-client>`, the raw HTTP package, or `@/services/*`. Their data input is hooks only.
- Hooks in `src/hooks/api/*` never import from `@/features/*`. They are entity-shaped, not feature-shaped.
- Services never import React. No JSX, no hooks, no `import * as React from "react"`.
- `src/config/*` is a leaf — it imports from nothing else inside `src/`. It only exports constants.
- Cross-layer side effects (e.g., invalidating a query after a mutation) live in `hooks/api/*` `onSuccess` callbacks, not in components.
- Feature-level hooks (`src/features/<feat>/hooks/*`) may compose `hooks/api/*` + stores + local state — they are the orchestration tier.
- Pages may only import templates and guards.

Reference: [Bulletproof React — Application State Management](https://github.com/alan2207/bulletproof-react/blob/master/docs/application-state-management.md)
