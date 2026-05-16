<template>
  <DynamicsDataTable :data="items" :columns="columns" :custom-actions="true">
    <template #actions="{ row }">
      <Button
        variant="outline"
        size="sm"
        @click="handleAddToList(row.original)"
        :disabled="isSelected(row.original.id)"
      >
        {{ isSelected(row.original.id) ? "Добавлено" : "Добавить" }}
      </Button>
    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import { Button } from "@/components/ui/button";

const props = defineProps({
  items: {
    type: Array as PropType<any[]>,
    default: [],
  },
  selectedList: {
    type: Array as PropType<number[]>,
    default: [],
  },
  loading: Boolean,
});

const emits = defineEmits(["addToSelectList"]);

const handleAddToList = (product: any) => {
  if (!isSelected(product.id)) {
    emits("addToSelectList", product);
  }
};

const isSelected = (productId: number) => {
  return props.selectedList.includes(productId);
};

const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "sku",
    header: "Артикул",
  },
  {
    accessorKey: "price",
    header: "Цена",
    cell: ({ row }: any) => `${row.original.price || 0}₽`,
  },
  {
    accessorKey: "stock",
    header: "Остаток",
    cell: ({ row }: any) => row.original.stock || 0,
  },
];
</script>

<style scoped></style>
