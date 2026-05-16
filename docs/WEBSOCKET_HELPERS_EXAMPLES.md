# Примеры использования Chat Helpers

## Полный пример интеграции всех composables

```vue
<template>
  <Card class="w-full h-full flex flex-col">
    <!-- Header с индикаторами -->
    <CardHeader class="border-b p-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Avatar class="h-8 w-8">
            <AvatarImage :src="conversation.client?.avatar" />
            <AvatarFallback>{{ conversation.client?.name }}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle class="text-sm">{{
              conversation.client?.name
            }}</CardTitle>
            <CardDescription class="flex items-center gap-1 text-xs">
              <!-- Статус подключения -->
              <Badge
                v-if="!isOnline"
                variant="destructive"
                class="h-4 px-1 text-[0.6rem]"
              >
                Нет сети
              </Badge>
              <Badge
                v-else-if="!isConnected"
                variant="secondary"
                class="h-4 px-1 text-[0.6rem]"
              >
                Подключение...
              </Badge>
              <Badge v-else variant="success" class="h-4 px-1 text-[0.6rem]">
                Онлайн
              </Badge>
            </CardDescription>
          </div>
        </div>

        <!-- Настройки уведомлений -->
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click="soundEnabled = !soundEnabled"
          >
            <Volume2 v-if="soundEnabled" class="h-4 w-4" />
            <VolumeX v-else class="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click="checkDesktopPermission"
          >
            <Bell v-if="desktopNotificationsEnabled" class="h-4 w-4" />
            <BellOff v-else class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>

    <!-- Список сообщений с группировкой по датам -->
    <CardContent class="flex-1 overflow-y-auto p-2" @scroll="handleScroll">
      <div class="space-y-4">
        <template v-for="(dateMessages, date) in groupedMessages" :key="date">
          <!-- Разделитель даты -->
          <div class="flex items-center justify-center my-4">
            <div
              class="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground"
            >
              {{ date }}
            </div>
          </div>

          <!-- Сообщения за эту дату -->
          <div class="space-y-1">
            <div
              v-for="message in dateMessages"
              :key="message.id"
              :class="[
                'flex',
                message.direction === 'incoming'
                  ? 'justify-start'
                  : 'justify-end',
              ]"
            >
              <div
                :class="[
                  'max-w-[80%] rounded-lg text-xs',
                  message.direction === 'incoming'
                    ? 'bg-muted'
                    : 'bg-primary text-primary-foreground',
                ]"
              >
                <!-- Вложения -->
                <div v-if="message.attachments?.length" class="p-2 space-y-1">
                  <AttachmentItem
                    v-for="attachment in message.attachments"
                    :key="attachment.id"
                    :attachment="attachment"
                  />
                </div>

                <!-- Текст с ссылками -->
                <p
                  v-if="message.content"
                  v-html="linkify(message.content)"
                  class="px-2 py-1 whitespace-pre-wrap break-words"
                ></p>

                <!-- Время и статус -->
                <div class="flex items-center justify-end gap-1 px-2 pb-1">
                  <span class="text-[0.6rem] opacity-70">
                    {{ formatTime(message.created_at) }}
                  </span>
                  <component
                    v-if="message.direction === 'outgoing'"
                    :is="getStatusIcon(message.status)"
                    class="w-3 h-3 opacity-70"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Индикатор печати -->
        <div v-if="isAnyoneTyping()" class="flex justify-start">
          <div class="bg-muted rounded-lg px-3 py-2">
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                <span
                  v-for="i in 3"
                  :key="i"
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  :style="{ animationDelay: `${(i - 1) * 150}ms` }"
                ></span>
              </div>
              <span class="text-xs text-muted-foreground">
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

        <div ref="messagesEndRef"></div>
      </div>

      <!-- Кнопка "Прокрутить вниз" -->
      <Transition name="fade">
        <Button
          v-if="!shouldAutoScroll"
          class="fixed bottom-20 right-4 rounded-full shadow-lg"
          size="icon"
          @click="scrollToBottom('smooth')"
        >
          <ChevronDown class="h-4 w-4" />
        </Button>
      </Transition>
    </CardContent>

    <!-- Форма отправки -->
    <div class="border-t">
      <FilePreview
        :files="pendingFiles"
        @remove="handleRemoveFile"
        @clear-all="handleClearAllFiles"
      />

      <div class="p-2">
        <div class="flex gap-1">
          <Input
            v-model="newMessage"
            placeholder="Сообщение..."
            class="flex-1"
            :disabled="isSending || !isOnline"
            @keyup.enter="sendMessage"
            @input="handleInput"
          />

          <FileUploadButton
            :disabled="isSending"
            @files-selected="handleFilesSelected"
          />

          <Button
            size="sm"
            @click="sendMessage"
            :disabled="
              isSending ||
              !isOnline ||
              (!newMessage.trim() && !pendingFiles.length)
            "
          >
            <Loader2 v-if="isSending" class="w-4 h-4 animate-spin" />
            <Send v-else class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useConversationWebSocket } from "@/composables/WebSocket/useConversationWebSocket";
import { useChatNotifications } from "@/composables/WebSocket/useChatHelpers";
import { useChatScroll } from "@/composables/WebSocket/useChatHelpers";
import { useTypingIndicator } from "@/composables/WebSocket/useChatHelpers";
import { useMessageTime } from "@/composables/WebSocket/useChatHelpers";
import { useMessageLinks } from "@/composables/WebSocket/useChatHelpers";
import { useOnlineStatus } from "@/composables/WebSocket/useChatHelpers";
import { useMessageGrouping } from "@/composables/WebSocket/useChatHelpers";
import { useChatsFunctions } from "@/composables/useChatsFunctions";
import type { Conversation, Message, PendingFile } from "@/types/conversation";

const props = defineProps<{
  conversation: Conversation;
}>();

const emit = defineEmits(["hasNewMessage"]);

// === API Functions ===
const { conversationReplyById } = useChatsFunctions();

// === Refs ===
const newMessage = ref("");
const messagesEndRef = ref<HTMLElement | null>(null);
const isSending = ref(false);
const pendingFiles = ref<PendingFile[]>([]);

// === Computed ===
const conversationId = computed(() => props.conversation?.id ?? null);

// === WebSocket ===
const {
  isConnected,
  connectionError,
  messages,
  setMessages,
  typingUsers,
  isAnyoneTyping,
  getTypingCount,
  markAllAsRead,
} = useConversationWebSocket({
  conversationId,

  onMessageReceived: (message) => {
    console.log("Новое сообщение:", message);

    // Уведомление
    if (message.direction === "incoming") {
      notifyNewMessage(
        props.conversation.client?.name || "Клиент",
        message.content,
        props.conversation.client?.avatar,
      );
    }

    // Прокрутка
    scrollToBottomIfNeeded();

    // Эмит события
    emit("hasNewMessage", props.conversation.id);

    // Пометка как прочитанное
    if (document.hasFocus()) {
      setTimeout(() => markAllAsRead(), 500);
    }
  },

  onStatusUpdated: (messageId, status) => {
    console.log(`Статус ${messageId}: ${status}`);
  },

  onTypingChanged: (userId, isTyping) => {
    console.log(
      `Пользователь ${userId} ${isTyping ? "печатает" : "перестал печатать"}`,
    );
  },
});

// === Notifications ===
const {
  notificationsEnabled,
  soundEnabled,
  desktopNotificationsEnabled,
  checkDesktopPermission,
  playNotificationSound,
  notifyNewMessage,
} = useChatNotifications();

// === Scroll Management ===
const {
  shouldAutoScroll,
  isUserScrolling,
  handleScroll,
  scrollToBottom,
  scrollToBottomIfNeeded,
} = useChatScroll(messagesEndRef);

// === Typing Indicator ===
const {
  isTyping,
  handleInput: handleTypingInput,
  stopTyping,
  cleanup: cleanupTyping,
} = useTypingIndicator(conversationId);

// === Time Formatting ===
const { formatTime, formatRelativeTime } = useMessageTime();

// === Link Processing ===
const { linkify, extractUrls } = useMessageLinks();

// === Online Status ===
const { isOnline, wasOffline, cleanup: cleanupOnline } = useOnlineStatus();

// === Message Grouping ===
const { groupMessagesByDate } = useMessageGrouping();

const groupedMessages = computed(() => {
  return groupMessagesByDate(messages.value);
});

// === Handlers ===
const handleInput = () => {
  handleTypingInput();
};

const handleFilesSelected = (files: PendingFile[]) => {
  pendingFiles.value.push(...files);
};

const handleRemoveFile = (fileId: string) => {
  pendingFiles.value = pendingFiles.value.filter((f) => f.id !== fileId);
};

const handleClearAllFiles = () => {
  pendingFiles.value = [];
};

const sendMessage = async () => {
  const text = newMessage.value.trim();
  const files = [...pendingFiles.value];

  if (!text && !files.length) return;
  if (!conversationId.value) return;

  isSending.value = true;
  stopTyping();

  // Временное сообщение
  const tempId = `temp-${Date.now()}`;
  const tempMessage: Message = {
    id: tempId,
    content: text,
    direction: "outgoing",
    status: "sending",
    created_at: new Date().toISOString(),
    attachments: [],
    conversation_id: conversationId.value,
  } as Message;

  setMessages([...messages.value, tempMessage]);
  newMessage.value = "";
  pendingFiles.value = [];
  scrollToBottom();

  try {
    const response = await conversationReplyById(
      conversationId.value,
      text || "",
      files,
    );

    if (response) {
      const updatedMessages = messages.value.map((m) =>
        m.id === tempId ? response : m,
      );
      setMessages(updatedMessages);
      playNotificationSound("sent");
    }
  } catch (error) {
    console.error("Ошибка отправки:", error);
    const updatedMessages = messages.value.map((m) =>
      m.id === tempId ? { ...m, status: "failed" as const } : m,
    );
    setMessages(updatedMessages);
    playNotificationSound("error");
  } finally {
    isSending.value = false;
  }
};

const getStatusIcon = (status: string) => {
  const icons = {
    sending: Clock,
    sent: Check,
    delivered: MessageSquare,
    read: Eye,
    failed: AlertCircle,
  };
  return icons[status as keyof typeof icons];
};

// === Lifecycle ===
onMounted(() => {
  if (props.conversation.messages) {
    setMessages(props.conversation.messages);
  }
  scrollToBottom("auto");
  checkDesktopPermission();
});

onBeforeUnmount(() => {
  cleanupTyping();
  cleanupOnline();
});

// === Watchers ===
watch(
  () => props.conversation.messages,
  (newMessages) => {
    if (newMessages?.length) {
      setMessages(newMessages);
    }
  },
  { deep: true },
);

watch(isOnline, (online, wasOnline) => {
  if (online && wasOnline === false) {
    console.log("Соединение восстановлено");
    // Можно показать toast
  }
});

watch(connectionError, (error) => {
  if (error) {
    console.error("Ошибка WebSocket:", error);
    // Можно показать toast
  }
});

// Автоматическая пометка прочитанных при фокусе
watch(
  () => document.hasFocus(),
  (hasFocus) => {
    if (hasFocus && messages.value.length > 0) {
      markAllAsRead();
    }
  },
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
```

