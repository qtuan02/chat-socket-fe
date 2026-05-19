import { Navigate, Outlet } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { useSessionCheck } from "@/hooks/use-session-check";
import { RouteGuardLoading } from "@/providers/route-guard-loading";

export function GuestRoute() {
  const { accessToken, isCheckingSession } = useSessionCheck();

  if (isCheckingSession) {
    return <RouteGuardLoading />;
  }

  if (accessToken) {
    return <Navigate to={APP_ROUTES.chat} replace />;
  }

  return <Outlet />;
}
