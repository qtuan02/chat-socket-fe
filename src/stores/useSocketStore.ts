import { Client, type IMessage } from "@stomp/stompjs";
import { create } from "zustand";
import { env } from "@/config/env";
import { parseToJson } from "@/utils/string";
import { useAuthStore } from "./useAuthStore";

interface SocketStore {
  client: Client | null;
  isConnected: boolean;
  onlineUsers: string[];
  connect: () => void;
  disconnect: () => void;
}

function sanitizeOnlineUserIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const uniqueUserIds = new Set<string>();
  for (const userId of value) {
    if (typeof userId !== "string") continue;
    uniqueUserIds.add(userId);
  }

  return [...uniqueUserIds];
}

function areSameStringArrays(a: string[], b: string[]) {
  if (a.length !== b.length) return false;

  return a.every((value, index) => value === b[index]);
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  client: null,
  isConnected: false,
  onlineUsers: [],

  connect: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingClient = get().client;

    if (!accessToken || existingClient) return;

    const client = new Client({
      brokerURL: env.PUBLIC_SOCKET_URL,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    set({ client });

    const resetConnectionState = () => {
      set({ isConnected: false, onlineUsers: [] });
    };

    client.onConnect = () => {
      set({ isConnected: true, onlineUsers: [] });

      const handleOnlineUsers = (message: IMessage) => {
        const payload = parseToJson<unknown>(message.body);
        if (!payload) return;

        const onlineUsers = sanitizeOnlineUserIds(payload);
        if (!onlineUsers) return;

        set((state) =>
          areSameStringArrays(state.onlineUsers, onlineUsers)
            ? state
            : { onlineUsers },
        );
      };

      client.subscribe("/topic/online-users", handleOnlineUsers);
      client.subscribe("/app/online-users", handleOnlineUsers);
    };

    client.onStompError = () => {
      resetConnectionState();
    };

    client.onDisconnect = resetConnectionState;

    client.onWebSocketClose = resetConnectionState;

    client.activate();
  },

  disconnect: () => {
    const client = get().client;

    if (client) {
      void client.deactivate();
      set({
        client: null,
        isConnected: false,
        onlineUsers: [],
      });
    }
  },
}));
