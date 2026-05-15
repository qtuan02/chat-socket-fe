export const APP_ROUTES = {
  chat: "/",
  chatConversation: "/conversation/:conversationId",
  signIn: "/sign-in",
  signUp: "/sign-up",
  conversationById: (conversationId: string) =>
    `/conversation/${conversationId}`,
} as const;

export const APP_API = {
  v1: {
    base: "/v1",
    auth: {
      signIn: "/auth/sign-in",
      signUp: "/auth/sign-up",
      signOut: "/auth/sign-out",
      refreshToken: "/auth/refresh",
    },
    user: {
      me: "/user/me",
    },
    chat: {
      conversations: "/conversation",
      messages: (conversationId: string) =>
        `/conversation/${conversationId}/messages`,
      sendDirectMessage: "/message/direct",
      sendGroupMessage: "/message/group",
    },
  },
} as const;
