import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PUBLIC_API_BASE_URL: z.string().optional(),
});

type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PUBLIC_API_BASE_URL:
    process.env.PUBLIC_API_BASE_URL || "http://localhost:3000",
};
