import { Check, Loader2, X } from "lucide-react";
import { UserItemAvatar } from "@/components/shared/user-item-avatar";
import { Button } from "@/components/ui/button";
import type {
  FriendRequestUser,
  ReceivedFriendRequest,
  SentFriendRequest,
} from "@/types/friend";
import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/date";
import { getDisplayName, getUsernameLabel } from "@/utils/display";

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
        size="icon-sm"
        variant="outline"
        className="size-7"
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
    <div className="flex shrink-0 items-center gap-1.5">
      <Button
        type="button"
        size="icon-sm"
        variant="destructive"
        className="size-7"
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
        size="icon-sm"
        className="size-7"
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

function getRequestStatusLabel(variant: "received" | "sent") {
  return variant === "received" ? "Received" : "Sent";
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
        <p className="rounded-md border border-dashed border-border/80 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => {
            const isProcessing = processingRequestId === request.id;
            const requestUser = getRequestUser(request, variant);
            const displayName = getDisplayName(requestUser);
            const usernameLabel = getUsernameLabel(requestUser.username);
            const subtitle = buildSubtitle(request.message, request.createdAt);

            return (
              <li
                key={request.id}
                className={cn(
                  "list-none rounded-md border border-border/80 bg-background p-2",
                  "transition hover:border-primary/50 hover:bg-muted/40",
                )}
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <UserItemAvatar
                      compact
                      displayName={displayName}
                      avatarUrl={requestUser.avatarUrl ?? undefined}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {displayName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {usernameLabel ?? "-"}
                      </p>
                    </div>
                  </div>

                  <FriendRequestActions
                    isProcessing={isProcessing}
                    requestId={request.id}
                    variant={variant}
                    onAccept={onAccept}
                    onDecline={onDecline}
                    onCancel={onCancel}
                  />
                </div>

                <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <p className="min-w-0 flex-1 truncate">{subtitle}</p>
                  <span className="shrink-0">
                    {getRequestStatusLabel(variant)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
