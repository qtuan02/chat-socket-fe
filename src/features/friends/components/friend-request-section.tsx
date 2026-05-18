import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReceivedFriendRequest, SentFriendRequest } from "@/types/friend";
import { getErrorMessage } from "@/utils/error";
import { FriendRequestList } from "./friend-request-list";

type FriendRequestSectionProps = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  receivedRequests: ReceivedFriendRequest[];
  sentRequests: SentFriendRequest[];
  processingRequestId: string | null;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onCancelSentRequest: (requestId: string) => void;
  onRetry: () => void;
};

export function FriendRequestSection({
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
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-background/60">
      <div className="border-b border-border px-3 py-2 md:px-4 md:py-3">
        <h2 className="text-base font-semibold">Friend requests</h2>
        <p className="text-xs text-muted-foreground">
          Review incoming and outgoing friend requests.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
        {isLoading ? (
          <div className="grid gap-2">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
            <p className="m-0 mb-2 text-destructive">
              {getErrorMessage(error, "Unable to load friend requests.")}
            </p>
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="grid gap-5">
            <FriendRequestList
              title="Received"
              emptyMessage="No received requests."
              variant="received"
              requests={receivedRequests}
              processingRequestId={processingRequestId}
              onAccept={onAccept}
              onDecline={onDecline}
            />

            <FriendRequestList
              title="Sent"
              emptyMessage="No sent requests."
              variant="sent"
              requests={sentRequests}
              processingRequestId={processingRequestId}
              onCancel={onCancelSentRequest}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
