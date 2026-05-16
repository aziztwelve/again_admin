<!-- 
  Пример интеграции useConversationWebSocket в ChatWidget.vue
  Этот файл показывает, как заменить существующую логику WebSocket на новую структуру
-->

<template>
  <Card
    class="w-full h-full shadow-none border-0 md:border-l md:border-r rounded-none flex flex-col"
  >
    <!-- Header -->
    <CardHeader class="border-b p-2">
      <div class="flex items-center justify-between space-x-2">
        <div class="flex items-center space-x-2">
          <Avatar class="h-8 w-8">
            <AvatarImage
              :src="conversation.client?.profile?.image || clientIcon"
            />
            <AvatarFallback>{{
              conversation.client?.profile?.full_name
            }}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle class="text-sm font-medium">
              {{ conversation.client?.profile?.full_name || "Клиент" }}
            </CardTitle>
            <CardDescription class="flex items-center gap-1 text-xs">
              <span>{{ conversation.client?.profile?.phone }}</span>
              <Badge
                variant="outline"
                class="h-4 px-1 text-[0.6rem] capitalize"
              >
                {{ sourceName }}
              </Badge>
              <!-- Индикатор подключения WebSocket -->
              <Badge
                v-if="!isConnected"
                variant="destructive"
                class="h-4 px-1 text-[0.6rem]"
              >
                Отключено
              </Badge>
            </CardDescription>
          </div>
        </div>
        <div class="text-right text-xs">
          <div class="font-medium">ID {{ conversation.id }}</div>
          <div class="text-muted-foreground">
            {{ formatTime(conversation.last_message_at) }}
          </div>
        </div>
      </div>
    </CardHeader>

    <!-- Messages -->
    <CardContent class="flex-1 p-2 overflow-y-auto flex flex-col">
      <div
        v-if="conversation.client?.profile?.address"
        class="mb-2 text-xs border-b pb-2"
      >
        <p class="text-muted-foreground">Адрес:</p>
        <p class="truncate">{{ conversation.client?.profile?.address }}</p>
      </div>

      <Loader v-if="isLoadingGetMessage" />
      <div
        class="flex-1 overflow-y-auto space-y-1 max-md:max-h-[66vh] max-md:min-h-[66vh]"
        v-else
      >
        <!-- Используем messages из WebSocket composable -->
        <div
          v-for="message in displayMessages"
          :key="message.id"
          :class="[
            'flex',
            message.direction === 'incoming' ? 'justify-start' : 'justify-end',
          ]"
        >
          <div
            :class="[
              'max-w-[80%] rounded-lg text-xs relative overflow-x-hidden break-words [overflow-wrap:anywhere]',
              message.direction === 'incoming'
                ? 'bg-muted'
                : 'bg-primary text-primary-foreground',
            ]"
          >
            <!-- Вложения -->
            <div
              v-if="message.attachments && message.attachments.length > 0"
              class="space-y-1"
              :class="message.content ? 'mb-1' : ''"
            >
              <div
                v-for="attachment in message.attachments"
                :key="attachment.id"
                class="p-1"
              >
                <AttachmentItem :attachment="attachment" />
              </div>
            </div>

            <!-- Текст сообщения -->
            <p
              v-if="message.content"
              v-html="linkify(message.content)"
              class="px-2 py-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
            ></p>

            <div
              class="flex items-center justify-end space-x-1 mt-0.5 px-2 pb-1"
            >
              <!-- Time -->
              <span class="text-[0.6rem] opacity-70">{{
                formatTime(message.created_at)
              }}</span>
              <!-- Status Icon for outgoing -->
              <component
                v-if="message.direction === 'outgoing'"
                :is="getStatusIcon(message.status)"
                class="w-4 h-4 opacity-70"
              />
            </div>
          </div>
        </div>

        <!-- Индикатор печати -->
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
              <span class="text-muted-foreground">Печатает...</span>
            </div>
          </div>
        </div>

        <div ref="messagesEndRef" />
      </div>
    </CardContent>

    <div class="border-t">
      <FilePreview
        :files="pendingFiles"
        @remove="handleRemoveFile"
        @clear-all="handleClearAllFiles"
      />

      <div class="p-2">
        <div class="flex space-x-1">
          <Input
            v-model="newMessage"
            placeholder="Сообщение..."
            class="h-8 text-xs flex-1"
            :disabled="isSending"
            @keyup.enter="sendMessage"
            @input="handleTyping"
          />

          <FileUploadButton
            :disabled="isSending"
            @files-selected="handleFilesSelected"
            @error="handleFileError"
          />

          <Button
            size="sm"
            class="h-8 w-8 px-2 text-xs"
            @click="sendMessage"
            :disabled="
              isSending || (!newMessage.trim() && pendingFiles.length === 0)
            "
          >
            <Loader2 v-if="isSending" class="w-4 h-4 animate-spin" />
            <Send v-else class="w-4 h-4" />
          </Button>
        </div>
        <p class="mt-1 text-[0.6rem] text-muted-foreground">
          Через {{ sourceName }}
        </p>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch, computed } from "vue";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Check,
  MessageSquare,
  Eye,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-vue-next";
