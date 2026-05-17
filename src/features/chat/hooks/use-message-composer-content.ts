import * as React from "react";

export function useMessageComposerContent() {
  const [content, setContent] = React.useState("");

  const handleContentChange = React.useCallback((nextContent: string) => {
    setContent(nextContent);
  }, []);

  const clearContent = React.useCallback(() => {
    setContent("");
  }, []);

  const restoreContent = React.useCallback((nextContent: string) => {
    setContent(nextContent);
  }, []);

  return {
    content,
    setContent,
    clearContent,
    restoreContent,
    handleContentChange,
  };
}
