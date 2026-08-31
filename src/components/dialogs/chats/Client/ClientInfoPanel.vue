<template>
  <div class="md:w-[240px] bg-background h-full flex flex-col ">
    <!-- Header -->
    <div class="p-2 flex flex-col ">
      <span class="text-gray-400 ">О клиенте</span>
      <span class="text-gray-500 py-3 text-sm">Последний заказ:
        <span class="text-blue-500" v-if="client?.last_order?.id">
          <router-link :to="`/order/${client?.last_order?.id}`">
          {{ client?.last_order?.id }}
          </router-link>
        </span>
      </span>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-2 space-y-6">

      <!-- Client Info -->
      <div class="flex ">

        <ClientInfo
            v-if="client"
            :client="client"
        />

        <ConversationClientCreateModal
            v-else-if="conversation"
            :conversation="conversation"
            @created="emit('clientUpdated', $event)"
        />

        <ClientEditModal
            v-if="client"
            :client="client"
            @updated="emit('clientUpdated', $event)"
        />

      </div>

      <Separator/>
      <!-- Tags Section -->
      <ClientTagsManager
          v-if="client"
          :client="client"
          @tags-updated="emit('tagsUpdated', $event)"
      />

      <Separator/>

      <!-- Segment Section -->
      <ChatClientSegmentManager
          v-if="client"
          :client="client"
      />

      <Separator/>

      <ChatClientActions
          :client="client!"
          :conversation="conversation"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import {Separator} from '@/components/ui/separator'
import ClientTagsManager from './Tag/ClientTagsManager.vue'
import type {Client} from '@/types/client'
import ClientEditModal from "@/components/clients/Edit/ClientEditModal.vue";
import ClientInfo from "@/components/dialogs/chats/Client/ClientInfo.vue";
import ChatClientSegmentManager from "@/components/dialogs/chats/Client/Segment/ChatClientSegmentManager.vue";
import ChatClientActions from "@/components/dialogs/chats/Client/ChatClientActions.vue";
import {Conversation} from "@/types/conversation";
import ConversationClientCreateModal from "@/components/dialogs/chats/Client/ConversationClientCreateModal.vue";

interface Props {
  client: Client | null
  conversation?: Conversation
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'tagsUpdated', data: any): [],
  (e: 'clientUpdated', data: Client): void
}>()

</script>
