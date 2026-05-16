<template>

  <DynamicsDataTable
      :data="promoCodes"
      :columns="columns"
      :custom-actions="true"
      :show-print-button="false"
  >
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {Check, X} from 'lucide-vue-next';
import {useDateFormat} from "@/composables/useDateFormat";
import {SegmentPromoCodeBrief} from "@/features/segment/types";
import {useTableColumns} from "@/composables/Table/useTableColumns";
import {DiscountValueLabels, DiscountValueType} from "@/constants/DiscountType";


interface PropsData {
  promoCodes: SegmentPromoCodeBrief[];
}

defineProps<PropsData>();


const {formatDateToRussian} = useDateFormat();


const {createIndexColumn} = useTableColumns()

const columns = [

  createIndexColumn(),
  {
    accessorKey: "code",
    header: "Код",
  },

  {
    accessorKey: "discount_type",
    header: "Тип скидки",
    cell: ({row}: any) => {
      const item: DiscountValueType = row.original.discount_type
      return DiscountValueLabels[item];
    }
  },
  {
    accessorKey: "discount_amount",
    header: "Значение",
    cell: ({row}: any) => {
      return `${row.original.discount_amount} ${row.original.discount_type_label}`;
    }
  },

  {
    accessorKey: "expires_at",
    header: "Окончание",
    cell: ({row}: any) => formatDateToRussian(row.original.expires_at)
  },

  {
    accessorKey: "description",
    header: "Описание",
  },

  {
    accessorKey: "is_active",
    header: "Активен",
    cell: ({row}: any) => {
      return row.original?.is_active
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
];
</script>

<style scoped></style>