## Использование отдельных хелперов

### 1. Уведомления

```typescript
import { useChatNotifications } from "@/composables/WebSocket/useChatHelpers";

const {
  soundEnabled,
  desktopNotificationsEnabled,
  checkDesktopPermission,
  playNotificationSound,
  notifyNewMessage,
} = useChatNotifications();

// Запросить разрешение на уведомления
await checkDesktopPermission();

// Воспроизвести звук
playNotificationSound("message"); // 'message' | 'sent' | 'error'

// Показать уведомление о новом сообщении
notifyNewMessage("Иван Иванов", "Привет! Как дела?", "/avatar.jpg");
```

### 2. Автопрокрутка

```typescript
import { useChatScroll } from '@/composables/WebSocket/useChatHelpers'

const messagesEndRef = ref<HTMLElement | null>(null)

const {
  shouldAutoScroll,
  handleScroll,
  scrollToBottom,
  scrollToBottomIfNeeded
} = useChatScroll(messagesEndRef)

// В шаблоне
<div @scroll="handleScroll">
  <!-- сообщения -->
  <div ref="messagesEndRef"></div>
</div>

// Прокрутка вниз
scrollToBottom('smooth')

// Прокрутка только если пользователь внизу
scrollToBottomIfNeeded()
```

### 3. Индикатор печати

