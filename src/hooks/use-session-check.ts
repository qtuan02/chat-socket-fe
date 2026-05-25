import * as React from "react";
import { refreshSessionOnce } from "@/hooks/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

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
