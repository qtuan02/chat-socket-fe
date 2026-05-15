import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { env } from "@/config/env";
import { APP_ROUTES } from "@/config/routes";
import { GuestRoute } from "@/features/auth/providers/guest-route";
import { ProtectedRoute } from "@/features/auth/providers/protected-route";
import { ChatPage } from "@/pages/chat-page";
import { SignInPage } from "@/pages/sign-in-page";
import { SignUpPage } from "@/pages/sign-up-page";

const LazyReactQueryDevtools = React.lazy(async () => {
  const { ReactQueryDevtools } = await import("@tanstack/react-query-devtools");
  return { default: ReactQueryDevtools };
});

export function App() {
  const [queryClient] = React.useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 0,
        },
      },
    }),
  );

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
        <BrowserRouter>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path={APP_ROUTES.signIn} element={<SignInPage />} />
              <Route path={APP_ROUTES.signUp} element={<SignUpPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path={APP_ROUTES.chat} element={<ChatPage />} />
              <Route
                path={APP_ROUTES.chatConversation}
                element={<ChatPage />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
        {showDevtools && (
          <React.Suspense fallback={null}>
            <LazyReactQueryDevtools initialIsOpen={false} />
          </React.Suspense>
        )}
      </QueryClientProvider>
    </>
  );
}
