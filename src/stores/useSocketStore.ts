import { Client } from "@stomp/stompjs";
import { create } from "zustand";
import { env } from "@/config/env";
import useAuthStore from "./useAuthStore";

interface SocketStore {
  client: Client | null;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  client: null,

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
      console.log("Đã kết nối STOMP");
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers.message);
    };

    client.activate();
  },

  disconnect: () => {
    const client = get().client;

    if (client) {
      void client.deactivate();
      set({ client: null });
    }
  },
}));
