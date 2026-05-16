import { ref, Ref, watch } from "vue";

/**
 * Composable для управления звуковыми уведомлениями в чате
 */
export function useChatNotifications() {
  const notificationsEnabled = ref(true);
  const soundEnabled = ref(true);
  const desktopNotificationsEnabled = ref(false);

  // Проверяем разрешение на desktop уведомления
  const checkDesktopPermission = async () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        desktopNotificationsEnabled.value = true;
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        desktopNotificationsEnabled.value = permission === "granted";
      }
    }
  };

  // Воспроизведение звука
  const playNotificationSound = (
    soundType: "message" | "sent" | "error" = "message",
  ) => {
    if (!soundEnabled.value) return;

    const soundMap = {
      message: "/sounds/notification.mp3",
      sent: "/sounds/sent.mp3",
      error: "/sounds/error.mp3",
    };

    try {
      const audio = new Audio(soundMap[soundType]);
      audio.volume = 0.5;
      audio
        .play()
        .catch((e) => console.error("Не удалось воспроизвести звук:", e));
    } catch (error) {
      console.error("Ошибка воспроизведения звука:", error);
    }
  };

  // Показать desktop уведомление
  const showDesktopNotification = (
    title: string,
    body: string,
    icon?: string,
  ) => {
    if (!desktopNotificationsEnabled.value || !notificationsEnabled.value)
      return;

    try {
      new Notification(title, {
        body,
        icon: icon || "/icons/chat.png",
        badge: "/icons/badge.png",
        tag: "chat-notification",
        requireInteraction: false,
      });
    } catch (error) {
      console.error("Ошибка показа уведомления:", error);
    }
  };

  // Показать уведомление о новом сообщении
  const notifyNewMessage = (
    senderName: string,
    messageContent: string,
    senderAvatar?: string,
  ) => {
    if (!notificationsEnabled.value) return;

    // Не показываем уведомление если окно активно
    if (document.hasFocus()) return;

    playNotificationSound("message");
    showDesktopNotification(
      `Новое сообщение от ${senderName}`,
      messageContent.substring(0, 100),
      senderAvatar,
    );
  };

  return {
    notificationsEnabled,
    soundEnabled,
    desktopNotificationsEnabled,
    checkDesktopPermission,
    playNotificationSound,
    showDesktopNotification,
    notifyNewMessage,
  };
}

/**
 * Composable для управления автоматической прокруткой чата
 */
export function useChatScroll(messagesEndRef: Ref<HTMLElement | null>) {
  const shouldAutoScroll = ref(true);
  const isUserScrolling = ref(false);

  // Проверяем, находится ли пользователь внизу списка
  const checkIfAtBottom = (element: HTMLElement) => {
    const threshold = 100; // пикселей от низа
    const position =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    return position < threshold;
  };

  // Обработчик прокрутки
  const handleScroll = (e: Event) => {
    const element = e.target as HTMLElement;
    shouldAutoScroll.value = checkIfAtBottom(element);

    if (!shouldAutoScroll.value) {
      isUserScrolling.value = true;
    }
  };

  // Прокрутка вниз
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (!messagesEndRef.value) return;

    messagesEndRef.value.scrollIntoView({ behavior });
    isUserScrolling.value = false;
  };

  // Прокрутка вниз только если нужно
  const scrollToBottomIfNeeded = () => {
    if (shouldAutoScroll.value && !isUserScrolling.value) {
      scrollToBottom();
    }
  };

  return {
    shouldAutoScroll,
    isUserScrolling,
    handleScroll,
    scrollToBottom,
    scrollToBottomIfNeeded,
  };
}

/**
 * Composable для управления индикатором "печатает"
 */
