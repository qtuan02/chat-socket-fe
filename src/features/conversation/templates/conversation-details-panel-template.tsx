import { ConversationDetailsPanel } from "@/features/conversation/components/conversation-details-panel";
import type { useConversationDetailsPanel } from "@/features/conversation/hooks/use-conversation-details-panel";
import type { useGroupConversationActions } from "@/features/group/hooks/use-group-conversation-actions";
import { GroupDetailsSection } from "@/features/group/templates/group-details-section";
import type { Conversation } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";

type ConversationDetailsPanelTemplateProps = {
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
  groupActions: ReturnType<typeof useGroupConversationActions>;
  detailsPanelActions: ReturnType<typeof useConversationDetailsPanel>;
};

export function ConversationDetailsPanelTemplate({
  conversation,
  open,
  onClose,
  groupActions,
  detailsPanelActions,
}: ConversationDetailsPanelTemplateProps) {
  return (
    <ConversationDetailsPanel
      conversation={conversation}
      open={open}
      onClose={onClose}
      groupSection={
        conversation.type === ConversationTypeEnum.GROUP ? (
          <GroupDetailsSection
            conversation={conversation}
            {...groupActions}
            {...detailsPanelActions}
          />
        ) : undefined
      }
    />
  );
}
