import type { BaseResponse } from "@/types/base";

export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  status?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserResponse = BaseResponse<User>;
