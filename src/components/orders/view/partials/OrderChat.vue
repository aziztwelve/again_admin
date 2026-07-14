<template>
  <section class="flex h-[680px] min-h-[520px] flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 lg:sticky lg:top-4">
    <header class="flex items-center justify-between gap-2 border-b px-4 py-3">
      <div class="flex min-w-0 items-center gap-2">
        <MessageSquare class="h-4 w-4 shrink-0 text-primary" />
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-gray-900">Чат с клиентом</h2>
          <p class="truncate text-xs text-gray-500">Переписка по заказу во всех каналах</p>
        </div>
        <Badge
          v-if="unreadTotal > 0"
          class="h-5 min-w-5 rounded-full bg-red-500 px-1.5 text-[0.65rem] text-white"
        >
          {{ unreadTotal }}
        </Badge>
      </div>
      <Button
        v-if="conversations.length"
        variant="ghost"
        size="sm"
        type="button"
        class="shrink-0"
        @click="goToFullPage"
      >
        Все чаты
      </Button>
    </header>

    <div v-if="isLoadingList" class="flex flex-1 items-center justify-center">
      <Loader />
    </div>

    <div
      v-else-if="!conversations.length"
      class="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center"
    >
      <MessagesSquare class="h-8 w-8 text-gray-300" />
      <p class="text-sm text-gray-500">Клиент пока не писал в чат</p>
      <p class="text-xs text-gray-400">
        Когда появится сообщение с сайта, из мессенджера или почты, диалог будет здесь.
      </p>
    </div>

    <template v-else>
      <div v-if="conversations.length > 1" class="flex shrink-0 gap-1 overflow-x-auto border-b px-3 py-2">
        <button
          v-for="conv in conversations"
          :key="conv.id"
          type="button"
          class="flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs transition"
          :class="selectedId === conv.id
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
          @click="selectConversation(conv.id)"
        >
          <span>{{ sourceLabel(conv.source) }}</span>
          <Badge v-if="conv.unread_messages_count" class="h-4 px-1 text-[0.6rem]">
            {{ conv.unread_messages_count }}
          </Badge>
        </button>
      </div>

      <div class="min-h-0 flex-1">
        <ChatWidget
          v-if="selectedConversation"
          :conversation="selectedConversation"
          :is-loading-get-message="isLoadingMessages"
          @has-new-message="onHasNewMessage"
        />
        <div v-else class="flex h-full items-center justify-center text-sm text-gray-400">
          Выберите диалог
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { MessageSquare, MessagesSquare } from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/common/Loader.vue";
import ChatWidget from "@/components/dialogs/chats/ChatWidget.vue";
import { useChatsFunctions } from "@/composables/useChatsFunctions";

const props = defineProps({
  clientId: { type: [Number, String], default: null },
  orderId: { type: [Number, String], default: null },
});

const router = useRouter();
const {
  getConversationsByClient,
  getConversationsByOrder,
  getConversationByIdWithMessages,
} = useChatsFunctions();

const conversations = ref([]);
const selectedId = ref(null);
const selectedConversation = ref(null);
const isLoadingList = ref(false);
const isLoadingMessages = ref(false);

const unreadTotal = computed(() =>
  conversations.value.reduce(
    (sum, conversation) => sum + Number(conversation.unread_messages_count || 0),
    0,
  ),
);

const sourceLabel = (source) => {
  const labels = {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    web_chat: "Веб-чат",
    vk: "ВКонтакте",
    email: "Почта",
    max: "MAX",
  };

  return labels[source] || source || "Чат";
};

const loadConversations = async () => {
  if (!props.orderId && !props.clientId) {
    conversations.value = [];
    selectedConversation.value = null;
    selectedId.value = null;
    return;
  }

  isLoadingList.value = true;
  try {
    const list = props.orderId
      ? await getConversationsByOrder(props.orderId)
      : await getConversationsByClient(props.clientId);

    conversations.value = Array.isArray(list) ? list : [];
    if (conversations.value.length) {
      await selectConversation(conversations.value[0].id);
    } else {
      selectedConversation.value = null;
      selectedId.value = null;
    }
  } catch (error) {
    console.error("Failed to load order conversations", error);
    conversations.value = [];
  } finally {
    isLoadingList.value = false;
  }
};

const selectConversation = async (id) => {
  if (!id || selectedId.value === id && selectedConversation.value) return;

  selectedId.value = id;
  isLoadingMessages.value = true;
  try {
    selectedConversation.value = await getConversationByIdWithMessages(id);
    const index = conversations.value.findIndex((conversation) => conversation.id === id);
    if (index !== -1) {
      conversations.value[index] = {
        ...conversations.value[index],
        unread_messages_count: 0,
      };
    }
  } catch (error) {
    console.error("Failed to load conversation messages", error);
    selectedConversation.value = null;
  } finally {
    isLoadingMessages.value = false;
  }
};

const onHasNewMessage = async () => {
  const selectedConversationId = selectedId.value;
  await loadConversations();
  if (selectedConversationId) await selectConversation(selectedConversationId);
};

const goToFullPage = () => router.push({ name: "dialogs-chats" });

watch(
  () => [props.clientId, props.orderId],
  () => loadConversations(),
);

onMounted(loadConversations);
</script>
