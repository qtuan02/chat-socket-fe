import { ConversationAvatar } from "@/components/shared/conversation-avatar";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/types/conversation";
import { cn } from "@/utils/cn";
import { formatTimestamp } from "@/utils/date";

type ConversationListItemProps = {
  activeConversationId: string;
  conversation: Conversation;
  onSelectConversation: (conversationId: string) => void;
};

function formatLastMessagePreview(conversation: Conversation) {
  if (!conversation.lastMessageId) return conversation.lastMessage;

  const senderLabel =
    conversation.lastMessageSenderId === conversation.currentUserId
      ? "You"
      : conversation.lastMessageSenderName || "Unknown";

  return `${senderLabel}: ${conversation.lastMessage}`;
}

function formatUnreadCount(unreadCount: number) {
  return unreadCount > 99 ? "99+" : unreadCount.toString();
}

export function ConversationListItem({
  activeConversationId,
  conversation,
  onSelectConversation,
}: ConversationListItemProps) {
  const isActive = conversation.id === activeConversationId;
  const hasUnreadMessages = conversation.unreadCount > 0;

  return (
    <div className="my-0.25">
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "h-auto w-full min-w-0 items-center justify-start gap-3 whitespace-normal rounded-xl p-2 text-left",
          isActive && "bg-primary/10 hover:bg-primary/10",
        )}
        aria-current={isActive ? "true" : undefined}
        onClick={() => {
          onSelectConversation(conversation.id);
        }}
      >
        <ConversationAvatar conversation={conversation} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p
              className={cn(
                "m-0 min-w-0 flex-1 truncate text-sm",
                hasUnreadMessages ? "font-semibold" : "font-medium",
              )}
            >
              {conversation.title}
            </p>
            <span
              className={cn(
                "shrink-0 text-[11px] text-muted-foreground",
                hasUnreadMessages && "font-medium text-primary",
              )}
            >
              {formatTimestamp(conversation.lastMessageAt)}
            </span>
          </div>
          <div className="mt-0.5 flex min-w-0 items-center justify-between gap-3">
            <p
              className={cn(
                "m-0 min-w-0 flex-1 truncate text-xs text-muted-foreground",
                hasUnreadMessages && "font-medium text-foreground",
              )}
            >
              {formatLastMessagePreview(conversation)}
            </p>
            {hasUnreadMessages ? (
              <span className="inline-flex min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {formatUnreadCount(conversation.unreadCount)}
              </span>
            ) : null}
          </div>
        </div>
      </Button>
    </div>
  );
}
