import * as React from "react";

type UseMessageComposerKeyDownOptions = {
  onSubmit: () => Promise<void> | void;
};

export function useMessageComposerKeyDown({
  onSubmit,
}: UseMessageComposerKeyDownOptions) {
  const handleFormSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void onSubmit();
    },
    [onSubmit],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey) return;

      event.preventDefault();
      void onSubmit();
    },
    [onSubmit],
  );

  return {
    handleFormSubmit,
    handleKeyDown,
  };
}
