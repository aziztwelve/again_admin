<template>
  <div v-if="description" class="max-w-xs">
    <p class="whitespace-pre-wrap break-words" :class="{'line-clamp-2': isLong}">
      {{ description }}
    </p>
    <Dialog v-if="isLong" v-model:open="isOpen">
      <DialogTrigger as-child>
        <button class="mt-1 text-xs text-blue-600 hover:underline" type="button">Показать всё</button>
      </DialogTrigger>
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Описание задачи</DialogTitle>
        </DialogHeader>
        <div class="max-h-[60vh] overflow-y-auto whitespace-pre-wrap break-words text-sm text-gray-700">
          {{ description }}
        </div>
        <DialogFooter>
          <button class="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" type="button" @click="isOpen = false">
            Скрыть
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  <span v-else>—</span>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog'

const props = defineProps<{description?: string | null}>()
const isOpen = ref(false)
const isLong = computed(() => (props.description?.length ?? 0) > 120)
</script>
