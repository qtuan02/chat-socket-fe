import * as React from "react";
import type { FriendRelationshipStatus } from "@/types/friend";
import type { UserItemData } from "@/types/user";
import { cn } from "@/utils/cn";
import { getUsernameLabel } from "@/utils/user-display";
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
  subtitle?: string;
  action?: React.ReactNode;
  compact?: boolean;
  friendStatus?: FriendRelationshipStatus;
  isActionLoading?: boolean;
  actionPayload?: string;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  onCancelFriendRequest?: (userId: string) => void;
  onUnfriend?: (userId: string) => void;
};

export function UserItem({
  className,
  user,
  subtitle,
  action,
  compact = false,
  friendStatus,
  isActionLoading = false,
  actionPayload,
  onSendFriendRequest,
  onCancelFriendRequest,
  onUnfriend,
}: UserItemProps) {
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const displayName = user.displayName.trim();
  const friendStatusLabel = getFriendStatusLabel(friendStatus);
  const presenceStatusLabel = getPresenceStatusLabel(user.presenceStatus);
  const popupAction = getFriendPopupAction(friendStatus);

  return (
    <>
      <li
        className={cn(
          "rounded-lg border border-border/80 bg-background p-2.5",
          "transition",
          "hover:border-primary/50 hover:bg-muted/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2",
          compact ? "py-2" : "py-2.5",
          className,
        )}
      >
        <div className="relative grid gap-2.5">
          <button
            type="button"
            className="grid grid-cols-[auto,1fr] gap-2.5 text-left"
            onClick={() => {
              setIsPopupOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <UserItemAvatar
                compact={compact}
                displayName={displayName}
                avatarUrl={user.avatarUrl}
                presenceStatus={user.presenceStatus}
                avatarSizeClassName="size-11"
              />
              <div className="flex flex-col justify-center">
                <p className="truncate text-sm font-medium leading-tight">
                  {displayName}
                </p>
                {user.username && (
                  <span className="text-xs text-muted-foreground">
                    {getUsernameLabel(user.username)}
                  </span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="mt-0.5 space-y-1 text-[12px] text-muted-foreground">
                <p className="truncate">{friendStatusLabel}</p>
                {subtitle && <p className="truncate">{subtitle}</p>}
              </div>
            </div>
          </button>

          {action && <div className="relative shrink-0 pt-0.5">{action}</div>}
        </div>
      </li>

      <UserItemDialog
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        user={user}
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
      />
    </>
  );
}
