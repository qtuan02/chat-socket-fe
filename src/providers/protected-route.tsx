import { Navigate, Outlet } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { useSessionCheck } from "../hooks/use-session-check";

export function ProtectedRoute() {
  const { accessToken, isCheckingSession } = useSessionCheck();

  if (isCheckingSession) {
    return <div className="flex h-screen items-center justify-center">...</div>;
  }

  if (!accessToken) return <Navigate to={APP_ROUTES.signIn} replace />;

  return <Outlet />;
}
