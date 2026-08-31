<template>
  <div class="flex p-2 bg-background md:rounded-lg md:border">
    <div class="max-md:hidden md:flex w-full h-[85vh]">
      <!-- Список чатов -->
      <div class="flex flex-col ">
        <ChatListConversations
            class="h-full border-r "
            :conversations="conversations"
            :current-source="currentSourceName"
            :isLoadingMore="isLoadingMore"
            :noMoreChats="noMoreChats"
            :sending="sending"
            :searchParams="searchParams"
            @scrolledToEnd="handleScrolledToEnd"
            @change-conversation="handleChangeConv"
            @search="handleSearch"
        />
      </div>

      <!-- Виджет чата -->
      <div class="flex flex-col h-full flex-1">
        <ChatWidget
            v-if="selectedConversation"
            class="h-full"
            :conversation="selectedConversation"
            :isLoadingGetMessage="isLoadingGetMessage"
            @has-new-message="handleUpdateConv"
        />
        <div v-else class="flex flex-col items-center justify-center gap-3 bg-muted/20 p-6 border h-[85vh]">
          <MessagesSquare class="h-10 w-10 text-muted-foreground"/>
          <h3 class="text-lg font-medium text-muted-foreground">Выберите чат</h3>
          <p class="text-sm text-muted-foreground text-center max-w-md">
            Выберите диалог из списка слева чтобы начать общение
          </p>
        </div>
      </div>

      <!-- Панель "О клиенте" -->
      <ClientInfoPanel
          v-if="selectedConversation"
          :client="selectedConversation.client"
          :conversation="selectedConversation"
          @tags-updated="handleTagsUpdated"
          @client-updated="handleClientUpdate"
          class="h-[85vh]"
      />
    </div>

    <!-- Mobile View -->
    <div class="md:hidden w-full h-full">
      <Transition name="slide-fade" mode="out-in">
        <ChatListConversations
            v-if="!showChat"
            class="h-full border-r"
            :search-params="searchParams"
            :conversations="conversations"
            :sending="sending"
            :current-source="currentSourceName"
            :isLoadingMore="isLoadingMore"
            :noMoreChats="noMoreChats"
            @scrolledToEnd="handleScrolledToEnd"
            @change-conversation="handleChangeConv"
        />

        <div
            v-else
            key="chat-widget"
            class="h-full w-full flex flex-col bg-background"
        >
          <div class="p-3 border-b flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Button
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9 rounded-full"
                  @click="handleBack"
              >
                <ChevronLeft class="h-5 w-5"/>
              </Button>
              <h3 class="font-medium">Чат с клиентом</h3>
            </div>

            <ChatClientInfoPanelMobileDrawer
                :conversation="selectedConversation"
                @client-updated="handleClientUpdate"
            />

          </div>
          <ChatWidget
              v-if="selectedConversation"
              class="flex-1"
              :conversation="selectedConversation"
              :isLoadingGetMessage="isLoadingGetMessage"
              @has-new-message="handleUpdateConv"
          />
        </div>

      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatWidget from "@/components/dialogs/chats/ChatWidget.vue";
import ClientInfoPanel from "@/components/dialogs/chats/Client/ClientInfoPanel.vue";
import {ref, onMounted, onBeforeUnmount, watch} from 'vue';
import {Button} from '@/components/ui/button';
import {ChevronLeft, MessagesSquare} from 'lucide-vue-next';
import {useChatsFunctions} from "@/composables/useChatsFunctions";
import ChatListConversations from "@/components/dialogs/chats/ChatListConversations.vue";
import {useStore} from "vuex";
import {useEchoListener} from "@/composables/Echo/useEchoListener";
import {ECHO_CHANNELS, ECHO_EVENTS} from "@/config/echoConfig";
import {ChatSourceObj, Conversation, ConversationSearchType} from "@/types/conversation";
import {Client} from "@/types/client";
import ChatClientInfoPanelMobileDrawer from "@/components/dialogs/chats/Client/ChatClientInfoPanelMobileDrawer.vue";

