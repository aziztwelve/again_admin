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
import { ref, onMounted } from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import { YandexMetrikaSettings } from '@/types/settings/YandexMetrikaSettings'

const props = defineProps<{
  formData: YandexMetrikaSettings
  submitButtonName?: string
}>()

const emit = defineEmits(['submitForm'])

const renderForm = ref(1)
const errors = ref<Record<string, string>>({})
const formFields = ref<any[]>([])

onMounted(() => {
  buildFormFields()
})

const buildFormFields = () => {
  formFields.value = [
    // Первая строка: включение и ID счетчика
    [
      {
        name: 'yandex_metrika_enabled',
        component: 'checkbox',
        label: 'Включить Яндекс.Метрику',
      },
      {
        name: 'yandex_metrika_id',
        component: 'text',
        type: 'text',
        label: 'Номер счетчика',
        required: false,
        placeholder: 'Например: 106361065',
        description: 'ID счетчика Яндекс.Метрики (можно найти в настройках счетчика)'
      },
    ],

    // Заголовок секции опций
    {
      name: 'options_header',
      component: 'enyComponentSlot',
      label: ''
    },

    // Опции Яндекс.Метрики
    [
      {
        name: 'yandex_metrika_webvisor',
        component: 'checkbox',
        label: 'Вебвизор',
        description: 'Записывает действия посетителей на сайте'
      },
      {
        name: 'yandex_metrika_clickmap',
        component: 'checkbox',
        label: 'Карта кликов',
        description: 'Визуализирует клики по элементам страницы'
      },
    ],
    [
      {
        name: 'yandex_metrika_tracklinks',
        component: 'checkbox',
        label: 'Отслеживание внешних ссылок',
        description: 'Отслеживает переходы по внешним ссылкам'
      },
      {
        name: 'yandex_metrika_accurateTrackBounce',
        component: 'checkbox',
        label: 'Точный показатель отказов',
        description: 'Более точный расчет показателя отказов'
      },
    ]
  ]
}
</script>