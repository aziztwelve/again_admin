<template>
  <Button
    variant="outline"
    size="sm"
    type="button"
    :disabled="!orderId"
    :title="orderId ? 'Открыть чат по заказу' : 'Заказ ещё не сохранён — чат недоступен'"
    class="relative"
    @click="openChat"
  >
    <MessageSquare class="mr-2 h-4 w-4" /> Чат
    <Badge
      v-if="unreadTotal > 0"
      class="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[0.6rem] text-white"
    >
      {{ unreadTotal }}
    </Badge>
  </Button>

  <Teleport to="body">
    <Transition name="order-chat-panel">
      <aside
        v-if="isOpen"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-white shadow-2xl sm:w-[32rem]"
        aria-label="Чат с клиентом"
      >
        <header class="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <MessageSquare class="h-5 w-5 shrink-0 text-primary" />
              <h2 class="text-base font-semibold text-gray-900">Чат с клиентом</h2>
              <Badge v-if="unreadTotal > 0" class="rounded-full bg-red-500 px-1.5 text-white">
                {{ unreadTotal }}
              </Badge>
            </div>
            <p class="mt-1 truncate text-xs text-gray-500">Переписка по заказу во всех каналах</p>
          </div>
          <Button variant="ghost" size="icon" type="button" title="Закрыть чат" @click="closeChat">
            <X class="h-5 w-5" />
            <span class="sr-only">Закрыть чат</span>
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
          <div v-if="conversations.length > 1" class="flex shrink-0 gap-1 overflow-x-auto border-b px-4 py-2">
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
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { MessageSquare, MessagesSquare, X } from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/common/Loader.vue";
import ChatWidget from "@/components/dialogs/chats/ChatWidget.vue";
import { useChatsFunctions } from "@/composables/useChatsFunctions";

const props = defineProps({
  clientId: { type: [Number, String], default: null },
  orderId: { type: [Number, String], default: null },
});

const {
  getConversationsByClient,
  getConversationsByOrder,
  getConversationByIdWithMessages,
} = useChatsFunctions();

const isOpen = ref(false);
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

const sourceLabel = (source) => ({
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  web_chat: "Веб-чат",
  vk: "ВКонтакте",
  email: "Почта",
  max: "MAX",
}[source] || source || "Чат");

const selectConversation = async (id, force = false) => {
  if (!id || (!force && selectedId.value === id && selectedConversation.value)) return;

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

const loadConversations = async () => {
  if (!props.orderId && !props.clientId) return;

  isLoadingList.value = true;
  try {
    const list = props.orderId
      ? await getConversationsByOrder(props.orderId)
      : await getConversationsByClient(props.clientId);

    conversations.value = Array.isArray(list) ? list : [];
    if (conversations.value.length) {
      await selectConversation(conversations.value[0].id, true);
    } else {
      selectedId.value = null;
      selectedConversation.value = null;
    }
  } catch (error) {
    console.error("Failed to load order conversations", error);
    conversations.value = [];
  } finally {
    isLoadingList.value = false;
  }
};

const openChat = async () => {
  isOpen.value = true;
  await loadConversations();
};

const closeChat = () => {
  isOpen.value = false;
};

const onHasNewMessage = async () => {
  const currentId = selectedId.value;
  await loadConversations();
  if (currentId) await selectConversation(currentId, true);
};

const onKeydown = (event) => {
  if (event.key === "Escape" && isOpen.value) closeChat();
};

window.addEventListener("keydown", onKeydown);
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

watch(
  () => [props.clientId, props.orderId],
  () => {
    conversations.value = [];
    selectedId.value = null;
    selectedConversation.value = null;
    if (isOpen.value) loadConversations();
  },
);
</script>

<style scoped>
.order-chat-panel-enter-active,
.order-chat-panel-leave-active {
  transition: transform 0.2s ease;
}

.order-chat-panel-enter-from,
.order-chat-panel-leave-to {
  transform: translateX(100%);
}
</style>
