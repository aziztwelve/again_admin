import { ref, watch, onBeforeUnmount, Ref } from "vue";
import { useWebSocketMessages } from "./useWebSocketMessages";
import { useWebSocketStatus } from "./useWebSocketStatus";
import { useWebSocketTyping } from "./useWebSocketTyping";
import { ECHO_CHANNELS, ECHO_EVENTS } from "@/config/echoConfig";
import type {
  Message,
  MessageCreatedEvent,
  MessageStatusUpdatedEvent,
  MessageDeletedEvent,
  UserTypingEvent,
  ConversationUpdatedEvent,
  ConversationAssignedEvent,
} from "@/types/conversation/chat";

interface UseConversationWebSocketOptions {
  conversationId: Ref<number | null>;
  onMessageReceived?: (message: Message) => void;
  onMessageDeleted?: (messageId: string | number) => void;
  onConversationUpdated?: (event: ConversationUpdatedEvent) => void;
  onConversationAssigned?: (event: ConversationAssignedEvent) => void;
  onStatusUpdated?: (
    messageId: string | number,
    status: Message["status"],
  ) => void;
  onTypingChanged?: (userId: number, isTyping: boolean) => void;
}

export function useConversationWebSocket(
  options: UseConversationWebSocketOptions,
) {
  const {
    conversationId,
    onMessageReceived,
    onMessageDeleted,
    onConversationUpdated,
    onConversationAssigned,
    onStatusUpdated,
    onTypingChanged,
  } = options;

  const isConnected = ref(false);
  const connectionError = ref<string | null>(null);
  const currentChannel = ref<any>(null);

  // Инициализируем composables для обработки различных событий
  const messagesHandler = useWebSocketMessages({
    conversationId,
    onMessageReceived,
  });

  const statusHandler = useWebSocketStatus({
    messages: messagesHandler.messages,
    onStatusUpdated,
  });

  const typingHandler = useWebSocketTyping({
    conversationId,
    onTypingChanged,
  });

  // Подписка на канал диалога
  const subscribeToConversation = (convId: number) => {
    if (!(window as any).Echo) {
      console.error("Echo не инициализирован");
      connectionError.value = "WebSocket не доступен";
      return;
    }

    try {
      // Отписываемся от предыдущего канала если есть
      unsubscribeFromConversation();

      const channelName = ECHO_CHANNELS.CONVERSATION(convId);
      console.log(`Подписка на канал: ${channelName}`);

      currentChannel.value = (window as any).Echo.private(channelName);

      // Подписываемся на события
      currentChannel.value
        // Новое сообщение
        .listen(ECHO_EVENTS.MESSAGE_CREATED, (event: MessageCreatedEvent) => {
          console.log("Получено новое сообщение:", event);
          messagesHandler.handleMessageCreated(event);
        })
        // Обновление статуса сообщения
        .listen(
          ECHO_EVENTS.MESSAGE_STATUS_UPDATED,
          (event: MessageStatusUpdatedEvent) => {
            console.log("Обновлен статус сообщения:", event);
            statusHandler.handleStatusUpdated(event);
          },
        )
        // Удаление сообщения
        .listen(ECHO_EVENTS.MESSAGE_DELETED, (event: MessageDeletedEvent) => {
          console.log("Сообщение удалено:", event);
          messagesHandler.removeMessage(event.message_id);
          if (onMessageDeleted) {
            onMessageDeleted(event.message_id);
          }
        })
        // Индикатор печати
        .listen(ECHO_EVENTS.USER_TYPING, (event: UserTypingEvent) => {
          console.log("Пользователь печатает:", event);
          typingHandler.handleUserTyping(event);
        })
        // Обновление диалога
        .listen(
          ECHO_EVENTS.CONVERSATION_UPDATED,
          (event: ConversationUpdatedEvent) => {
            console.log("Диалог обновлен:", event);
            if (onConversationUpdated) {
              onConversationUpdated(event);
            }
          },
        )
        // Назначение диалога
        .listen(
          ECHO_EVENTS.CONVERSATION_ASSIGNED,
          (event: ConversationAssignedEvent) => {
            console.log("Диалог назначен:", event);
            if (onConversationAssigned) {
              onConversationAssigned(event);
            }
          },
        )
        // Обработка ошибок
        .error((error: any) => {
          console.error("Ошибка WebSocket:", error);
          connectionError.value = "Ошибка подключения";
          isConnected.value = false;
        });

      isConnected.value = true;
      connectionError.value = null;
      console.log(`Успешно подключено к каналу ${channelName}`);
    } catch (error) {
      console.error("Ошибка при подписке на канал:", error);
      connectionError.value = "Не удалось подключиться";
      isConnected.value = false;
    }
  };

  // Отписка от канала диалога
  const unsubscribeFromConversation = () => {
    if (currentChannel.value && (window as any).Echo) {
      try {
        const channelName = currentChannel.value.name;
        (window as any).Echo.leave(channelName);
        console.log(`Отписка от канала: ${channelName}`);
        currentChannel.value = null;
        isConnected.value = false;
      } catch (error) {
        console.error("Ошибка при отписке от канала:", error);
      }
    }

    // Очищаем индикаторы печати
    typingHandler.clearAllTyping();
  };

  // Следим за изменением conversationId
  watch(
    conversationId,
    (newId, oldId) => {
      if (newId && newId !== oldId) {
        subscribeToConversation(newId);
      } else if (!newId) {
        unsubscribeFromConversation();
      }
    },
    { immediate: true },
  );

  // Отписываемся при размонтировании компонента
  onBeforeUnmount(() => {
    unsubscribeFromConversation();
  });

  return {
    // Состояние подключения
    isConnected,
    connectionError,

    // Сообщения
    messages: messagesHandler.messages,
    isReceiving: messagesHandler.isReceiving,
    setMessages: messagesHandler.setMessages,
    clearMessages: messagesHandler.clearMessages,

    // Статусы
    isUpdating: statusHandler.isUpdating,
    updateMessageStatus: statusHandler.updateMessageStatus,
    markAllAsRead: statusHandler.markAllAsRead,

    // Индикаторы печати
    typingUsers: typingHandler.typingUsers,
    isAnyoneTyping: typingHandler.isAnyoneTyping,
    getTypingCount: typingHandler.getTypingCount,

    // Управление подключением
    subscribeToConversation,
    unsubscribeFromConversation,
  };
}
