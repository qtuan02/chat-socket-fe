import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import * as React from "react";
import {
  BrowserRouter,
  matchPath,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router";
import { Toaster, toast } from "sonner";
import { env } from "@/config/env";
import { APP_ROUTES } from "@/config/routes";
import { useBackendHealthQuery } from "@/hooks/api/health";
import { queryClient } from "@/libs/query-client";
import { ChatPage } from "@/pages/chat-page";
import { SignInPage } from "@/pages/sign-in-page";
import { SignUpPage } from "@/pages/sign-up-page";
import { ChatSocketProvider } from "@/providers/chat-socket-provider";
import { GuestRoute } from "@/providers/guest-route";
import { ProtectedRoute } from "@/providers/protected-route";
import useAuthStore from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { isDraftConversationId } from "@/utils/conversation";

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
      <SessionExpiredNotice />
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

function SessionExpiredNotice() {
  const sessionExpiredAt = useAuthStore((state) => state.sessionExpiredAt);
  const clearSessionExpired = useAuthStore(
    (state) => state.clearSessionExpired,
  );

  React.useEffect(() => {
    if (!sessionExpiredAt) return;

    toast.error("Your session has expired. Please sign in again.", {
      id: "session-expired",
    });
    clearSessionExpired();
  }, [clearSessionExpired, sessionExpiredAt]);

  return null;
}

function BackendHealthGate({ children }: { children: React.ReactNode }) {
  const backendHealthQuery = useBackendHealthQuery();

  if (!backendHealthQuery.isSuccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          <span>Connecting to server...</span>
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
          <Route element={<ChatSocketRouteBoundary />}>
            <Route path={APP_ROUTES.chat} element={<ChatPage />} />
            <Route path={APP_ROUTES.friends} element={<ChatPage />} />
            <Route path={APP_ROUTES.chatConversation} element={<ChatPage />} />
            <Route path={APP_ROUTES.profile} element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function ChatSocketRouteBoundary() {
  const location = useLocation();
  const conversationMatch = matchPath(
    APP_ROUTES.chatConversation,
    location.pathname,
  );
  const routeConversationId = conversationMatch?.params.conversationId ?? "";
  const activeConversationId = isDraftConversationId(routeConversationId)
    ? ""
    : routeConversationId;

  return (
    <ChatSocketProvider activeConversationId={activeConversationId}>
      <Outlet />
    </ChatSocketProvider>
  );
}
