import { Virtuoso } from "react-virtuoso";
import { Button } from "@/components/ui/button";
import { useCurrentUserQuery } from "@/hooks/api/user";
import type { Conversation } from "@/types/conversation";
import { cn } from "@/utils/cn";
import { formatMessageDate } from "@/utils/date";
import { useChatMessages } from "../../hooks/use-chat-messages";
import { MessageListSkeleton } from "../skeleton/message-list-skeleton";
import { MessageBubble } from "./message-bubble";

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
  } = useChatMessages(conversation);

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

  if (messages.length === 0) return <MessageListEmpty className={className} />;

  return (
    <section className={className ?? "min-h-0 flex-1 overflow-hidden p-4"}>
      <Virtuoso
        data={messages}
        firstItemIndex={firstItemIndex}
        followOutput="auto"
        initialTopMostItemIndex={
          messages.length > 0 ? firstItemIndex + messages.length - 1 : 0
        }
        startReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        itemContent={(messageIndex, message) => {
          const arrayIndex = messageIndex - firstItemIndex;
          const previousMessage = messages[arrayIndex - 1];
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