import { useChatsFunctions } from "@/composables/useChatsFunctions";
import { useConversationWebSocket } from "@/composables/WebSocket/useConversationWebSocket";
import { assetPath } from "@/utils/assetPath";
import Loader from "@/components/common/Loader.vue";
import FileUploadButton from "./File/FileUploadButton.vue";
import FilePreview from "./File/FilePreview.vue";
import AttachmentItem from "./File/AttachmentItem.vue";
import type { Conversation, PendingFile, Message } from "@/types/conversation";

const props = defineProps<{
  conversation: Conversation;
  isLoadingGetMessage: boolean;
}>();

const emits = defineEmits(["hasNewMessage"]);

const { conversationReplyById } = useChatsFunctions();
const clientIcon = assetPath("icons/client.png");

const newMessage = ref("");
const messagesEndRef = ref<HTMLDivElement | null>(null);
const isSending = ref(false);
const pendingFiles = ref<PendingFile[]>([]);

// Computed для conversationId
const conversationId = computed(() => props.conversation?.id ?? null);

// Инициализация WebSocket
const {
  isConnected,
  connectionError,
  messages: wsMessages,
  isReceiving,
  setMessages,
  typingUsers,
  isAnyoneTyping,
  getTypingCount,
  markAllAsRead,
} = useConversationWebSocket({
  conversationId,

  // Callback при получении нового сообщения
  onMessageReceived: (message) => {
    console.log("Новое сообщение через WebSocket:", message);
    scrollToBottom();
    emits("hasNewMessage", props.conversation.id);

    // Автоматически помечаем как прочитанное если окно активно
    if (document.hasFocus()) {
      setTimeout(() => markAllAsRead(), 500);
    }
  },

  // Callback при удалении сообщения
  onMessageDeleted: (messageId) => {
    console.log("Сообщение удалено:", messageId);
  },

  // Callback при обновлении статуса
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

// Объединяем сообщения из props и WebSocket
const displayMessages = computed(() => {
  // Если есть сообщения в WebSocket, используем их
  if (wsMessages.value.length > 0) {
    return wsMessages.value;
  }
  // Иначе используем сообщения из props
  return props.conversation.messages || [];
});

const sourceName = computed(() => {
  switch (props.conversation.source) {
    case "telegram":
      return "Telegram";
    case "whatsapp":
      return "WhatsApp";
    case "web_chat":
      return "Веб-чат";
    case "vk":
      return "ВКонтакте";
    case "email":
      return "Почта";
    default:
      return props.conversation.source || "";
  }
});

function scrollToBottom(behavior: ScrollBehavior = "smooth") {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior });
  });
}

