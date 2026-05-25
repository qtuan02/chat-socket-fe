import { create } from "zustand";

interface AuthStore {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearState: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clearState: () => {
    set({ accessToken: null });
  },
}));

