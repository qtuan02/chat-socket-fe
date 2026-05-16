import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { APP_ROUTES } from "@/config/routes";
import { ChatSidebar } from "@/features/conversation/components/chat-sidebar";
import { ConversationDetailsPanel } from "@/features/conversation/components/conversation-details-panel";
import { FriendsTemplate } from "@/features/friends/templates/friends-template";
import {
  useAddGroupMembersMutation,
  useConversationsInfiniteQuery,
  useLeaveGroupMutation,
  useMarkConversationAsSeenMutation,
  useRemoveGroupMemberMutation,
  useUpdateGroupMutation,
} from "@/hooks/api/conversation";
import {
  friendRequestQueryKeys,
  useSendFriendRequestMutation,
} from "@/hooks/api/friend";
import { messageQueryKeys } from "@/hooks/api/message";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useSocketStore } from "@/stores/useSocketStore";
import type {
  Conversation,
  ConversationMember,
  GroupMembersRequest,
  UpdateGroupRequest,
} from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import type { Friend } from "@/types/friend";
import type { MessageDto } from "@/types/message";
import { PresenceStatusEnum } from "@/types/user";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/error";
import { getDisplayName } from "@/utils/user-display";
import { ChatHeader } from "../components/content/chat-header";
import { EmptyConversationBanner } from "../components/content/empty-conversation-banner";
import { MessageComposer } from "../components/content/message-composer";
import { MessageList } from "../components/content/message-list";
import { WelcomeSkeleton } from "../components/skeleton/welcome-skeleton";
import { ChatSocketProvider } from "../providers/chat-socket-provider";

type ChatLocationState = {
  directMessageDraftFriend?: Friend | null;
};

function getDraftFriendFromLocationState(state: unknown) {
  if (!state || typeof state !== "object") return null;

  const directMessageDraftFriend = (state as ChatLocationState)
    .directMessageDraftFriend;

  if (
    !directMessageDraftFriend ||
    typeof directMessageDraftFriend.id !== "string" ||
    typeof directMessageDraftFriend.displayName !== "string"
  )
    return null;

  return directMessageDraftFriend;
}

function createDirectMessageDraftConversation({
  currentUser,
  friend,
  presenceStatus,
}: {
  currentUser: ReturnType<typeof useCurrentUserQuery>["data"];
  friend: Friend;
  presenceStatus?: PresenceStatusEnum;
}): Conversation {
  const now = new Date().toISOString();
  const friendMember: ConversationMember = {
    id: friend.id,
    userId: friend.id,
    firstName: friend.firstName ?? "",
    lastName: friend.lastName ?? "",
    displayName: friend.displayName,
    username: friend.username,
    avatarUrl: friend.avatarUrl,
    bio: friend.bio,
    joinedAt: friend.joinedAt,
    lastReadMessageId: null,
    lastReadAt: null,
    presenceStatus:
      presenceStatus ?? friend.presenceStatus ?? PresenceStatusEnum.Checking,
  };
  const currentUserMember: ConversationMember | null = currentUser
    ? {
        id: currentUser.id,
        userId: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        displayName: getDisplayName(currentUser),
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        bio: currentUser.bio,
        joinedAt: currentUser.createdAt ?? now,
        lastReadMessageId: null,
        lastReadAt: null,
        presenceStatus: PresenceStatusEnum.Online,
      }
    : null;
  const members = currentUserMember
    ? [currentUserMember, friendMember]
    : [friendMember];

  return {
    id: `draft:${friend.id}`,
    type: ConversationTypeEnum.DIRECT,
    title: friend.displayName,
    lastMessage: "No messages yet.",
    lastMessageAt: "No messages yet.",
    participantCount: members.length,
    unreadCount: 0,
    avatarUrl: friend.avatarUrl,
    members,
    directMember: friendMember,
    currentUserId: currentUser?.id,
    lastMessageId: null,
    updatedAt: now,
  };
}

