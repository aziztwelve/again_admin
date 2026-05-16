<template>
  <DynamicForm
      v-model="props.formData"
      :fields="formFields"
      :show-submit-button="true"
      :submit-button-text="submitButtonName"
      @submit-form="emit('submitForm')"
  />
</template>

<script setup lang="ts">
import {ref} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import {FormDynamicFieldType} from "@/types/form";
import {TagFormData} from "@/types/tag";


interface Props {
  formData: TagFormData;
  submitButtonName: string,
}

const props = withDefaults(defineProps<Props>(), {
  submitButtonName: 'Создать'
})

const emit = defineEmits(['submitForm'])


const formFields = ref<FormDynamicFieldType[]>([
  {
    name: 'name',
    component: 'text',
    type: 'text',
    label: 'Название',
    required: true,
    placeholder: 'Введите название'
  },
])


</script>