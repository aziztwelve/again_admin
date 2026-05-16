<template>
  <Spinner v-if="isLoading"/>
  <DynamicForm
      v-else
      v-model="props.formData"
      :submit-button-text="props.submitButtonText"
      :fields="formFields"
      :errors="errors"
      :show-submit-button="props.showSubmitButton"
      @submit-form="emit('submitForm')"
  />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import type {SegmentFormData} from '@/features/segment/types'
import {PERIOD_OPTIONS, RECALCULATE_FREQUENCY_OPTIONS} from '@/features/segment/types'
import {Spinner} from "@/components/ui/spinner";

interface SegmentFormFieldsProps {
  formData: SegmentFormData
  showSubmitButton?: boolean
  submitButtonText?: string
}

const props = withDefaults(defineProps<SegmentFormFieldsProps>(), {
  showSubmitButton: true,
  submitButtonText: 'Создать сегмент',
})

const emit = defineEmits(['submitForm'])

const isLoading = ref<boolean>(true)
const errors = ref<Record<string, string>>({})
const formFields = ref<any[]>([])

onMounted(() => {
  buildFormFields()
  isLoading.value = false
})

const buildFormFields = () => {
  formFields.value = [
    // Чекбокс активности
    {
      name: 'is_active',
      component: 'checkbox',
      label: 'Активен',
    },

    // Название и описание
    [
      {
        name: 'name',
        component: 'text',
        type: 'text',
        label: 'Название сегмента',
        required: true,
        placeholder: 'Например: VIP клиенты',
      },
      {
        name: 'recalculate_frequency',
        component: 'select',
        label: 'Частота пересчёта',
        required: true,
        options: RECALCULATE_FREQUENCY_OPTIONS,
        optionLabel: 'label',
        optionValue: 'value',
        placeholder: 'Выберите частоту',
      },
    ],

    // Описание на всю ширину
    {
      name: 'description',
      component: 'textarea',
      label: 'Описание',
      placeholder: 'Опишите критерии сегмента...',
      rows: 3,
    },


    // Период и количество заказов
    [
      {
        name: 'period',
        component: 'select',
        label: 'Период',
        options: PERIOD_OPTIONS,
        optionLabel: 'label',
        optionValue: 'value',
        placeholder: 'Выберите период',
      },
      {
        name: 'min_orders_count',
        component: 'text',
        type: 'number',
        label: 'Мин заказов',
        placeholder: 'Например: 10',
        min: 0,
      },
      {
        name: 'max_orders_count',
        component: 'text',
        type: 'number',
        label: 'Макс заказов',
        placeholder: 'Например: 100',
        min: 0,
      },
    ],

    // Суммы
    [
      {
        name: 'min_total_amount',
        component: 'text',
        type: 'number',
        label: 'Мин сумма покупок (₽)',
        placeholder: 'Например: 50000',
        min: 0,
      },
      {
        name: 'min_average_check',
        component: 'text',
        type: 'number',
        label: 'Мин средний чек (₽)',
        placeholder: 'Например: 5000',
        min: 0,
      },
    ],
  ]
}
</script>