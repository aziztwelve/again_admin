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
import {Warehouse} from "lucide-vue-next";


const props = defineProps({
  items: {
    type: Array as PropType<Product[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

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

const groupHeader = (icon: any, label: string) => h('div', {
  class: 'flex items-center justify-center gap-2 text-xs font-semibold whitespace-nowrap'
}, [
  h(icon, {class: 'h-4 w-4'}),
  h('span', label),
])

const columns = [
  {
    accessorKey: 'name',
    header: 'Название',
  },

  {
    id: 'warehouse',
    header: () => groupHeader(Warehouse, 'Мои склады'),
    meta: {
      headerClass: 'text-center bg-gray-50 border-l',
    },
    columns: [
      {
        accessorKey: 'stock_quantity',
        header: 'МойСклад',
        meta: {
          headerClass: 'bg-gray-50 border-l',
          cellClass: 'bg-gray-50 border-l',
        },
        cell: ({row}: any) => {
          return stockInput(row);
        },
      },
    ],
  },

  {
    accessorKey: 'barcode',
    header: 'Штрихкод',
  },

]


</script>

<style scoped></style>
