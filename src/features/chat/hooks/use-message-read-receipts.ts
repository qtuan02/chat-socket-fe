import * as React from "react";
import type { ConversationMember } from "@/types/conversation";
import { type Message, MessageStatus } from "@/types/message";

type UseMessageReadReceiptsParams = {
  currentUserId?: string;
  members: ConversationMember[];
  messages: Message[];
};

export function useMessageReadReceipts({
  currentUserId,
  members,
  messages,
}: UseMessageReadReceiptsParams) {
  return React.useMemo(() => {
    const readReceipts = new Map<string, ConversationMember[]>();
    if (!currentUserId) return readReceipts;

    const ownSentMessageIds = new Set(
      messages
        .filter(
          (message) =>
            message.senderId === currentUserId &&
            message.messageStatus === MessageStatus.Sent,
        )
        .map((message) => message.id),
    );

    for (const member of members) {
      const readMessageId = member.lastReadMessageId;

      if (
        member.userId === currentUserId ||
        !readMessageId ||
        !ownSentMessageIds.has(readMessageId)
      ) {
        continue;
      }

      const messageReaders = readReceipts.get(readMessageId);

      if (messageReaders) {
        messageReaders.push(member);
      } else {
        readReceipts.set(readMessageId, [member]);
      }
    }

    return readReceipts;
  }, [currentUserId, members, messages]);
}
