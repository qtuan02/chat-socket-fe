import * as React from "react";
import { UserItemActionButton } from "@/components/shared/user-item-action-button";
import { UserItemAvatar } from "@/components/shared/user-item-avatar";
import { UserItemDialog } from "@/components/shared/user-item-dialog";
import {
  getFriendPopupAction,
  getFriendStatusLabel,
  getPresenceStatusLabel,
} from "@/components/shared/user-item-helpers";
import { Button } from "@/components/ui/button";
import { useUserInfoQuery } from "@/hooks/api/user";
import type { FriendStatus } from "@/types/friend-status";
import type { UserItemData } from "@/types/user";
import { cn } from "@/utils/cn";
import { getDisplayName, getUsernameLabel } from "@/utils/display";
import { getErrorMessage } from "@/utils/error";

type UserItemProps = {
  className?: string;
  user: UserItemData;
  subtitle?: string;
  action?: React.ReactNode;
  dialogAction?: React.ReactNode;
  compact?: boolean;
  friendStatus?: FriendStatus;
  isActionLoading?: boolean;
  actionPayload?: string;
  onOpenDetails?: (userId: string) => void;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  onCancelFriendRequest?: (userId: string) => void;
  onUnfriend?: (userId: string) => void;
};

export function UserItem({
  className,
  user,
  subtitle,
  action,
  dialogAction,
  compact = false,
  friendStatus,
  isActionLoading = false,
  actionPayload,
  onOpenDetails,
  onSendFriendRequest,
  onCancelFriendRequest,
  onUnfriend,
}: UserItemProps) {
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const infoQuery = useUserInfoQuery(user.id, { enabled: isPopupOpen });
  const displayName = getDisplayName(user);
  const resolvedFriendStatus = infoQuery.data?.statusFriend ?? friendStatus;
  const dialogUser: UserItemData = { ...user, ...infoQuery.data };
  const friendStatusLabel = getFriendStatusLabel(resolvedFriendStatus);
  const presenceStatusLabel = getPresenceStatusLabel(user.presenceStatus);
  const popupAction = getFriendPopupAction(resolvedFriendStatus);
  const detailErrorMessage = infoQuery.error
    ? getErrorMessage(infoQuery.error, "Unable to load user details.")
    : null;

  return (
    <>
      <li
        className={cn(
          "list-none transition-colors",
          "hover:bg-accent focus-within:bg-accent",
          compact ? "rounded-xl p-2" : "rounded-xl p-2.5",
          className,
        )}
      >
        <div className="relative flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-auto min-w-0 flex-1 p-0 text-left whitespace-normal hover:bg-transparent",
              compact
                ? "flex items-center justify-between gap-2"
                : "grid grid-cols-[auto,1fr] gap-2.5",
            )}
            onClick={() => {
              setIsPopupOpen(true);
              onOpenDetails?.(user.id);
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <UserItemAvatar
                compact={compact}
                displayName={displayName}
                avatarUrl={user.avatarUrl ?? undefined}
                presenceStatus={user.presenceStatus}
                avatarSizeClassName={compact ? "size-8" : "size-11"}
              />
              <div className="flex min-w-0 flex-col justify-center">
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    compact ? "leading-5" : "leading-tight",
                  )}
                >
                  {displayName}
                </p>
                {user.username && (
                  <span
                    className={cn(
                      "truncate text-muted-foreground",
                      compact ? "text-[11px] leading-4" : "text-xs",
                    )}
                  >
                    {getUsernameLabel(user.username)}
                  </span>
                )}
              </div>
            </div>
            <div
              className={compact ? "max-w-24 shrink-0 text-right" : "min-w-0"}
            >
              <div
                className={cn(
                  "text-muted-foreground",
                  compact
                    ? "text-[11px] leading-4"
                    : "mt-0.5 space-y-1 text-[12px]",
                )}
              >
                {friendStatus !== undefined ? (
                  <p className="truncate">{friendStatusLabel}</p>
                ) : null}
                {subtitle && <p className="truncate">{subtitle}</p>}
              </div>
            </div>
          </Button>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      </li>

      <UserItemDialog
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        user={dialogUser}
        friendStatusLabel={friendStatusLabel}
        presenceStatusLabel={presenceStatusLabel}
        popupAction={popupAction}
        actionButton={
          <UserItemActionButton
            userId={user.id}
            friendStatus={resolvedFriendStatus}
            actionPayload={actionPayload}
            isActionLoading={isActionLoading}
            onSendFriendRequest={onSendFriendRequest}
            onCancelFriendRequest={onCancelFriendRequest}
            onUnfriend={onUnfriend}
          />
        }
        dialogAction={dialogAction}
        detailErrorMessage={detailErrorMessage}
        isDetailLoading={infoQuery.isLoading}
      />
    </>
  );
}
