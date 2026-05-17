import * as React from "react";
import { useMarkConversationAsSeenMutation } from "@/hooks/api/conversation";
import type { Conversation } from "@/types/conversation";

type UseConversationAutoSeenParams = {
  conversation?: Conversation;
  isEnabled: boolean;
};

export function useConversationAutoSeen({
  conversation,
  isEnabled,
}: UseConversationAutoSeenParams) {
  const { mutate: markConversationAsSeen } =
    useMarkConversationAsSeenMutation();
  const lastSeenMessageRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (
      !isEnabled ||
      !conversation ||
      conversation.unreadCount === 0 ||
      !conversation.lastMessageId
    )
      return;

    const lastSeenMessageKey = `${conversation.id}:${conversation.lastMessageId}`;
    if (lastSeenMessageRef.current === lastSeenMessageKey) return;

    lastSeenMessageRef.current = lastSeenMessageKey;
    markConversationAsSeen(conversation.id);
  }, [conversation, isEnabled, markConversationAsSeen]);
}
