import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import {
  useAddGroupMembersMutation,
  useLeaveGroupMutation,
  useRemoveGroupMemberMutation,
  useUpdateGroupMutation,
} from "@/hooks/api/conversation";
import {
  friendRequestQueryKeys,
  useSendFriendRequestMutation,
} from "@/hooks/api/friend";
import { messageQueryKeys } from "@/hooks/api/message";
import { useCurrentUserQuery } from "@/hooks/api/user";
import {
  type Conversation,
  ConversationTypeEnum,
  type GroupMembersRequest,
  type UpdateGroupRequest,
} from "@/types/conversation";
import { getErrorMessage } from "@/utils/error";

type UseConversationDetailsActionsParams = {
  conversation?: Conversation;
  onCloseDetails: () => void;
};

export function useConversationDetailsActions({
  conversation,
  onCloseDetails,
}: UseConversationDetailsActionsParams) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserQuery();
  const [removingMemberId, setRemovingMemberId] = React.useState<string | null>(
    null,
  );
  const [sendingFriendRequestId, setSendingFriendRequestId] = React.useState<
    string | null
  >(null);

  const { mutate: sendFriendRequest, isPending: isSendingFriendRequest } =
    useSendFriendRequestMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: friendRequestQueryKeys.all,
        });
        toast.success("Friend request sent.");
        setSendingFriendRequestId(null);
      },
    });

  const { mutate: updateGroup, isPending: isRenameGroupSubmitting } =
    useUpdateGroupMutation({
      onSuccess: () => {
        toast.success("Group name updated.");
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Failed to update group name."));
      },
    });

  const { mutate: addGroupMembers, isPending: isAddMembersSubmitting } =
    useAddGroupMembersMutation({
      onSuccess: () => {
        toast.success("Group members updated.");
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Failed to add members."));
      },
    });

  const { mutate: removeGroupMember } = useRemoveGroupMemberMutation({
    onSuccess: () => {
      toast.success("Member removed from the group.");
      setRemovingMemberId(null);
    },
    onError: (error) => {
      setRemovingMemberId(null);
      toast.error(getErrorMessage(error, "Failed to remove member."));
    },
  });

  const { mutate: leaveGroup, isPending: isLeaveGroupSubmitting } =
    useLeaveGroupMutation({
      onSuccess: (conversationId) => {
        toast.success("You left the group.");
        onCloseDetails();

        if (currentUser?.id) {
          queryClient.invalidateQueries({
            queryKey: messageQueryKeys.messages(currentUser.id, conversationId),
          });
        }

        navigate(APP_ROUTES.chat);
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(
            error,
            "Failed to leave group. You may not be allowed to.",
          ),
        );
      },
    });

  const handleRenameGroup = React.useCallback(
    (name: string) => {
      if (conversation?.type !== ConversationTypeEnum.GROUP) return;

      const payload: UpdateGroupRequest = {
        name: name.trim(),
      };

      updateGroup({
        conversationId: conversation.id,
        payload,
      });
    },
    [conversation, updateGroup],
  );

  const handleAddMembers = React.useCallback(
    (payload: GroupMembersRequest) => {
      if (conversation?.type !== ConversationTypeEnum.GROUP) return;

      addGroupMembers({
        conversationId: conversation.id,
        payload,
      });
    },
    [addGroupMembers, conversation],
  );

  const handleLeaveGroup = React.useCallback(() => {
    if (conversation?.type !== ConversationTypeEnum.GROUP) return;

    leaveGroup(conversation.id);
  }, [conversation, leaveGroup]);

  const handleRemoveMember = React.useCallback(
    (memberId: string) => {
      if (conversation?.type !== ConversationTypeEnum.GROUP) return;

      setRemovingMemberId(memberId);
      removeGroupMember({
        conversationId: conversation.id,
        memberId,
      });
    },
    [conversation, removeGroupMember],
  );

  const handleSendFriendRequest = React.useCallback(
    (userId: string, message?: string) => {
      if (isSendingFriendRequest) return;

      setSendingFriendRequestId(userId);
      sendFriendRequest(
        {
          toUserId: userId,
          message: message?.trim() || undefined,
        },
        {
          onSettled: () => {
            setSendingFriendRequestId((currentId) =>
              currentId === userId ? null : currentId,
            );
          },
        },
      );
    },
    [isSendingFriendRequest, sendFriendRequest],
  );

  return {
    isAddMembersSubmitting,
    isLeaveGroupSubmitting,
    isRenameGroupSubmitting,
    onAddMembers: handleAddMembers,
    onLeaveGroup: handleLeaveGroup,
    onRemoveMember: handleRemoveMember,
    onRenameGroup: handleRenameGroup,
    onSendFriendRequest: handleSendFriendRequest,
    removingMemberId,
    sendingFriendRequestId,
  };
}
