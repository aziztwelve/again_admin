<template>
  <EditableOrderCell
      :initial-order="initialOrder"
      :min="1"
      :save="save"
      @updated="emits('updated', $event)"
  />
</template>

<script setup lang="ts">
import EditableOrderCell from '@/components/dynamics/EditableOrderCell.vue'
import { useProductOrderFunctions } from '@/composables/useProductOrderFunctions'

const props = defineProps<{
  productId: number
  initialOrder: number
}>()

const emits = defineEmits<{
  (e: 'updated', value: number): void
}>()

const { updateProductOrder } = useProductOrderFunctions()

const save = (value: number) => updateProductOrder(props.productId, value)
</script>
