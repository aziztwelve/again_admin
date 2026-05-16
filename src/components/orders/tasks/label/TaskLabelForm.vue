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
import TaskLabel from '@/models/TaskLabel'

const props = defineProps({
  formData: {
    type: Object as () => TaskLabel,
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
      label: 'Название метки',
      component: 'text',
      type: 'text',
      placeholder: 'Введите название метки',
      required: true,
    },

    {
      name: 'color',
      label: 'Цвет',
      component: 'color',
      placeholder: 'Выберите цвет для метки',
    },


  ]
}

const onSubmit = () => {
  emit('submitForm')
}
</script>

<style scoped>
</style>
