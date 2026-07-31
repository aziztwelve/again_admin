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

const moneyInput = (row: any, field: string) => h(Input, {
  modelValue: row.original[field],
  'onUpdate:modelValue': (value) => {
    row.original[field] = Number(value)
  },
  class: 'w-24 text-center border-gray-300 text-sm h-8 px-2 whitespace-nowrap',
  type: 'number',
  min: 0,
  readonly: true,
})


const columns = [
  {
    accessorKey: 'name',
    header: 'Название',
  },

  {
    accessorKey: 'price',
    header: 'Цена продажи',
    cell: ({row}: any) => {
      return moneyInput(row, 'price');
    },
  },

  {
    accessorKey: 'discount_percentage',
    header: 'Скидка',
    cell: ({row}: any) => h('span', {class: 'font-medium whitespace-nowrap'}, `${Number(row.original.discount_percentage ?? 0)} %`),
  },

  {
    accessorKey: 'old_price',
    header: 'Цена до скидки',
    cell: ({row}: any) => moneyInput(row, 'old_price'),
  },

  {
    accessorKey: 'barcode',
    header: 'Штрихкод',
  },

]


</script>

<style scoped></style>
