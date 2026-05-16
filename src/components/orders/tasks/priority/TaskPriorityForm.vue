<template>
  <DynamicForm
      v-model="props.formData"
      :key="renderForm"
      :fields="formFields"
      :submit-button-text="submitButtonName"
      :show-submit-button="showSubmitButton"
      @submit-form="onSubmit"
  />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import TaskPriority from '@/models/TaskPriority'

const props = defineProps({
  formData: {
    type: Object as () => TaskPriority,
    required: true,
  },
  submitButtonName: {
    type: String,
    default: 'Создать'
  },
  showSubmitButton: {
    type: Boolean,
    default: true
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submitForm'])

const renderForm = ref(1)
const formFields = ref<any[]>([])

onMounted(() => {
  buildFormFields()
})

const buildFormFields = () => {
  formFields.value = [
    {
      name: 'name',
      label: 'Название приоритета',
      component: 'text',
      type: 'text',
      placeholder: 'Введите название приоритета',
      required: true,
    },

    {
      name: 'level',
      label: 'Уровень',
      component: 'text',
      type: 'number',
      placeholder: 'Введите уровень приоритета (целое число)',
      required: true,
    },

    {
      name: 'color',
      label: 'Цвет',
      component: 'color',
      placeholder: 'Выберите цвет для приоритета',
    },

    ...(props.isEdit ? [
      [
        {
          name: 'created_at',
          label: 'Создано',
          component: 'date',
          type: 'text',
        },
        {
          name: 'updated_at',
          label: 'Обновлено',
          component: 'date',
          disabled: true,
        },
      ],
    ] : []),
  ]
}

const onSubmit = () => {
  emit('submitForm')
}
</script>

<style scoped>
</style>
