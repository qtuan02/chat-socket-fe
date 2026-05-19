import type { BaseResponse } from "./base";

export interface SignInPayload {
  username: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

interface AuthTokenResponse {
  accessToken: string;
}

export type SignInResponse = BaseResponse<AuthTokenResponse>;
export type SignUpResponse = BaseResponse<null>;
export type SignOutResponse = BaseResponse<null>;
