import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Paperclip, Send, Smile } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useThrottle } from "@/hooks/use-throttle";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";

type MessageComposerProps = {
  className?: string;
  conversation: Conversation;
};

type PickerEmoji = {
  native?: string;
};

export function MessageComposer({
  className,
  conversation,
}: MessageComposerProps) {
  const [content, setContent] = React.useState("");
  const [focusRequestCount, setFocusRequestCount] = React.useState(0);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const pickerRef = React.useRef<HTMLDivElement>(null);
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);
  const isSending = useChatStore((state) => state.isSending);
  const sendDirectMessage = useChatStore((state) => state.sendDirectMessage);
  const sendGroupMessage = useChatStore((state) => state.sendGroupMessage);
  const { data: currentUser } = useCurrentUserQuery();

  const focusComposer = React.useCallback(() => {
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  const { throttle: throttleSubmit, isThrottling } = useThrottle(
    async (trimmedContent: string) => {
      if (!currentUser?.id) return;
      const payload = {
        conversationId: conversation.id,
        content: trimmedContent,
        senderId: currentUser.id,
      };

      if (conversation.type === ConversationTypeEnum.DIRECT) {
        const recipientId = conversation.directMember?.userId;

        if (!recipientId) return;

        await sendDirectMessage({
          ...payload,
          recipientId,
        });
      }

      if (conversation.type === ConversationTypeEnum.GROUP)
        await sendGroupMessage(payload);

      setFocusRequestCount((count) => count + 1);
    },
    300,
  );

  const isSendBlocked = isSending || isThrottling;

  React.useEffect(() => {
    focusComposer();
  }, [conversation.id, focusComposer]);

  React.useEffect(() => {
    if (focusRequestCount === 0) {
      return;
    }

    focusComposer();
  }, [focusComposer, focusRequestCount]);

  React.useEffect(() => {
    if (!isSendBlocked) {
      return;
    }

    setIsEmojiPickerOpen(false);
  }, [isSendBlocked]);

  React.useEffect(() => {
    if (!isEmojiPickerOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (
        pickerRef.current?.contains(target) ||
        emojiButtonRef.current?.contains(target)
      ) {
        return;
      }

      setIsEmojiPickerOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isEmojiPickerOpen]);

  const handleEmojiButtonClick = React.useCallback(() => {
    setIsEmojiPickerOpen((previous) => !previous);
  }, []);

  const insertEmoji = React.useCallback((emoji: PickerEmoji) => {
    if (!emoji.native) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;

    setContent((previous) => {
      const beforeCursor = previous.slice(0, start);
      const afterCursor = previous.slice(end);
      return `${beforeCursor}${emoji.native}${afterCursor}`;
    });

    const cursorPosition = start + emoji.native.length;
    window.requestAnimationFrame(() => {
      const nextTextarea = textareaRef.current;
      if (!nextTextarea) {
        return;
      }

      nextTextarea.focus();
      nextTextarea.setSelectionRange(cursorPosition, cursorPosition);
    });

    setIsEmojiPickerOpen(false);
  }, []);

  const handleSubmit = React.useCallback(async () => {
    if (isSendBlocked) {
      return;
    }

    if (!currentUser?.id) {
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    setContent("");

    try {
      await throttleSubmit(trimmedContent);
    } catch {
      // Error handling remains in hooks/toast wiring.
    }
  }, [content, currentUser?.id, isSendBlocked, throttleSubmit]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSubmit();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const actionLabel = isSending ? "Sending..." : "Send";

  return (
    <div className={cn("border-t border-border p-4", className)}>
      <form className="space-y-3" onSubmit={handleFormSubmit}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
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
            <Button type="button" size="icon" variant="outline">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach</span>
            </Button>
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
              {isEmojiPickerOpen ? (
                <div
                  ref={pickerRef}
                  className="absolute bottom-full left-0 z-20 mb-2 rounded-lg border border-border bg-background p-1 shadow-lg"
                >
                  <Picker
                    data={data}
                    onEmojiSelect={insertEmoji}
                    theme="light"
                  />
                </div>
              ) : null}
            </div>
          </div>
          <Button type="submit" variant="default" disabled={isSendBlocked}>
            <Send className="size-4" />
            {actionLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
