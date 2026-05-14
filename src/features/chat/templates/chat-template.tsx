import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { APP_ROUTES } from "@/config/routes";
import { ProfileTemplate } from "@/features/profile/templates/profile-template";
import { useSignOutMutation } from "@/hooks/api/auth";
import { currentUserQueryKeys } from "@/hooks/api/user";
import useAuthStore from "@/stores/useAuthStore";
import { ChatHeader } from "../components/chat-header";
import { ConversationList } from "../components/conversation-list";
import { MessageComposer } from "../components/message-composer";
import { MessageList } from "../components/message-list";
import type { ChatMessage, ChatUser, Conversation } from "../types/chat";

const currentUser: ChatUser = {
  id: "user-current",
  displayName: "You",
  isOnline: true,
};

const conversations: Conversation[] = [
  {
    id: "conversation-1",
    title: "Design Team",
    lastMessage: "Great, I will push the latest spec shortly.",
    lastMessageAt: "Today - 09:14",
    participantCount: 6,
    unreadCount: 3,
  },
  {
    id: "conversation-2",
    title: "Product Standup",
    lastMessage: "No messages yet. Start the thread when ready.",
    lastMessageAt: "Yesterday",
    participantCount: 3,
    unreadCount: 0,
  },
  {
    id: "conversation-3",
    title: "Direct message: Alex",
    lastMessage: "Let's sync on the API timeline tomorrow.",
    lastMessageAt: "Monday - 17:40",
    participantCount: 2,
    unreadCount: 1,
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
};

export function ChatTemplate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuthState = useAuthStore((state) => state.clearState);
  const { mutateAsync, isPending: isSignOutPending } = useSignOutMutation({
    onSuccess: () => {
      clearAuthState();
      void queryClient.removeQueries({
        queryKey: currentUserQueryKeys.current(),
      });
      navigate(APP_ROUTES.signIn, { replace: true });
    },
  });

  const activeConversationId = conversations[0].id;
  const activeConversation = conversations[0];
  const activeMessages = messagesByConversation[activeConversationId] ?? [];

  const handleSignOut = async () => {
    await mutateAsync();
  };

  return (
    <main className="min-h-svh bg-muted/50">
      <div className="mx-auto flex h-svh w-full flex-col gap-3 px-3 py-3 md:px-6 md:py-6">
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-xl border border-border bg-background shadow-sm md:grid-cols-[320px_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col md:border-r">
            <ConversationList
              activeConversationId={activeConversationId}
              conversations={conversations}
              className="min-h-0 flex-1 overflow-hidden"
            />
            <section className="sticky bottom-0 border-t border-border bg-background/95 p-2">
              <ProfileTemplate
                variant="compact"
                className="w-full"
                onSignOut={handleSignOut}
                isSignOutPending={isSignOutPending}
              />
            </section>
          </div>
          <section className="flex min-h-0 flex-col">
            <ChatHeader
              conversation={activeConversation}
              onSignOut={handleSignOut}
              isSignOutPending={isSignOutPending}
            />
            <MessageList
              currentUserId={currentUser.id}
              messages={activeMessages}
            />
            <MessageComposer />
          </section>
        </div>
      </div>
    </main>
  );
}
