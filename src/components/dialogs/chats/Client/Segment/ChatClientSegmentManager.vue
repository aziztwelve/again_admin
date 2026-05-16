<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium">Клиент в сегменте</h3>
      <ChatClientSegmentAdd
          :client="client"
      />
    </div>

    <!-- Tags list -->
    <div v-if="client.segments && client.segments.length" class="flex flex-wrap gap-2">
      <Badge
          v-for="s in client.segments"
          :key="s.id"
          variant="secondary"
          class="cursor-pointer hover:bg-destructive/10 group"
      >
        {{ s.name }}
        <X
            class="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
            @click="handleRemoveSegment(s.id)"
        />
      </Badge>
    </div>
    <p v-else class="text-sm text-muted-foreground">Клиент не добавлен не к одному сегменту</p>

  </div>
</template>

<script setup lang="ts">
import {X} from 'lucide-vue-next'
import {Badge} from '@/components/ui/badge'
import type {Client} from '@/types/client'
import ChatClientSegmentAdd from "@/components/dialogs/chats/Client/Segment/ChatClientSegmentAdd.vue";
import {useSegments} from "@/features/segment/composables/useSegments";

interface Props {
  client: Client
}

const props = defineProps<Props>()

const {
  detachClients
} = useSegments()


const handleRemoveSegment = (segmentId: number) => {
  detachClients(
      segmentId,
      {
        client_ids: [props.client.id]
      })
      .then(() => {
        props.client.segments = props.client.segments?.filter(i => i.id !== segmentId)
      })
      .catch(err => console.error(err))
}


</script>