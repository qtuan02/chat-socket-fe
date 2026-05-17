import * as React from "react";
import type { VirtuosoHandle } from "react-virtuoso";

type UseMessageListAutoScrollParams = {
  isLatestMessageOwn: boolean;
  latestMessageKey: string | null;
  messageCount: number;
  virtuosoRef: React.RefObject<VirtuosoHandle | null>;
};

export function useMessageListAutoScroll({
  isLatestMessageOwn,
  latestMessageKey,
  messageCount,
  virtuosoRef,
}: UseMessageListAutoScrollParams) {
  const previousTailRef = React.useRef<{
    count: number;
    key: string | null;
  }>({
    count: 0,
    key: null,
  });

  React.useLayoutEffect(() => {
    const previousTail = previousTailRef.current;
    const didAppendAtTail =
      messageCount > previousTail.count &&
      latestMessageKey !== previousTail.key;

    previousTailRef.current = {
      count: messageCount,
      key: latestMessageKey,
    };

    if (!didAppendAtTail || !isLatestMessageOwn) return;

    const scrollToBottom = () => {
      virtuosoRef.current?.scrollToIndex({
        align: "end",
        behavior: "auto",
        index: "LAST",
      });
    };

    scrollToBottom();
    const animationFrameId = window.requestAnimationFrame(scrollToBottom);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isLatestMessageOwn, latestMessageKey, messageCount, virtuosoRef]);
}