export function ChatTemplate() {
  const { conversationId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationDraftFriend = React.useMemo(
    () => getDraftFriendFromLocationState(location.state),
    [location.state],
  );
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [removingMemberId, setRemovingMemberId] = React.useState<string | null>(
    null,
  );
  const [directMessageDraftFriend, setDirectMessageDraftFriend] =
    React.useState<Friend | null>(() => locationDraftFriend);
  const [sendingFriendId, setSendingFriendId] = React.useState<string | null>(
    null,
  );
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserQuery();
  const isPresenceReady = useSocketStore((state) => state.isPresenceReady);
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const { conversations, isLoading: isConversationsLoading } =
    useConversationsInfiniteQuery();
  const { mutate: markConversationAsSeen } =
    useMarkConversationAsSeenMutation();
  const lastSeenMessageRef = React.useRef<string | null>(null);

  const activeConversation = React.useMemo(
    () =>
      conversations.find((conversation) => conversation.id === conversationId),
    [conversationId, conversations],
  );
  const isFriendsRoute = location.pathname === APP_ROUTES.friends;
  const directMessageDraftConversation = React.useMemo(() => {
    if (!directMessageDraftFriend) return null;

    const onlineUserIds = new Set(onlineUsers);
    const presenceStatus = isPresenceReady
      ? onlineUserIds.has(directMessageDraftFriend.id)
        ? PresenceStatusEnum.Online
        : PresenceStatusEnum.Offline
      : PresenceStatusEnum.Checking;

    return createDirectMessageDraftConversation({
      currentUser,
      friend: directMessageDraftFriend,
      presenceStatus,
    });
  }, [currentUser, directMessageDraftFriend, isPresenceReady, onlineUsers]);
  const displayedConversation = isFriendsRoute
    ? null
    : (directMessageDraftConversation ?? activeConversation);
  const isDraftConversation =
    !isFriendsRoute && !!directMessageDraftConversation;
  const sidebarActiveConversationId =
    isDraftConversation || isFriendsRoute ? "" : conversationId;

  React.useEffect(() => {
    if (!locationDraftFriend) return;

    setDirectMessageDraftFriend(locationDraftFriend);
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      { replace: true, state: null },
    );
  }, [
    location.hash,
    location.pathname,
    location.search,
    locationDraftFriend,
    navigate,
  ]);

  React.useEffect(() => {
    if (!isFriendsRoute || !directMessageDraftFriend) return;

    setDirectMessageDraftFriend(null);
    setIsDetailsOpen(false);
  }, [directMessageDraftFriend, isFriendsRoute]);

  React.useEffect(() => {
    if (
      !directMessageDraftFriend ||
      !activeConversation ||
      activeConversation.id !== conversationId ||
      activeConversation.type !== ConversationTypeEnum.DIRECT ||
      activeConversation.directMember?.userId !== directMessageDraftFriend.id
    )
      return;

    setDirectMessageDraftFriend(null);
  }, [activeConversation, conversationId, directMessageDraftFriend]);

  React.useEffect(() => {
    if (
      isDraftConversation ||
      isFriendsRoute ||
      !activeConversation ||
      activeConversation.unreadCount === 0 ||
      !activeConversation.lastMessageId
    )
      return;

    const lastSeenMessageKey = `${activeConversation.id}:${activeConversation.lastMessageId}`;
    if (lastSeenMessageRef.current === lastSeenMessageKey) return;

    lastSeenMessageRef.current = lastSeenMessageKey;
    markConversationAsSeen(activeConversation.id);
  }, [
    activeConversation,
    isDraftConversation,
    isFriendsRoute,
    markConversationAsSeen,
  ]);

  const handleConversationSelect = React.useCallback(() => {
    setDirectMessageDraftFriend(null);
    setIsSidebarOpen(false);
    setIsDetailsOpen(false);
  }, []);

  const handleDirectMessageDraftSelect = React.useCallback(
    (friend: Friend) => {
      setDirectMessageDraftFriend(friend);
      setIsSidebarOpen(false);
      setIsDetailsOpen(false);

      if (location.pathname !== APP_ROUTES.chat) {
        navigate(APP_ROUTES.chat, {
          state: { directMessageDraftFriend: friend },
        });
      }
    },
    [location.pathname, navigate],
  );

  const handleDraftMessageSent = React.useCallback(
    (message: MessageDto) => {
      setIsDetailsOpen(false);
      navigate(APP_ROUTES.conversationById(message.conversationId));
    },
    [navigate],
  );

  const sendFriendRequestMutation = useSendFriendRequestMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
      toast.success("Friend request sent.");
      setSendingFriendId(null);
    },
  });
  const updateGroupMutation = useUpdateGroupMutation({
    onSuccess: () => {
      toast.success("Group name updated.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update group name."));
    },
  });
  const addGroupMembersMutation = useAddGroupMembersMutation({
    onSuccess: () => {
      toast.success("Group members updated.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to add members."));
    },
  });
  const removeGroupMemberMutation = useRemoveGroupMemberMutation({
    onSuccess: () => {
      toast.success("Member removed from the group.");
      setRemovingMemberId(null);
    },
    onError: (error) => {
      setRemovingMemberId(null);
      toast.error(getErrorMessage(error, "Failed to remove member."));
    },
  });
  const leaveGroupMutation = useLeaveGroupMutation({
    onSuccess: (conversationId) => {
      toast.success("You left the group.");
      setIsDetailsOpen(false);
      if (currentUser?.id) {
        queryClient.invalidateQueries({
          queryKey: messageQueryKeys.messages(currentUser.id, conversationId),
        });
      }
      navigate(APP_ROUTES.chat);
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(
          error,
          "Failed to leave group. You may not be allowed to.",
        ),
      );
    },
  });

  const handleRenameGroup = React.useCallback(
    (name: string) => {
      if (activeConversation?.type !== ConversationTypeEnum.GROUP) return;
      const payload: UpdateGroupRequest = {
        name: name.trim(),
      };

      updateGroupMutation.mutate({
        conversationId: activeConversation.id,
        payload,
      });
    },
    [activeConversation?.id, activeConversation?.type, updateGroupMutation],
  );

  const handleAddMembers = React.useCallback(
    (payload: GroupMembersRequest) => {
      if (activeConversation?.type !== ConversationTypeEnum.GROUP) return;

      addGroupMembersMutation.mutate({
        conversationId: activeConversation.id,
        payload,
      });
    },
    [activeConversation?.id, activeConversation?.type, addGroupMembersMutation],
  );

  const handleLeaveGroup = React.useCallback(() => {
    if (activeConversation?.type !== ConversationTypeEnum.GROUP) return;

    leaveGroupMutation.mutate(activeConversation.id);
  }, [activeConversation?.id, activeConversation?.type, leaveGroupMutation]);

  const handleRemoveMember = React.useCallback(
    (memberId: string) => {
      if (activeConversation?.type !== ConversationTypeEnum.GROUP) return;

      setRemovingMemberId(memberId);
      removeGroupMemberMutation.mutate(
        {
          conversationId: activeConversation.id,
          memberId,
        },
        {
          onSettled: () => {
            setRemovingMemberId(null);
          },
        },
      );
    },
    [
      activeConversation?.id,
      activeConversation?.type,
      removeGroupMemberMutation.mutate,
    ],
  );

  const handleSendFriendRequest = (userId: string, message?: string) => {
    if (sendFriendRequestMutation.isPending) return;
    setSendingFriendId(userId);

    sendFriendRequestMutation.mutate(
      {
        toUserId: userId,
        message: message?.trim() || undefined,
      },
      {
        onSettled: () => {
          setSendingFriendId((currentId) =>
            currentId === userId ? null : currentId,
          );
        },
      },
    );
  };

  return (
    <ChatSocketProvider
      activeConversationId={isDraftConversation ? "" : conversationId}
    >
      <main className="h-screen w-full overflow-hidden bg-muted/50">
        <div className="h-full w-full min-w-0 bg-background">
          <div
            className={cn(
              "grid h-full min-h-0 w-full overflow-hidden",
              activeConversation && !isDraftConversation && isDetailsOpen
                ? "md:grid-cols-[320px_minmax(0,1fr)_320px]"
                : "md:grid-cols-[320px_minmax(0,1fr)]",
            )}
          >
            <ChatSidebar
              activeConversationId={sidebarActiveConversationId}
              className="hidden md:flex md:w-[320px] md:border-r"
              onConversationSelect={handleConversationSelect}
              onDirectMessageDraftSelect={handleDirectMessageDraftSelect}
            />

            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetContent side="left" className="w-[320px] p-0 md:hidden">
                <ChatSidebar
                  activeConversationId={sidebarActiveConversationId}
                  className="h-full"
                  onConversationSelect={handleConversationSelect}
                  onDirectMessageDraftSelect={handleDirectMessageDraftSelect}
                />
              </SheetContent>

              <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col border-l border-border md:border-l-0">
                <div className="border-b border-border px-3 md:hidden">
                  <div className="flex h-14 items-center gap-2">
                    <SheetTrigger asChild>
                      <Button type="button" size="sm" variant="outline">
                        <Menu className="size-4" />
                        <span>Conversations</span>
                      </Button>
                    </SheetTrigger>
                    <h2 className="truncate text-sm font-medium">
                      {isFriendsRoute
                        ? "Friends"
                        : (displayedConversation?.title ?? "Chat")}
                    </h2>
                  </div>
                </div>

                {isFriendsRoute ? (
                  <FriendsTemplate />
                ) : displayedConversation ? (
                  <>
                    <ChatHeader
                      conversation={displayedConversation}
                      onOpenDetails={
                        isDraftConversation
                          ? undefined
                          : () => {
                              setIsDetailsOpen((isOpen) => !isOpen);
                            }
                      }
                    />
                    <MessageList
                      conversation={displayedConversation}
                      isDraft={isDraftConversation}
                    />
                    <MessageComposer
                      conversation={displayedConversation}
                      onMessageSent={
                        isDraftConversation ? handleDraftMessageSent : undefined
                      }
                    />
                  </>
                ) : isConversationsLoading ? (
                  <WelcomeSkeleton />
                ) : (
                  <EmptyConversationBanner />
                )}
              </section>
            </Sheet>

            {activeConversation && !isDraftConversation && !isFriendsRoute ? (
              <ConversationDetailsPanel
                conversation={activeConversation}
                open={isDetailsOpen}
                isRenameGroupSubmitting={updateGroupMutation.isPending}
                isAddMembersSubmitting={addGroupMembersMutation.isPending}
                isLeaveGroupSubmitting={leaveGroupMutation.isPending}
                removingMemberId={removingMemberId}
                onSendFriendRequest={handleSendFriendRequest}
                sendingFriendRequestId={sendingFriendId}
                onRenameGroup={handleRenameGroup}
                onAddMembers={handleAddMembers}
                onLeaveGroup={handleLeaveGroup}
                onRemoveMember={handleRemoveMember}
              />
            ) : null}
          </div>
        </div>
      </main>
    </ChatSocketProvider>
  );
}
