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
              :src="clientAvatar"
            />
            <AvatarFallback>{{
              conversation.client?.profile?.full_name
            }}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle class="text-sm font-medium">{{
              conversation.client?.profile?.full_name || "Клиент"
            }}</CardTitle>
            <CardDescription class="flex items-center gap-1 text-xs">
              <span>{{ conversation.client?.profile?.phone }}</span>
              <Badge
                variant="outline"
                class="h-4 px-1 text-[0.6rem] capitalize"
              >
                {{ sourceName }}
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
        <div
          v-for="message in conversation.messages"
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
            <!-- ← ДОБАВИЛИ: Вложения -->
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
            <!--            <p-->
            <!--                v-if="message.content"-->
            <!--                v-html="linkify(message.content)"-->
            <!--                class="px-2 py-1"-->
            <!--            ></p>-->

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
import {
  ref,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
} from "vue";
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
import "@/echo";
import { assetPath } from "@/utils/assetPath";
import Loader from "@/components/common/Loader.vue";

import FileUploadButton from "./File/FileUploadButton.vue";
import FilePreview from "./File/FilePreview.vue";
import AttachmentItem from "./File/AttachmentItem.vue";
import type { Conversation, PendingFile } from "@/types/conversation";
import { Message } from "@/types/conversation";

const props = defineProps<{
  conversation: Conversation;
  isLoadingGetMessage: boolean;
}>();

const emits = defineEmits(["hasNewMessage"]);

const { conversationReplyById } = useChatsFunctions();

const clientIcon = assetPath("icons/client.png");

// API чатов возвращает путь к аватару клиента из user_profiles (без
// домена и /storage). В карточке заказа относительный путь иначе превращается
// в /admin/order/user_profiles/... и даёт 404.
const clientAvatar = computed(() => {
  const image = props.conversation?.client?.profile?.image;
  if (!image) return clientIcon;
  if (/^(https?:|data:)/i.test(image)) return image;

  const path = image.replace(/^\/+/, "").replace(/^storage\//, "");
  return `/storage/${path}`;
});

const newMessage = ref("");
const messagesEndRef = ref<HTMLDivElement | null>(null);
const isSending = ref(false); // ← ДОБАВИЛИ

const pendingFiles = ref<PendingFile[]>([]);

const sourceName = computed(() => {
  switch (props.conversation?.source) {
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
  console.log("handleRemoveFile", fileId);

  pendingFiles.value = pendingFiles.value.filter((f) => f.id !== fileId);
};

const handleClearAllFiles = () => {
  pendingFiles.value = [];
};

const handleFileError = (error: string) => {
  console.error("File error:", error);
  // Можно добавить toast notification
};

let addMessage = true;

async function sendMessage() {
  const text = newMessage.value.trim();
  const files = [...pendingFiles.value];

  // Должен быть текст ИЛИ файлы
  if (!text && files.length === 0) return;
  if (props.conversation.id === undefined) return;

  isSending.value = true;
  addMessage = false;

  // Создаём временное сообщение
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

  props.conversation.messages = props.conversation.messages || [];
  props.conversation.messages.push(tempMessage);
  newMessage.value = "";
  pendingFiles.value = []; // ← Очищаем файлы
  scrollToBottom();

  try {
    const response = await conversationReplyById(
      Number(props.conversation.id),
      text || "",
      files,
    );

    if (response) {
      const tempIndex = props.conversation.messages.findIndex(
        (m) => m.id === tempId,
      );
      if (tempIndex !== -1) {
        props.conversation.messages[tempIndex] = response;
      }

      emits("hasNewMessage", props.conversation.id);

      // Задержка перед разблокировкой WebSocket, чтобы избежать дублирования
      setTimeout(() => {
        addMessage = true;
      }, 500);
    }
  } catch (e) {
    console.error("Ошибка отправки:", e);

    const messageIndex = props.conversation.messages.findIndex(
      (m) => m.id === tempId,
    );
    if (messageIndex !== -1) {
      props.conversation.messages[messageIndex].status = "failed";
    }
    addMessage = true;
  } finally {
    isSending.value = false;
  }
}

onMounted(() => scrollToBottom("auto"));

watch(
  () => props.conversation?.messages?.length,
  () => scrollToBottom(),
);

const urlPattern = /(\bhttps?:\/\/[^\s<>]+[^\s<.,:;"')\]\s])/g;

function linkify(text = ""): string {
  return text.replace(
    urlPattern,
    (url) =>
      `<a href="${url}" target="_blank" class="text-blue-600 underline">${url}</a>`,
  );
}

/* ---------- WebSocket подписка ---------- */
let currentChannel: any = null;

watch(
  () => props.conversation.id,
  (id, oldId) => {
    if (oldId && (window as any).Echo) {
      try {
        (window as any).Echo.leave(`private-conversation.${oldId}`);
      } catch (e) {}
    }

    if (!id || !(window as any).Echo) return;

    try {
      currentChannel = (window as any).Echo.private(`conversation.${id}`);

      currentChannel.listen(".MessageCreated", (payload: any) => {
        if (!addMessage) return;

        const incoming: Partial<Message> = {
          id: payload.id,
          content: payload.content,
          direction: payload.direction,
          status: payload.status,
          created_at: payload.created_at,
          attachments: payload.attachments ?? [],
        };

        props.conversation.messages = props.conversation.messages || [];

        // Улучшенная проверка дубликатов: проверяем по ID и по содержимому + времени
        const exists = props.conversation.messages.some((m) => {
          // Проверка по ID
          if (String(m.id) === String(incoming.id)) return true;

          // Дополнительная проверка: одинаковое содержимое и близкое время (в пределах 2 секунд)
          if (
            m.content === incoming.content &&
            m.direction === incoming.direction
          ) {
            const timeDiff = Math.abs(
              new Date(m.created_at).getTime() -
                new Date(incoming.created_at).getTime(),
            );
            if (timeDiff < 2000) return true;
          }

          return false;
        });

        if (!exists) {
          props.conversation.messages.push(incoming as Message);
          nextTick(() => scrollToBottom());
          emits("hasNewMessage", id);
        }
      });
    } catch (e) {
      console.error("Echo subscribe failed:", e);
    }
  },
  {
    immediate: true,
  },
);

onBeforeUnmount(() => {
  const id = props.conversation.id;
  if (id && (window as any).Echo) {
    try {
      (window as any).Echo.leave(`private-conversation.${id}`);
    } catch (e) {
      /* ignore */
    }
  }
});
</script>
