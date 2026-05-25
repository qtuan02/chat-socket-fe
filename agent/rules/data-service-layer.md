---
title: HTTP Service Layer Pattern
impact: HIGH
impactDescription: Centralizes API access; prevents hardcoded URLs; keeps hooks free of HTTP-client details.
tags: service, http, api, architecture
---

## HTTP Service Layer Pattern

**Impact: HIGH (Single source of truth for API endpoints and response shape)**

Every HTTP call must go through a service object in `src/services/`. Services are plain object literals (not classes), use the shared HTTP client from `@/libs/http-client`, build URLs from the constants in `@/config/routes`, and return *unwrapped* data — never the raw HTTP response. Data-cache hooks in `src/hooks/api/` call these services, but never touch the HTTP client directly.

**Incorrect:**

```typescript
import axios from "axios";

export const exampleService = {
  list: () => axios.get(`${import.meta.env.PUBLIC_API_BASE_URL}/api/v1/example`),
};

export const exampleService = {
  list: () => httpClient.get("/v1/example"),
  remove: (id: string) => httpClient.delete(`/v1/example/${id}`),
};

list: async () => {
  return httpClient.get<ExamplePageResponse>(`...`);
}

class ExampleService {
  async list() { return httpClient.get(...); }
}
export const exampleService = new ExampleService();

function ExampleList() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    exampleService.list().then(setItems);
  }, []);
}

list: async () => {
  const token = useExampleAuthStore.getState().token;
  return httpClient.get(url, { headers: { Authorization: `Bearer ${token}` } });
}
```

**Correct:**

```typescript
import { EXAMPLE_API } from "@/config/routes";
import httpClient from "@/libs/http-client";
import type { BaseResponse } from "@/types/base";
import type {
  Example,
  ExamplePage,
  ExamplePageResponse,
  GetExamplesParams,
} from "@/types/example";

export const exampleService = {
  list: async (params: GetExamplesParams = {}): Promise<ExamplePage> => {
    const response = await httpClient.get<ExamplePageResponse>(
      `${EXAMPLE_API.v1.base}${EXAMPLE_API.v1.example.list}`,
      { params },
    );

    return {
      items: response.data.data.items,
      nextCursor: response.data.data.nextCursor,
    };
  },

  markSeen: async (exampleId: string): Promise<void> => {
    await httpClient.patch<BaseResponse<null>>(
      `${EXAMPLE_API.v1.base}${EXAMPLE_API.v1.example.markSeen(exampleId)}`,
    );
  },
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
```

**Conventions:**
- File location: `src/services/<entity>-service.ts`. Named export `<entity>Service`.
- Methods are `async` arrow functions on the object literal — keeps `this` irrelevant and types simple.
- URLs: always `${EXAMPLE_API.v1.base}${EXAMPLE_API.v1.<group>.<path>}`. If a new endpoint is needed, add it to `EXAMPLE_API` first.
- Response types: declare an `XxxResponse = BaseResponse<XxxData>` in `src/types/`, pass it as the HTTP client's generic, then return `.data.data` (or a transformed shape).
- POST/PATCH/DELETE that return nothing meaningful: type the call as `BaseResponse<null>` and return `void`.
- New endpoint = 3 edits in this order: add URL to `EXAMPLE_API`, add request/response types in `src/types/`, add method to the service.
- Auth tokens are added by the HTTP client's request interceptor — services never read tokens directly.

Reference: [Kent C. Dodds — Application State Management](https://kentcdodds.com/blog/application-state-management-with-react)
