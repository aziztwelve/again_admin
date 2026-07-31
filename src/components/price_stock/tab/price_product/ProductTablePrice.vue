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
import {Monitor} from "lucide-vue-next";


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
    id: 'online-store',
    header: () => groupHeader(Monitor, 'Мой интернет-магазин'),
    meta: {
      headerClass: 'text-center bg-gray-100 border-l',
    },
    columns: [
      {
        accessorKey: 'price',
        header: 'Цена продажи',
        meta: {
          headerClass: 'bg-gray-100 border-l',
          cellClass: 'bg-gray-100 border-l',
        },
        cell: ({row}: any) => {
          return moneyInput(row, 'price');
        },
      },

      {
        accessorKey: 'discount_percentage',
        header: 'Скидка',
        meta: {
          headerClass: 'bg-gray-100',
          cellClass: 'bg-gray-100',
        },
        cell: ({row}: any) => h('span', {class: 'font-medium whitespace-nowrap'}, `${Number(row.original.discount_percentage ?? 0)} %`),
      },

      {
        accessorKey: 'old_price',
        header: 'Цена до скидки',
        meta: {
          headerClass: 'bg-gray-100',
          cellClass: 'bg-gray-100',
        },
        cell: ({row}: any) => moneyInput(row, 'old_price'),
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
