import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SignInResponse } from "@/types/auth";

export function useAuthSessionSuccess() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return (data: SignInResponse) => {
    queryClient.clear();
    setAccessToken(data.data.accessToken);
    toast.success(data?.message || "Sign in successful.");
    navigate(APP_ROUTES.chat, { replace: true });
  };
}
