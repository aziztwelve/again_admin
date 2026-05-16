export const ECHO_CHANNELS = {
  ADMIN_NOTIFICATIONS: "admin.notifications",
  PRESENCE_USERS: "presence.users",
  CONVERSATION: (conversationId: number) => `conversation.${conversationId}`,
} as const;

export const ECHO_EVENTS = {
  CONVERSATION_UPDATED: ".ConversationUpdated",
  MESSAGE_CREATED: ".MessageCreated",
  MESSAGE_STATUS_UPDATED: ".MessageStatusUpdated",
  MESSAGE_DELETED: ".MessageDeleted",
  USER_TYPING: ".UserTyping",
  CONVERSATION_ASSIGNED: ".ConversationAssigned",
} as const;

// Типы для типизации
export type EchoChannel = (typeof ECHO_CHANNELS)[keyof typeof ECHO_CHANNELS];
export type EchoEvent = (typeof ECHO_EVENTS)[keyof typeof ECHO_EVENTS];
