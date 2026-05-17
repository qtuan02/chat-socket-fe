import * as React from "react";
import { Button } from "@/components/ui/button";
import type { FriendRelationshipStatus } from "@/types/friend";
import type { UserItemData } from "@/types/user";
import { cn } from "@/utils/cn";
import { getUsernameLabel } from "@/utils/display";
import { UserItemActionButton } from "./user-item-action-button";
import { UserItemAvatar } from "./user-item-avatar";
import { UserItemDialog } from "./user-item-dialog";
import {
  getFriendPopupAction,
  getFriendStatusLabel,
  getPresenceStatusLabel,
} from "./user-item-helpers";

type UserItemProps = {
  className?: string;
  user: UserItemData;
  detailUser?: UserItemData | null;
  subtitle?: string;
  action?: React.ReactNode;
  dialogAction?: React.ReactNode;
  detailErrorMessage?: string | null;
  compact?: boolean;
  friendStatus?: FriendRelationshipStatus;
  isDetailLoading?: boolean;
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
  detailUser,
  subtitle,
  action,
  dialogAction,
  detailErrorMessage,
  compact = false,
  friendStatus,
  isDetailLoading = false,
  isActionLoading = false,
  actionPayload,
  onOpenDetails,
  onSendFriendRequest,
  onCancelFriendRequest,
  onUnfriend,
}: UserItemProps) {
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const displayName = user.displayName.trim();
  const dialogUser = detailUser ?? user;
  const friendStatusLabel = getFriendStatusLabel(friendStatus);
  const presenceStatusLabel = getPresenceStatusLabel(dialogUser.presenceStatus);
  const popupAction = getFriendPopupAction(friendStatus);

  return (
    <>
      <li
        className={cn(
          "border border-border/80 bg-background",
          "transition",
          "hover:border-primary/50 hover:bg-muted/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2",
          compact ? "rounded-md p-2" : "rounded-lg p-2.5",
          className,
        )}
      >
        <div className={cn("relative grid", compact ? "gap-1.5" : "gap-2.5")}>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-auto w-full p-0 text-left whitespace-normal hover:bg-transparent",
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
                avatarUrl={user.avatarUrl}
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
                <p className="truncate">{friendStatusLabel}</p>
                {subtitle && <p className="truncate">{subtitle}</p>}
              </div>
            </div>
          </Button>

          {action && <div className="relative shrink-0 pt-0.5">{action}</div>}
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
            friendStatus={friendStatus}
            actionPayload={actionPayload}
            isActionLoading={isActionLoading}
            onSendFriendRequest={onSendFriendRequest}
            onCancelFriendRequest={onCancelFriendRequest}
            onUnfriend={onUnfriend}
          />
        }
        dialogAction={dialogAction}
        detailErrorMessage={detailErrorMessage}
        isDetailLoading={isDetailLoading}
      />
    </>
  );
}
