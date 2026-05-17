import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  queryKeysFactory,
  type UseMutationOptionsWrapper,
  type UseQueryOptionsWrapper,
} from "@/libs/query-key-factory";
import { userService } from "@/services/user-service";
import useAuthStore from "@/stores/useAuthStore";
import type {
  UpdateUserRequestPayload,
  User,
  UserItemData,
} from "@/types/user";

const userQueryKeyFactory = queryKeysFactory<"user">("user");

export const currentUserQueryKeys = {
  ...userQueryKeyFactory,
  current: () => userQueryKeyFactory.detail("me"),
  info: (userId: string) => userQueryKeyFactory.detail(userId),
};

export function useCurrentUserQuery(options?: UseQueryOptionsWrapper<User>) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    ...options,
    queryKey: currentUserQueryKeys.current(),
    queryFn: userService.getCurrentUserProfile,
    enabled: !!accessToken && (options?.enabled ?? true),
  });
}

export function useUserInfoQuery(
  userId: string | null,
  options?: UseQueryOptionsWrapper<UserItemData>,
) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    ...options,
    queryKey: currentUserQueryKeys.info(userId ?? ""),
    queryFn: () => userService.getUserInfo(userId ?? ""),
    enabled: !!accessToken && !!userId && (options?.enabled ?? true),
  });
}

export function useUpdateCurrentUserMutation(
  options?: UseMutationOptionsWrapper<UpdateUserRequestPayload, User, Error>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateCurrentUserProfile,
    onError: (error) => {
      toast.error(error?.message || "Unable to update user profile.");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: currentUserQueryKeys.current(),
      });
    },
    ...options,
  });
}