```typescript
import { useTypingIndicator } from '@/composables/WebSocket/useChatHelpers'

const conversationId = computed(() => props.conversation.id)

const {
  isTyping,
  handleInput,
  stopTyping
} = useTypingIndicator(conversationId)

// В input
<Input @input="handleInput" />

// При отправке сообщения
const sendMessage = () => {
  stopTyping()
  // отправка...
}
```

### 4. Форматирование времени

```typescript
import { useMessageTime } from "@/composables/WebSocket/useChatHelpers";

const { formatTime, formatRelativeTime } = useMessageTime();

formatTime("2026-04-09T10:30:00"); // "10:30"
formatRelativeTime("2026-04-09T10:30:00"); // "2 ч назад"
```

### 5. Обработка ссылок

```typescript
import { useMessageLinks } from "@/composables/WebSocket/useChatHelpers";

const { linkify, extractUrls } = useMessageLinks();

const text = "Посмотри https://example.com и напиши на test@mail.com";
const html = linkify(text);
// "Посмотри <a href="https://example.com">...</a> и напиши на <a href="mailto:test@mail.com">...</a>"

const urls = extractUrls(text);
// ['https://example.com']
```

### 6. Статус онлайн

```typescript
import { useOnlineStatus } from '@/composables/WebSocket/useChatHelpers'

const { isOnline, wasOffline } = useOnlineStatus()

// В шаблоне
<Badge v-if="!isOnline" variant="destructive">Нет сети</Badge>

// Реакция на восстановление
watch(isOnline, (online, wasOnline) => {
  if (online && wasOnline === false) {
    toast({ title: 'Соединение восстановлено' })
  }
})
```

