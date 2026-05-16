import { Check, Loader2, X } from "lucide-react";
import { UserItem } from "@/components/shared/user-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FriendRequestItem } from "@/types/friend";
import { FriendRelationshipStatusEnum } from "@/types/friend-status";
import { formatRelativeTime } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";

type FriendRequestSectionProps = {
  className?: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  receivedRequests: FriendRequestItem[];
  sentRequests: FriendRequestItem[];
  processingRequestId: string | null;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onCancelSentRequest: (requestId: string) => void;
  onRetry: () => void;
};

function buildSubtitle(message?: string, createdAt?: string) {
  const relativeTime = formatRelativeTime(createdAt);

  if (message && relativeTime) {
    return `${message} - ${relativeTime}`;
  }

  if (message) return message;
  return relativeTime;
}

function renderRequestList(
  title: string,
  requests: FriendRequestItem[],
  showActions: boolean,
  processingRequestId: string | null,
  onAccept?: (requestId: string) => void,
  onDecline?: (requestId: string) => void,
  onCancel?: (requestId: string) => void,
) {
  return (
    <section className="grid gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>

      {requests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
          {title === "Received" ? "No received requests." : "No sent requests."}
        </p>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => {
            const isProcessing = processingRequestId === request.id;

            return (
              <UserItem
                key={request.id}
                friendStatus={
                  showActions
                    ? FriendRelationshipStatusEnum.Pending
                    : FriendRelationshipStatusEnum.Sent
                }
                user={{
                  id: request.user.id,
                  displayName: request.user.displayName,
                  username: request.user.username,
                  avatarUrl: request.user.avatarUrl,
                  bio: request.user.bio,
                }}
                subtitle={buildSubtitle(request.message, request.createdAt)}
                action={
                  showActions ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="destructive"
                        onClick={() => {
                          onDecline?.(request.id);
                        }}
                        disabled={isProcessing}
                        className="whitespace-nowrap"
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
                          onAccept?.(request.id);
                        }}
                        disabled={isProcessing}
                        className="whitespace-nowrap"
                      >
                        {isProcessing ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Check className="size-3" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      onClick={() => {
                        onCancel?.(request.id);
                      }}
                      disabled={isProcessing}
                      className="whitespace-nowrap"
                    >
                      {isProcessing ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <X className="size-3" />
                      )}
                    </Button>
                  )
                }
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function FriendRequestSection({
  className,
  isLoading,
  isError,
  error,
  receivedRequests,
  sentRequests,
  processingRequestId,
  onAccept,
  onDecline,
  onCancelSentRequest,
  onRetry,
}: FriendRequestSectionProps) {
  return (
    <section
      className={
        className ??
        "flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-background/60"
      }
    >
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">Friend requests</h2>
        <p className="text-xs text-muted-foreground">
          Review incoming and outgoing friend requests.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="grid gap-2">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
            <p className="m-0 mb-2 text-destructive">
              {getErrorMessage(error, "Unable to load friend requests.")}
            </p>
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid gap-5">
            {renderRequestList(
              "Received",
              receivedRequests,
              true,
              processingRequestId,
              onAccept,
              onDecline,
            )}

            {renderRequestList(
              "Sent",
              sentRequests,
              false,
              processingRequestId,
              undefined,
              undefined,
              onCancelSentRequest,
            )}
          </div>
        )}
      </div>
    </section>
  );
}
