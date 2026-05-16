import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PUBLIC_API_BASE_URL: z.string().optional(),
  PUBLIC_SOCKET_URL: z.string().optional(),
});

type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = {
  NODE_ENV: import.meta.env.NODE_ENV || "development",
  PUBLIC_API_BASE_URL:
    import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:3000",
  PUBLIC_SOCKET_URL:
    import.meta.env.PUBLIC_SOCKET_URL || "ws://localhost:8089/api/ws",
};
