import axios from "axios";

import { env } from "@/config/env";
import { authService } from "@/services/auth-service";
import useAuthStore from "@/stores/useAuthStore";

const axiosClient = axios.create({
  baseURL: `${env.PUBLIC_API_BASE_URL}/api`,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url.includes("/auth/signin") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/refresh")
    )
      return Promise.reject(error);

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;

      try {
        const res = await authService.refreshToken();
        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }

    if (axios.isAxiosError(error)) {
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
