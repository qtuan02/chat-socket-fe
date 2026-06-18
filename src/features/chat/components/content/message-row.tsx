import type { ConversationMember } from "@/types/conversation";
import type { Message } from "@/types/message";
import { cn } from "@/utils/cn";
import { formatMessageDate } from "@/utils/date";
import { MessageBubble, type MessageGroupPosition } from "./message-bubble";

type MessageRowProps = {
  currentUserId?: string;
  firstItemIndex: number;
  message: Message;
  messageIndex: number;
  messages: Message[];
  readReceipts: ConversationMember[];
};

function getMessageRowMeta({
  currentUserId,
  firstItemIndex,
  message,
  messageIndex,
  messages,
}: Omit<MessageRowProps, "readReceipts">) {
  const arrayIndex = messageIndex - firstItemIndex;
  const previousMessage = messages[arrayIndex - 1];
  const nextMessage = messages[arrayIndex + 1];
  const dateLabel = formatMessageDate(message.createdAt);
  const previousDateLabel = previousMessage
    ? formatMessageDate(previousMessage.createdAt)
    : null;
  const isOwnMessage = message.senderId === currentUserId;

  const showDateDivider = arrayIndex === 0 || dateLabel !== previousDateLabel;
  const nextStartsNewDate = nextMessage
    ? formatMessageDate(nextMessage.createdAt) !== dateLabel
    : true;

  const isFirstInGroup =
    showDateDivider || previousMessage?.senderId !== message.senderId;
  const isLastInGroup =
    nextStartsNewDate || nextMessage?.senderId !== message.senderId;

  const position: MessageGroupPosition =
    isFirstInGroup && isLastInGroup
      ? "single"
      : isFirstInGroup
        ? "first"
        : isLastInGroup
          ? "last"
          : "middle";

  return {
    dateLabel,
    isLastInGroup,
    isOwnMessage,
    position,
    showDateDivider,
    showSenderName: !isOwnMessage && isFirstInGroup,
  };
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function MessageRow({
  currentUserId,
  firstItemIndex,
  message,
  messageIndex,
  messages,
  readReceipts,
}: MessageRowProps) {
  const {
    dateLabel,
    isLastInGroup,
    isOwnMessage,
    position,
    showDateDivider,
    showSenderName,
  } = getMessageRowMeta({
    currentUserId,
    firstItemIndex,
    message,
    messageIndex,
    messages,
  });

  return (
    <>
      {showDateDivider ? <DateDivider label={dateLabel} /> : null}

      <div
        className={cn(
          "flex min-w-0",
          isLastInGroup ? "pb-2" : "pb-0.5",
          isOwnMessage
            ? "justify-end mr-3 md:mr-4"
            : "justify-start ml-3 md:ml-4",
        )}
      >
        <MessageBubble
          message={message}
          isOwnMessage={isOwnMessage}
          position={position}
          readReceipts={readReceipts}
          showSenderName={showSenderName}
        />
      </div>
    </>
  );
}
