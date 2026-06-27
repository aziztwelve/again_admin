<template>
  <DialogModal ref="modalRef" title="Каналы маркетинга">
    <template #button>
      <span class="hidden"></span>
    </template>

    <template #content>
      <div class="space-y-4">
        <!-- Добавление канала -->
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-600 mb-1">Название</label>
            <Input v-model="newChannel.name" placeholder="Например: Pinterest"/>
          </div>
          <div class="w-32">
            <label class="block text-xs font-medium text-gray-600 mb-1">Код</label>
            <Input v-model="newChannel.code" placeholder="pinterest"/>
          </div>
          <Button :disabled="sending || !newChannel.name || !newChannel.code" @click="add">Добавить</Button>
        </div>

        <!-- Список каналов -->
        <div class="border border-gray-200 rounded-md divide-y max-h-[320px] overflow-y-auto">
          <div
              v-for="c in channels"
              :key="c.id"
              class="flex items-center justify-between px-3 py-2 text-sm"
          >
            <div>
              <span class="font-medium">{{ c.name }}</span>
              <span class="text-gray-400 ml-2">{{ c.code }}</span>
              <span v-if="c.is_system" class="ml-2 text-xs text-gray-400">(системный)</span>
            </div>
            <button
                v-if="!c.is_system"
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                title="Удалить"
                @click="remove(c)"
            >
              <Trash2 class="h-4 w-4"/>
            </button>
          </div>
          <div v-if="!channels.length" class="px-3 py-4 text-center text-sm text-gray-400">
            Нет каналов
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
import type {CreateMarketingChannelRequest, MarketingChannel} from '@/types/utm'

defineProps<{
  channels: MarketingChannel[]
}>()

const emit = defineEmits<{
  (e: 'changed'): void
}>()

const {createChannel, deleteChannel, sending} = useUtmFunctions()

const modalRef = ref<{ closeModal: () => void; openModal: () => void } | null>(null)
const newChannel = ref<CreateMarketingChannelRequest>({name: '', code: ''})

const open = () => modalRef.value?.openModal()

const add = async () => {
  try {
    await createChannel(newChannel.value)
    newChannel.value = {name: '', code: ''}
    emit('changed')
  } catch (e) { /* обработано */ }
}

const remove = async (channel: MarketingChannel) => {
  if (!confirm(`Удалить канал «${channel.name}»?`)) return
  try {
    await deleteChannel(channel.id)
    emit('changed')
  } catch (e) { /* обработано */ }
}

defineExpose({open})
</script>
