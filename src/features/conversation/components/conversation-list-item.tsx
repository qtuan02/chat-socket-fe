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
    <div className="px-1 pt-2">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-auto min-w-0 w-full justify-start overflow-hidden rounded-lg p-2 text-left whitespace-normal shadow-none",
          "hover:border-primary/50 hover:bg-muted/50",
          isActive
            ? "border-primary/70! bg-primary/10!"
            : "border-border/80 bg-background",
          hasUnreadMessages && !isActive && "bg-primary/5",
        )}
        aria-current={isActive ? "true" : undefined}
        onClick={() => {
          onSelectConversation(conversation.id);
        }}
      >
        <div className="flex min-h-12 min-w-0 w-full items-start gap-3">
          <ConversationAvatar conversation={conversation} />
          <div className="min-w-0 flex-1 py-1">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p
                className={cn(
                  "m-0 min-w-0 flex-1 truncate text-sm font-medium",
                  hasUnreadMessages && "font-semibold",
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
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p
                className={cn(
                  "m-0 mt-1 min-w-0 flex-1 truncate text-xs text-muted-foreground",
                  hasUnreadMessages && "font-medium text-foreground",
                )}
              >
                {formatLastMessagePreview(conversation)}
              </p>
              {hasUnreadMessages ? (
                <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                  {formatUnreadCount(conversation.unreadCount)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Button>
    </div>
  );
}
