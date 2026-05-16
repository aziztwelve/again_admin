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
import type {OtoBannerFormData} from '@/features/oto-banner/types'
import {
  OTO_BANNER_STATUS_OPTIONS,
  OTO_BANNER_DEVICE_TYPE_OPTIONS,
  OTO_BANNER_INPUT_FIELD_TYPE_OPTIONS,
} from '@/features/oto-banner/types'
import {Spinner} from "@/components/ui/spinner"
import {usePromoCodeFunctions} from "@/composables/usePromoCodeFunctions";

interface OtoBannerFormProps {
  formData: OtoBannerFormData
  showSubmitButton?: boolean
  submitButtonText?: string
}

const props = withDefaults(defineProps<OtoBannerFormProps>(), {
  showSubmitButton: true,
  submitButtonText: 'Создать баннер',
})

const emit = defineEmits<{
  (e: 'submitForm'): void
}>()

const {getPromoCodes} = usePromoCodeFunctions()
const loadingPromos = ref(false)
const promoCodes = ref<any[]>([])

const isLoading = ref<boolean>(true)
const errors = ref<Record<string, string>>({})
const formFields = ref<any[]>([])

onMounted(async () => {
  await loadPromoCodes()
  buildFormFields()
  isLoading.value = false
})


const loadPromoCodes = async () => {
  loadingPromos.value = true
  try {
    const res = await getPromoCodes({
      is_active: true,
      per_page: 100,  // или сколько нужно
    })
    if (res) {
      promoCodes.value = res.data || []
    }
  } catch (e) {
    console.error('Ошибка загрузки промокодов', e)
  } finally {
    loadingPromos.value = false
  }
}

const buildFormFields = () => {
  formFields.value = [
    // Чекбокс активности
    {
      name: 'status',
      component: 'select',
      label: 'Статус',
      required: true,
      options: OTO_BANNER_STATUS_OPTIONS,
      optionLabel: 'label',
      optionValue: 'value',
    },

    // Название и тип устройства
    [
      {
        name: 'name',
        component: 'text',
        type: 'text',
        label: 'Название баннера',
        required: true,
        placeholder: 'Например: Скидка 15% на первый заказ',
      },
      {
        name: 'device_type',
        component: 'select',
        label: 'Тип устройства',
        required: true,
        options: OTO_BANNER_DEVICE_TYPE_OPTIONS,
        optionLabel: 'label',
        optionValue: 'value',
      },
    ],

    // Изображение
    {
      name: 'image',
      component: 'text',
      type: 'file',
      label: 'Изображение баннера',
      required: false,
      accept: 'image/jpeg,image/jpg,image/png,image/webp',
      description: 'Рекомендуемый размер: 800x600px. Максимум 5MB',
    },

    // Заголовок и подзаголовок
    [
      {
        name: 'title',
        component: 'text',
        type: 'text',
        label: 'Заголовок',
        placeholder: 'Например: Получите скидку 15%',
      },
      {
        name: 'subtitle',
        component: 'text',
        type: 'text',
        label: 'Подзаголовок',
        placeholder: 'Например: Подпишитесь на рассылку',
      },
    ],

    // Настройки кнопки
    {
      name: 'button_enabled',
      component: 'checkbox',
      label: 'Показывать кнопку действия',
    },

    {
      name: 'button_text',
      component: 'text',
      type: 'text',
      label: 'Текст кнопки',
      placeholder: 'Например: Подписаться',
    },

    // Настройки поля ввода
    {
      name: 'input_field_enabled',
      component: 'checkbox',
      label: 'Показывать поле ввода',
    },
    {
      name: 'input_field_required',
      component: 'checkbox',
      label: 'Поле обязательно',
    },
    [
      {
        name: 'input_field_type',
        component: 'select',
        label: 'Тип поля ввода',
        options: OTO_BANNER_INPUT_FIELD_TYPE_OPTIONS,
        optionLabel: 'label',
        optionValue: 'value',
      },

      {
        name: 'input_field_placeholder',
        component: 'text',
        type: 'text',
        label: 'Placeholder поля',
        placeholder: 'Например: example@mail.com',
      },
    ],


    // Задержка показа
    [
      {
        name: 'display_delay_seconds',
        component: 'text',
        type: 'number',
        label: 'Задержка перед показом (секунды)',
        placeholder: '0',
        min: 0,
        max: 3600,
      },


      {
        name: 'promo_code_id',
        component: 'select',
        label: 'Привязанный промокод',
        required: false,
        options: promoCodes.value.map(p => ({
          value: p.id,
          label: `${p.code} - ${p.discountType === 'percentage' ? p.discountAmount + '%' : p.discountAmount + '₽'}`
        })),
        optionLabel: 'label',
        optionValue: 'value',
        placeholder: 'Выберите промокод (опционально)',
        description: loadingPromos.value
            ? 'Загрузка промокодов...'
            : promoCodes.value.length === 0
                ? 'Активных промокодов нет'
                : 'Клиент получит выбранный промокод после заявки',
        disabled: loadingPromos.value || promoCodes.value.length === 0,
      },

    ],


    // Текст политики
    {
      name: 'privacy_text',
      component: 'textarea',
      label: 'Текст политики конфиденциальности',
      placeholder: 'Нажимая на кнопку, вы соглашаетесь с условиями...',
      rows: 3,
    },


  ]
}
</script>