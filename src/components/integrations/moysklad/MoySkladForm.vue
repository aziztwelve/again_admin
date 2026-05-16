<template>
  <DynamicForm
      v-model="props.formData"
      :key="renderForm"
      :fields="formFields"
      :errors="errors"
      :show-submit-button="true"
      :submit-button-text="submitButtonName"
      @submit-form="emit('submitForm')"
  />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'

import {MoyskladSettings} from "@/models/MoyskladSettings";

const props = defineProps({
  formData: {
    type: MoyskladSettings,
    required: true,
  },
  submitButtonName: {
    type: String,
    default: 'Синхронизировать'
  }
})

const emit = defineEmits(['submitForm'])

const renderForm = ref(1)
const errors = ref<Record<string, string>>({})
const formFields = ref<any[]>([])

onMounted(() => {
  buildFormFields()
})

const buildFormFields = () => {
  formFields.value = [
    {
      name: 'email',
      component: 'text',
      type: 'email',
      label: 'Email',
      required: true,
      placeholder: 'Введите email от МойСклад'
    },
    {
      name: 'password',
      component: 'text',
      type: 'password',
      label: 'Пароль',
      required: true,
      placeholder: 'Введите пароль от МойСклад'
    },
  ]
}
</script>
