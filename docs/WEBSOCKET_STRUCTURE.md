# Структура обработки WebSocket для диалогов

## Обзор архитектуры

Система WebSocket для диалогов построена на модульной архитектуре с разделением ответственности:

```
src/composables/WebSocket/
├── useWebSocketMessages.ts      # Обработка сообщений
├── useWebSocketStatus.ts        # Обработка статусов сообщений
├── useWebSocketTyping.ts        # Обработка индикаторов печати
└── useConversationWebSocket.ts  # Главный composable (объединяет все)
```

## Компоненты системы

### 1. useWebSocketMessages

Отвечает за обработку входящих сообщений.

**Возможности:**

- Добавление новых сообщений
- Обновление существующих сообщений
- Удаление сообщений
- Управление списком сообщений

**API:**

```typescript
const {
  messages, // Ref<Message[]> - список сообщений
  isReceiving, // Ref<boolean> - флаг получения
  addMessage, // (message: Message) => void
  handleMessageCreated, // (event: MessageCreatedEvent) => void
  setMessages, // (messages: Message[]) => void
  clearMessages, // () => void
  removeMessage, // (messageId: string | number) => void
} = useWebSocketMessages(options);
```

### 2. useWebSocketStatus

Управляет статусами сообщений (отправлено, доставлено, прочитано).

**Возможности:**

- Обновление статуса отдельного сообщения
- Массовое обновление статусов
- Пометка всех сообщений как прочитанных

**API:**

```typescript
const {
  isUpdating, // Ref<boolean>
  updateMessageStatus, // (messageId, status) => void
  handleStatusUpdated, // (event: MessageStatusUpdatedEvent) => void
  updateMultipleStatuses, // (updates: Array) => void
  markAllAsRead, // () => void
} = useWebSocketStatus(options);
```

### 3. useWebSocketTyping

Обрабатывает индикаторы печати пользователей.

**Возможности:**

- Отслеживание печатающих пользователей
- Автоматическое удаление индикатора через 3 секунды
- Управление таймерами

**API:**

```typescript
const {
  typingUsers, // Ref<Set<number>> - ID печатающих
  handleUserTyping, // (event: UserTypingEvent) => void
  addTypingUser, // (userId: number) => void
  removeTypingUser, // (userId: number) => void
  clearAllTyping, // () => void
  isAnyoneTyping, // () => boolean
  getTypingCount, // () => number
} = useWebSocketTyping(options);
```

### 4. useConversationWebSocket (главный)

Объединяет все обработчики и управляет подключением к каналу.

**Возможности:**

- Автоматическая подписка/отписка при изменении conversationId
- Обработка всех типов событий
- Управление состоянием подключения
- Обработка ошибок

## События WebSocket

Система обрабатывает следующие события:

| Событие                | Описание                     |
| ---------------------- | ---------------------------- |
| `MessageCreated`       | Новое сообщение в диалоге    |
| `MessageStatusUpdated` | Изменение статуса сообщения  |
| `MessageDeleted`       | Удаление сообщения           |
| `UserTyping`           | Пользователь печатает        |
| `ConversationUpdated`  | Обновление диалога           |
| `ConversationAssigned` | Назначение диалога менеджеру |

## Пример использования

### Базовое использование в компоненте

```vue
<template>
  <div class="chat-container">
    <!-- Индикатор подключения -->
    <div v-if="!isConnected" class="connection-status">Подключение...</div>

    <!-- Список сообщений -->
    <div class="messages-list">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.direction]"
      >
        <p>{{ message.content }}</p>
        <span class="status">{{ message.status }}</span>
      </div>
    </div>

    <!-- Индикатор печати -->
    <div v-if="isAnyoneTyping()" class="typing-indicator">
      {{ getTypingCount() }} пользователь(ей) печатает...
    </div>

    <!-- Форма отправки -->
    <form @submit.prevent="sendMessage">
      <input v-model="newMessage" @input="handleTyping" />
      <button type="submit">Отправить</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useConversationWebSocket } from "@/composables/WebSocket/useConversationWebSocket";
import { useChatsFunctions } from "@/composables/useChatsFunctions";

const props = defineProps<{
  conversationId: number;
}>();

const conversationIdRef = computed(() => props.conversationId);
const newMessage = ref("");

// Инициализация WebSocket
const {
  isConnected,
  connectionError,
  messages,
  isReceiving,
  setMessages,
  typingUsers,
  isAnyoneTyping,
  getTypingCount,
  markAllAsRead,
} = useConversationWebSocket({
  conversationId: conversationIdRef,

  // Callback при получении нового сообщения
  onMessageReceived: (message) => {
    console.log("Новое сообщение:", message);
    // Можно добавить уведомление, звук и т.д.
  },

  // Callback при удалении сообщения
  onMessageDeleted: (messageId) => {
    console.log("Сообщение удалено:", messageId);
  },

  // Callback при обновлении диалога
  onConversationUpdated: (event) => {
    console.log("Диалог обновлен:", event);
  },

  // Callback при изменении статуса
  onStatusUpdated: (messageId, status) => {
    console.log(`Статус сообщения ${messageId} изменен на ${status}`);
  },

  // Callback при изменении индикатора печати
  onTypingChanged: (userId, isTyping) => {
    console.log(
      `Пользователь ${userId} ${isTyping ? "печатает" : "перестал печатать"}`,
    );
  },
});

// Функции для работы с API
const { conversationReplyById } = useChatsFunctions();

// Отправка сообщения
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    await conversationReplyById(props.conversationId, newMessage.value);
    newMessage.value = "";
  } catch (error) {
    console.error("Ошибка отправки:", error);
  }
};

// Обработка печати (можно отправлять событие на сервер)
let typingTimeout: NodeJS.Timeout;
const handleTyping = () => {
  clearTimeout(typingTimeout);
  // Здесь можно отправить событие на сервер о том, что пользователь печатает
  typingTimeout = setTimeout(() => {
    // Событие о прекращении печати
  }, 1000);
};

// Загрузка начальных сообщений
const loadMessages = async () => {
  const { getConversationByIdWithMessages } = useChatsFunctions();
  const conversation = await getConversationByIdWithMessages(
    props.conversationId,
  );
  if (conversation.messages) {
    setMessages(conversation.messages);
  }
};

// Загружаем сообщения при монтировании
onMounted(() => {
  loadMessages();
});
</script>
```

