import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { env } from "@/config/env";
import { APP_ROUTES } from "@/config/routes";
import { GuestRoute } from "@/features/auth/providers/guest-route";
import { ProtectedRoute } from "@/features/auth/providers/protected-route";
import { useBackendHealthQuery } from "@/hooks/api/health";
import { queryClient } from "@/libs/query-client";
import { ChatPage } from "@/pages/chat-page";
import { SignInPage } from "@/pages/sign-in-page";
import { SignUpPage } from "@/pages/sign-up-page";
import useAuthStore from "./stores/useAuthStore";
import { useSocketStore } from "./stores/useSocketStore";

const LazyReactQueryDevtools = React.lazy(async () => {
  const { ReactQueryDevtools } = await import("@tanstack/react-query-devtools");
  return { default: ReactQueryDevtools };
});

export function App() {
  const [showDevtools, setShowDevtools] = React.useState(
    env.NODE_ENV === "development",
  );

  React.useEffect(() => {
    (window as any).toggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <>
      <Toaster richColors />
      <QueryClientProvider client={queryClient}>
        <BackendHealthGate>
          <AppRoutes />
        </BackendHealthGate>
        {showDevtools && (
          <React.Suspense fallback={null}>
            <LazyReactQueryDevtools initialIsOpen={false} />
          </React.Suspense>
        )}
      </QueryClientProvider>
    </>
  );
}

function BackendHealthGate({ children }: { children: React.ReactNode }) {
  const backendHealthQuery = useBackendHealthQuery();

  if (!backendHealthQuery.isSuccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          <span>Đang kết nối máy chủ...</span>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { accessToken } = useAuthStore();
  const { connect: connectSocket, disconnect: disconnectSocket } =
    useSocketStore();

  React.useEffect(() => {
    if (accessToken) connectSocket();
    return () => disconnectSocket();
  }, [accessToken, connectSocket, disconnectSocket]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path={APP_ROUTES.signIn} element={<SignInPage />} />
          <Route path={APP_ROUTES.signUp} element={<SignUpPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path={APP_ROUTES.chat} element={<ChatPage />} />
          <Route path={APP_ROUTES.friends} element={<ChatPage />} />
          <Route path={APP_ROUTES.chatConversation} element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
