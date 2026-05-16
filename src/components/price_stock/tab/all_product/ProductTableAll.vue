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
    accessorKey: 'cost_price',
    header: 'Цена закупки',
    cell: ({row}: any) => {
      return h(Input, {
        modelValue: row.original.cost_price,
        'onUpdate:modelValue': (value) => {
          row.original.cost_price = Number(value)
        },
        class: 'w-24 text-center border-gray-300 text-sm h-8 px-2 whitespace-nowrap',
        type: 'number',
        min: 0,
        readonly: true,
      });
    },
  },
  {
    accessorKey: 'stock_quantity',
    header: 'Остаток',
    cell: ({row}: any) => {
      return h(Input, {
        modelValue: row.original.stock_quantity,
        'onUpdate:modelValue': (value) => {
          row.original.stock_quantity = Number(value)
        },
        class: 'w-20 text-center border-gray-300 text-sm h-8 px-2',
        type: 'number',
        min: 0,
        readonly: true,
      });
    },
  },

  {
    accessorKey: 'price',
    header: 'Цена продажи',
    cell: ({row}: any) => {
      if (row.original.price && row.original.price <= 0) {
        row.original.changeDiscount = Number(row.original.price);
      }
      return h(Input, {
        modelValue: row.original.price,
        'onUpdate:modelValue': (value) => {
          row.original.price = Number(value)
        },
        class: 'w-24 text-center border-gray-300 text-sm h-8 px-2 whitespace-nowrap',
        type: 'number',
        min: 0,
        readonly: true,
      });
    },
  },

  {
    accessorKey: 'discount_price',
    header: 'Скидка',
  },

]


</script>

<style scoped></style>
