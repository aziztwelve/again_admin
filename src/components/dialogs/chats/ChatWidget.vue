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
              conversation.client?.profile?.full_name || "Неизвестный"
            }}</CardTitle>
            <CardDescription class="flex items-center gap-1 text-xs">
              <span>{{ conversation.client?.profile?.phone || (!conversation.client ? `№ чата ${conversation.id}` : '') }}</span>
              <Badge
                variant="outline"
                class="h-4 px-1 text-[0.6rem] capitalize"
              >
                {{ sourceName }}
              </Badge>
            </CardDescription>
          </div>
        </div>
        <div class="flex items-center gap-1 text-right text-xs">
          <Button type="button" variant="ghost" size="sm" class="h-7 w-7 px-0" :title="conversation.unread_messages_count ? 'Отметить прочитанным' : 'Отметить непрочитанным'" @click="toggleReadState">
            <MailOpen v-if="conversation.unread_messages_count" class="h-4 w-4" />
            <Mail v-else class="h-4 w-4" />
          </Button>
          <div>
          <div class="font-medium">ID {{ conversation.id }}</div>
          <div class="text-muted-foreground">
            {{ formatTime(conversation.last_message_at) }}
          </div>
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
        ref="messagesScrollRef"
        class="flex-1 overflow-y-auto space-y-1 max-md:max-h-[66vh] max-md:min-h-[66vh]"
        v-else
      >
        <template
          v-for="(message, index) in conversation.messages"
          :key="message.id"
        >
        <div v-if="isNewMessageDay(index)" class="py-2 text-center">
          <span class="rounded-full bg-muted px-2 py-1 text-[0.65rem] text-muted-foreground">
            {{ formatMessageDate(message.created_at) }}
          </span>
        </div>
        <div
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
        </template>
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
          <textarea
            ref="messageInputRef"
            v-model="newMessage"
            placeholder="Сообщение..."
            rows="1"
            class="flex min-h-8 h-8 max-h-32 w-full flex-1 resize-y rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSending"
            @keydown="handleMessageKeydown"
          />

          <div ref="emojiPickerContainerRef" class="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="h-8 w-8 px-2"
              title="Смайлики"
              aria-label="Открыть смайлики"
              :disabled="isSending"
              @click="toggleEmojiPicker"
            >
              <Smile class="w-4 h-4" />
            </Button>

            <div
              v-if="isEmojiPickerOpen"
              class="absolute bottom-full left-0 z-50 mb-2 overflow-hidden rounded-md border bg-background shadow-lg"
            >
              <emoji-picker
                v-if="isEmojiPickerLoaded"
                class="chat-emoji-picker"
                :data-source="emojiDataSource"
                @emoji-click="handleEmojiClick"
              />
            </div>
          </div>

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
          Через {{ sourceName }} · Enter — отправить, Ctrl+Enter — новая строка
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
import { Button } from "@/components/ui/button";
import {
  Clock,
  Check,
  MessageSquare,
  Eye,
  AlertCircle,
  Send,
  Loader2,
  Smile,
  Mail,
  MailOpen,
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

const { conversationReplyById, markConversationAsRead, markConversationAsUnread } = useChatsFunctions();

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
const messageInputRef = ref<HTMLTextAreaElement | null>(null);
const messagesEndRef = ref<HTMLDivElement | null>(null);
const messagesScrollRef = ref<HTMLDivElement | null>(null);
const isSending = ref(false); // ← ДОБАВИЛИ
const isEmojiPickerOpen = ref(false);
const isEmojiPickerLoaded = ref(false);
const emojiDataSource = ref("");
const emojiPickerContainerRef = ref<HTMLElement | null>(null);

const pendingFiles = ref<PendingFile[]>([]);

function insertTextAtCursor(text: string) {
  const textarea = messageInputRef.value;
  const start = textarea?.selectionStart ?? newMessage.value.length;
  const end = textarea?.selectionEnd ?? start;

  newMessage.value = `${newMessage.value.slice(0, start)}${text}${newMessage.value.slice(end)}`;

  nextTick(() => {
    const cursor = start + text.length;
    textarea?.focus();
    textarea?.setSelectionRange(cursor, cursor);
  });
}

function handleMessageKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" || event.isComposing) return;

  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    insertTextAtCursor("\n");
    return;
  }

  event.preventDefault();
  void sendMessage();
}

async function toggleEmojiPicker() {
  if (!isEmojiPickerLoaded.value) {
    const [, emojiDataModule] = await Promise.all([
      import("emoji-picker-element"),
      import("emoji-picker-element-data/en/emojibase/data.json"),
    ]);

    // Набор эмодзи включён в сборку, а Blob URL позволяет пикеру загрузить
    // его как обычный JSON без обращения к внешнему CDN.
    emojiDataSource.value = URL.createObjectURL(
      new Blob([JSON.stringify(emojiDataModule.default)], {
        type: "application/json",
      }),
    );
    isEmojiPickerLoaded.value = true;
  }

  isEmojiPickerOpen.value = !isEmojiPickerOpen.value;
}

function handleEmojiClick(event: Event) {
  const emoji = (event as CustomEvent<{ unicode?: string }>).detail?.unicode;
  if (!emoji) return;

  insertTextAtCursor(emoji);
}

async function toggleReadState() {
  const updated = props.conversation.unread_messages_count
    ? await markConversationAsRead(props.conversation.id)
    : await markConversationAsUnread(props.conversation.id);
  props.conversation.unread_messages_count = updated.unread_messages_count;
}

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
    const container = messagesScrollRef.value;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior });
      return;
    }

    messagesEndRef.value?.scrollIntoView({ behavior });
  });
}

function formatTime(datetime: any): string {
  if (!datetime) return "";
  const date = new Date(datetime);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMessageDate(datetime: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(datetime));
}

function isNewMessageDay(index: number): boolean {
  const messages = props.conversation.messages ?? [];
  return index === 0 || new Date(messages[index].created_at).toDateString()
    !== new Date(messages[index - 1].created_at).toDateString();
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

function closeEmojiPickerOnOutsideClick(event: MouseEvent) {
  if (
    isEmojiPickerOpen.value
    && !emojiPickerContainerRef.value?.contains(event.target as Node)
  ) {
    isEmojiPickerOpen.value = false;
  }
}

const draftsStorageKey = "again-admin-chat-drafts";

function getDrafts(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(draftsStorageKey) ?? "{}");
  } catch {
    return {};
  }
}

function persistDraft(conversationId: number, text: string) {
  const drafts = getDrafts();
  if (text) drafts[String(conversationId)] = text;
  else delete drafts[String(conversationId)];
  localStorage.setItem(draftsStorageKey, JSON.stringify(drafts));
}

onMounted(() => {
  scrollToBottom("auto");
  document.addEventListener("click", closeEmojiPickerOnOutsideClick);
});

// When the selected conversation finishes loading, the message list is only
// rendered at this point (before that it is replaced by Loader).
watch(
  () => props.isLoadingGetMessage,
  (isLoading) => {
    if (!isLoading) {
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
  },
  { flush: "post" },
);

watch(
  () => props.conversation?.messages?.length,
  () => scrollToBottom(),
);

// При переключении между каналами сразу показываем конец выбранного диалога.
watch(
  () => props.conversation?.id,
  () => scrollToBottom("auto"),
);

watch(newMessage, (text) => persistDraft(props.conversation.id, text));

watch(
  () => props.conversation.id,
  (conversationId) => {
    newMessage.value = getDrafts()[String(conversationId)] ?? "";
  },
  { immediate: true },
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
  document.removeEventListener("click", closeEmojiPickerOnOutsideClick);
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
