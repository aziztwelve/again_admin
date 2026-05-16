<template>
  <DynamicsDataTable
      v-if="components?.length"
      :data="components"
      :columns="columns"
      :custom-actions="true"
      :loading="loading"
  />
</template>

<script setup lang="ts">
import {PropType} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {CreateRecipeComponent} from "@/models/CreateRecipeComponent";

const props = defineProps({
  components: {
    type: Array as PropType<CreateRecipeComponent[]>,
    default: () => []
  },
  loading: Boolean,
  planned_quantity: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    default: ''
  }
});


const columns = [
  {
    accessorKey: "id",
    header: "№",
    cell: (cell) => cell.row.index + 1,
  },
  {
    accessorKey: "component.name",
    header: "Готовая продукция",
  },

  {
    accessorKey: "quantity",
    header: "Норма",
    cell: ({row}) => {
      return Math.trunc(row.original?.norm_qty) || Math.trunc(row.original?.qty)
    },
  },
  {
    accessorKey: "quantity",
    header: "Запланировано",
    cell: ({row}) => {
      return `${ (Math.trunc(row.original?.norm_qty) || Math.trunc(row.original?.qty)) * Math.trunc(props.planned_quantity)} шт`
    },
  },
  {
    accessorKey: "quantity",
    header: "Произведено",
    cell: ({row}) => {
      // return props.status == 'completed'
      return `${ props.status == 'completed'
          ? ((Math.trunc(row.original?.norm_qty) || Math.trunc(row.original?.qty)) * Math.trunc(props.planned_quantity ) ) : 0} шт`
    },
  },
];


</script>

<style scoped></style>