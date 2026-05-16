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
import {ref, onMounted, watch} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import TaskStatus from '@/models/TaskStatus'
import {FormDynamicFieldType} from '@/types/form'

const props = defineProps({
  formData: {
    type: Object as () => TaskStatus,
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

onMounted(async () => {
  buildFormFields()
})


const buildFormFields = () => {
  formFields.value = [
    {
      name: 'is_default',
      label: 'Статус по умолчанию',
      component: 'checkbox',
      description: 'Отметьте, если это статус по умолчанию',
    },
    {
      name: 'name',
      label: 'Название статуса',
      component: 'text',
      type: 'text',
      placeholder: 'Введите название статуса',
      required: true,
    },


    {
      name: 'color',
      label: 'Цвет',
      component: 'color',
      placeholder: 'Выберите цвет для статуса',
      // description: 'Цвет в формате HEX (#RRGGBB)',
    },

    // В случае редактирования можно показать created/updated (только для отображения)
    ...(props.isEdit ? [
      [
        {
          name: 'created_at',
          label: 'Создано',
          component: 'text',
          type: 'text',
          disabled: true,
        },
        {
          name: 'updated_at',
          label: 'Обновлено',
          component: 'text',
          type: 'text',
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
/* при необходимости добавь стили */
</style>
