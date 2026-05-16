<template>
  <DynamicForm
      v-if="!isLoading"
      v-model="props.formData"
      submit-button-text="Создать"
      :key="renderForm"
      :fields="formFields"
      :errors="errors"
      :show-submit-button="submitButtonButton"
      @submit-form="emit('submitForm')"
  />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import {PromoCode} from "@/models/PromoCode";

const props = defineProps({
  formData: {
    type: PromoCode,
    required: true,
  },
  submitButtonButton: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['submitForm'])

const renderForm = ref(1)
const isLoading = ref<boolean>(true)
const errors = ref<Record<string, string>>({})
const formFields = ref<any[]>([])

onMounted(() => {
  buildFormFields()
  isLoading.value = false
})

const buildFormFields = () => {
  formFields.value = [

    {
      name: 'isActive',
      component: 'checkbox',
      label: 'Активен',
    },
    [

      {
        name: 'code',
        component: 'text',
        type: 'text',
        label: 'Код промо',
        required: true,
        placeholder: 'Введите код промокода'
      },
      {
        name: 'maxUses',
        component: 'text',
        type: 'number',
        label: 'Максимальное количество использований',
        placeholder: 'Оставьте пустым для безлимитного',
        min: 1
      }

    ],


    [
      {
        name: 'discountAmount',
        component: 'text',
        type: 'number',
        label: 'Сумма скидки',
        required: true,
        placeholder: 'Введите сумму или %',
        min: 0
      },
      {
        name: 'discountType',
        component: 'select',
        label: 'Тип скидки',
        required: true,
        options: [
          {label: 'Процент', value: 'percentage'},
          {label: 'Фиксированная сумма', value: 'fixed'}
        ],
        optionLabel: 'label',
        optionValue: 'value',
        placeholder: 'Выберите тип'
      },
    ],
    [
      {
        name: 'startsAt',
        component: 'date',
        label: 'Дата начала'
      },
      {
        name: 'expiresAt',
        component: 'date',
        label: 'Дата окончания'
      }
    ],


    {
      name: 'image',
      component: 'text',
      type: 'file',
      label: 'Изображение',
      placeholder: 'Выберите файл изображения',
      accept: 'image/*',
      imagePreview: true
    }


  ]
}
</script>
