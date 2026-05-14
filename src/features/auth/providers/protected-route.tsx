import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Navigate, Outlet } from "react-router";
import { toast } from "sonner";
import { useRefreshTokenMutation } from "@/hooks/api/auth";
import { currentUserQueryKeys } from "@/hooks/api/user";
import useAuthStore from "@/stores/useAuthStore";

export function ProtectedRoute() {
  const queryClient = useQueryClient();
  const { accessToken, setAccessToken, clearState } = useAuthStore();
  const [loginChecked, setLoginChecked] = React.useState(false);

  const { mutate: refreshToken, isPending } = useRefreshTokenMutation({
    onError: (error) => {
      console.error(
        error?.message || "Refresh token failed. Please try again.",
      );
      clearState();
      toast.error("Your login session has expired. Please log in again!");
    },
    onSuccess: (data) => {
      setAccessToken(data.data.accessToken);
      queryClient.invalidateQueries({ queryKey: currentUserQueryKeys.all });
    },
    onSettled: () => setLoginChecked(true),
  });

  const init = async () => {
    if (!accessToken && !loginChecked) refreshToken();
    setLoginChecked(true);
  };

  React.useEffect(() => {
    init();
  }, []);

  if (!loginChecked || isPending)
    return <div className="flex h-screen items-center justify-center">...</div>;

  if (!accessToken) return <Navigate to="/sign-in" replace />;

  return <Outlet />;
}
