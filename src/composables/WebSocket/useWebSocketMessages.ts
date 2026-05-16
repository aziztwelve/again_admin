import { ref, Ref } from "vue";
import type { Message, MessageCreatedEvent } from "@/types/conversation/chat";

interface UseWebSocketMessagesOptions {
  conversationId: Ref<number | null>;
  onMessageReceived?: (message: Message) => void;
}

export function useWebSocketMessages(options: UseWebSocketMessagesOptions) {
  const { conversationId, onMessageReceived } = options;
  const messages = ref<Message[]>([]);
  const isReceiving = ref(false);

  // Добавить новое сообщение в список
  const addMessage = (message: Message) => {
    // Проверяем, что сообщение относится к текущему диалогу
    if (
      conversationId.value &&
      message.conversation_id === conversationId.value
    ) {
      // Проверяем, нет ли уже такого сообщения (по ID)
      const existingIndex = messages.value.findIndex(
        (m) => m.id === message.id,
      );

      if (existingIndex === -1) {
        // Добавляем новое сообщение
        messages.value.push(message);
      } else {
        // Обновляем существующее сообщение
        messages.value[existingIndex] = message;
      }

      // Вызываем callback если он есть
      if (onMessageReceived) {
        onMessageReceived(message);
      }
    }
  };

  // Обработчик события создания сообщения
  const handleMessageCreated = (event: MessageCreatedEvent) => {
    isReceiving.value = true;

    try {
      addMessage(event.message);
    } catch (error) {
      console.error("Ошибка при обработке нового сообщения:", error);
    } finally {
      isReceiving.value = false;
    }
  };

  // Установить список сообщений (при загрузке диалога)
  const setMessages = (newMessages: Message[]) => {
    messages.value = newMessages;
  };

  // Очистить список сообщений
  const clearMessages = () => {
    messages.value = [];
  };

  // Удалить сообщение по ID
  const removeMessage = (messageId: string | number) => {
    const index = messages.value.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      messages.value.splice(index, 1);
    }
  };

  return {
    messages,
    isReceiving,
    addMessage,
    handleMessageCreated,
    setMessages,
    clearMessages,
    removeMessage,
  };
}
