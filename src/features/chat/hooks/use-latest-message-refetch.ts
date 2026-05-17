import * as React from "react";
import type { Message } from "@/types/message";

type UseLatestMessageRefetchParams = {
  conversationId: string;
  isDraft: boolean;
  isFetching: boolean;
  isLoading: boolean;
  lastMessageId?: string | null;
  messages: Message[];
  refetch: () => Promise<unknown>;
};

function hasMessage(messages: Message[], messageId?: string | null) {
  return !messageId || messages.some((message) => message.id === messageId);
}

export function useLatestMessageRefetch({
  conversationId,
  isDraft,
  isFetching,
  isLoading,
  lastMessageId,
  messages,
  refetch,
}: UseLatestMessageRefetchParams) {
  const refetchedMessageKeyRef = React.useRef<string | null>(null);
  const hasLatestMessage = React.useMemo(
    () => hasMessage(messages, lastMessageId),
    [lastMessageId, messages],
  );

  React.useEffect(() => {
    if (
      isDraft ||
      isLoading ||
      isFetching ||
      !lastMessageId ||
      hasLatestMessage
    )
      return;

    const refetchKey = `${conversationId}:${lastMessageId}`;
    if (refetchedMessageKeyRef.current === refetchKey) return;

    refetchedMessageKeyRef.current = refetchKey;
    void refetch();
  }, [
    conversationId,
    hasLatestMessage,
    isDraft,
    isFetching,
    isLoading,
    lastMessageId,
    refetch,
  ]);
}
