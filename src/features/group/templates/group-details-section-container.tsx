import { useGroupConversationActions } from "@/features/group/hooks/use-group-conversation-actions";
import { GroupDetailsSection } from "@/features/group/templates/group-details-section";
import type { Conversation } from "@/types/conversation";

type GroupDetailsSectionContainerProps = {
  conversation: Conversation;
  onCloseDetails: () => void;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  sendingFriendRequestId?: string | null;
};

export function GroupDetailsSectionContainer({
  conversation,
  onCloseDetails,
  onSendFriendRequest,
  sendingFriendRequestId,
}: GroupDetailsSectionContainerProps) {
  const groupActions = useGroupConversationActions({
    conversation,
    onCloseDetails,
  });

  return (
    <GroupDetailsSection
      conversation={conversation}
      {...groupActions}
      onSendFriendRequest={onSendFriendRequest}
      sendingFriendRequestId={sendingFriendRequestId}
    />
  );
}
