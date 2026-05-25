import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  queryKeysFactory,
  type UseMutationOptionsWrapper,
  type UseQueryOptionsWrapper,
} from "@/libs/query-key-factory";
import { userService } from "@/services/user-service";
import { useAuthStore } from "@/stores/useAuthStore";
import type { PaginationRequest, PaginationResponse } from "@/types/base";
import type {
  UpdateUserRequestPayload,
  User,
  UserInfo,
  UserSearch,
} from "@/types/user";

type UserSearchParams = Omit<PaginationRequest, "cursor"> & {
  search?: string;
};
const INITIAL_OFFSET_PAGE_PARAM: number | undefined = undefined;

const userQueryKeyFactory = queryKeysFactory<"user">("user");

export const currentUserQueryKeys = {
  ...userQueryKeyFactory,
  current: () => userQueryKeyFactory.detail("me"),
  info: (userId: string) => userQueryKeyFactory.detail(userId),
  searchInfinite: (params: Omit<UserSearchParams, "offset"> = {}) =>
    userQueryKeyFactory.list({
      search: params.search,
      limit: params.limit,
    }),
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
  options?: UseQueryOptionsWrapper<UserInfo>,
) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    ...options,
    queryKey: currentUserQueryKeys.info(userId ?? ""),
    queryFn: () => userService.getUserInfo(userId ?? ""),
    enabled: !!accessToken && !!userId && (options?.enabled ?? true),
  });
}

export function useUserSearchInfiniteQuery(
  params: Omit<UserSearchParams, "offset"> = {},
) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useInfiniteQuery<
    PaginationResponse<UserSearch>,
    Error,
    {
      pages: Array<PaginationResponse<UserSearch>>;
      pageParams: Array<number | undefined>;
    },
    ReturnType<typeof currentUserQueryKeys.searchInfinite>,
    number | undefined
  >({
    queryKey: currentUserQueryKeys.searchInfinite(params),
    queryFn: ({ pageParam }) =>
      userService.searchUsers({
        search: params.search,
        limit: params.limit,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    initialPageParam: INITIAL_OFFSET_PAGE_PARAM,
    enabled: !!accessToken && (params.search?.trim().length ?? 0) > 0,
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
