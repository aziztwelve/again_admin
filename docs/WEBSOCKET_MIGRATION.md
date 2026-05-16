# Руководство по миграции на новую структуру WebSocket

## Обзор изменений

Старая структура использовала прямую работу с Echo в компонентах. Новая структура предоставляет модульные composables для управления WebSocket соединениями.

## Преимущества новой структуры

1. **Модульность** - каждый аспект (сообщения, статусы, печать) в отдельном composable
2. **Переиспользуемость** - легко использовать в разных компонентах
3. **Типобезопасность** - полная типизация TypeScript
4. **Автоматическое управление** - подписка/отписка происходит автоматически
5. **Централизованная обработка ошибок** - единое место для логирования и обработки
6. **Тестируемость** - легко тестировать отдельные части

## Шаг 1: Обновление типов

Типы уже обновлены в `src/types/conversation/chat.ts`:

```typescript
// Добавлены новые события
export interface MessageDeletedEvent { ... }
export interface UserTypingEvent { ... }
export interface ConversationUpdatedEvent { ... }
export interface ConversationAssignedEvent { ... }
```

## Шаг 2: Обновление конфигурации

Конфигурация обновлена в `src/config/echoConfig.ts`:

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

## Шаг 3: Миграция ChatWidget.vue

### Старый код (до миграции)

```vue
<script setup lang="ts">
// Старая логика WebSocket
let currentChannel: any = null

watch(
  () => props.conversation.id,
  (id, oldId) => {
    if (oldId && (window as any).Echo) {
      try {
        (window as any).Echo.leave(`private-conversation.${oldId}`)
      } catch (e) {}
    }

    if (!id || !(window as any).Echo) return

    try {
      currentChannel = (window as any).Echo.private(`conversation.${id}`)

      currentChannel.listen('.MessageCreated', (payload: any) => {
        // Ручная обработка сообщений
        const incoming: Partial<Message> = {
          id: payload.id,
          content: payload.content,
          // ...
        }

        // Проверка дубликатов
        const exists = props.conversation.messages.some(...)

        if (!exists) {
          props.conversation.messages.push(incoming as Message)
        }
      })
    } catch (e) {
      console.error('Echo subscribe failed:', e)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  // Ручная отписка
  if (id && (window as any).Echo) {
    try {
      (window as any).Echo.leave(`private-conversation.${id}`)
    } catch (e) {}
  }
})
</script>
```

### Новый код (после миграции)

```vue
<script setup lang="ts">
import { useConversationWebSocket } from "@/composables/WebSocket/useConversationWebSocket";

// Computed для conversationId
const conversationId = computed(() => props.conversation?.id ?? null);

// Вся логика WebSocket в одном composable
const {
  isConnected,
  connectionError,
  messages: wsMessages,
  setMessages,
  typingUsers,
  isAnyoneTyping,
  markAllAsRead,
} = useConversationWebSocket({
  conversationId,

  onMessageReceived: (message) => {
    scrollToBottom();
    emits("hasNewMessage", props.conversation.id);
  },

  onStatusUpdated: (messageId, status) => {
    console.log(`Статус обновлен: ${messageId} -> ${status}`);
  },
});

// Автоматическая подписка/отписка при изменении conversationId
// Автоматическая очистка при размонтировании
</script>
```

## Шаг 4: Обновление компонента списка диалогов

### В `src/components/dialogs/chats/index.vue`

Старый код использует `useEchoListener` для глобальных уведомлений:

```vue
<script setup lang="ts">
const { isSubscribed: listenerSubscribed } = useEchoListener({
  channel: ECHO_CHANNELS.ADMIN_NOTIFICATIONS,
  event: ECHO_EVENTS.CONVERSATION_UPDATED,
  isPrivate: true,
  onMessage: () => {
    fetchData();
  },
});
</script>
```

Это можно оставить как есть, так как это глобальный канал уведомлений.

Но для отдельных диалогов теперь используем `useConversationWebSocket`.

## Шаг 5: Добавление индикатора печати

### В шаблоне ChatWidget

```vue
<template>
  <!-- После списка сообщений -->
  <div v-if="isAnyoneTyping()" class="flex justify-start">
    <div class="bg-muted rounded-lg px-3 py-2 text-xs">
      <div class="flex items-center gap-2">
        <div class="flex gap-1">
          <span
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 0ms"
          ></span>
          <span
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 150ms"
          ></span>
          <span
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 300ms"
          ></span>
        </div>
        <span class="text-muted-foreground">
          {{
            getTypingCount() > 1
              ? `${getTypingCount()} пользователей`
              : "Клиент"
          }}
          печатает...
        </span>
      </div>
    </div>
  </div>
</template>
```

## Шаг 6: Добавление индикатора подключения

```vue
<template>
  <CardDescription class="flex items-center gap-1 text-xs">
    <span>{{ conversation.client?.profile?.phone }}</span>

    <!-- Индикатор статуса подключения -->
    <Badge
      v-if="!isConnected"
      variant="destructive"
      class="h-4 px-1 text-[0.6rem]"
    >
      Отключено
    </Badge>

    <Badge
      v-else-if="isReceiving"
      variant="secondary"
      class="h-4 px-1 text-[0.6rem]"
    >
      Получение...
    </Badge>
  </CardDescription>
</template>
```

## Шаг 7: Обработка ошибок

