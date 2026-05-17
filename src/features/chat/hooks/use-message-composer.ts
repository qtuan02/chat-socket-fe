import * as React from "react";
import { useMessageComposerContent } from "@/features/chat/hooks/use-message-composer-content";
import { useMessageComposerKeyDown } from "@/features/chat/hooks/use-message-composer-key-down";
import {
  type PickerEmoji,
  useMessageEmoji,
} from "@/features/chat/hooks/use-message-emoji";
import { useSendMessage } from "@/features/chat/hooks/use-send-message";
import type { Conversation } from "@/types/conversation";
import type { MessageDto } from "@/types/message";

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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const {
    content,
    setContent,
    clearContent,
    restoreContent,
    handleContentChange,
  } = useMessageComposerContent();

  const focusComposer = React.useCallback(() => {
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  const { actionLabel, isSendBlocked, handleSubmit } = useSendMessage({
    conversation,
    content,
    onAfterMessageSent: focusComposer,
    onClearContent: clearContent,
    onMessageSent,
    onRestoreContent: restoreContent,
  });

  const {
    isEmojiPickerOpen,
    pickerRef,
    emojiButtonRef,
    handleEmojiButtonClick,
    insertEmoji,
  } = useMessageEmoji({
    shouldClosePicker: isSendBlocked,
    textareaRef,
    setContent,
  });

  const { handleFormSubmit, handleKeyDown } = useMessageComposerKeyDown({
    onSubmit: handleSubmit,
  });

  React.useEffect(() => {
    focusComposer();
  }, [conversation.id, focusComposer]);

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
