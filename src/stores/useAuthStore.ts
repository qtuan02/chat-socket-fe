import { create } from "zustand";

interface AuthStore {
  accessToken: string | null;
  sessionExpiredAt: number | null;
  setAccessToken: (accessToken: string) => void;
  markSessionExpired: () => void;
  clearSessionExpired: () => void;
  clearState: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  sessionExpiredAt: null,
  setAccessToken: (accessToken) => {
    set({ accessToken, sessionExpiredAt: null });
  },
  markSessionExpired: () => {
    set({ accessToken: null, sessionExpiredAt: Date.now() });
  },
  clearSessionExpired: () => {
    set({ sessionExpiredAt: null });
  },
  clearState: () => {
    set({ accessToken: null, sessionExpiredAt: null });
  },
}));

export default useAuthStore;
