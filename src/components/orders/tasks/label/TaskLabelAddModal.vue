<template>
  <div>
    <ModalDialog
        :key="renderModal"
        dynamic-style="max-md:min-w-full"
        title="Создать новую метку задачи"
        description="Заполните форму для создания метки задачи. Укажите название и цвет."
    >
      <template #trigger>
        <Button variant="outline">
          Добавить
        </Button>
      </template>

      <template #content>
        <TaskLabelAdd
            @created="handleLabelCreated"
        />
      </template>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModalDialog from '@/components/dynamics/shadcn/ModalDialog.vue'
import { Button } from '@/components/ui/button'
import TaskLabelAdd from '@/components/orders/tasks/label/TaskLabelAdd.vue'
import TaskLabel from '@/models/TaskLabel'

const emit = defineEmits<{ (e: 'created', label: TaskLabel): void }>()

const renderModal = ref(1)

const handleLabelCreated = (label: TaskLabel) => {
  emit('created', label)
  renderModal.value += 1
}
</script>

<style scoped>
</style>
