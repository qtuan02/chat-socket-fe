import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:8089"),
  PUBLIC_SOCKET_URL: z.string().url().default("ws://localhost:8089/api/ws"),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse({
  NODE_ENV: import.meta.env.NODE_ENV,
  PUBLIC_API_BASE_URL: import.meta.env.PUBLIC_API_BASE_URL,
  PUBLIC_SOCKET_URL: import.meta.env.PUBLIC_SOCKET_URL,
});
