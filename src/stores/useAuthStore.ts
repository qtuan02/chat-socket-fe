import { create } from "zustand";

interface AuthStore {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearState: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clearState: () => {
    set({ accessToken: null });
  },
}));

export default useAuthStore;
