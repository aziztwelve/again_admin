import { ref, Ref } from "vue";
import type {
  Message,
  MessageStatusUpdatedEvent,
} from "@/types/conversation/chat";

interface UseWebSocketStatusOptions {
  messages: Ref<Message[]>;
  onStatusUpdated?: (
    messageId: string | number,
    status: Message["status"],
  ) => void;
}

export function useWebSocketStatus(options: UseWebSocketStatusOptions) {
  const { messages, onStatusUpdated } = options;
  const isUpdating = ref(false);

  // Обновить статус сообщения
  const updateMessageStatus = (
    messageId: string | number,
    status: Message["status"],
  ) => {
    const message = messages.value.find((m) => m.id === messageId);

    if (message) {
      message.status = status;

      // Вызываем callback если он есть
      if (onStatusUpdated) {
        onStatusUpdated(messageId, status);
      }
    }
  };

  // Обработчик события обновления статуса
  const handleStatusUpdated = (event: MessageStatusUpdatedEvent) => {
    isUpdating.value = true;

    try {
      updateMessageStatus(event.message_id, event.status);
    } catch (error) {
      console.error("Ошибка при обновлении статуса сообщения:", error);
    } finally {
      isUpdating.value = false;
    }
  };

  // Установить статус для нескольких сообщений
  const updateMultipleStatuses = (
    updates: Array<{ messageId: string | number; status: Message["status"] }>,
  ) => {
    updates.forEach(({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    });
  };

  // Пометить все сообщения как прочитанные
  const markAllAsRead = () => {
    messages.value.forEach((message) => {
      if (message.direction === "incoming" && message.status !== "read") {
        message.status = "read";
      }
    });
  };

  return {
    isUpdating,
    updateMessageStatus,
    handleStatusUpdated,
    updateMultipleStatuses,
    markAllAsRead,
  };
}
