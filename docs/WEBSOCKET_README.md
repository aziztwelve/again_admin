# WebSocket структура для диалогов - Полная документация

## 📁 Структура файлов

```
src/
├── composables/
│   └── WebSocket/
│       ├── useConversationWebSocket.ts    # Главный composable
│       ├── useWebSocketMessages.ts        # Обработка сообщений
│       ├── useWebSocketStatus.ts          # Обработка статусов
│       ├── useWebSocketTyping.ts          # Индикаторы печати
│       └── useChatHelpers.ts              # Вспомогательные утилиты
│
├── config/
│   └── echoConfig.ts                      # Конфигурация каналов и событий
│
├── types/
│   └── conversation/
│       └── chat.ts                        # TypeScript типы для WebSocket
│
└── components/
    └── dialogs/
        └── chats/
            ├── ChatWidget.vue             # Основной компонент чата
            └── ChatWidget.example.vue     # Пример интеграции

Документация:
├── WEBSOCKET_STRUCTURE.md                 # Описание архитектуры
├── WEBSOCKET_MIGRATION.md                 # Руководство по миграции
└── WEBSOCKET_HELPERS_EXAMPLES.md          # Примеры использования
```

## 🚀 Быстрый старт

### 1. Базовое использование

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useConversationWebSocket } from "@/composables/WebSocket/useConversationWebSocket";

const props = defineProps<{ conversation: Conversation }>();
const conversationId = computed(() => props.conversation?.id ?? null);

const { isConnected, messages, setMessages, isAnyoneTyping } =
  useConversationWebSocket({
    conversationId,
    onMessageReceived: (message) => {
      console.log("Новое сообщение:", message);
    },
  });
</script>
```

### 2. С уведомлениями и звуком

```vue
<script setup lang="ts">
import { useConversationWebSocket } from "@/composables/WebSocket/useConversationWebSocket";
import { useChatNotifications } from "@/composables/WebSocket/useChatHelpers";

const conversationId = computed(() => props.conversation?.id ?? null);

const { notifyNewMessage, playNotificationSound } = useChatNotifications();

const websocket = useConversationWebSocket({
  conversationId,
  onMessageReceived: (message) => {
    if (message.direction === "incoming") {
      playNotificationSound("message");
      notifyNewMessage("Клиент", message.content);
    }
  },
});
</script>
```

### 3. Полная интеграция

См. файл `ChatWidget.example.vue` для полного примера со всеми функциями.

## 📚 Основные composables

### useConversationWebSocket

Главный composable для управления WebSocket соединением.

**Параметры:**

```typescript
{
  conversationId: Ref<number | null>
  onMessageReceived?: (message: Message) => void
  onMessageDeleted?: (messageId: string | number) => void
  onConversationUpdated?: (event: ConversationUpdatedEvent) => void
  onConversationAssigned?: (event: ConversationAssignedEvent) => void
  onStatusUpdated?: (messageId: string | number, status: Message['status']) => void
  onTypingChanged?: (userId: number, isTyping: boolean) => void
}
```

**Возвращает:**

```typescript
{
  // Состояние подключения
  isConnected: Ref<boolean>
  connectionError: Ref<string | null>

  // Сообщения
  messages: Ref<Message[]>
  isReceiving: Ref<boolean>
  setMessages: (messages: Message[]) => void
  clearMessages: () => void

  // Статусы
  isUpdating: Ref<boolean>
  updateMessageStatus: (messageId, status) => void
  markAllAsRead: () => void

  // Индикаторы печати
  typingUsers: Ref<Set<number>>
  isAnyoneTyping: () => boolean
  getTypingCount: () => number

  // Управление
  subscribeToConversation: (id: number) => void
  unsubscribeFromConversation: () => void
}
```

### useChatHelpers

Набор вспомогательных утилит:

- **useChatNotifications** - звуковые и desktop уведомления
- **useChatScroll** - управление автопрокруткой
- **useTypingIndicator** - отправка событий печати
- **useMessageTime** - форматирование времени
- **useMessageLinks** - обработка ссылок в тексте
- **useOnlineStatus** - отслеживание онлайн статуса
- **useMessageGrouping** - группировка по датам

## 🎯 События WebSocket

| Событие                | Канал                 | Описание                    |
| ---------------------- | --------------------- | --------------------------- |
| `MessageCreated`       | `conversation.{id}`   | Новое сообщение в диалоге   |
| `MessageStatusUpdated` | `conversation.{id}`   | Изменение статуса сообщения |
| `MessageDeleted`       | `conversation.{id}`   | Удаление сообщения          |
| `UserTyping`           | `conversation.{id}`   | Пользователь печатает       |
| `ConversationUpdated`  | `conversation.{id}`   | Обновление диалога          |
| `ConversationAssigned` | `conversation.{id}`   | Назначение диалога          |
| `ConversationUpdated`  | `admin.notifications` | Глобальные уведомления      |

## 🔧 Конфигурация

### Каналы (echoConfig.ts)

```typescript
export const ECHO_CHANNELS = {
  ADMIN_NOTIFICATIONS: "admin.notifications",
  PRESENCE_USERS: "presence.users",
  CONVERSATION: (conversationId: number) => `conversation.${conversationId}`,
};
```

### События

```typescript
export const ECHO_EVENTS = {
  CONVERSATION_UPDATED: ".ConversationUpdated",
  MESSAGE_CREATED: ".MessageCreated",
  MESSAGE_STATUS_UPDATED: ".MessageStatusUpdated",
  MESSAGE_DELETED: ".MessageDeleted",
  USER_TYPING: ".UserTyping",
  CONVERSATION_ASSIGNED: ".ConversationAssigned",
};
```

## 📝 TypeScript типы

Все типы определены в `src/types/conversation/chat.ts`:

```typescript
// Основные модели
interface Message { ... }
interface Conversation { ... }
interface User { ... }

