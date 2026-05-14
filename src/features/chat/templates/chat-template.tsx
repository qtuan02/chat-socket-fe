import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { APP_ROUTES } from "@/config/routes";
import { useSignOutMutation } from "@/hooks/api/auth";
import { currentUserQueryKeys } from "@/hooks/api/user";
import useAuthStore from "@/stores/useAuthStore";
import { cn } from "@/utils/cn";
import { ChatHeader } from "../components/chat-header";
import { ChatSidebar } from "../components/chat-sidebar";
import { ConversationDetailsPanel } from "../components/conversation-details-panel";
import { MessageComposer } from "../components/message-composer";
import { MessageList } from "../components/message-list";
import type {
  ChatMessage,
  ChatUser,
  Conversation,
  ConversationFilter,
} from "../types/chat";

const currentUser: ChatUser = {
  id: "user-current",
  displayName: "You",
  isOnline: true,
};

const conversations: Conversation[] = [
  {
    id: "conversation-1",
    title: "Design Team",
    kind: "group",
    lastMessage: "Great, I will push the latest spec shortly.",
    lastMessageAt: "Today - 09:14",
    participantCount: 6,
    unreadCount: 3,
    onlineUsersCount: 3,
    statusText: "Team active",
    members: [
      {
        id: "member-01",
        displayName: "Maya",
        isOnline: true,
        role: "Design Lead",
      },
      {
        id: "member-02",
        displayName: "Ibrahim",
        isOnline: true,
        role: "Product Designer",
      },
      {
        id: "member-03",
        displayName: "Sophia",
        isOnline: false,
        role: "Research",
      },
      {
        id: "member-04",
        displayName: "Liam",
        isOnline: true,
        role: "Developer",
      },
      {
        id: "member-05",
        displayName: "Noah",
        isOnline: false,
        role: "QA",
      },
      {
        id: "member-06",
        displayName: "Riley",
        isOnline: true,
        role: "PM",
      },
    ],
  },
  {
    id: "conversation-2",
    title: "Product Standup",
    kind: "group",
    lastMessage: "No messages yet. Start the thread when ready.",
    lastMessageAt: "Yesterday",
    participantCount: 3,
    unreadCount: 0,
    onlineUsersCount: 2,
    members: [
      {
        id: "member-07",
        displayName: "Alex",
        isOnline: true,
        role: "Tech Lead",
      },
      {
        id: "member-08",
        displayName: "Jordan",
        isOnline: false,
        role: "Marketing",
      },
      {
        id: "member-09",
        displayName: "You",
        isOnline: true,
        role: "Owner",
      },
    ],
  },
  {
    id: "conversation-3",
    title: "Alex",
    kind: "direct",
    lastMessage: "Let's sync on the API timeline tomorrow.",
    lastMessageAt: "Monday - 17:40",
    participantCount: 2,
    unreadCount: 1,
    onlineUsersCount: 2,
    members: [
      { id: "member-10", displayName: "You", isOnline: true, role: "You" },
      {
        id: "member-11",
        displayName: "Alex",
        isOnline: true,
        role: "Manager",
      },
    ],
  },
  {
    id: "conversation-4",
    title: "Maya",
    kind: "direct",
    lastMessage: "Can you quickly review the onboarding copy?",
    lastMessageAt: "Friday - 13:11",
    participantCount: 2,
    unreadCount: 2,
    onlineUsersCount: 1,
    members: [
      { id: "member-12", displayName: "You", isOnline: true, role: "You" },
      {
        id: "member-13",
        displayName: "Maya",
        isOnline: false,
        role: "Contributor",
      },
    ],
  },
];

const messagesByConversation: Record<string, ChatMessage[]> = {
  "conversation-1": [
    {
      id: "m-01",
      conversationId: "conversation-1",
      senderId: "user-other-1",
      senderName: "Maya",
      content: "The wireframes are in. Want me to share?",
      sentAt: "09:03",
    },
    {
      id: "m-02",
      conversationId: "conversation-1",
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      content: "Yes, send them over. I will review after standup.",
      sentAt: "09:07",
    },
    {
      id: "m-03",
      conversationId: "conversation-1",
      senderId: "user-other-2",
      senderName: "Ibrahim",
      content:
        "Great, I will push the latest spec shortly. We should be aligned by 10:30.",
      sentAt: "09:14",
    },
  ],
  "conversation-2": [],
  "conversation-3": [
    {
      id: "m-04",
      conversationId: "conversation-3",
      senderId: "user-other-3",
      senderName: "Alex",
      content: "Hey, do you have time to review the socket schema?",
      sentAt: "16:52",
    },
    {
      id: "m-05",
      conversationId: "conversation-3",
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      content: "Absolutely, send it now.",
      sentAt: "16:54",
    },
  ],
  "conversation-4": [
    {
      id: "m-06",
      conversationId: "conversation-4",
      senderId: "user-other-4",
      senderName: "Maya",
      content: "Can you check the onboarding copy for voice consistency?",
      sentAt: "12:58",
    },
    {
      id: "m-07",
      conversationId: "conversation-4",
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      content: "On it. I'll review and leave feedback by EOD.",
      sentAt: "13:01",
    },
  ],
};

