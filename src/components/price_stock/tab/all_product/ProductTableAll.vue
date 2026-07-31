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

const formatMoney = (value: number | string | null | undefined) => {
  return `${Number(value ?? 0).toLocaleString('ru-RU')} ₽`
}

const moneyInput = (row: any, field: string, width = 'w-24') => h(Input, {
  modelValue: row.original[field],
  'onUpdate:modelValue': (value) => {
    row.original[field] = Number(value)
  },
  class: `${width} text-center border-gray-300 text-sm h-8 px-2 whitespace-nowrap`,
  type: 'number',
  min: 0,
  readonly: true,
})

const stockInput = (row: any) => h('div', {class: 'flex items-center gap-1'}, [
  h(Input, {
    modelValue: row.original.stock_quantity,
    'onUpdate:modelValue': (value) => {
      row.original.stock_quantity = Number(value)
    },
    class: 'w-20 text-center border-gray-300 text-sm h-8 px-2',
    type: 'number',
    min: 0,
    readonly: true,
  }),
  h('span', {class: 'text-xs text-gray-400'}, 'шт'),
])


const columns = [
  {
    accessorKey: 'name',
    header: 'Название',
  },

  {
    accessorKey: 'cost_price',
    header: 'Себестоимость',
    cell: ({row}: any) => {
      return h('span', {class: 'text-blue-600 whitespace-nowrap'}, formatMoney(row.original.cost_price));
    },
  },

  {
    accessorKey: 'stock_quantity',
    header: 'МойСклад',
    cell: ({row}: any) => {
      return stockInput(row);
    },
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
