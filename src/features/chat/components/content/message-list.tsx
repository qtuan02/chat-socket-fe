import * as React from "react";
import type { VirtuosoHandle } from "react-virtuoso";
import { Virtuoso } from "react-virtuoso";
import { Button } from "@/components/ui/button";
import { useLatestMessageRefetch } from "@/features/chat/hooks/use-latest-message-refetch";
import { useMessageListAutoScroll } from "@/features/chat/hooks/use-message-list-auto-scroll";
import { useMessageReadReceipts } from "@/features/chat/hooks/use-message-read-receipts";
import { useMessagesView } from "@/features/chat/hooks/use-messages-view";
import { useCurrentUserQuery } from "@/hooks/api/user";
import type { Conversation } from "@/types/conversation";
import type { Message } from "@/types/message";
import { cn } from "@/utils/cn";
import { isDraftConversationId } from "@/utils/conversation";
import { MessageListSkeleton } from "../skeleton/message-list-skeleton";
import { MessageRow } from "./message-row";

type MessageListProps = {
  className?: string;
  conversation: Conversation;
  isDraft?: boolean;
};

type ConversationMessageListProps = {
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
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm",
        className,
      )}
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
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      <p className="m-0">No messages yet.</p>
    </section>
  );
}

function getMessageKey(message: Message) {
  return message.clientMessageId ?? message.id;
}

export function MessageList({
  className,
  conversation,
  isDraft = false,
}: MessageListProps) {
  if (isDraft || isDraftConversationId(conversation.id)) {
    return <MessageListEmpty className={className} />;
  }

  return (
    <ConversationMessageList
      className={className}
      conversation={conversation}
    />
  );
}

function ConversationMessageList({
  className,
  conversation,
}: ConversationMessageListProps) {
  const virtuosoRef = React.useRef<VirtuosoHandle>(null);
  const { data: currentUser } = useCurrentUserQuery();
  const {
    error,
    fetchNextPage,
    firstItemIndex,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
    messages,
    refetch,
  } = useMessagesView({
    conversationId: conversation.id,
    members: conversation.members,
  });
  const currentUserId = currentUser?.id;
  const latestMessage = messages[messages.length - 1];
  const latestMessageKey = latestMessage ? getMessageKey(latestMessage) : null;
  const isLatestMessageOwn =
    !!currentUserId && latestMessage?.senderId === currentUserId;
  const readReceiptsByMessageId = useMessageReadReceipts({
    currentUserId,
    members: conversation.members,
    messages,
  });

  useLatestMessageRefetch({
    conversationId: conversation.id,
    isDraft: false,
    isFetching,
    isLoading,
    lastMessageId: conversation.lastMessageId,
    messages,
    refetch,
  });

  useMessageListAutoScroll({
    isLatestMessageOwn,
    latestMessageKey,
    messageCount: messages.length,
    virtuosoRef,
  });

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
    <section
      className={cn(
        "min-h-0 flex-1 overflow-hidden overflow-x-hidden md:py-4",
        className,
      )}
    >
      <Virtuoso
        ref={virtuosoRef}
        alignToBottom
        atBottomThreshold={80}
        key={conversation.id}
        computeItemKey={(_, message) => getMessageKey(message)}
        data={messages}
        firstItemIndex={firstItemIndex}
        followOutput="auto"
        initialTopMostItemIndex={{ index: "LAST", align: "end" }}
        startReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        itemContent={(messageIndex, message) => (
          <MessageRow
            currentUserId={currentUserId}
            firstItemIndex={firstItemIndex}
            message={message}
            messageIndex={messageIndex}
            messages={messages}
            readReceipts={readReceiptsByMessageId.get(message.id) ?? []}
          />
        )}
      />
    </section>
  );
}