export function useTypingIndicator(conversationId: Ref<number | null>) {
  const isTyping = ref(false);
  let typingTimeout: NodeJS.Timeout;

  // Отправка события печати на сервер
  const sendTypingEvent = async (typing: boolean) => {
    if (!conversationId.value) return;

    try {
      // Здесь должен быть реальный API запрос
      // await axios.post(`conversations/${conversationId.value}/typing`, {
      //     is_typing: typing
      // })
      console.log(`Отправка события печати: ${typing}`);
    } catch (error) {
      console.error("Ошибка отправки события печати:", error);
    }
  };

  // Начать печатать
  const startTyping = () => {
    if (!isTyping.value) {
      isTyping.value = true;
      sendTypingEvent(true);
    }

    // Сбрасываем таймер
    clearTimeout(typingTimeout);

    // Автоматически останавливаем через 3 секунды
    typingTimeout = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  // Остановить печатать
  const stopTyping = () => {
    if (isTyping.value) {
      isTyping.value = false;
      sendTypingEvent(false);
    }
    clearTimeout(typingTimeout);
  };

  // Обработчик ввода
  const handleInput = () => {
    startTyping();
  };

  // Очистка при размонтировании
  const cleanup = () => {
    stopTyping();
  };

  return {
    isTyping,
    startTyping,
    stopTyping,
    handleInput,
    cleanup,
  };
}

/**
 * Composable для форматирования времени сообщений
 */
export function useMessageTime() {
  const formatTime = (datetime: string | Date): string => {
    if (!datetime) return "";

    const date = new Date(datetime);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Только что (меньше минуты)
    if (diffInSeconds < 60) {
      return "Только что";
    }

    // Сегодня - показываем время
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Вчера
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера ${date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Эта неделя - показываем день недели
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (date > weekAgo) {
      const dayName = date.toLocaleDateString("ru-RU", { weekday: "short" });
      return `${dayName} ${date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Старше недели - полная дата
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (datetime: string | Date): string => {
    if (!datetime) return "";

    const date = new Date(datetime);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "только что";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} мин назад`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} ч назад`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} дн назад`;

    return formatTime(datetime);
  };

  return {
    formatTime,
    formatRelativeTime,
  };
}

/**
 * Composable для обработки ссылок в сообщениях
 */
export function useMessageLinks() {
  const urlPattern = /(\bhttps?:\/\/[^\s<>]+[^\s<.,:;"')\]\s])/g;
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phonePattern =
    /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

  const linkify = (text: string): string => {
    if (!text) return "";

    // Заменяем URL
    let result = text.replace(
      urlPattern,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${url}</a>`,
    );

    // Заменяем email
    result = result.replace(
      emailPattern,
      (email) =>
        `<a href="mailto:${email}" class="text-blue-600 underline hover:text-blue-800">${email}</a>`,
    );

    // Заменяем телефоны
    result = result.replace(
      phonePattern,
      (phone) =>
        `<a href="tel:${phone.replace(/\s/g, "")}" class="text-blue-600 underline hover:text-blue-800">${phone}</a>`,
    );

    return result;
  };

  const extractUrls = (text: string): string[] => {
    if (!text) return [];
    return text.match(urlPattern) || [];
  };

  return {
    linkify,
    extractUrls,
  };
}

/**
 * Composable для управления состоянием онлайн/оффлайн
 */
export function useOnlineStatus() {
  const isOnline = ref(navigator.onLine);
  const wasOffline = ref(false);

  const handleOnline = () => {
    isOnline.value = true;
    if (wasOffline.value) {
      console.log("Соединение восстановлено");
      wasOffline.value = false;
    }
  };

  const handleOffline = () => {
    isOnline.value = false;
    wasOffline.value = true;
    console.log("Соединение потеряно");
  };

  // Подписываемся на события
  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  const cleanup = () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
  };

  return {
    isOnline,
    wasOffline,
    cleanup,
  };
}

/**
 * Composable для группировки сообщений по датам
 */
export function useMessageGrouping() {
  const groupMessagesByDate = (messages: any[]) => {
    const groups: Record<string, any[]> = {};

    messages.forEach((message) => {
      const date = new Date(message.created_at);
      const dateKey = date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(message);
    });

    return groups;
  };

  const shouldShowDateSeparator = (
    currentMessage: any,
    previousMessage: any,
  ): boolean => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.created_at).toDateString();
    const previousDate = new Date(previousMessage.created_at).toDateString();

    return currentDate !== previousDate;
  };

  return {
    groupMessagesByDate,
    shouldShowDateSeparator,
  };
}
