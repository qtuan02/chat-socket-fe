import axios, { type InternalAxiosRequestConfig } from "axios";

import { env } from "@/config/env";
import { APP_API } from "@/config/routes";
import { queryClient } from "@/libs/query-client";
import useAuthStore from "@/stores/useAuthStore";
import type { SignInResponse } from "@/types/auth";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retryCount?: number;
};

type RefreshTokenRequest = Promise<SignInResponse["data"]["accessToken"]>;

const AUTH_RETRY_LIMIT = 1;
const AUTH_RETRY_STATUS_CODES = new Set([401, 403]);
const PUBLIC_AUTH_PATHS = [
  `${APP_API.v1.base}${APP_API.v1.auth.signIn}`,
  `${APP_API.v1.base}${APP_API.v1.auth.signUp}`,
  `${APP_API.v1.base}${APP_API.v1.auth.refreshToken}`,
] as const;

let refreshTokenRequest: RefreshTokenRequest | null = null;

function isPublicAuthPath(url?: string) {
  return PUBLIC_AUTH_PATHS.some((path) => url?.includes(path));
}

async function getFreshAccessToken() {
  if (!refreshTokenRequest) {
    refreshTokenRequest = axiosClient
      .post<SignInResponse>(`${APP_API.v1.base}${APP_API.v1.auth.refreshToken}`)
      .then((response) => response.data.data.accessToken)
      .finally(() => {
        refreshTokenRequest = null;
      });
  }

  return refreshTokenRequest;
}

const axiosClient = axios.create({
  baseURL: `${env.PUBLIC_API_BASE_URL}/api`,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken && !isPublicAuthPath(config.url)) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      const originalRequest = error.config as
        | RetryableRequestConfig
        | undefined;
      const retryCount = originalRequest?._retryCount ?? 0;
      const hasAccessToken = !!useAuthStore.getState().accessToken;
      const shouldRefreshToken =
        originalRequest &&
        !isPublicAuthPath(originalRequest.url) &&
        hasAccessToken &&
        error.response?.status !== undefined &&
        AUTH_RETRY_STATUS_CODES.has(error.response.status) &&
        retryCount < AUTH_RETRY_LIMIT;

      if (shouldRefreshToken) {
        originalRequest._retryCount = retryCount + 1;

        try {
          const newAccessToken = await getFreshAccessToken();
          useAuthStore.getState().setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          queryClient.clear();
          useAuthStore.getState().clearState();
          return Promise.reject(refreshError);
        }
      }

      const responseData = error.response?.data;
      const responseMessage =
        responseData &&
        typeof responseData === "object" &&
        "message" in responseData &&
        typeof responseData.message === "string" &&
        responseData.message.trim().length > 0
          ? responseData.message
          : "";

      const finalMessage =
        responseMessage || error.message || "Request failed.";
      return Promise.reject(new Error(finalMessage));
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
