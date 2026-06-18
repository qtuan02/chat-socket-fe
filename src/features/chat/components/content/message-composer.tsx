import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Send, Smile } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessageComposer } from "@/features/chat/hooks/use-message-composer";
import type { Conversation } from "@/types/conversation";
import type { MessageRecord } from "@/types/message";
import { cn } from "@/utils/cn";

type MessageComposerProps = {
  className?: string;
  conversation: Conversation;
  onMessageSent?: (message: MessageRecord) => void;
};

function MessageComposerActions({
  actionLabel,
  isSendBlocked,
  isEmojiPickerOpen,
  pickerRef,
  emojiButtonRef,
  handleEmojiButtonClick,
  handleFormSubmit,
  handleKeyDown,
  handleContentChange,
  insertEmoji,
  textareaRef,
  content,
}: {
  actionLabel: string;
  isSendBlocked: boolean;
  isEmojiPickerOpen: boolean;
  pickerRef: React.RefObject<HTMLDivElement | null>;
  emojiButtonRef: React.RefObject<HTMLButtonElement | null>;
  handleEmojiButtonClick: () => void;
  handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleContentChange: (content: string) => void;
  insertEmoji: (emoji: { native?: string }) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
}) {
  return (
    <form className="flex items-end gap-2" onSubmit={handleFormSubmit}>
      <div className="relative shrink-0">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="rounded-full text-primary hover:bg-accent"
          ref={emojiButtonRef}
          onClick={handleEmojiButtonClick}
          aria-label="Insert emoji"
        >
          <Smile className="size-5" />
          <span className="sr-only">Emoji</span>
        </Button>
        {isEmojiPickerOpen && (
          <div
            ref={pickerRef}
            className={cn(
              "fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3",
              "md:absolute md:inset-auto md:bottom-full md:left-0 md:mb-2 md:block md:bg-transparent md:p-0",
            )}
            onPointerDown={handleEmojiButtonClick}
          >
            <div
              className={cn(
                "w-full max-w-md overflow-hidden rounded-t-2xl bg-background p-2 shadow-lg",
                "[&_em-emoji-picker]:h-[min(70dvh,24rem)] [&_em-emoji-picker]:w-full [&_em-emoji-picker]:max-w-full",
                "md:w-[352px] md:rounded-lg md:border md:border-border md:p-0 md:[&_em-emoji-picker]:h-[435px]",
              )}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
            >
              <div className="md:hidden">
                <Picker
                  data={data}
                  dynamicWidth
                  emojiButtonSize={34}
                  emojiSize={22}
                  maxFrequentRows={2}
                  onEmojiSelect={insertEmoji}
                  previewPosition="none"
                  skinTonePosition="none"
                  theme="light"
                />
              </div>
              <div className="hidden md:block">
                <Picker data={data} onEmojiSelect={insertEmoji} theme="light" />
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-2 w-full md:hidden"
                onClick={handleEmojiButtonClick}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>

      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(event) => {
          handleContentChange(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        rows={1}
        aria-label="Message composer"
        placeholder="Aa"
        className="max-h-32 min-h-10 flex-1 resize-none rounded-3xl border-transparent bg-muted px-4 py-2 text-sm"
      />

      <Button
        type="submit"
        size="icon"
        variant="default"
        className="shrink-0 rounded-full"
        disabled={isSendBlocked}
        aria-label={actionLabel}
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}

export function MessageComposer({
  className,
  conversation,
  onMessageSent,
}: MessageComposerProps) {
  const composer = useMessageComposer({ conversation, onMessageSent });

  return (
    <div className={cn("border-t border-border p-3 md:p-4", className)}>
      <MessageComposerActions {...composer} />
    </div>
  );
}
