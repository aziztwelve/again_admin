<template>
  <DynamicForm
      v-model="product.marketplace_links"
      :fields="formFields"
      :show-submit-button="false"
      @submit-form=""
  />
</template>

<script setup lang="ts">
import {ref, PropType} from 'vue'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import {FormDynamicFieldType} from "@/types/form";
import {Product} from "@/models/Product";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
})


const formFields = ref<any[]>([
  [
    {
      name: 'wb',
      component: 'text',
      type: 'text',
      label: 'Wildberries',
      required: false,
      placeholder: 'https://wildberries.ru/catalog/...'
    },
    {
      name: 'ozon',
      component: 'text',
      type: 'text',
      label: 'Ozon',
      required: false,
      placeholder: 'https://ozon.ru/product/...'
    },
    {
      name: 'zy',
      component: 'text',
      type: 'text',
      label: 'Золотое яблоко',
      required: false,
      placeholder: 'https://goldapple.ru/product/...'
    }
  ]
])

</script>