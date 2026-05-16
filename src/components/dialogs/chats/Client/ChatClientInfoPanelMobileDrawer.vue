<template>
  <div>
    <DynamicDrawer
        title="О клиенте"
    >
      <template #buttonTrigger>
        <Button variant="ghost" size="icon">
          <EllipsisVertical class="h-5 w-5"/>
        </Button>
      </template>

      <template #default>
        <div class="flex-1 overflow-y-auto">
          <ClientInfoPanel
              v-if="conversation"
              :client="conversation.client"
              @tags-updated="emit('tagsUpdated', $event)"
              @client-updated="emit('clientUpdated', $event)"
          />
        </div>
      </template>
    </DynamicDrawer>
  </div>
</template>
<script setup lang="ts">
import {EllipsisVertical} from 'lucide-vue-next'
import DynamicDrawer from "@/components/dynamics/shadcn/DynamicDrawer.vue";
import ClientInfoPanel from "@/components/dialogs/chats/Client/ClientInfoPanel.vue";
import {Conversation} from "@/types/conversation";
import type {Client} from "@/types/client";


interface Props {
  conversation?: Conversation;
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'tagsUpdated', data: any): [],
  (e: 'clientUpdated', data: Client): void
}>()

</script>


<style scoped>

</style>