<template>
  <Dialog
      :open="dialogOpen"
      @update:open="(value: any) => handleOpenChange(value)"
  >
    <DialogTrigger as-child>
      <!-- Trigger: например кнопка/иконка -->
    </DialogTrigger>
    <DialogContent
        :class="dynamicStyle"
        class="w-full min-h-[100px]: overflow-y-auto flex flex-col items-start max-h-[95vh]"
    >
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div class="w-full">
        <slot name="content"/>
      </div>

      <DialogFooter>
        <slot name="footer"/>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const props = defineProps({
  dialogOpen: Boolean,
  title: String,
  description: {
    type: String,
    default: null,
  },
  dynamicStyle: String,
})

const emits = defineEmits(['update:dialogOpen', 'close'])

function handleOpenChange(value: boolean) {
  // Обновляем привязанный v-model
  // emits('update:dialogOpen', value)
  // Дополнительно кидаем событие close при закрытии
  if (!value) {
    emits('close')
  }
}
</script>

<style scoped></style>
