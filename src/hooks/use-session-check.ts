import * as React from "react";
import { authService } from "@/services/auth-service";
import useAuthStore from "@/stores/useAuthStore";

let refreshSessionPromise: ReturnType<typeof authService.refreshToken> | null =
  null;

function refreshSessionOnce() {
  if (!refreshSessionPromise) {
    refreshSessionPromise = authService.refreshToken().finally(() => {
      refreshSessionPromise = null;
    });
  }

  return refreshSessionPromise;
}

export function useSessionCheck() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [isCheckingSession, setIsCheckingSession] = React.useState(
    !accessToken,
  );

  React.useEffect(() => {
    if (accessToken) {
      setIsCheckingSession(false);
      return;
    }

    let ignore = false;

    setIsCheckingSession(true);

    async function checkSession() {
      try {
        const data = await refreshSessionOnce();
        if (ignore) return;

        setAccessToken(data.data.accessToken);
      } catch {
        // Keep unauthenticated state when refresh fails.
      }

      if (!ignore) setIsCheckingSession(false);
    }

    void checkSession();

    return () => {
      ignore = true;
    };
  }, [accessToken, setAccessToken]);

  return {
    accessToken,
    isCheckingSession,
  };
}
