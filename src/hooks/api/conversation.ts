import {
  type InfiniteData,
  type QueryClient,
  type QueryKey,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as React from "react";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { queryKeysFactory } from "@/libs/query-key-factory";
import { conversationService } from "@/services/conversation-service";
import { useSocketStore } from "@/stores/useSocketStore";
import type {
  Conversation,
  ConversationEvent,
  ConversationMember,
  ConversationPage,
  ConversationRecord,
  ConversationSeenEvent,
  CreateGroupConversationRequest,
  GetConversationsParams,
  GroupMembersRequest,
  UpdateGroupRequest,
} from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { PresenceStatusEnum } from "@/types/user";

const conversationQueryKeyFactory =
  queryKeysFactory<"conversation">("conversation");
const INITIAL_CURSOR_PAGE_PARAM: string | undefined = undefined;

type ConversationInfiniteData = InfiniteData<
  ConversationPage,
  string | undefined
>;

type ConversationUpdateOptions = {
  refetchMissingConversation?: boolean;
  unreadCount?: number;
};

type ConversationMutationContext = {
  previousConversationQueries: Array<
    [QueryKey, ConversationInfiniteData | undefined]
  >;
};

type ConversationCacheUpdateOptions = {
  moveToTop?: boolean;
};

export const conversationQueryKeys = {
  ...conversationQueryKeyFactory,
  list: (userId: string, type?: ConversationTypeEnum, limit = 30) =>
    conversationQueryKeyFactory.list({ userId, type, limit }),
};

const CONVERSATIONS_DEFAULT_LIMIT = 30;

function mapConversationToUiModel(
  conversation: ConversationRecord,
  currentUserId: string,
  onlineUserIds: ReadonlySet<string>,
): Conversation {
  const members: ConversationMember[] = conversation.participants.map(
    (participant) => ({
      userId: participant.userId,
      id: participant.userId,
      firstName: participant.firstName,
      lastName: participant.lastName,
      displayName:
        [participant.firstName, participant.lastName]
          .filter(Boolean)
          .join(" ") ||
        participant.username ||
        "Unknown user",
      username: participant.username ?? undefined,
      avatarUrl: participant.avatarUrl ?? undefined,
      bio: participant.bio,
      presenceStatus: onlineUserIds.has(participant.userId)
        ? PresenceStatusEnum.Online
        : PresenceStatusEnum.Offline,
      role: participant.role,
      joinedAt: participant.joinedAt,
      lastReadMessageId: participant.lastReadMessageId ?? null,
      lastReadAt: participant.lastReadAt ?? null,
    }),
  );

  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const otherParticipant = members.find(
    (member) => member.userId !== currentUserId,
  );
  const lastMessageSenderId = conversation.lastMessage?.senderId;
  const lastMessageSender = conversation.lastMessage
    ? members.find((member) => member.userId === lastMessageSenderId)
    : undefined;

  return {
    id: conversation.id,
    type: conversation.type,
    title: isGroup
      ? conversation.groupName || "Group conversation"
      : otherParticipant?.displayName || "Direct message",
    groupName: conversation.groupName,
    createdById: conversation.createdById,
    directUserAId: conversation.directUserAId,
    directUserBId: conversation.directUserBId,
    lastMessage:
      conversation.lastMessage?.content?.trim() || "No messages yet.",
    lastMessageAt: conversation.lastMessageAt,
    lastMessageSenderId: conversation.lastMessage?.senderId,
    lastMessageSenderName: lastMessageSender?.displayName,
    participantCount: members.length,
    unreadCount: conversation.unreadCount,
    members,
    directMember: isGroup ? undefined : otherParticipant,
    currentUserId: currentUserId || undefined,
    lastMessageId: conversation.lastMessageId,
    avatarUrl:
      isGroup || !otherParticipant?.avatarUrl
        ? undefined
        : otherParticipant.avatarUrl,
    onlineUsersCount: members.filter(
      (member) => member.presenceStatus === PresenceStatusEnum.Online,
    ).length,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

function hasConversation(
  data: ConversationInfiniteData | undefined,
  conversationId: string,
) {
  return data?.pages.some((page) =>
    page.items.some((conversation) => conversation.id === conversationId),
  );
}

function getHasLoadedConversation(
  queryClient: QueryClient,
  conversationId: string,
) {
  const conversationQueries =
    queryClient.getQueriesData<ConversationInfiniteData>({
      queryKey: conversationQueryKeys.lists(),
    });

  return conversationQueries.some(([, data]) =>
    hasConversation(data, conversationId),
  );
}

function getHasLoadedConversationQueries(queryClient: QueryClient) {
  const conversationQueries =
    queryClient.getQueriesData<ConversationInfiniteData>({
      queryKey: conversationQueryKeys.lists(),
    });

  return conversationQueries.some(([, data]) => !!data);
}

function upsertConversationInPages(
  data: ConversationInfiniteData | undefined,
  conversationId: string,
  replacement: ConversationRecord | null | undefined,
  options: ConversationCacheUpdateOptions = {},
) {
  if (!data) return data;

  const replacementIsPresent = replacement != null;
  let isFound = false;
  let hasChanges = false;

  const nextPages = data.pages.map((page) => {
    const items: ConversationRecord[] = [];
    let didProcess = false;

    for (const conversation of page.items) {
      if (conversation.id !== conversationId) {
        items.push(conversation);
        continue;
      }

      isFound = true;
      didProcess = true;

      if (replacementIsPresent) {
        if (replacement !== conversation) hasChanges = true;
        items.push(replacement);
      }
    }

    if (!didProcess) return page;

    if (items.length !== page.items.length) hasChanges = true;

    return { ...page, items };
  });

  if (!replacementIsPresent) {
    return hasChanges ? { ...data, pages: nextPages } : data;
  }

  if (options.moveToTop) {
    const [firstPage, ...restPages] = nextPages;
    if (!firstPage) return data;

    const currentFirstPageItems = isFound
      ? firstPage.items.filter((item) => item.id !== conversationId)
      : firstPage.items;
    const upsertedFirstPage = [replacement, ...currentFirstPageItems];

    return {
      ...data,
      pages: [{ ...firstPage, items: upsertedFirstPage }, ...restPages],
    };
  }

  if (isFound || replacement == null)
    return hasChanges ? { ...data, pages: nextPages } : data;

  const [firstPage, ...restPages] = nextPages;
  if (!firstPage) return data;

  return {
    ...data,
    pages: [
      { ...firstPage, items: [replacement, ...firstPage.items] },
      ...restPages,
    ],
  };
}

function updateConversationInPages(
  data: ConversationInfiniteData | undefined,
  conversationId: string,
  updater: (conversation: ConversationRecord) => ConversationRecord,
  options: ConversationCacheUpdateOptions = {},
) {
  if (!data) return data;

  const targetConversation = data.pages
    .flatMap((page) => page.items)
    .find((conversation) => conversation.id === conversationId);
  if (!targetConversation) return data;

  return upsertConversationInPages(
    data,
    conversationId,
    updater(targetConversation),
    options,
  );
}

function updateConversationUnreadCount(
  data: ConversationInfiniteData | undefined,
  conversationId: string,
  unreadCount: number,
) {
  return updateConversationInPages(data, conversationId, (conversation) => {
    if (conversation.unreadCount === unreadCount) return conversation;

    return {
      ...conversation,
      unreadCount,
    };
  });
}

function updateConversationFromEvent(
  data: ConversationInfiniteData | undefined,
  event: ConversationEvent,
  options: ConversationUpdateOptions = {},
) {
  const lastMessage = event.lastMessage;

  return updateConversationInPages(
    data,
    event.conversationId,
    (conversation) => ({
      ...conversation,
      lastMessageId: lastMessage?.id ?? null,
      lastMessage: lastMessage,
      lastMessageSenderId: lastMessage?.senderId,
      lastMessageSenderName: lastMessage
        ? (() => {
            const member = conversation.participants.find(
              (item) => item.userId === lastMessage.senderId,
            );
            if (!member) return undefined;

            return (
              [member.firstName, member.lastName].filter(Boolean).join(" ") ||
              member.username ||
              "Unknown user"
            );
          })()
        : undefined,
      lastMessageAt: event.lastMessageAt,
      unreadCount: options.unreadCount ?? event.unreadCount,
      updatedAt: event.lastMessageAt,
    }),
    { moveToTop: true },
  );
}

function updateConversationSeenStatus(
  data: ConversationInfiniteData | undefined,
  event: ConversationSeenEvent,
  currentUserId?: string,
) {
  return updateConversationInPages(
    data,
    event.conversationId,
    (conversation) => {
      let didUpdateParticipant = false;
      const participants = conversation.participants.map((participant) => {
        if (participant.userId !== event.seenByUserId) return participant;

        if (
          participant.lastReadMessageId === event.lastReadMessageId &&
          participant.lastReadAt === event.lastReadAt
        )
          return participant;

        didUpdateParticipant = true;
        return {
          ...participant,
          lastReadMessageId: event.lastReadMessageId,
          lastReadAt: event.lastReadAt,
        };
      });

      const unreadCount =
        event.seenByUserId === currentUserId ? 0 : conversation.unreadCount;

      if (!didUpdateParticipant && unreadCount === conversation.unreadCount) {
        return conversation;
      }

      return {
        ...conversation,
        participants,
        unreadCount,
      };
    },
  );
}

export function applyConversationUpdateToCache(
  queryClient: QueryClient,
  event: ConversationEvent,
  options: ConversationUpdateOptions = {},
) {
  const hasLoadedConversation = getHasLoadedConversation(
    queryClient,
    event.conversationId,
  );
  const hasLoadedConversationQueries =
    getHasLoadedConversationQueries(queryClient);

  queryClient.setQueriesData<ConversationInfiniteData>(
    { queryKey: conversationQueryKeys.lists() },
    (data) => updateConversationFromEvent(data, event, options),
  );

  if (
    options.refetchMissingConversation !== false &&
    !hasLoadedConversation &&
    hasLoadedConversationQueries
  ) {
    void queryClient.invalidateQueries({
      queryKey: conversationQueryKeys.lists(),
    });
  }
}

export function applyConversationSeenToCache(
  queryClient: QueryClient,
  event: ConversationSeenEvent,
  currentUserId?: string,
) {
  queryClient.setQueriesData<ConversationInfiniteData>(
    { queryKey: conversationQueryKeys.lists() },
    (data) => updateConversationSeenStatus(data, event, currentUserId),
  );
}

function upsertConversation(
  queryClient: QueryClient,
  conversation?: ConversationRecord | null,
  options?: ConversationCacheUpdateOptions,
) {
  if (!conversation) return;

  queryClient.setQueriesData<ConversationInfiniteData>(
    { queryKey: conversationQueryKeys.lists() },
    (data) =>
      upsertConversationInPages(data, conversation.id, conversation, {
        moveToTop: options?.moveToTop,
      }),
  );
}

function getConversationQueriesSnapshot(queryClient: QueryClient) {
  return queryClient.getQueriesData<ConversationInfiniteData>({
    queryKey: conversationQueryKeys.lists(),
  });
}

async function snapshotConversationQueries(queryClient: QueryClient) {
  await queryClient.cancelQueries({
    queryKey: conversationQueryKeys.lists(),
  });

  return {
    previousConversationQueries: getConversationQueriesSnapshot(queryClient),
  } satisfies ConversationMutationContext;
}

function restoreConversationQueries(
  queryClient: QueryClient,
  context?: ConversationMutationContext,
) {
  for (const [queryKey, data] of context?.previousConversationQueries ?? []) {
    queryClient.setQueryData(queryKey, data);
  }
}

export function useConversationsInfiniteQuery(
  params: Omit<GetConversationsParams, "cursor"> & {
    limit?: number;
  } = {},
) {
  const { type, limit = CONVERSATIONS_DEFAULT_LIMIT } = params;
  const { data: currentUser } = useCurrentUserQuery();
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const onlineUserIds = React.useMemo(
    () => new Set(onlineUsers),
    [onlineUsers],
  );

  const query = useInfiniteQuery<
    ConversationPage,
    Error,
    {
      pages: Array<ConversationPage>;
      pageParams: Array<string | undefined>;
    },
    ReturnType<typeof conversationQueryKeys.list>,
    string | undefined
  >({
    queryKey: conversationQueryKeys.list(currentUser?.id ?? "", type, limit),
    queryFn: ({ pageParam }) =>
      conversationService.getConversations({
        type,
        limit,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: INITIAL_CURSOR_PAGE_PARAM,
    enabled: !!currentUser?.id,
  });

  const conversations = React.useMemo(() => {
    return (
      query.data?.pages.flatMap((page) =>
        page.items.map((conversation) =>
          mapConversationToUiModel(
            conversation,
            currentUser?.id ?? "",
            onlineUserIds,
          ),
        ),
      ) ?? []
    );
  }, [currentUser?.id, onlineUserIds, query.data?.pages]);

  return {
    ...query,
    conversations,
  };
}

export function useMarkConversationAsSeenMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, ConversationMutationContext>({
    mutationFn: conversationService.markAsSeen,
    onMutate: async (conversationId) => {
      const context = await snapshotConversationQueries(queryClient);

      queryClient.setQueriesData<ConversationInfiniteData>(
        { queryKey: conversationQueryKeys.lists() },
        (data) => updateConversationUnreadCount(data, conversationId, 0),
      );

      return context;
    },
    onError: (_error, _conversationId, context) => {
      restoreConversationQueries(queryClient, context);
    },
  });
}

export function useCreateGroupConversationMutation(options?: {
  onSuccess?: (conversation: ConversationRecord) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    ConversationRecord,
    Error,
    CreateGroupConversationRequest,
    ConversationMutationContext
  >({
    mutationFn: conversationService.createGroupConversation,
    onMutate: async () => snapshotConversationQueries(queryClient),
    onSuccess: (data, _variables, context) => {
      upsertConversation(queryClient, data, { moveToTop: true });
      void queryClient.invalidateQueries({
        queryKey: conversationQueryKeys.lists(),
      });
      options?.onSuccess?.(data);
      return context;
    },
    onError: (error, _variables, context) => {
      restoreConversationQueries(queryClient, context);
      options?.onError?.(error);
    },
  });
}

export function useUpdateGroupMutation(options?: {
  onSuccess?: (conversation: ConversationRecord) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    ConversationRecord,
    Error,
    { conversationId: string; payload: UpdateGroupRequest },
    ConversationMutationContext
  >({
    mutationFn: ({ conversationId, payload }) =>
      conversationService.updateGroup(conversationId, payload),
    onMutate: async () => snapshotConversationQueries(queryClient),
    onSuccess: (data) => {
      upsertConversation(queryClient, data, { moveToTop: true });
      void queryClient.invalidateQueries({
        queryKey: conversationQueryKeys.lists(),
      });
      options?.onSuccess?.(data);
    },
    onError: (error, _variables, context) => {
      restoreConversationQueries(queryClient, context);
      options?.onError?.(error);
    },
  });
}

export function useAddGroupMembersMutation(options?: {
  onSuccess?: (conversation: ConversationRecord) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    ConversationRecord,
    Error,
    { conversationId: string; payload: GroupMembersRequest },
    ConversationMutationContext
  >({
    mutationFn: ({ conversationId, payload }) =>
      conversationService.addGroupMembers(conversationId, payload),
    onMutate: async () => snapshotConversationQueries(queryClient),
    onSuccess: (data) => {
      upsertConversation(queryClient, data, { moveToTop: true });
      void queryClient.invalidateQueries({
        queryKey: conversationQueryKeys.lists(),
      });
      options?.onSuccess?.(data);
    },
    onError: (error, _variables, context) => {
      restoreConversationQueries(queryClient, context);
      options?.onError?.(error);
    },
  });
}

export function useRemoveGroupMemberMutation(options?: {
  onSuccess?: (conversation: ConversationRecord) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    ConversationRecord,
    Error,
    { conversationId: string; memberId: string },
    ConversationMutationContext
  >({
    mutationFn: ({ conversationId, memberId }) =>
      conversationService.removeGroupMember(conversationId, memberId),
    onMutate: async () => snapshotConversationQueries(queryClient),
    onSuccess: (data) => {
      upsertConversation(queryClient, data, { moveToTop: true });
      void queryClient.invalidateQueries({
        queryKey: conversationQueryKeys.lists(),
      });
      options?.onSuccess?.(data);
    },
    onError: (error, _variables, context) => {
      restoreConversationQueries(queryClient, context);
      options?.onError?.(error);
    },
  });
}

export function useLeaveGroupMutation(options?: {
  onSuccess?: (conversationId: string) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<null, Error, string, ConversationMutationContext>({
    mutationFn: conversationService.leaveGroup,
    onMutate: async (conversationId) => {
      const context = await snapshotConversationQueries(queryClient);

      queryClient.setQueriesData<ConversationInfiniteData>(
        { queryKey: conversationQueryKeys.lists() },
        (data) => upsertConversationInPages(data, conversationId, null),
      );

      return context;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: conversationQueryKeys.lists(),
      });
      options?.onSuccess?.(variables);
    },
    onError: (error, _variables, context) => {
      restoreConversationQueries(queryClient, context);
      options?.onError?.(error);
    },
  });
}
