import type { ReactNode } from "react";
import { useChatSocketSync } from "@/features/chat/hooks/use-chat-socket-sync";

type ChatSocketProviderProps = {
  activeConversationId: string;
  children: ReactNode;
};

export function ChatSocketProvider({
  activeConversationId,
  children,
}: ChatSocketProviderProps) {
  useChatSocketSync({ activeConversationId });

  return <>{children}</>;
}
