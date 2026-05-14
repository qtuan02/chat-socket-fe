import { useQuery } from "@tanstack/react-query";
import {
  queryKeysFactory,
  type UseQueryOptionsWrapper,
} from "@/libs/query-key-factory";
import { userService } from "@/services/v1/user-service";
import type { User } from "@/types/user";

const userQueryKeyFactory = queryKeysFactory<"user", void, "me">("user");

export const currentUserQueryKeys = {
  ...userQueryKeyFactory,
  current: () => userQueryKeyFactory.detail("me"),
};

export function useCurrentUserQuery(options?: UseQueryOptionsWrapper<User>) {
  return useQuery({
    queryKey: currentUserQueryKeys.current(),
    queryFn: userService.getCurrentUserProfile,
    ...options,
  });
}
