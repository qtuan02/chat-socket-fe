import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { currentUserQueryKeys } from "@/hooks/api/user";
import { authService } from "@/services/auth-service";
import useAuthStore from "@/stores/useAuthStore";
import type { SignInResponse } from "@/types/auth";

type UseSessionCheckOptions = {
  onUnauthenticated?: (error: Error) => void;
};

let refreshSessionPromise: Promise<SignInResponse> | null = null;

function refreshSessionOnce() {
  if (!refreshSessionPromise) {
    refreshSessionPromise = authService.refreshToken().finally(() => {
      refreshSessionPromise = null;
    });
  }

  return refreshSessionPromise;
}

export function useSessionCheck(options: UseSessionCheckOptions = {}) {
  const { onUnauthenticated } = options;
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearState = useAuthStore((state) => state.clearState);
  const [isSessionChecked, setIsSessionChecked] = React.useState(!!accessToken);
  const [isCheckingSession, setIsCheckingSession] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    if (accessToken) {
      setIsSessionChecked(true);
      setIsCheckingSession(false);

      return () => {
        isMounted = false;
      };
    }

    setIsCheckingSession(true);
    setIsSessionChecked(false);

    refreshSessionOnce()
      .then((data) => {
        if (!isMounted) return;

        setAccessToken(data.data.accessToken);
        void queryClient.invalidateQueries({
          queryKey: currentUserQueryKeys.all,
        });
      })
      .catch((error: Error) => {
        if (!isMounted) return;

        queryClient.clear();
        clearState();
        onUnauthenticated?.(error);
      })
      .finally(() => {
        if (!isMounted) return;

        setIsCheckingSession(false);
        setIsSessionChecked(true);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, clearState, onUnauthenticated, queryClient, setAccessToken]);

  return {
    accessToken,
    isCheckingSession,
    isSessionChecked,
  };
}
