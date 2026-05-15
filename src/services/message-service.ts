import { APP_API } from "@/config/routes";
import axiosClient from "@/libs/axios";
import type {
  GetMessagesParams,
  MessageDto,
  MessagePage,
  MessagePageResponse,
  MessageResponse,
  SendDirectMessageRequest,
  SendGroupMessageRequest,
} from "@/types/message";

export const messageService = {
  getMessages: async ({
    conversationId,
    limit,
    cursor,
  }: GetMessagesParams): Promise<MessagePage> => {
    const response = await axiosClient.get<MessagePageResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.messages(conversationId)}`,
      {
        params: {
          limit,
          cursor,
        },
      },
    );

    return {
      items: response.data.data.messages,
      nextCursor: response.data.data.nextCursor,
    };
  },

  sendDirectMessage: async (
    payload: SendDirectMessageRequest,
  ): Promise<MessageDto> => {
    const response = await axiosClient.post<MessageResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.sendDirectMessage}`,
      payload,
    );

    return response.data.data;
  },

  sendGroupMessage: async (
    payload: SendGroupMessageRequest,
  ): Promise<MessageDto> => {
    const response = await axiosClient.post<MessageResponse>(
      `${APP_API.v1.base}${APP_API.v1.chat.sendGroupMessage}`,
      payload,
    );

    return response.data.data;
  },
};
