---
title: Error Handling & User Feedback
impact: HIGH
impactDescription: Consistent error UX; no duplicate toasts; no leaked stack traces.
tags: error, toast, http, mutation
---

## Error Handling & User Feedback

**Impact: HIGH (One predictable place to surface errors; one normalization point at the boundary)**

The HTTP client's response interceptor in `src/libs/http-client.ts` normalizes errors into `new Error(message)` — using the server `message` field, then `error.message`, then a generic fallback. Downstream code relies on that contract: use `getErrorMessage(error, fallback)` to extract the message, surface user-facing failures via a single toast helper, and never re-parse the raw HTTP error shape in components or hooks.

**Incorrect:**

```typescript
import axios from "axios";

const handleSubmit = async () => {
  try {
    await updateExampleMutation.mutateAsync(values);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message ?? error.message;
      notify(msg);
    } else {
      notify("Something went wrong");
    }
  }
};

notify(error);
notify(String(error));

const mutation = useUpdateExampleMutation({
  onError: (error) => notify(error.message),
});

const handleSubmit = async () => {
  try {
    await mutation.mutateAsync(values);
  } catch (error) {
    notify(getErrorMessage(error, "Update failed"));
  }
};

catch (error) {
  console.error(error);
  notify("Failed");
}

catch { /* ignore */ }

notify(getErrorMessage(error, ""));
```

**Correct:**

```typescript
export function useUpdateExampleMutation(
  options?: UseMutationOptionsWrapper<ExamplePayload, ExampleResponse, Error>,
) {
  return useMutation({
    mutationFn: exampleService.update,
    onError: (error) => {
      notify(error?.message || "Update failed. Please try again.");
    },
    ...options,
  });
}

import { getErrorMessage } from "@/utils/error";

const handleSubmit = React.useCallback(async () => {
  if (!trimmedValue) return;
  onClearValue();

  try {
    await throttledSubmit(trimmedValue);
  } catch (error) {
    onRestoreValue(trimmedValue);
    notify(getErrorMessage(error, "Unable to save."));
  }
}, [/* deps */]);
```

**Conventions:**
- Every user-facing error notification must have a meaningful fallback string — never empty.
- Pick **one** place to notify per flow:
  - Hook-level `onError` for fire-and-forget calls (auth, background syncs).
  - Component-level `try/catch` when you need custom recovery (restore draft, focus a field, undo optimistic update) — and omit the toasting `onError`.
- Extract messages with `getErrorMessage(error, fallback)` — never type-narrow HTTP errors in components.
- For network-level diagnostics during development, rely on browser devtools network tab — do not add `console.error` to ship.
- For background events that fail (parse errors, etc.), fail closed silently — do not notify users for events they did not trigger.
- Never `throw` inside a mutation's `onError` / `onSuccess` callback — handle it inline or return.

Reference: [Sonner — Toast Notifications](https://sonner.emilkowal.ski/)
