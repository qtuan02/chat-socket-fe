import { ConversationDetailsPanel } from "@/features/conversation/components/conversation-details-panel";
import { useConversationDetailsPanel } from "@/features/conversation/hooks/use-conversation-details-panel";
import { GroupDetailsSectionContainer } from "@/features/group/templates/group-details-section-container";
import type { Conversation } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";

type ConversationDetailsPanelTemplateProps = {
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
};

export function ConversationDetailsPanelTemplate({
  conversation,
  open,
  onClose,
}: ConversationDetailsPanelTemplateProps) {
  const detailsPanelActions = useConversationDetailsPanel();

  return (
    <ConversationDetailsPanel
      conversation={conversation}
      open={open}
      onClose={onClose}
      groupSection={
        conversation.type === ConversationTypeEnum.GROUP ? (
          <GroupDetailsSectionContainer
            conversation={conversation}
            onCloseDetails={onClose}
            onSendFriendRequest={detailsPanelActions.onSendFriendRequest}
            sendingFriendRequestId={detailsPanelActions.sendingFriendRequestId}
          />
        ) : undefined
      }
    />
  );
}
