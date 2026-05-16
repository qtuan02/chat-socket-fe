import * as React from "react";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useThrottle } from "@/hooks/use-throttle";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import type { MessageDto } from "@/types/message";

type PickerEmoji = {
  native?: string;
};

type ComposerState = {
  content: string;
  isEmojiPickerOpen: boolean;
  isSendBlocked: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  pickerRef: React.RefObject<HTMLDivElement | null>;
  emojiButtonRef: React.RefObject<HTMLButtonElement | null>;
  actionLabel: string;
};

type ComposerActions = {
  handleContentChange: (content: string) => void;
  handleEmojiButtonClick: () => void;
  insertEmoji: (emoji: PickerEmoji) => void;
  handleSubmit: () => Promise<void>;
  handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export function useMessageComposer({
  conversation,
  onMessageSent,
}: {
  conversation: Conversation;
  onMessageSent?: (message: MessageDto) => void;
}): ComposerState & ComposerActions {
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
      let sentMessage: MessageDto | undefined;

      const payload = {
        conversationId: conversation.id,
        content: trimmedContent,
        senderId: currentUser.id,
      };

      if (conversation.type === ConversationTypeEnum.DIRECT) {
        const recipientId = conversation.directMember?.userId;
        if (!recipientId) return;

        sentMessage = await sendDirectMessage({
          ...payload,
          recipientId,
        });
      } else {
        sentMessage = await sendGroupMessage(payload);
      }

      if (sentMessage) {
        onMessageSent?.(sentMessage);
      }

      setFocusRequestCount((count) => count + 1);
    },
    300,
  );

  const isSendBlocked = isSending || isThrottling;
  const actionLabel = isSending ? "Sending..." : "Send";

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

  const handleContentChange = React.useCallback((nextContent: string) => {
    setContent(nextContent);
  }, []);

  const handleEmojiButtonClick = React.useCallback(() => {
    setIsEmojiPickerOpen((previous) => !previous);
  }, []);

  const insertEmoji = React.useCallback((emoji: PickerEmoji) => {
    if (!emoji.native) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

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
      if (!nextTextarea) return;

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
    if (!trimmedContent) return;

    setContent("");

    try {
      await throttleSubmit(trimmedContent);
    } catch {
      // Error handling is managed by the message store/toast middleware.
    }
  }, [content, currentUser?.id, isSendBlocked, throttleSubmit]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return {
    content,
    isEmojiPickerOpen,
    isSendBlocked,
    textareaRef,
    pickerRef,
    emojiButtonRef,
    actionLabel,
    handleContentChange,
    handleEmojiButtonClick,
    insertEmoji,
    handleSubmit,
    handleFormSubmit,
    handleKeyDown,
  };
}
