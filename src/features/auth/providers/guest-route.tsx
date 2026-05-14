import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Navigate, Outlet } from "react-router";

import { currentUserQueryKeys } from "@/hooks/api/user";
import { useRefreshTokenMutation } from "@/hooks/api/auth";
import { APP_ROUTES } from "@/config/routes";
import useAuthStore from "@/stores/useAuthStore";

export function GuestRoute() {
  const queryClient = useQueryClient();
  const { accessToken, setAccessToken, clearState } = useAuthStore();
  const [checkedSession, setCheckedSession] = React.useState(false);

  const { mutate: refreshToken, isPending } = useRefreshTokenMutation({
    onError: () => {
      clearState();
    },
    onSuccess: (data) => {
      setAccessToken(data.data.accessToken);
      queryClient.invalidateQueries({
        queryKey: currentUserQueryKeys.all,
      });
    },
    onSettled: () => {
      setCheckedSession(true);
    },
  });

  React.useEffect(() => {
    if (accessToken) {
      setCheckedSession(true);
      return;
    }

    if (!checkedSession) {
      refreshToken();
    }
  }, [accessToken, checkedSession, refreshToken]);

  if (!checkedSession || isPending) {
    return <div className="flex h-screen items-center justify-center">...</div>;
  }

  if (accessToken) {
    return <Navigate to={APP_ROUTES.chat} replace />;
  }

  return <Outlet />;
}
