import { ArrowLeft, CircleCheckBig, Columns2Icon } from "lucide-react";
import { ConversationAvatar } from "@/components/shared/conversation-avatar";
import { Button } from "@/components/ui/button";
import { useChatHeader } from "@/features/chat/hooks/use-chat-header";
import {
  UserItemActionButton,
  UserItemDialog,
} from "@/features/friends/templates/user-item-template";
import type { Conversation, ConversationMember } from "@/types/conversation";
import type { UserInfo } from "@/types/user";

type ChatHeaderProps = {
  conversation: Conversation;
  directMember?: ConversationMember;
  directUserInfo?: UserInfo;
  directUserInfoErrorMessage?: string | null;
  isDirectUserInfoLoading?: boolean;
  onOpenDetails?: () => void;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  sendingFriendRequestId?: string | null;
  showBackButton?: boolean;
  onBack?: () => void;
};

export function ChatHeader({
  conversation,
  directMember,
  directUserInfo,
  directUserInfoErrorMessage,
  isDirectUserInfoLoading,
  onOpenDetails,
  onSendFriendRequest,
  sendingFriendRequestId,
  showBackButton,
  onBack,
}: ChatHeaderProps) {
  const {
    canOpenDirectUserDialog,
    canSendFriendRequest,
    dialogUser,
    friendStatus,
    friendStatusLabel,
    isDirectUserDialogOpen,
    isSendingFriendRequest,
    popupAction,
    presenceStatusLabel,
    setIsDirectUserDialogOpen,
    statusLabel,
  } = useChatHeader({
    conversation,
    directMember,
    directUserInfo,
    onSendFriendRequest,
    sendingFriendRequestId,
  });

  return (
    <>
      <header className="h-14 border-b border-border bg-background px-3 py-2 md:h-16 md:px-4 md:py-2">
        <div className="flex h-full min-w-0 items-center justify-between gap-2 md:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {showBackButton && onBack ? (
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={onBack}
                className="md:hidden"
                aria-label="Go back to conversations"
              >
                <ArrowLeft className="size-4" />
              </Button>
            ) : null}
            {canOpenDirectUserDialog ? (
              <Button
                type="button"
                variant="ghost"
                className="h-auto min-w-0 flex-1 justify-start p-0 text-left whitespace-normal hover:bg-transparent"
                onClick={() => {
                  setIsDirectUserDialogOpen(true);
                }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <ConversationAvatar conversation={conversation} size="md" />
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-sm font-semibold leading-tight md:text-lg">
                      {conversation.title}
                    </h1>
                    <p className="truncate text-[11px] text-muted-foreground md:text-sm">
                      {statusLabel}
                    </p>
                  </div>
                </div>
              </Button>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <ConversationAvatar conversation={conversation} size="md" />
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-sm font-semibold leading-tight md:text-lg">
                    {conversation.title}
                  </h1>
                  <p className="truncate text-[11px] text-muted-foreground md:text-sm">
                    {statusLabel}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {conversation.unreadCount > 0 ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                <CircleCheckBig className="size-3.5" />
                <span>{conversation.unreadCount}</span>
              </div>
            ) : null}
            {onOpenDetails ? (
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                onClick={onOpenDetails}
                aria-label="Toggle conversation info"
              >
                <Columns2Icon className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </header>
      {canOpenDirectUserDialog && dialogUser && directMember ? (
        <UserItemDialog
          isOpen={isDirectUserDialogOpen}
          onOpenChange={setIsDirectUserDialogOpen}
          user={dialogUser}
          friendStatusLabel={friendStatusLabel}
          presenceStatusLabel={presenceStatusLabel}
          popupAction={popupAction}
          actionButton={
            <UserItemActionButton
              userId={directMember.userId}
              friendStatus={friendStatus}
              isActionLoading={isSendingFriendRequest}
              onSendFriendRequest={
                canSendFriendRequest ? onSendFriendRequest : undefined
              }
            />
          }
          detailErrorMessage={directUserInfoErrorMessage}
          isDetailLoading={isDirectUserInfoLoading}
        />
      ) : null}
    </>
  );
}
