import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UseMutationOptionsWrapper } from "@/libs/query-key-factory";
import { authService } from "@/services/auth-service";
import type {
  SignInPayload,
  SignInResponse,
  SignOutResponse,
  SignUpPayload,
  SignUpResponse,
} from "@/types/auth";

export function useSignInMutation(
  options?: UseMutationOptionsWrapper<SignInPayload, SignInResponse, Error>,
) {
  return useMutation({
    mutationFn: authService.signIn,
    onError: (error) => {
      toast.error(error?.message || "Sign in failed. Please try again.");
    },
    ...options,
  });
}

export function useSignUpMutation(
  options?: UseMutationOptionsWrapper<SignUpPayload, SignUpResponse, Error>,
) {
  return useMutation({
    mutationFn: authService.signUp,
    onError: (error) => {
      toast.error(error?.message || "Sign up failed. Please try again.");
    },
    ...options,
  });
}

export function useSignOutMutation(
  options?: UseMutationOptionsWrapper<void, SignOutResponse, Error>,
) {
  return useMutation({
    mutationFn: authService.signOut,
    onError: (error) => {
      toast.error(error?.message || "Sign out failed. Please try again.");
    },
    ...options,
  });
}
