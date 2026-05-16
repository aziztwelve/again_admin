<template>
  <div>
    <ModalDialog
        :key="renderModal"
        dynamic-style="max-md:min-w-full"
        title="Создать новый статус"
        description="Заполните форму для создания статуса задачи. Укажите название,  цвет, статус по умолчанию."
    >
      <template #trigger>
        <Button variant="outline">
          Добавить
        </Button>
      </template>

      <template #content>
        <TaskStatusAdd
            @created="handleStatusCreated"
        />
      </template>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import ModalDialog from '@/components/dynamics/shadcn/ModalDialog.vue'
import {Button} from '@/components/ui/button'
import TaskStatusAdd from '@/components/orders/tasks/status/TaskStatusAdd.vue' // путь подгони при необходимости
import TaskStatus from '@/models/TaskStatus'

const emit = defineEmits<{ (e: 'created', status: TaskStatus): void }>()

const renderModal = ref(1)

const handleStatusCreated = (status: TaskStatus) => {
  emit('created', status)
  renderModal.value += 1
}
</script>

<style scoped>
</style>