### 7. Группировка сообщений

```typescript
import { useMessageGrouping } from '@/composables/WebSocket/useChatHelpers'

const { groupMessagesByDate, shouldShowDateSeparator } = useMessageGrouping()

const grouped = groupMessagesByDate(messages.value)
// {
//   "9 апреля 2026 г.": [...],
//   "8 апреля 2026 г.": [...]
// }

// Или проверка для каждого сообщения
<div v-if="shouldShowDateSeparator(message, previousMessage)">
  {{ formatDate(message.created_at) }}
</div>
```

## Комбинирование хелперов

```typescript
// Полная интеграция в один composable
export function useAdvancedChat(conversationId: Ref<number | null>) {
  const messagesEndRef = ref<HTMLElement | null>(null);

  const websocket = useConversationWebSocket({ conversationId });
  const notifications = useChatNotifications();
  const scroll = useChatScroll(messagesEndRef);
  const typing = useTypingIndicator(conversationId);
  const time = useMessageTime();
  const links = useMessageLinks();
  const online = useOnlineStatus();
  const grouping = useMessageGrouping();

  return {
    // WebSocket
    ...websocket,

    // Notifications
    ...notifications,

    // Scroll
    ...scroll,
    messagesEndRef,

    // Typing
    ...typing,

    // Formatting
    ...time,
    ...links,

    // Status
    ...online,

    // Grouping
    ...grouping,
  };
}
```

## Настройка звуков

Создайте папку `public/sounds/` и добавьте файлы:

- `notification.mp3` - новое сообщение
- `sent.mp3` - сообщение отправлено
- `error.mp3` - ошибка отправки

Или измените пути в `useChatNotifications`:

```typescript
const soundMap = {
  message: "/assets/sounds/new-message.mp3",
  sent: "/assets/sounds/message-sent.mp3",
  error: "/assets/sounds/error.mp3",
};
```