export function ChatTemplate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuthState = useAuthStore((state) => state.clearState);
  const [activeConversationId, setActiveConversationId] = React.useState(
    conversations[0]?.id ?? "",
  );
  const [conversationFilter, setConversationFilter] =
    React.useState<ConversationFilter>("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const { mutateAsync, isPending: isSignOutPending } = useSignOutMutation({
    onSuccess: () => {
      clearAuthState();
      void queryClient.removeQueries({
        queryKey: currentUserQueryKeys.current(),
      });
      navigate(APP_ROUTES.signIn, { replace: true });
    },
  });

  const filteredConversations = React.useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return conversations.filter((conversation) => {
      if (conversationFilter === "groups" && conversation.kind !== "group") {
        return false;
      }

      if (conversationFilter === "direct" && conversation.kind !== "direct") {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const searchable =
        `${conversation.title} ${conversation.lastMessage}`.toLowerCase();
      return searchable.includes(normalizedSearchTerm);
    });
  }, [conversationFilter, searchTerm]);

  const activeConversation = React.useMemo(
    () =>
      filteredConversations.find((item) => item.id === activeConversationId) ??
      filteredConversations[0] ??
      conversations[0],
    [activeConversationId, filteredConversations],
  );

  React.useEffect(() => {
    if (!activeConversation && conversations[0]) {
      setActiveConversationId(conversations[0].id);
      return;
    }

    if (!activeConversationId && filteredConversations.length > 0) {
      setActiveConversationId(filteredConversations[0].id);
      return;
    }

    if (
      !filteredConversations.some((item) => item.id === activeConversationId)
    ) {
      setActiveConversationId(filteredConversations[0]?.id ?? "");
    }
  }, [activeConversation, activeConversationId, filteredConversations]);

  React.useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const handleBodyScroll = () => {
      if (window.innerWidth >= 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleBodyScroll);
    return () => {
      window.removeEventListener("resize", handleBodyScroll);
    };
  }, [isSidebarOpen]);

  const activeMessages = React.useMemo(
    () => messagesByConversation[activeConversation?.id ?? ""] ?? [],
    [activeConversation],
  );
  const onlineUsersCount = activeConversation
    ? (activeConversation.onlineUsersCount ??
      activeConversation.participantCount)
    : 0;

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsSidebarOpen(false);
    setIsDetailsOpen(false);
  };

  const handleSignOut = async () => {
    await mutateAsync();
  };

  const sidebarCommonProps = {
    activeConversationId,
    conversationFilter,
    conversations: filteredConversations,
    onConversationFilterChange: setConversationFilter,
    onConversationSelect: handleConversationSelect,
    onSearchTermChange: setSearchTerm,
    isSignOutPending,
    onSignOut: handleSignOut,
    searchTerm,
  };

  if (!activeConversation) {
    return (
      <main className="h-[100dvh] min-h-[100dvh] w-full bg-muted/50">
        <div className="flex h-full w-full min-w-0 items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            No conversations available yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-muted/50">
      <div className="h-full w-full min-w-0 bg-background">
        <div
          className={cn(
            "grid h-full min-h-0 w-full overflow-hidden",
            isDetailsOpen
              ? "md:grid-cols-[320px_minmax(0,1fr)_320px]"
              : "md:grid-cols-[320px_minmax(0,1fr)]",
          )}
        >
          <ChatSidebar
            className="hidden md:flex md:w-[320px] md:border-r"
            {...sidebarCommonProps}
          />
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="w-[320px] p-0 md:hidden">
              <ChatSidebar className="h-full" {...sidebarCommonProps} />
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
                    {activeConversation.title}
                  </h2>
                </div>
              </div>
              <ChatHeader
                conversation={activeConversation}
                isDetailsOpen={isDetailsOpen}
                onlineUsersCount={onlineUsersCount}
                onOpenDetails={() => {
                  setIsDetailsOpen((old) => !old);
                }}
              />
              <MessageList
                currentUserId={currentUser.id}
                messages={activeMessages}
              />
              <MessageComposer isDisabled />
            </section>
          </Sheet>
          <ConversationDetailsPanel
            conversation={activeConversation}
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
          />
        </div>
      </div>
    </main>
  );
}
