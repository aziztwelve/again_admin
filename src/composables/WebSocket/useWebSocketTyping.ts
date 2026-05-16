import { ref, Ref } from "vue";
import type { UserTypingEvent } from "@/types/conversation/chat";

interface UseWebSocketTypingOptions {
  conversationId: Ref<number | null>;
  onTypingChanged?: (userId: number, isTyping: boolean) => void;
}

export function useWebSocketTyping(options: UseWebSocketTypingOptions) {
  const { conversationId, onTypingChanged } = options;

  // Хранит ID пользователей, которые сейчас печатают
  const typingUsers = ref<Set<number>>(new Set());

  // Таймеры для автоматического удаления индикатора печати
  const typingTimers = new Map<number, NodeJS.Timeout>();

  // Время в миллисекундах, после которого индикатор печати автоматически исчезает
  const TYPING_TIMEOUT = 3000;

  // Добавить пользователя в список печатающих
  const addTypingUser = (userId: number) => {
    if (typingUsers.value.has(userId)) {
      // Если пользователь уже печатает, сбрасываем таймер
      clearTypingTimer(userId);
    } else {
      typingUsers.value.add(userId);
    }

    // Устанавливаем новый таймер
    const timer = setTimeout(() => {
      removeTypingUser(userId);
    }, TYPING_TIMEOUT);

    typingTimers.set(userId, timer);

    if (onTypingChanged) {
      onTypingChanged(userId, true);
    }
  };

  // Удалить пользователя из списка печатающих
  const removeTypingUser = (userId: number) => {
    if (typingUsers.value.has(userId)) {
      typingUsers.value.delete(userId);
      clearTypingTimer(userId);

      if (onTypingChanged) {
        onTypingChanged(userId, false);
      }
    }
  };

  // Очистить таймер для пользователя
  const clearTypingTimer = (userId: number) => {
    const timer = typingTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      typingTimers.delete(userId);
    }
  };

  // Обработчик события печати
  const handleUserTyping = (event: UserTypingEvent) => {
    // Проверяем, что событие относится к текущему диалогу
    if (
      conversationId.value &&
      event.conversation_id === conversationId.value
    ) {
      if (event.is_typing) {
        addTypingUser(event.user_id);
      } else {
        removeTypingUser(event.user_id);
      }
    }
  };

  // Очистить все индикаторы печати
  const clearAllTyping = () => {
    typingTimers.forEach((timer) => clearTimeout(timer));
    typingTimers.clear();
    typingUsers.value.clear();
  };

  // Проверить, печатает ли кто-то
  const isAnyoneTyping = () => {
    return typingUsers.value.size > 0;
  };

  // Получить количество печатающих пользователей
  const getTypingCount = () => {
    return typingUsers.value.size;
  };

  return {
    typingUsers,
    handleUserTyping,
    addTypingUser,
    removeTypingUser,
    clearAllTyping,
    isAnyoneTyping,
    getTypingCount,
  };
}
