<template>
  <ModalDialog
      ref="modalDialog"
      title="Добавить тег"
  >
    <template #trigger>
      <Button variant="ghost" size="icon" class="h-6 w-6">
        <Plus class="h-4 w-4"/>
      </Button>
    </template>

    <template #content>
      <div class="space-y-4">
        <!-- Select existing tag -->
        <div class="space-y-2">
          <Label>Выберите существующий тег</Label>
          <div class=" flex items-center gap-2 w-full">
            <Select
                class="w-full"
                v-model="selectedTagId"
                option-value="id"
                option-label="name"
                placeholder="Выберите тег"
                :options="availableTags"
            />

            <Button
                @click="handleAddTag"
                :disabled="!selectedTagId"
            >
              Добавить
            </Button>

          </div>
        </div>

        <div class="flex items-center gap-2">
          <Separator class="flex-1"/>
          <span class="text-xs text-muted-foreground">или</span>
          <Separator class="flex-1"/>
        </div>

        <!-- Create new tag -->
        <div class="space-y-2">
          <Label>Создать новый тег</Label>
          <TagAdd
              @tag-added="handleAttach"
          />
        </div>
      </div>

    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import ModalDialog from "@/components/dynamics/shadcn/ModalDialog.vue";
import Select from "@/components/dynamics/Dropdown/Select.vue";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Plus} from "lucide-vue-next";
import {Separator} from '@/components/ui/separator'
import {Client} from "@/types/client";
import {computed, ref, onMounted} from "vue";
import type {Tag} from "@/types/tag";
import {useTagFunctions} from "@/composables/Tag/useTagFunctions";
import TagAdd from "@/components/Tag/Add/TagAdd.vue";

interface Props {
  client: Client
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'addedTagToClient', tags: Tag[]): void
}>()

const {
  getAllTags,
  attachClientTag,
} = useTagFunctions()

const allTags = ref<Tag[]>([])

const selectedTagId = ref<string | number | undefined>(undefined)

const availableTags = computed(() => {
  return allTags.value?.filter(
      tag => !props.client.tags?.some(ct => ct.id === tag.id)
  )
})

const modalDialog = ref<{
  close: () => void
} | null>(null)

const closeModal = () => {
  modalDialog.value?.close()
}

const handleAttach = (tag: Tag) => {
  attachClientTag(
      props.client.id,
      {tag_id: tag.id}
  ).then(tags => {
    emit('addedTagToClient', tags)
    closeModal()
  })
}


const handleAddTag = () => {
  const findTag = availableTags.value?.find(i => i.id == selectedTagId.value)

  if (findTag) {
    handleAttach(findTag)
  }
}

onMounted(async () => {
  allTags.value = await getAllTags()
})
</script>