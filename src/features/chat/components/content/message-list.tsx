import * as React from "react";
import { Virtuoso } from "react-virtuoso";
import { Button } from "@/components/ui/button";
import { useMessagesInfiniteQuery } from "@/hooks/api/message";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/conversation";
import type { Message } from "@/types/message";
import { cn } from "@/utils/cn";
import { formatMessageDate } from "@/utils/date";
import { MessageListSkeleton } from "../skeleton/message-list-skeleton";
import { MessageBubble } from "./message-bubble";

const EMPTY_PENDING_MESSAGES: Message[] = [];

type MessageListProps = {
  className?: string;
  conversation: Conversation;
};

function MessageListError({
  className,
  error,
  onRetry,
}: {
  className?: string;
  error: unknown;
  onRetry: () => void;
}) {
  const errorMessage =
    error instanceof Error && error.message
      ? error.message
      : "Unable to load messages.";

  return (
    <section
      className={
        className ??
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm"
      }
    >
      <p className="m-0 text-destructive">{errorMessage}</p>
      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </section>
  );
}

function MessageListEmpty({ className }: { className?: string }) {
  return (
    <section
      className={
        className ??
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground"
      }
    >
      <p className="m-0">No messages yet.</p>
    </section>
  );
}

export function MessageList({ className, conversation }: MessageListProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const pendingMessages = useChatStore(
    (state) =>
      state.pendingMessagesByConversationId[conversation.id] ??
      EMPTY_PENDING_MESSAGES,
  );
  const {
    error,
    fetchNextPage,
    firstItemIndex,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    messages,
    refetch,
  } = useMessagesInfiniteQuery({
    conversationId: conversation.id,
    members: conversation.members,
  });
  const visibleMessages = React.useMemo(() => {
    const serverMessageIds = new Set(messages.map((message) => message.id));
    const localMessages = pendingMessages.filter(
      (message) => !serverMessageIds.has(message.id),
    );

    return [...messages, ...localMessages].sort(
      (firstMessage, secondMessage) =>
        Date.parse(firstMessage.createdAt) -
        Date.parse(secondMessage.createdAt),
    );
  }, [messages, pendingMessages]);

  if (isLoading) return <MessageListSkeleton className={className} />;

  if (isError)
    return (
      <MessageListError
        className={className}
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );

  if (visibleMessages.length === 0)
    return <MessageListEmpty className={className} />;

  return (
    <section className={className ?? "min-h-0 flex-1 overflow-hidden p-4"}>
      <Virtuoso
        key={conversation.id}
        computeItemKey={(_, message) => message.clientMessageId ?? message.id}
        data={visibleMessages}
        firstItemIndex={firstItemIndex}
        followOutput="auto"
        initialTopMostItemIndex={{ index: "LAST", align: "end" }}
        startReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        itemContent={(messageIndex, message) => {
          const arrayIndex = messageIndex - firstItemIndex;
          const previousMessage = visibleMessages[arrayIndex - 1];
          const dateLabel = formatMessageDate(message.createdAt);
          const previousDateLabel = previousMessage
            ? formatMessageDate(previousMessage.createdAt)
            : "";
          const showDateDivider =
            arrayIndex === 0 || dateLabel !== previousDateLabel;
          const isOwnMessage = message.senderId === currentUser?.id;
          const showSenderName =
            !isOwnMessage &&
            (arrayIndex === 0 ||
              previousMessage?.senderId !== message.senderId);

          return (
            <>
              {showDateDivider ? (
                <div className="flex justify-center py-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    {dateLabel}
                  </span>
                </div>
              ) : null}

              <div
                className={cn(
                  "flex pb-1",
                  isOwnMessage ? "justify-end" : "justify-start",
                )}
              >
                <MessageBubble
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showSenderName={showSenderName}
                />
              </div>
            </>
          );
        }}
      />
    </section>
  );
}
