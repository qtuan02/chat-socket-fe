import { APP_API } from "@/config/routes";
import axiosClient from "@/libs/axios";
import type {
  SignInPayload,
  SignInResponse,
  SignOutResponse,
  SignUpPayload,
  SignUpResponse,
} from "@/types/auth";

export const authService = {
  signIn: async (payload: SignInPayload) => {
    const response = await axiosClient.post<SignInResponse>(
      `${APP_API.v1.base}${APP_API.v1.auth.signIn}`,
      payload,
    );

    return response.data;
  },

  signUp: async (payload: SignUpPayload) => {
    const response = await axiosClient.post<SignUpResponse>(
      `${APP_API.v1.base}${APP_API.v1.auth.signUp}`,
      payload,
    );

    return response.data;
  },

  signOut: async () => {
    const response = await axiosClient.post<SignOutResponse>(
      `${APP_API.v1.base}${APP_API.v1.auth.signOut}`,
    );

    return response.data;
  },

  refreshToken: async () => {
    const response = await axiosClient.post<SignInResponse>(
      `${APP_API.v1.base}${APP_API.v1.auth.refreshToken}`,
    );

    return response.data;
  },
};
