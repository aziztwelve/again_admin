<template>
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :custom-actions="true"
      :show-print-button="false"
  >
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {useSelectableColumn} from "@/composables/useSelectableColumn";
import {ref} from "vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
});

const pagination = ref({
  per_page: props.items?.length ?? 15,
  page: 1,
})

const {indexColumn} = useSelectableColumn(pagination.value)


const columns = [
  indexColumn,


  {
    accessorKey: "product_name",
    header: "Название",
  },

  {
    accessorKey: "quantity",
    header: "Кол-во",
  },
  {
    header: "Цена",
    accessorKey: "price",
  },

  {
    accessorKey: "subtotal",
    header: "Сумма",
  },

];

</script>

<style scoped></style>
