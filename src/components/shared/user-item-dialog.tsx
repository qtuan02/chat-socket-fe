import type { ReactNode } from "react";
import { DetailField } from "@/components/shared/detail-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserItemData } from "@/types/user";
import { formatDateTime } from "@/utils/date";
import { getDisplayName, getUsernameLabel } from "@/utils/display";
import type { UserItemPopupAction } from "./user-item-helpers";

type UserItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  user: UserItemData;
  friendStatusLabel: string;
  presenceStatusLabel: string | null;
  popupAction: UserItemPopupAction;
  actionButton: ReactNode;
  dialogAction?: ReactNode;
  isDetailLoading?: boolean;
  detailErrorMessage?: string | null;
};

export function UserItemDialog({
  isOpen,
  onOpenChange,
  user,
  friendStatusLabel,
  presenceStatusLabel,
  popupAction,
  actionButton,
  dialogAction,
  isDetailLoading = false,
  detailErrorMessage,
}: UserItemDialogProps) {
  const usernameLabel = getUsernameLabel(user.username);
  const displayName = getDisplayName(user);
  const hasMultipleActions = Boolean(actionButton && dialogAction);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{displayName}</DialogTitle>
          <DialogDescription>
            Contact information and friend status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {isDetailLoading ? (
            <div className="grid gap-2">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : detailErrorMessage ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {detailErrorMessage}
            </p>
          ) : (
            <>
              <DetailField label="Username" value={usernameLabel} />
              {user.email ? (
                <DetailField label="Email" value={user.email} />
              ) : null}
              {user.phone ? (
                <DetailField label="Phone" value={user.phone} />
              ) : null}
              <DetailField label="Bio" value={user.bio} />
              <DetailField label="Relationship" value={friendStatusLabel} />
              {presenceStatusLabel ? (
                <DetailField label="Presence" value={presenceStatusLabel} />
              ) : null}
              <DetailField
                label="Additional info"
                value={
                  <span className="inline-flex items-center gap-2">
                    {popupAction.icon}
                    <span>{popupAction.label}</span>
                  </span>
                }
              />
              {user.joinedAt ? (
                <DetailField
                  label="Joined"
                  value={formatDateTime(user.joinedAt)}
                />
              ) : null}
            </>
          )}
          {actionButton || dialogAction ? (
            <div
              className={
                hasMultipleActions ? "grid gap-2 pt-1 sm:grid-cols-2" : "pt-1"
              }
            >
              {dialogAction}
              {actionButton}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
