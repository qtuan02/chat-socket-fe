import * as React from "react";

export type PickerEmoji = {
  native?: string;
};

type UseMessageEmojiOptions = {
  shouldClosePicker: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

export function useMessageEmoji({
  shouldClosePicker,
  textareaRef,
  setContent,
}: UseMessageEmojiOptions) {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!shouldClosePicker) return;

    setIsEmojiPickerOpen(false);
  }, [shouldClosePicker]);

  React.useEffect(() => {
    if (!isEmojiPickerOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (
        pickerRef.current?.contains(target) ||
        emojiButtonRef.current?.contains(target)
      )
        return;

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

  const insertEmoji = React.useCallback(
    (emoji: PickerEmoji) => {
      if (!emoji.native) return;

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
    },
    [setContent, textareaRef],
  );

  return {
    isEmojiPickerOpen,
    pickerRef,
    emojiButtonRef,
    handleEmojiButtonClick,
    insertEmoji,
  };
}