### Расширенное использование с ChatWidget

```vue
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useConversationWebSocket } from "@/composables/WebSocket/useConversationWebSocket";

const props = defineProps<{
  conversation: Conversation;
}>();

const conversationId = computed(() => props.conversation?.id ?? null);

// Инициализация WebSocket с расширенными опциями
const websocket = useConversationWebSocket({
  conversationId,

  onMessageReceived: (message) => {
    // Прокрутка к новому сообщению
    scrollToBottom();

    // Воспроизведение звука
    playNotificationSound();

    // Пометка как прочитанное если окно активно
    if (document.hasFocus()) {
      websocket.markAllAsRead();
    }
  },

  onConversationUpdated: (event) => {
    // Обновляем данные диалога
    emit("conversation-updated", event.conversation);
  },
});

// Следим за фокусом окна для автоматической пометки прочитанных
watch(
  () => document.hasFocus(),
  (hasFocus) => {
    if (hasFocus && websocket.messages.value.length > 0) {
      websocket.markAllAsRead();
    }
  },
);
</script>
```

## Конфигурация событий

События настраиваются в `src/config/echoConfig.ts`:

```typescript
export const ECHO_CHANNELS = {
  ADMIN_NOTIFICATIONS: "admin.notifications",
  PRESENCE_USERS: "presence.users",
  CONVERSATION: (conversationId: number) => `conversation.${conversationId}`,
};

export const ECHO_EVENTS = {
  CONVERSATION_UPDATED: ".ConversationUpdated",
  MESSAGE_CREATED: ".MessageCreated",
  MESSAGE_STATUS_UPDATED: ".MessageStatusUpdated",
  MESSAGE_DELETED: ".MessageDeleted",
  USER_TYPING: ".UserTyping",
  CONVERSATION_ASSIGNED: ".ConversationAssigned",
};
```

## Типы данных

Все типы определены в `src/types/conversation/chat.ts`:

```typescript
// События WebSocket
export interface MessageCreatedEvent {
  message: Message;
  conversation_id: number;
}

export interface MessageStatusUpdatedEvent {
  message_id: string | number;
  status: Message["status"];
  conversation_id: number;
}

export interface UserTypingEvent {
  user_id: number;
  conversation_id: number;
  is_typing: boolean;
}

// И другие...
```

## Лучшие практики

1. **Всегда используйте computed для conversationId**

   ```typescript
   const conversationId = computed(() => props.conversation?.id ?? null);
   ```

2. **Очищайте сообщения при смене диалога**

   ```typescript
   watch(conversationId, () => {
     websocket.clearMessages();
   });
   ```

3. **Обрабатывайте ошибки подключения**

   ```typescript
   watch(
     () => websocket.connectionError.value,
     (error) => {
       if (error) {
         showNotification("Ошибка подключения к чату", "error");
       }
     },
   );
   ```

4. **Используйте debounce для индикатора печати**
   ```typescript
   const debouncedTyping = useDebounceFn(() => {
     // Отправка события печати
   }, 300);
   ```

## Отладка

Для отладки WebSocket соединений:

```typescript
// В echo.js уже есть логирование
console.log("Echo instance created:", window.Echo);

// В useConversationWebSocket есть подробные логи
console.log("Подписка на канал:", channelName);
console.log("Получено новое сообщение:", event);
```

## Требования на стороне сервера

Сервер должен отправлять события в следующем формате:

```php
// Laravel Broadcasting
broadcast(new MessageCreated($message))->toOthers();
broadcast(new MessageStatusUpdated($messageId, $status));
broadcast(new UserTyping($userId, $conversationId, $isTyping));
```

## Производительность

- Автоматическая отписка при размонтировании компонента
- Таймеры для индикаторов печати очищаются автоматически
- Проверка дубликатов сообщений по ID
- Минимальное количество ре-рендеров благодаря ref
