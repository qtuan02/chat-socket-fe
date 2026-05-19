import * as React from "react";
import { toast } from "sonner";
import {
  useSendDirectMessageMutation,
  useSendGroupMessageMutation,
} from "@/hooks/api/message";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useThrottle } from "@/hooks/use-throttle";
import type { Conversation } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { type MessageRecord, MessageTypeEnum } from "@/types/message";
import { getErrorMessage } from "@/utils/error";

type UseSendMessageOptions = {
  conversation: Conversation;
  content: string;
  onAfterMessageSent: () => void;
  onClearContent: () => void;
  onMessageSent?: (message: MessageRecord) => void;
  onRestoreContent: (content: string) => void;
};

export function useSendMessage({
  conversation,
  content,
  onAfterMessageSent,
  onClearContent,
  onMessageSent,
  onRestoreContent,
}: UseSendMessageOptions) {
  const sendDirectMessageMutation = useSendDirectMessageMutation();
  const sendGroupMessageMutation = useSendGroupMessageMutation();
  const { data: currentUser } = useCurrentUserQuery();

  const sendMessageForConversation = React.useCallback(
    async (messageContent: string) => {
      if (conversation.type === ConversationTypeEnum.DIRECT) {
        const recipientId = conversation.directMember?.userId;
        if (!recipientId) return undefined;

        return sendDirectMessageMutation.mutateAsync({
          content: messageContent,
          recipientId,
          type: MessageTypeEnum.TEXT,
          attachmentUrl: null,
        });
      }

      return sendGroupMessageMutation.mutateAsync({
        conversationId: conversation.id,
        content: messageContent,
        type: MessageTypeEnum.TEXT,
        attachmentUrl: null,
      });
    },
    [
      conversation.directMember?.userId,
      conversation.id,
      conversation.type,
      sendDirectMessageMutation.mutateAsync,
      sendGroupMessageMutation.mutateAsync,
    ],
  );

  const handleMessageSent = React.useCallback(
    (sentMessage: MessageRecord) => {
      onMessageSent?.(sentMessage);
      onAfterMessageSent();
    },
    [onAfterMessageSent, onMessageSent],
  );

  const sendSubmittedMessage = React.useCallback(
    async (messageContent: string) => {
      const sentMessage = await sendMessageForConversation(messageContent);

      if (!sentMessage) return;

      handleMessageSent(sentMessage);
    },
    [handleMessageSent, sendMessageForConversation],
  );

  const { throttle: throttleSubmit, isThrottling } = useThrottle(
    sendSubmittedMessage,
    300,
  );

  const isSending =
    sendDirectMessageMutation.isPending || sendGroupMessageMutation.isPending;
  const isSendBlocked = isSending || isThrottling;
  const actionLabel = isSending ? "Sending..." : "Send";

  const handleSubmit = React.useCallback(async () => {
    if (isSendBlocked) return;

    if (!currentUser?.id) return;

    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    onClearContent();

    try {
      await throttleSubmit(trimmedContent);
    } catch (error) {
      onRestoreContent(trimmedContent);
      toast.error(getErrorMessage(error, "Unable to send message."));
    }
  }, [
    content,
    currentUser?.id,
    isSendBlocked,
    onClearContent,
    onRestoreContent,
    throttleSubmit,
  ]);

  return {
    actionLabel,
    isSendBlocked,
    handleSubmit,
  };
}
