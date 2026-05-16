import * as React from "react";
import { Navigate, Outlet } from "react-router";
import { toast } from "sonner";
import { useSessionCheck } from "../hooks/use-session-check";

export function ProtectedRoute() {
  const handleUnauthenticated = React.useCallback((error: Error) => {
    console.error(error.message || "Refresh token failed. Please try again.");
    toast.error("Your login session has expired. Please log in again!");
  }, []);

  const { accessToken, isCheckingSession, isSessionChecked } = useSessionCheck({
    onUnauthenticated: handleUnauthenticated,
  });

  if (!isSessionChecked || isCheckingSession) {
    return <div className="flex h-screen items-center justify-center">...</div>;
  }

  if (!accessToken) return <Navigate to="/sign-in" replace />;

  return <Outlet />;
}
