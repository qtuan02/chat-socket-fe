---
title: Error Handling & User Feedback
impact: HIGH
impactDescription: Consistent error UX, no duplicate toasts, no leaked stack traces.
tags: error, toast, sonner, axios, mutation
---

## Error Handling & User Feedback

**Impact: HIGH (Predictable error UX and a single normalization point)**

The axios response interceptor in `src/libs/axios.ts` already normalizes errors into `new Error(message)` (using the server `message` field, then `error.message`, then `"Request failed."`). Downstream code must rely on that contract: use `getErrorMessage(error, fallback)` to extract the message, surface user-facing failures via `toast.error()` from `sonner`, and never re-parse the axios error shape in components or hooks.

**Incorrect:**

```typescript
// ❌ Re-parsing axios error — interceptor already did this; double-handling drifts
import axios from "axios";

const handleSubmit = async () => {
  try {
    await signInMutation.mutateAsync(values);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message ?? error.message;
      toast.error(msg);
    } else {
      toast.error("Something went wrong");
    }
  }
};

// ❌ Showing the raw Error object — leaks "[object Object]" or stack info
toast.error(error);
toast.error(String(error));

// ❌ Both mutation.onError AND try/catch toasting — user sees two toasts
const mutation = useSignInMutation({
  onError: (error) => toast.error(error.message),
});

const handleSubmit = async () => {
  try {
    await mutation.mutateAsync(values);
  } catch (error) {
    toast.error(getErrorMessage(error, "Sign in failed")); // ← duplicate
  }
};

// ❌ console.error in production code paths (not allowed by lint baseline)
catch (error) {
  console.error(error);
  toast.error("Failed");
}

// ❌ Silently swallowing — user has no idea anything failed
catch { /* ignore */ }

// ❌ Empty/missing fallback — user sees nothing if error.message is empty
toast.error(getErrorMessage(error, ""));
```

**Correct:**

```typescript
// ✅ Mutations that fire from background flows: toast in onError
export function useSignInMutation(
  options?: UseMutationOptionsWrapper<SignInPayload, SignInResponse, Error>,
) {
  return useMutation({
    mutationFn: authService.signIn,
    onError: (error) => {
      toast.error(error?.message || "Sign in failed. Please try again.");
    },
    ...options,
  });
}

// ✅ User-driven submit that needs custom recovery: try/catch with getErrorMessage,
//    and DO NOT pass an onError that also toasts.
import { getErrorMessage } from "@/utils/error";

const handleSubmit = React.useCallback(async () => {
  if (!trimmedContent) return;
  onClearContent();

  try {
    await throttleSubmit(trimmedContent);
  } catch (error) {
    onRestoreContent(trimmedContent); // recovery: put draft back into the input
    toast.error(getErrorMessage(error, "Unable to send message."));
  }
}, [/* deps */]);
```

### Conventions

- Every `toast.error` call must have a meaningful fallback string — never empty.
- Pick **one** place to toast per flow:
  - Hook-level `onError` for fire-and-forget calls (sign-in, sign-up, sign-out, etc.).
  - Component-level `try/catch` when you need custom recovery (restore draft, focus a field, undo optimistic update) — and omit the toasting `onError`.
- Extract messages with `getErrorMessage(error, fallback)` — never type-narrow axios errors in components.
- For network-level diagnostics during development, rely on the browser devtools network tab — do not add `console.error` to ship.
- For background socket events that fail (parse errors, etc.), fail closed silently — do not toast users for events they did not trigger.
- Never `throw` inside a `useMutation` `onError` / `onSuccess` callback — handle it inline or return.

Reference: [`src/libs/axios.ts`](../../src/libs/axios.ts), [`src/utils/error.ts`](../../src/utils/error.ts), [Sonner docs](https://sonner.emilkowal.ski/)
