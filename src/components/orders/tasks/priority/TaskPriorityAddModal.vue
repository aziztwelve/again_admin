<template>
  <div>
    <ModalDialog
        :key="renderModal"
        dynamic-style="max-md:min-w-full"
        title="Создать новый приоритет"
        description="Заполните форму для создания приоритета задачи. Укажите название, цвет и уровень."
    >
      <template #trigger>
        <Button variant="outline">
          Добавить
        </Button>
      </template>

      <template #content>
        <TaskPriorityAdd
            @created="handlePriorityCreated"
        />
      </template>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import ModalDialog from '@/components/dynamics/shadcn/ModalDialog.vue'
import {Button} from '@/components/ui/button'
import TaskPriorityAdd from '@/components/orders/tasks/priority/TaskPriorityAdd.vue'
import TaskPriority from '@/models/TaskPriority'

const emit = defineEmits<{ (e: 'created', priority: TaskPriority): void }>()

const renderModal = ref(1)

const handlePriorityCreated = (priority: TaskPriority) => {
  emit('created', priority)
  renderModal.value += 1
}
</script>

<style scoped>
</style>
