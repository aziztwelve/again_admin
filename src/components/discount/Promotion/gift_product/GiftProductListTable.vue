<template>
  <DynamicsDataTable :data="items" :columns="columns" :custom-actions="true">
    <template #actions="{ row }">
      <div class="flex items-center gap-2">
        <Input
          v-model.number="quantities[row.original.id]"
          type="number"
          min="1"
          placeholder="Кол-во"
          class="w-20"
        />
        <Button
          variant="outline"
          size="sm"
          @click="handleAddToList(row.original)"
          :disabled="isSelected(row.original.id)"
        >
          {{ isSelected(row.original.id) ? "Добавлено" : "Добавить" }}
        </Button>
      </div>
    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const props = defineProps({
  items: {
    type: Array as PropType<any[]>,
    default: [],
  },
  selectedList: {
    type: Array as PropType<{ product_id: number; quantity: number }[]>,
    default: [],
  },
  loading: Boolean,
});

const emits = defineEmits(["addToSelectList"]);

const quantities = ref<Record<number, number>>({});

const handleAddToList = (product: any) => {
  if (!isSelected(product.id)) {
    const quantity = quantities.value[product.id] || 1;
    emits("addToSelectList", {
      product: product,
      quantity: quantity,
    });
  }
};

const isSelected = (productId: number) => {
  return props.selectedList.some((item) => item.product_id === productId);
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
    accessorKey: "stock_quantity",
    header: "Остаток",
    cell: ({ row }: any) =>
      row.original.stock_quantity ?? row.original.stock ?? 0,
  },
  {
    id: "variants",
    header: "Вариативность",
    cell: ({ row }: any) => {
      // Если у товара включён флаг has_variants — клиент сам выберет размер
      // на странице оформления заказа из активных вариантов с stock > 0.
      if (!row.original.has_variants) return "—";
      const count = row.original.active_variants_count;
      const label = count
        ? `📏 размеры (${count})`
        : "📏 размеры";
      return label;
    },
  },
];
</script>

<style scoped></style>
