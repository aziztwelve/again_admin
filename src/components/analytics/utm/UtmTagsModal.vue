<template>
  <DialogModal ref="modalRef" title="Теги UTM-меток">
    <template #button>
      <span class="hidden"></span>
    </template>

    <template #content>
      <div class="space-y-4">
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-600 mb-1">Название тега</label>
            <Input v-model="newTagName" placeholder="Например: Блогер1"/>
          </div>
          <Button :disabled="sending || !newTagName" @click="add">Добавить</Button>
        </div>

        <div class="border border-gray-200 rounded-md divide-y max-h-[320px] overflow-y-auto">
          <div
              v-for="t in tags"
              :key="t.id"
              class="flex items-center justify-between px-3 py-2 text-sm"
          >
            <span class="font-medium">{{ t.name }}</span>
            <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                title="Удалить"
                @click="remove(t)"
            >
              <Trash2 class="h-4 w-4"/>
            </button>
          </div>
          <div v-if="!tags.length" class="px-3 py-4 text-center text-sm text-gray-400">
            Нет тегов
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <Button variant="outline" @click="modalRef?.closeModal()">Закрыть</Button>
    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Trash2} from 'lucide-vue-next'
import DialogModal from '@/components/dynamics/shadcn/DialogModal.vue'
import {useUtmFunctions} from '@/composables/useUtmFunctions'
import type {UtmTag} from '@/types/utm'

defineProps<{
  tags: UtmTag[]
}>()

const emit = defineEmits<{
  (e: 'changed'): void
}>()

const {createTag, deleteTag, sending} = useUtmFunctions()

const modalRef = ref<{ closeModal: () => void; openModal: () => void } | null>(null)
const newTagName = ref('')

const open = () => modalRef.value?.openModal()

const add = async () => {
  try {
    await createTag({name: newTagName.value})
    newTagName.value = ''
    emit('changed')
  } catch (e) { /* обработано */ }
}

const remove = async (tag: UtmTag) => {
  if (!confirm(`Удалить тег «${tag.name}»?`)) return
  try {
    await deleteTag(tag.id)
    emit('changed')
  } catch (e) { /* обработано */ }
}

defineExpose({open})
</script>
