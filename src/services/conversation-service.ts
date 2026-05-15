import { APP_API } from "@/config/routes";
import axiosClient from "@/libs/axios";
import type {
  ConversationPage,
  ConversationPageResponse,
  GetConversationsParams,
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
};
