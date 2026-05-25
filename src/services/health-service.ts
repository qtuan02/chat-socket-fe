import { APP_API } from "@/config/routes";
import { axiosClient } from "@/libs/axios";

export const healthService = {
  getHealthCheck: async (): Promise<boolean> => {
    await axiosClient.get(APP_API.healthCheck);

    return true;
  },
};
