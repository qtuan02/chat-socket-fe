import { Client, type IMessage } from "@stomp/stompjs";
import { create } from "zustand";
import { env } from "@/config/env";
import { parseToJson } from "@/utils/string";
import useAuthStore from "./useAuthStore";

interface SocketStore {
  client: Client | null;
  isConnected: boolean;
  onlineUsers: string[];
  connect: () => void;
  disconnect: () => void;
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

    client.onConnect = () => {
      set({ isConnected: true, onlineUsers: [] });

      const handleOnlineUsers = (message: IMessage) => {
        const onlineUsers = parseToJson<string[]>(message.body);

        if (!Array.isArray(onlineUsers)) return;

        set({ onlineUsers });
      };

      client.subscribe("/topic/online-users", handleOnlineUsers);
      client.subscribe("/app/online-users", handleOnlineUsers);
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers.message);
      set({ isConnected: false, onlineUsers: [] });
    };

    client.onDisconnect = () => {
      set({ isConnected: false, onlineUsers: [] });
    };

    client.onWebSocketClose = () => {
      set({ isConnected: false, onlineUsers: [] });
    };

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
