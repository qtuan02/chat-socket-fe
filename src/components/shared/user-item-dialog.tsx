import type { ReactNode } from "react";
import { DetailField } from "@/components/shared/detail-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserItemData } from "@/types/user";
import { formatDateTime } from "@/utils/date";
import { getUsernameLabel } from "@/utils/user-display";
import type { UserItemPopupAction } from "./user-item-helpers";

type UserItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  user: UserItemData;
  friendStatusLabel: string;
  presenceStatusLabel: string | null;
  popupAction: UserItemPopupAction;
  actionButton: ReactNode;
};

export function UserItemDialog({
  isOpen,
  onOpenChange,
  user,
  friendStatusLabel,
  presenceStatusLabel,
  popupAction,
  actionButton,
}: UserItemDialogProps) {
  const usernameLabel = getUsernameLabel(user.username);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user.displayName.trim()}</DialogTitle>
          <DialogDescription>
            Contact information and friend status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <DetailField label="Username" value={usernameLabel} />
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
            <DetailField label="Joined" value={formatDateTime(user.joinedAt)} />
          ) : null}
          {actionButton ? <div className="pt-1">{actionButton}</div> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
