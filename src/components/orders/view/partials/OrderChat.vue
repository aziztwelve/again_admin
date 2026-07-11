<template>
  <ModalDialog
    ref="modalRef"
    title="Чат с клиентом"
    description="Переписка с клиентом во всех источниках (веб-чат, мессенджеры, почта)."
    dynamic-style="sm:max-w-3xl"
  >
    <template #trigger>
      <Button
        variant="outline"
        size="sm"
        type="button"
        :disabled="!orderId"
        :title="
          orderId
            ? 'Открыть чат по заказу'
            : 'Заказ ещё не сохранён — чат недоступен'
        "
        class="relative"
        @click.stop="onOpen"
      >
        <MessageSquare class="mr-2 h-4 w-4" /> Чат
        <Badge
          v-if="unreadTotal > 0"
          class="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[0.6rem] text-white"
        >
          {{ unreadTotal }}
        </Badge>
      </Button>
    </template>

    <template #content>
      <!-- Загрузка списка -->
      <div
        v-if="isLoadingList"
        class="flex h-32 items-center justify-center"
      >
        <Loader />
      </div>

      <!-- У клиента ещё нет диалогов -->
      <div
        v-else-if="!conversations.length"
        class="flex flex-col items-center justify-center gap-2 py-8 text-center"
      >
        <MessagesSquare class="h-8 w-8 text-gray-300" />
        <p class="text-sm text-gray-500">Клиент пока не писал в чат</p>
        <p class="text-xs text-gray-400">
          Когда клиент напишет с сайта, мессенджера или почты — диалог появится здесь.
        </p>
      </div>

      <!-- Есть один или несколько диалогов -->
      <div v-else class="flex flex-col">
        <!-- Вкладки источников (показываем только если диалогов больше одного) -->
        <div
          v-if="conversations.length > 1"
          class="flex flex-wrap gap-1 border-b pb-2"
        >
          <button
            v-for="conv in conversations"
            :key="conv.id"
            type="button"
            class="flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition"
            :class="
              selectedId === conv.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            "
            @click="selectConversation(conv.id)"
          >
            <span class="capitalize">{{ sourceLabel(conv.source) }}</span>
            <Badge
              v-if="conv.unread_messages_count"
              class="ml-1 h-4 px-1 text-[0.6rem]"
            >
              {{ conv.unread_messages_count }}
            </Badge>
            <span class="text-[0.65rem] text-gray-400">#{{ conv.id }}</span>
          </button>
        </div>

        <!-- Виджет чата -->
        <div class="h-[60vh] min-h-[420px]">
          <ChatWidget
            v-if="selectedConversation"
            :conversation="selectedConversation"
            :is-loading-get-message="isLoadingMessages"
            @has-new-message="onHasNewMessage"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-sm text-gray-400"
          >
            Выберите диалог
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <Button
        v-if="conversations.length"
        variant="ghost"
        size="sm"
        type="button"
        @click="goToFullPage"
      >
        Открыть в полном виде
      </Button>
    </template>
  </ModalDialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { MessageSquare, MessagesSquare } from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/common/Loader.vue";
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import ChatWidget from "@/components/dialogs/chats/ChatWidget.vue";
import { useChatsFunctions } from "@/composables/useChatsFunctions";

const props = defineProps({
  clientId: { type: [Number, String], default: null },
  orderId: { type: [Number, String], default: null },
});

const router = useRouter();
const { getConversationsByClient, getConversationsByOrder, getConversationByIdWithMessages } =
  useChatsFunctions();

const modalRef = ref(null);

const conversations = ref([]);
const selectedId = ref(null);
const selectedConversation = ref(null);
const isLoadingList = ref(false);
const isLoadingMessages = ref(false);
// Загружали ли мы уже список диалогов в этом сеансе.
// Используется, чтобы не дёргать API при каждом hover, но грузить при первом
// открытии модалки.
const hasLoaded = ref(false);

const unreadTotal = computed(() =>
  conversations.value.reduce(
    (sum, c) => sum + Number(c.unread_messages_count || 0),
    0,
  ),
);

const sourceLabel = (source) => {
  switch (source) {
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
    case "max":
      return "MAX";
    default:
      return source || "Чат";
  }
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
      // По умолчанию открываем самый свежий диалог (бэк уже сортирует по
      // last_message_at desc).
      await selectConversation(conversations.value[0].id);
    } else {
      selectedConversation.value = null;
      selectedId.value = null;
    }
    hasLoaded.value = true;
  } catch (e) {
    console.error("Failed to load client conversations", e);
    conversations.value = [];
  } finally {
    isLoadingList.value = false;
  }
};

const selectConversation = async (id) => {
  if (!id) return;
  selectedId.value = id;
  isLoadingMessages.value = true;
  try {
    selectedConversation.value = await getConversationByIdWithMessages(id);
    // Локально обнуляем непрочитанные у выбранного диалога в списке —
    // бэкенд уже пометил их как прочитанные в /conversations/{id}.
    const idx = conversations.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      conversations.value[idx] = {
        ...conversations.value[idx],
        unread_messages_count: 0,
      };
    }
  } catch (e) {
    console.error("Failed to load conversation messages", e);
    selectedConversation.value = null;
  } finally {
    isLoadingMessages.value = false;
  }
};

const onHasNewMessage = async () => {
  // После ответа подтянем свежий список (last_message_at + порядок).
  if (!props.orderId && !props.clientId) return;
  try {
    const list = props.orderId
      ? await getConversationsByOrder(props.orderId)
      : await getConversationsByClient(props.clientId);
    conversations.value = Array.isArray(list) ? list : [];
  } catch (e) {
    /* ignore */
  }
};

const goToFullPage = () => {
  modalRef.value?.close?.();
  router.push({ name: "dialogs-chats" });
};

const onOpen = async () => {
  if (!props.orderId && !props.clientId) return;
  modalRef.value?.open?.();
  // Подгружаем диалоги при каждом открытии — admin мог получить новые
  // сообщения с момента предыдущего просмотра.
  await loadConversations();
};

watch(
  () => props.clientId,
  () => {
    // При смене клиента сбросим состояние, чтобы badge / список не «прилипли»
    // от предыдущего заказа.
    conversations.value = [];
    selectedConversation.value = null;
    selectedId.value = null;
    hasLoaded.value = false;
  },
);

watch(
  () => props.orderId,
  () => {
    conversations.value = [];
    selectedConversation.value = null;
    selectedId.value = null;
    hasLoaded.value = false;
  },
);
</script>
