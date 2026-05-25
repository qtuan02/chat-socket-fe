---
title: Service Layer Pattern (HTTP)
impact: HIGH
impactDescription: Centralizes API access, prevents hardcoded URLs, and keeps hooks free of axios details.
tags: service, axios, api, http, architecture
---

## Service Layer Pattern (HTTP)

**Impact: HIGH (Single source of truth for API endpoints and response shape)**

Every HTTP call must go through a service object in `src/services/`. Services are plain objects (not classes), use the shared `axiosClient` from `@/libs/axios`, build URLs from the `APP_API` constant in `@/config/routes`, and return *unwrapped* data — never the raw axios response. React Query hooks in `src/hooks/api/` call these services, but never touch axios directly.

**Incorrect:**

```typescript
// ❌ Importing axios directly — bypasses auth interceptor & error normalization
import axios from "axios";

export const userService = {
  getMe: () => axios.get(`${import.meta.env.PUBLIC_API_BASE_URL}/api/v1/user/me`),
};

// ❌ Hardcoded URL strings — duplicated and drift-prone
export const friendService = {
  list: () => axiosClient.get("/v1/friend"),
  delete: (id: string) => axiosClient.delete(`/v1/friend/${id}`),
};

// ❌ Returning the raw AxiosResponse — every caller must do response.data.data
list: async () => {
  return axiosClient.get<FriendPageResponse>(`...`);
}

// ❌ Service as a class with `new` — no benefit, harder to tree-shake
class FriendService {
  async list() { return axiosClient.get(...); }
}
export const friendService = new FriendService();

// ❌ Calling services from components — bypasses React Query cache
function FriendList() {
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    friendService.list().then(setFriends);
  }, []);
}

// ❌ Manually reading auth token in service — interceptor already handles it
list: async () => {
  const token = useAuthStore.getState().accessToken;
  return axiosClient.get(url, { headers: { Authorization: `Bearer ${token}` } });
}
```

**Correct:**

```typescript
// ✅ Plain object service, axiosClient + APP_API, return unwrapped data
import { APP_API } from "@/config/routes";
import axiosClient from "@/libs/axios";
import type { BaseResponse } from "@/types/base";
import type {
  ConversationPage,
  ConversationPageResponse,
  GetConversationsParams,
} from "@/types/conversation";

export const conversationService = {
  getConversations: async (
    params: GetConversationsParams = {},
  ): Promise<ConversationPage> => {
    const response = await axiosClient.get<ConversationPageResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.conversations}`,
      { params },
    );

    return {
      items: response.data.data.messages,
      nextCursor: response.data.data.nextCursor,
    };
  },

  markAsSeen: async (conversationId: string): Promise<void> => {
    await axiosClient.patch<BaseResponse<null>>(
      `${APP_API.v1.base}${APP_API.v1.chat.markConversationAsSeen(conversationId)}`,
    );
  },
};

// ✅ Hooks layer calls service — no axios import here
export function useConversationsQuery(params: GetConversationsParams) {
  return useInfiniteQuery({
    queryKey: conversationQueryKeys.list(params.userId, params.type, params.limit),
    queryFn: ({ pageParam }) =>
      conversationService.getConversations({ ...params, cursor: pageParam }),
    initialPageParam: INITIAL_CURSOR_PAGE_PARAM,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
```

### Conventions

- File location: `src/services/{entity}-service.ts`. Named export `{entity}Service`.
- Methods are `async` arrow functions on the object literal — keeps `this` irrelevant and types simple.
- URLs: always `${APP_API.v1.base}${APP_API.v1.<group>.<path>}`. If a new endpoint is needed, add it to `APP_API` first.
- Response types: declare a `XxxResponse = BaseResponse<XxxData>` in `src/types/`, pass it as the axios generic, then return `.data.data` (or a transformed shape).
- POST/PATCH/DELETE that return nothing meaningful: type the call as `BaseResponse<null>` and return `void`.
- New endpoint = 3 edits, in this order: add URL to `APP_API`, add request/response types in `src/types/`, add method to the service.

Reference: [`src/services/conversation-service.ts`](../../src/services/conversation-service.ts), [`src/libs/axios.ts`](../../src/libs/axios.ts)
