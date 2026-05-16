<template>
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :custom-actions="true"
  >
    <template #actions="{row}">

    </template>

    <template #actionsVariant="{row}">

    </template>

  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, PropType} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {Product} from "@/models/Product";
import {Input} from "@/components/ui/input";


const props = defineProps({
  items: {
    type: Array as PropType<Product[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);


const columns = [
  {
    accessorKey: 'name',
    header: 'Название',
  },

  {
    accessorKey: 'barcode',
    header: 'Штрих-код',
  },

  {
    accessorKey: 'stock_quantity',
    header: 'Остаток',
  },

]


</script>

<style scoped></style>
