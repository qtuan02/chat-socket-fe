import { APP_API } from "@/config/routes";
import axiosClient from "@/libs/axios";
import type { UserResponse } from "@/types/user";

export const userService = {
  getCurrentUserProfile: async () => {
    const response = await axiosClient.get<UserResponse>(
      `${APP_API.v1.base}${APP_API.v1.user.me}`,
    );

    return response.data.data;
  },
};
