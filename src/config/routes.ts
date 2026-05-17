export const APP_ROUTES = {
  chat: "/",
  chatConversation: "/conversation/:conversationId",
  signIn: "/sign-in",
  signUp: "/sign-up",
  friends: "/friends",
  profile: "/profile",
  conversationById: (conversationId: string) =>
    `/conversation/${conversationId}`,
} as const;

export const APP_API = {
  healthCheck: "/health-check",
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
      info: "/user/info",
    },
    friend: {
      list: "/friend",
      search: "/friend/search",
      requests: "/friend/request",
      sendRequest: "/friend/request",
      acceptRequest: "/friend/accept",
      declineRequest: "/friend/decline",
      cancelRequest: "/friend/cancel",
      delete: (friendId: string) => `/friend/${friendId}`,
    },
    chat: {
      conversations: "/conversation",
      markConversationAsSeen: (conversationId: string) =>
        `/conversation/${conversationId}/seen`,
      createConversation: "/conversation",
      updateGroup: (conversationId: string) =>
        `/conversation/${conversationId}/group`,
      addGroupMembers: (conversationId: string) =>
        `/conversation/${conversationId}/members`,
      removeGroupMember: (conversationId: string, memberId: string) =>
        `/conversation/${conversationId}/members/${memberId}`,
      leaveGroup: (conversationId: string) =>
        `/conversation/${conversationId}/leave`,
      messages: (conversationId: string) =>
        `/conversation/${conversationId}/messages`,
      sendDirectMessage: "/message/direct",
      sendGroupMessage: "/message/group",
    },
  },
} as const;
