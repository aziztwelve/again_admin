<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium">Теги</h3>


      <ClientAddTagModal
          :client="client"
          @added-tag-to-client="handleAddedTagToClient"
      />


    </div>

    <!-- Tags list -->
    <div v-if="client.tags && client.tags.length" class="flex flex-wrap gap-2">
      <Badge
          v-for="tag in client.tags"
          :key="tag.id"
          variant="secondary"
          class="cursor-pointer hover:bg-destructive/10 group"
          :style="tag.color ? { backgroundColor: tag.color, color: '#fff' } : undefined"
      >
        {{ tag.name }}
        <X
            class="ml-1 h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity"
            @click="handleRemoveTag(tag.id)"
        />
      </Badge>
    </div>
    <p v-else class="text-sm text-muted-foreground">Нет тегов</p>

  </div>
</template>

<script setup lang="ts">
import {X} from 'lucide-vue-next'
import {Badge} from '@/components/ui/badge'
import {useTagFunctions} from '@/composables/Tag/useTagFunctions'
import type {Client} from '@/types/client'
import type {Tag} from '@/types/tag'
import ClientAddTagModal from "@/components/dialogs/chats/Client/Tag/ClientAddTagModal.vue";

interface Props {
  client: Client
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updated', tags: Tag[]): void
}>()

const {
  detachClientTag
} = useTagFunctions()


const handleRemoveTag = (tagId: number) => {
  detachClientTag(
      props.client.id,
      {tag_id: tagId}
  )
      .then(tags => {
        // Поддержим обратную совместимость: мутируем входной список тегов
        // (старые места рассчитывают на это поведение) и сообщаем родителю.
        props.client.tags = tags
        emit('updated', tags)
      })
      .catch(err => console.error(err))
}


const handleAddedTagToClient = (tags: Tag[]) => {
  props.client.tags = tags
  emit('updated', tags)
}


</script>