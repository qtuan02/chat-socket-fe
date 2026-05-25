import * as React from "react";
import { useLocation, useParams } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { MobileChatBottomNav } from "@/features/chat/components/mobile/mobile-chat-bottom-nav";
import { ChatSidebar } from "@/features/chat/components/sidebar/chat-sidebar";
import { useDirectMessageDraft } from "@/features/chat/hooks/use-direct-message-draft";

type ChatShellLayoutProps = {
  children: React.ReactNode;
};

export function ChatShellLayout({ children }: ChatShellLayoutProps) {
  const { conversationId = "" } = useParams();
  const location = useLocation();
  const isFriendsRoute = location.pathname === APP_ROUTES.friends;
  const isProfileRoute = location.pathname === APP_ROUTES.profile;

  const closeDetails = React.useCallback(() => undefined, []);

  const { clearDraftConversation, openDraftConversation, isDraftConversation } =
    useDirectMessageDraft({
      conversationId,
      isChatHomeRoute: false,
      isFriendsRoute,
      isProfileRoute,
      onCloseDetails: closeDetails,
    });

  const sidebarActiveConversationId =
    isDraftConversation || isFriendsRoute || isProfileRoute
      ? ""
      : conversationId;

  const handleConversationSelect = React.useCallback(() => {
    clearDraftConversation();
  }, [clearDraftConversation]);

  return (
    <>
      <main className="min-h-screen h-dvh w-full overflow-hidden bg-muted/50 md:h-screen md:min-h-screen">
        <div className="h-full w-full min-w-0 bg-background">
          <div className="grid h-full min-h-0 w-full overflow-hidden md:grid-cols-[320px_minmax(0,1fr)]">
            <ChatSidebar
              activeConversationId={sidebarActiveConversationId}
              className="hidden md:flex md:w-[320px] md:border-r"
              onConversationSelect={handleConversationSelect}
              onDirectMessageDraftSelect={openDraftConversation}
            />

            <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col border-l border-border md:border-l-0">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-16 md:pb-0">
                {children}
              </div>
            </section>
          </div>
        </div>
      </main>
      <MobileChatBottomNav />
    </>
  );
}