function formatTime(datetime: any): string {
  if (!datetime) return "";
  const date = new Date(datetime);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getStatusIcon(status: string | undefined) {
  switch (status) {
    case "sending":
      return Clock;
    case "sent":
      return Check;
    case "delivered":
      return MessageSquare;
    case "read":
      return Eye;
    case "failed":
      return AlertCircle;
    default:
      return null;
  }
}

const handleFilesSelected = (files: PendingFile[]) => {
  pendingFiles.value.push(...files);
};

const handleRemoveFile = (fileId: string) => {
  pendingFiles.value = pendingFiles.value.filter((f) => f.id !== fileId);
};

const handleClearAllFiles = () => {
  pendingFiles.value = [];
};

const handleFileError = (error: string) => {
  console.error("File error:", error);
};

// Обработка печати (можно отправить событие на сервер)
let typingTimeout: NodeJS.Timeout;
const handleTyping = () => {
  clearTimeout(typingTimeout);
  // Здесь можно отправить событие на сервер о том, что пользователь печатает
  // axios.post(`conversations/${conversationId.value}/typing`, { is_typing: true })

  typingTimeout = setTimeout(() => {
    // Событие о прекращении печати
    // axios.post(`conversations/${conversationId.value}/typing`, { is_typing: false })
  }, 1000);
};

async function sendMessage() {
  const text = newMessage.value.trim();
  const files = [...pendingFiles.value];

  if (!text && files.length === 0) return;
  if (props.conversation.id === undefined) return;

  isSending.value = true;

  // Создаём временное сообщение для оптимистичного UI
  const tempId = `temp-${Date.now()}-${Math.random()}`;
  const tempMessage: Message = {
    id: tempId,
    content: text,
    direction: "outgoing",
    status: "sending",
    created_at: new Date().toISOString(),
    attachments: [],
    conversation_id: props.conversation.id,
  } as Message;

  // Добавляем временное сообщение в список
  const currentMessages = [...displayMessages.value, tempMessage];
  setMessages(currentMessages);

  newMessage.value = "";
  pendingFiles.value = [];
  scrollToBottom();

  try {
    const response = await conversationReplyById(
      Number(props.conversation.id),
      text || "",
      files,
    );

    if (response) {
      // Заменяем временное сообщение на реальное
      const updatedMessages = currentMessages.map((m) =>
        m.id === tempId ? response : m,
      );
      setMessages(updatedMessages);

      emits("hasNewMessage", props.conversation.id);
    }
  } catch (e) {
    console.error("Ошибка отправки:", e);

    // Помечаем сообщение как failed
    const updatedMessages = currentMessages.map((m) =>
      m.id === tempId ? { ...m, status: "failed" as const } : m,
    );
    setMessages(updatedMessages);
  } finally {
    isSending.value = false;
  }
}

// Загрузка начальных сообщений при монтировании
onMounted(() => {
  if (props.conversation.messages) {
    setMessages(props.conversation.messages);
  }
  scrollToBottom("auto");
});

// Обновляем сообщения при изменении conversation
watch(
  () => props.conversation.messages,
  (newMessages) => {
    if (newMessages && newMessages.length > 0) {
      setMessages(newMessages);
    }
  },
  { deep: true },
);

// Следим за фокусом окна для автоматической пометки прочитанных
watch(
  () => document.hasFocus(),
  (hasFocus) => {
    if (hasFocus && displayMessages.value.length > 0) {
      markAllAsRead();
    }
  },
);

// Показываем ошибку подключения
watch(connectionError, (error) => {
  if (error) {
    console.error("Ошибка WebSocket:", error);
    // Здесь можно показать toast уведомление
  }
});

const urlPattern = /(\bhttps?:\/\/[^\s<>]+[^\s<.,:;"')\]\s])/g;

function linkify(text = ""): string {
  return text.replace(
    urlPattern,
    (url) =>
      `<a href="${url}" target="_blank" class="text-blue-600 underline">${url}</a>`,
  );
}
</script>

<style scoped>
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
