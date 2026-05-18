import { Check, Loader2, X } from "lucide-react";
import { UserItem } from "@/components/shared/user-item";
import { Button } from "@/components/ui/button";
import type {
  FriendRequestUser,
  ReceivedFriendRequest,
  SentFriendRequest,
} from "@/types/friend";
import { FriendStatus } from "@/types/friend-status";
import { formatRelativeTime } from "@/utils/date";

type FriendRequest = ReceivedFriendRequest | SentFriendRequest;

type FriendRequestListProps = {
  emptyMessage: string;
  requests: FriendRequest[];
  title: string;
  variant: "received" | "sent";
  processingRequestId: string | null;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
};

function getRequestUser(
  request: FriendRequest,
  variant: "received" | "sent",
): FriendRequestUser {
  return variant === "received"
    ? (request as ReceivedFriendRequest).fromUser
    : (request as SentFriendRequest).toUser;
}

function buildSubtitle(message?: string | null, createdAt?: string) {
  const relativeTime = formatRelativeTime(createdAt);

  if (message && relativeTime) return `${message} - ${relativeTime}`;
  if (message) return message;

  return relativeTime;
}

function FriendRequestActions({
  isProcessing,
  requestId,
  variant,
  onAccept,
  onDecline,
  onCancel,
}: {
  isProcessing: boolean;
  requestId: string;
  variant: "received" | "sent";
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}) {
  if (variant === "sent") {
    return (
      <Button
        type="button"
        size="icon-xs"
        variant="outline"
        onClick={() => {
          onCancel?.(requestId);
        }}
        disabled={isProcessing}
        aria-label="Cancel friend request"
      >
        {isProcessing ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <X className="size-3" />
        )}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon-xs"
        variant="destructive"
        onClick={() => {
          onDecline?.(requestId);
        }}
        disabled={isProcessing}
        aria-label="Decline friend request"
      >
        {isProcessing ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <X className="size-3" />
        )}
      </Button>
      <Button
        type="button"
        size="icon-xs"
        onClick={() => {
          onAccept?.(requestId);
        }}
        disabled={isProcessing}
        aria-label="Accept friend request"
      >
        {isProcessing ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Check className="size-3" />
        )}
      </Button>
    </div>
  );
}

export function FriendRequestList({
  emptyMessage,
  requests,
  title,
  variant,
  processingRequestId,
  onAccept,
  onDecline,
  onCancel,
}: FriendRequestListProps) {
  return (
    <section className="grid gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>

      {requests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => {
            const isProcessing = processingRequestId === request.id;
            const requestUser = getRequestUser(request, variant);

            return (
              <UserItem
                key={request.id}
                friendStatus={
                  variant === "received"
                    ? FriendStatus.RECEIVED
                    : FriendStatus.SENT
                }
                user={requestUser}
                subtitle={buildSubtitle(request.message, request.createdAt)}
                action={
                  <FriendRequestActions
                    isProcessing={isProcessing}
                    requestId={request.id}
                    variant={variant}
                    onAccept={onAccept}
                    onDecline={onDecline}
                    onCancel={onCancel}
                  />
                }
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