const store = useStore();

const {getConversations, getConversationByIdWithMessages, sending} = useChatsFunctions()

const conversations = ref<Conversation[]>([]);
const currentSourceName = ref<ChatSourceObj>({source: 'all'})
const selectedConversation = ref<Conversation>()

const isMobile = ref(false);
const showChat = ref(false);

const isLoadingGetMessage = ref(false)
const isLoadingMore = ref(false);
const noMoreChats = ref(false)

const pagination = ref({
  page: 1,
  per_page: 20,
  total: 0,
})

const searchParams = ref<ConversationSearchType>({
  search: ''
})

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

const handleBack = () => {
  showChat.value = false;
};

const fetchData = async () => {
  pagination.value.page = 1;

  getConversations({
    page: pagination.value.page,
    per_page: pagination.value.per_page,
    source: currentSourceName.value.source === 'all' ? '' : currentSourceName.value.source,
    search: searchParams.value.search ?? null
  })
      .then(res => {
        pagination.value.total = res.meta.total ?? 0
        conversations.value = res.data
      })
};

const handleChangeConv = async (c: Conversation) => {
  showChat.value = true; //for mobile

  isLoadingGetMessage.value = true;
  try {
    const conversation = await getConversationByIdWithMessages(Number(c.id))
    selectedConversation.value = conversation

    // API сбрасывает непрочитанные только для открытого диалога. Сразу
    // отражаем это в списке и в общем индикаторе, не трогая другие чаты.
    const listIndex = conversations.value.findIndex(item => item.id === conversation.id)
    if (listIndex !== -1) {
      conversations.value[listIndex] = {
        ...conversations.value[listIndex],
        unread_messages_count: conversation.unread_messages_count,
      }
    }
    await store.dispatch('notifications/checkForUpdates')
  } finally {
    isLoadingGetMessage.value = false;
  }

}

const handleUpdateConv = () => {
  fetchData()
}

const handleTagsUpdated = async () => {
  if (selectedConversation.value) {
    const updated = await getConversationByIdWithMessages(Number(selectedConversation.value.id))
    selectedConversation.value = updated
  }
}


const handleClientUpdate = (c: Client) => {
  if (selectedConversation.value) {
    selectedConversation.value.client = c
    selectedConversation.value.client_id = c.id
  }

  const listIndex = conversations.value.findIndex(item => item.id === selectedConversation.value?.id)
  if (listIndex !== -1) {
    conversations.value[listIndex] = {
      ...conversations.value[listIndex],
      client: c,
      client_id: c.id,
    }
  }
}

const handleScrolledToEnd = async () => {
  if (isLoadingMore.value) return;

  if (pagination.value.page * pagination.value.per_page >= pagination.value.total) {
    noMoreChats.value = true
    return
  }

  isLoadingMore.value = true;
  pagination.value.page++;

  const res = await getConversations({
    page: pagination.value.page,
    per_page: pagination.value.per_page,
    source: currentSourceName.value.source === 'all' ? '' : currentSourceName.value.source,
  });

  conversations.value.push(...(res.data ?? []));
  isLoadingMore.value = false;
};

const handleSearch = () => {
  fetchData()
}


onMounted(async () => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  await fetchData()
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize);
});

const {isSubscribed: listenerSubscribed} = useEchoListener({
  channel: ECHO_CHANNELS.ADMIN_NOTIFICATIONS,
  event: ECHO_EVENTS.CONVERSATION_UPDATED,
  isPrivate: true,
  onMessage: () => {
    fetchData();
  },
  onError: (error) => {
    console.error('Ошибка подписки:', error);
  }
});

watch(
    () => currentSourceName.value.source,
    () => {
      fetchData()
    }
)

</script>

<style>
/* Плавные переходы для мобильного вида */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}

/* Анимация для кнопки назад */
.button-scale-enter-active,
.button-scale-leave-active {
  transition: all 0.2s ease;
}

.button-scale-enter-from,
.button-scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>
