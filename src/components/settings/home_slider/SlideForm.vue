<template>
  <DynamicForm
      v-model="props.formData"
      submit-button-text="Создать"
      :show-submit-button="props.showButton"
      :key="renderForm"
      :fields="formFields"
      @submit-form="emit('submitForm', )"
  />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import HomeSlider from '@/models/HomeSlider'

const props = defineProps({
  formData: {
    type: HomeSlider,
    required: true,
  },
  submitButtonName: {
    type: String,
    default: 'Сохранить'
  },
  showButton: {
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
    [
      {name: 'order', component: 'text', placeholder: 'Порядок', type: 'number', label: 'Порядок отображения'},
      {name: 'is_active', component: 'checkbox', label: 'Активен'},
    ],
    [
      {name: 'title', component: 'text', placeholder: 'Заголовок', label: 'Заголовок'},
      {name: 'subtitle', component: 'text', placeholder: 'Подзаголовок', label: 'Подзаголовок'},
    ],

    {name: 'text', component: 'textarea', placeholder: 'Текст', label: 'Текст'},

    // Desktop изображение
    {
      name: 'image',
      component: 'text',
      type: 'file',
      label: 'Изображение для Desktop',
      placeholder: 'Изображение для Desktop',
      accept: 'image/*',
      cropperAspectRatio: 1920 / 920,
      cropperShow: false,
      description: 'Рекомендуемый размер: 1920x920px'
    },

    // Mobile изображение
    {
      name: 'image_mobile',
      component: 'text',
      type: 'file',
      label: 'Изображение для Mobile (опционально)',
      placeholder: 'Изображение для Mobile',
      accept: 'image/*',
      cropperAspectRatio: 640 / 800,
      cropperShow: false,
      description: 'Рекомендуемый размер: 640x800px. Если не загружено, будет использовано desktop изображение'
    }
  ]
}
</script>