// WebSocket события
interface MessageCreatedEvent { ... }
interface MessageStatusUpdatedEvent { ... }
interface MessageDeletedEvent { ... }
interface UserTypingEvent { ... }
interface ConversationUpdatedEvent { ... }
interface ConversationAssignedEvent { ... }
```

## 🎨 UI компоненты

### Индикатор печати

```vue
<div v-if="isAnyoneTyping()" class="flex justify-start">
  <div class="bg-muted rounded-lg px-3 py-2">
    <div class="flex items-center gap-2">
      <div class="flex gap-1">
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 150ms"></span>
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 300ms"></span>
      </div>
      <span class="text-xs">Печатает...</span>
    </div>
  </div>
</div>
```

### Статус подключения

```vue
<Badge v-if="!isConnected" variant="destructive">
  Отключено
</Badge>
<Badge v-else-if="isReceiving" variant="secondary">
  Получение...
</Badge>
<Badge v-else variant="success">
  Онлайн
</Badge>
```

### Статусы сообщений

```vue
<component
  v-if="message.direction === 'outgoing'"
  :is="getStatusIcon(message.status)"
  class="w-4 h-4"
/>

<script>
const getStatusIcon = (status: string) => {
  const icons = {
    sending: Clock,
    sent: Check,
    delivered: MessageSquare,
    read: Eye,
    failed: AlertCircle,
  }
  return icons[status]
}
</script>
```

## 🔄 Жизненный цикл

```
1. Компонент монтируется
   ↓
2. useConversationWebSocket инициализируется
   ↓
3. watch отслеживает conversationId
   ↓
4. При изменении ID → subscribeToConversation()
   ↓
5. Echo.private(`conversation.${id}`)
   ↓
6. Подписка на все события (.listen)
   ↓
7. События обрабатываются соответствующими handlers
   ↓
8. При размонтировании → unsubscribeFromConversation()
   ↓
9. Echo.leave() + очистка таймеров
```

## 🐛 Отладка

### Проверка подключения

```javascript
// В консоли браузера
console.log(window.Echo);
console.log(window.Echo.connector.pusher.connection.state);
```

### Логирование событий

Все события логируются в консоль:

```
Подписка на канал: conversation.123
Получено новое сообщение: {...}
Обновлен статус сообщения: {...}
Пользователь печатает: {...}
```

### Проверка каналов

```javascript
// Список активных каналов
Object.keys(window.Echo.connector.channels);
```

## ⚡ Производительность

### Оптимизации

1. **Автоматическая отписка** - при размонтировании компонента
2. **Проверка дубликатов** - по ID и содержимому
3. **Таймеры для typing** - автоматическая очистка через 3 сек
4. **Debounce для typing** - не более 1 запроса в 300мс
5. **Условная прокрутка** - только если пользователь внизу

### Рекомендации

- Используйте `computed` для `conversationId`
- Не создавайте несколько экземпляров для одного диалога
- Очищайте сообщения при смене диалога
- Используйте `markAllAsRead()` при фокусе окна

## 🔐 Безопасность

### Приватные каналы

Все каналы диалогов используют `private`:

```typescript
Echo.private(`conversation.${id}`);
```

### Авторизация

Настроена в `echo.js`:

```javascript
auth: {
  headers: {
    'Authorization': `Bearer ${access_token}`,
  },
}
```

### Валидация на сервере

Laravel должен проверять права доступа:

```php
Broadcast::channel('conversation.{id}', function ($user, $id) {
    return $user->canAccessConversation($id);
});
```

## 📦 Зависимости

```json
{
  "laravel-echo": "^1.15.0",
  "pusher-js": "^8.0.0",
  "vue": "^3.3.0"
}
```

## 🚨 Требования на сервере

### Laravel Broadcasting

```php
// config/broadcasting.php
'reverb' => [
    'driver' => 'reverb',
    'key' => env('REVERB_APP_KEY'),
    'secret' => env('REVERB_APP_SECRET'),
    'app_id' => env('REVERB_APP_ID'),
    'options' => [
        'host' => env('REVERB_HOST'),
        'port' => env('REVERB_PORT', 443),
        'scheme' => env('REVERB_SCHEME', 'https'),
    ],
],
```

### События

Все события должны реализовывать `ShouldBroadcast`:

```php
class MessageCreated implements ShouldBroadcast
{
    public function broadcastOn(): array
    {
        return [new PrivateChannel('conversation.' . $this->message->conversation_id)];
    }

    public function broadcastAs(): string
    {
        return 'MessageCreated';
    }
}
```

## 📖 Дополнительная документация

- [WEBSOCKET_STRUCTURE.md](WEBSOCKET_STRUCTURE.md) - Архитектура системы
- [WEBSOCKET_MIGRATION.md](WEBSOCKET_MIGRATION.md) - Миграция со старого кода
- [WEBSOCKET_HELPERS_EXAMPLES.md](WEBSOCKET_HELPERS_EXAMPLES.md) - Примеры использования

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что Echo инициализирован
3. Проверьте права доступа к каналу
4. Убедитесь, что сервер отправляет события
5. Проверьте формат событий

## 📄 Лицензия

Этот код является частью проекта Again Dashboard.

---

**Версия:** 1.0.0  
**Дата:** 2026-04-09  
**Автор:** OpenCode AI Assistant
