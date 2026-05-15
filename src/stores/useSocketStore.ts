import { Client, type IMessage } from "@stomp/stompjs";
import { create } from "zustand";
import { env } from "@/config/env";
import { parseToJson } from "@/utils/string";
import useAuthStore from "./useAuthStore";

interface SocketStore {
  client: Client | null;
  isPresenceReady: boolean;
  onlineUsers: string[];
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  client: null,
  isPresenceReady: false,
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
      set({ isPresenceReady: false });

      const handleOnlineUsers = (message: IMessage) => {
        const onlineUsers = parseToJson<string[]>(message.body);

        if (!Array.isArray(onlineUsers)) return;

        set({ isPresenceReady: true, onlineUsers });
      };

      client.subscribe("/topic/online-users", handleOnlineUsers);
      client.subscribe("/app/online-users", handleOnlineUsers);
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers.message);
      set({ isPresenceReady: false });
    };

    client.onWebSocketClose = () => {
      set({ isPresenceReady: false, onlineUsers: [] });
    };

    client.activate();
  },

  disconnect: () => {
    const client = get().client;

    if (client) {
      void client.deactivate();
      set({ client: null, isPresenceReady: false, onlineUsers: [] });
    }
  },
}));
