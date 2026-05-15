import { Menu } from "lucide-react";
import * as React from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/utils/cn";
import { ChatHeader } from "../components/content/chat-header";
import { EmptyConversationBanner } from "../components/content/empty-conversation-banner";
import { MessageComposer } from "../components/content/message-composer";
import { MessageList } from "../components/content/message-list";
import { ChatSidebar } from "../components/conversation/chat-sidebar";
import { ConversationDetailsPanel } from "../components/conversation/conversation-details-panel";
import { WelcomeSkeleton } from "../components/skeleton/welcome-skeleton";
import { useChatConversations } from "../hooks/use-chat-conversations";

export function ChatTemplate() {
  const { conversationId = "" } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const { conversations, isLoading: isConversationsLoading } =
    useChatConversations();

  const activeConversation = React.useMemo(
    () =>
      conversations.find((conversation) => conversation.id === conversationId),
    [conversationId, conversations],
  );

  const handleConversationSelect = React.useCallback(() => {
    setIsSidebarOpen(false);
    setIsDetailsOpen(false);
  }, []);

  return (
    <main className="h-screen w-full overflow-hidden bg-muted/50">
      <div className="h-full w-full min-w-0 bg-background">
        <div
          className={cn(
            "grid h-full min-h-0 w-full overflow-hidden",
            activeConversation && isDetailsOpen
              ? "md:grid-cols-[320px_minmax(0,1fr)_320px]"
              : "md:grid-cols-[320px_minmax(0,1fr)]",
          )}
        >
          <ChatSidebar
            activeConversationId={conversationId}
            className="hidden md:flex md:w-[320px] md:border-r"
            onConversationSelect={handleConversationSelect}
          />

          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="w-[320px] p-0 md:hidden">
              <ChatSidebar
                activeConversationId={conversationId}
                className="h-full"
                onConversationSelect={handleConversationSelect}
              />
            </SheetContent>

            <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col border-l border-border md:border-l-0">
              <div className="border-b border-border px-3 md:hidden">
                <div className="flex h-14 items-center gap-2">
                  <SheetTrigger asChild>
                    <Button type="button" size="sm" variant="outline">
                      <Menu className="size-4" />
                      <span>Conversations</span>
                    </Button>
                  </SheetTrigger>
                  <h2 className="truncate text-sm font-medium">
                    {activeConversation?.title ?? "Chat"}
                  </h2>
                </div>
              </div>

              {activeConversation ? (
                <>
                  <ChatHeader
                    conversation={activeConversation}
                    onOpenDetails={() => {
                      setIsDetailsOpen((isOpen) => !isOpen);
                    }}
                  />
                  <MessageList conversation={activeConversation} />
                  <MessageComposer conversation={activeConversation} />
                </>
              ) : isConversationsLoading ? (
                <WelcomeSkeleton />
              ) : (
                <EmptyConversationBanner />
              )}
            </section>
          </Sheet>

          {activeConversation ? (
            <ConversationDetailsPanel
              conversation={activeConversation}
              open={isDetailsOpen}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
