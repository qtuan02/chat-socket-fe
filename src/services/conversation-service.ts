import { APP_API } from "@/config/routes";
import { axiosClient } from "@/libs/axios";
import type { BaseResponse } from "@/types/base";
import type {
  AddGroupMembersResponse,
  ConversationPage,
  ConversationPageResponse,
  CreateGroupConversationRequest,
  CreateGroupConversationResponse,
  GetConversationsParams,
  GroupMembersRequest,
  LeaveGroupResponse,
  RemoveGroupMemberResponse,
  UpdateGroupRequest,
  UpdateGroupResponse,
} from "@/types/conversation";

export const conversationService = {
  getConversations: async (
    params: GetConversationsParams = {},
  ): Promise<ConversationPage> => {
    const { type, limit, cursor } = params;
    const response = await axiosClient.get<ConversationPageResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.conversations}`,
      {
        params: {
          limit,
          cursor,
          type,
        },
      },
    );

    return {
      items: response.data.data.messages,
      nextCursor: response.data.data.nextCursor,
    };
  },

  markAsSeen: async (conversationId: string): Promise<void> => {
    await axiosClient.patch<BaseResponse<null>>(
      `${APP_API.v1.base}${APP_API.v1.chat.markConversationAsSeen(
        conversationId,
      )}`,
    );
  },

  createGroupConversation: async (
    payload: CreateGroupConversationRequest,
  ): Promise<CreateGroupConversationResponse["data"]> => {
    const response = await axiosClient.post<CreateGroupConversationResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.createConversation}`,
      payload,
    );

    return response.data.data;
  },

  updateGroup: async (
    conversationId: string,
    payload: UpdateGroupRequest,
  ): Promise<UpdateGroupResponse["data"]> => {
    const response = await axiosClient.patch<UpdateGroupResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.updateGroup(conversationId)}`,
      payload,
    );

    return response.data.data;
  },

  addGroupMembers: async (
    conversationId: string,
    payload: GroupMembersRequest,
  ): Promise<AddGroupMembersResponse["data"]> => {
    const response = await axiosClient.post<AddGroupMembersResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.addGroupMembers(conversationId)}`,
      payload,
    );

    return response.data.data;
  },

  removeGroupMember: async (
    conversationId: string,
    memberId: string,
  ): Promise<RemoveGroupMemberResponse["data"]> => {
    const response = await axiosClient.delete<RemoveGroupMemberResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.removeGroupMember(
        conversationId,
        memberId,
      )}`,
    );

    return response.data.data;
  },

  leaveGroup: async (
    conversationId: string,
  ): Promise<LeaveGroupResponse["data"]> => {
    const response = await axiosClient.post<LeaveGroupResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.leaveGroup(conversationId)}`,
    );

    return response.data.data;
  },
};
