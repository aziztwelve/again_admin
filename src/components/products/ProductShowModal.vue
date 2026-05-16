<template>
  <DialogModal
      title="Товары"
      @dialog-open="emit('dialogOpen')"
      dynamic-style="md:min-w-[80%] md:min-h-[50vh]"
  >
    <template #button>
      <IconButtons :buttons="[
          {type: 'view'}
      ]"/>
    </template>

    <template #content>
      <ProductListTable
          :key="renderTable"
          :items="products"
          :show-action-button="false"
          :showPrint="false"
      />
    </template>

  </DialogModal>
</template>

<script setup lang="ts">
import DialogModal from "@/components/dynamics/shadcn/DialogModal.vue";
import {PropType, ref, watch} from "vue";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import ProductListTable from "@/components/products/list/ProductListTable.vue";
import type {Product} from "@/models/Product";

const emit = defineEmits(["dialogOpen"]);

const props = defineProps({
  products: {
    type: Array as PropType<Product[]>,
    required: true
  }
})

const renderTable = ref(1)

watch(
    () => props.products,
    () => renderTable.value++
)

</script>

<style scoped>

</style>
