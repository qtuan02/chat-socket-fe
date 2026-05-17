import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Send, Smile } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { useMessageComposer } from "@/features/chat/hooks/use-message-composer";
import type { Conversation } from "@/types/conversation";
import type { MessageDto } from "@/types/message";
import { cn } from "@/utils/cn";

type MessageComposerProps = {
  className?: string;
  conversation: Conversation;
  onMessageSent?: (message: MessageDto) => void;
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
    <form className="space-y-1 md:space-y-3" onSubmit={handleFormSubmit}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => {
            handleContentChange(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          rows={3}
          aria-label="Message composer"
          placeholder="Type a message..."
          className="w-full min-h-20 resize-none rounded-md border border-input bg-muted/20 px-3 py-2 text-sm shadow-sm outline-none ring-0 transition"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* <Button type="button" size="icon" variant="outline">
            <Paperclip className="size-4" />
            <span className="sr-only">Attach</span>
          </Button> */}
          <div className="relative">
            <Button
              type="button"
              size="icon"
              variant="outline"
              ref={emojiButtonRef}
              onClick={handleEmojiButtonClick}
              aria-label="Insert emoji"
            >
              <Smile className="size-4" />
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
                    <Picker
                      data={data}
                      onEmojiSelect={insertEmoji}
                      theme="light"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full md:hidden"
                    onClick={handleEmojiButtonClick}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Button type="submit" variant="default" disabled={isSendBlocked}>
          <Send className="size-4" />
          {actionLabel}
        </Button>
      </div>
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
    <div className={cn("border-t border-border p-3 pb-1 md:p-4", className)}>
      <MessageComposerActions {...composer} />
    </div>
  );
}