```vue
<script setup lang="ts">
import { useToast } from "@/components/ui/toast";

const { toast } = useToast();

// Следим за ошибками подключения
watch(connectionError, (error) => {
  if (error) {
    toast({
      title: "Ошибка подключения",
      description: error,
      variant: "destructive",
    });
  }
});

// Следим за восстановлением подключения
watch(isConnected, (connected, wasConnected) => {
  if (connected && wasConnected === false) {
    toast({
      title: "Подключение восстановлено",
      description: "WebSocket соединение активно",
    });
  }
});
</script>
```

## Шаг 8: Отправка события печати на сервер (опционально)

```vue
<script setup lang="ts">
import axios from "axios";
import { useDebounceFn } from "@vueuse/core";

let isTypingActive = false;

const sendTypingEvent = useDebounceFn(async (isTyping: boolean) => {
  if (!conversationId.value) return;

  try {
    await axios.post(`conversations/${conversationId.value}/typing`, {
      is_typing: isTyping,
    });
    isTypingActive = isTyping;
  } catch (error) {
    console.error("Ошибка отправки события печати:", error);
  }
}, 300);

const handleTyping = () => {
  if (!isTypingActive) {
    sendTypingEvent(true);
  }

  // Автоматически отправляем false через 3 секунды
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendTypingEvent(false);
  }, 3000);
};

// При отправке сообщения сбрасываем индикатор
const sendMessage = async () => {
  // ... код отправки

  if (isTypingActive) {
    sendTypingEvent(false);
  }
};
</script>
```

## Шаг 9: Тестирование

### Проверьте следующие сценарии:

1. **Получение сообщений**
   - Отправьте сообщение из другого источника
   - Убедитесь, что оно появляется в реальном времени

2. **Обновление статусов**
   - Отправьте сообщение
   - Проверьте изменение статуса (sending → sent → delivered → read)

3. **Индикатор печати**
   - Начните печатать в другом клиенте
   - Убедитесь, что индикатор появляется
   - Проверьте, что он исчезает через 3 секунды

4. **Переключение диалогов**
   - Откройте один диалог
   - Переключитесь на другой
   - Убедитесь, что подписка обновляется корректно

5. **Обработка ошибок**
   - Отключите интернет
   - Проверьте отображение ошибки
   - Включите интернет
   - Убедитесь в восстановлении подключения

6. **Дубликаты сообщений**
   - Отправьте сообщение
   - Убедитесь, что оно не дублируется

## Шаг 10: Очистка старого кода

После успешной миграции удалите:

1. Старую логику WebSocket из ChatWidget.vue
2. Неиспользуемые переменные (currentChannel, addMessage флаг)
3. Ручные обработчики подписки/отписки

## Требования на стороне сервера (Laravel)

### События должны транслироваться в правильном формате:

```php
// app/Events/MessageCreated.php
class MessageCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageCreated';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message->load('attachments'),
            'conversation_id' => $this->message->conversation_id,
        ];
    }
}
```

### Аналогично для других событий:

- `MessageStatusUpdated`
- `MessageDeleted`
- `UserTyping`
- `ConversationUpdated`
- `ConversationAssigned`

## Troubleshooting

### Проблема: Сообщения не приходят

**Решение:**

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что Echo подключен: `console.log(window.Echo)`
3. Проверьте имя канала: должно быть `conversation.{id}`
4. Убедитесь, что сервер отправляет события

### Проблема: Дубликаты сообщений

**Решение:**

1. Проверьте, что используете `setMessages` вместо прямого push
2. Убедитесь, что не смешиваете старую и новую логику
3. Проверьте логику проверки дубликатов в `useWebSocketMessages`

### Проблема: Индикатор печати не исчезает

**Решение:**

1. Проверьте, что сервер отправляет событие `is_typing: false`
2. Убедитесь, что таймер в `useWebSocketTyping` работает (3 секунды)
3. Проверьте, что `clearAllTyping` вызывается при отписке

### Проблема: Статусы не обновляются

**Решение:**

1. Убедитесь, что сервер отправляет `MessageStatusUpdated`
2. Проверьте, что `message_id` совпадает с ID в списке
3. Проверьте формат события в консоли

## Дополнительные возможности

### Звуковые уведомления

```typescript
const playNotificationSound = () => {
  const audio = new Audio("/sounds/notification.mp3");
  audio.play().catch((e) => console.error("Не удалось воспроизвести звук:", e));
};

const { messages } = useConversationWebSocket({
  conversationId,
  onMessageReceived: (message) => {
    if (message.direction === "incoming") {
      playNotificationSound();
    }
  },
});
```

### Desktop уведомления

```typescript
const showDesktopNotification = (message: Message) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Новое сообщение", {
      body: message.content,
      icon: "/icons/chat.png",
    });
  }
};
```

### Автоматическая прокрутка только для новых сообщений

```typescript
const shouldAutoScroll = ref(true);

const handleScroll = (e: Event) => {
  const element = e.target as HTMLElement;
  const isAtBottom =
    element.scrollHeight - element.scrollTop === element.clientHeight;
  shouldAutoScroll.value = isAtBottom;
};

const { messages } = useConversationWebSocket({
  conversationId,
  onMessageReceived: () => {
    if (shouldAutoScroll.value) {
      scrollToBottom();
    }
  },
});
```

## Заключение

Новая структура WebSocket предоставляет:

- Чистый и поддерживаемый код
- Легкую интеграцию в новые компоненты
- Автоматическое управление подписками
- Полную типизацию
- Расширяемость для новых функций

Следуйте этому руководству для плавной миграции существующих компонентов.
