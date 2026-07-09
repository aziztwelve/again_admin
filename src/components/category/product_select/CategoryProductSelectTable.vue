<template>
  <div>
    <table class="min-w-full divide-y divide-gray-200 text-sm">
      <thead class="bg-gray-50">
      <tr>
        <th class="px-3 py-2 text-left w-8">
          <input
              type="checkbox"
              :checked="allVisibleChecked"
              :indeterminate="someVisibleChecked && !allVisibleChecked"
              class="rounded border-gray-300"
              @change="toggleVisible"
          />
        </th>
        <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">ID</th>
        <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Название</th>
        <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Остаток</th>
        <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Код</th>
        <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Активен</th>
      </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
      <tr v-if="!items.length">
        <td colspan="6" class="px-3 py-6 text-center text-gray-400">
          Нет товаров
        </td>
      </tr>

      <tr
          v-for="item in items"
          :key="item.id"
          :class="isChecked(item.id) ? 'bg-blue-50' : 'hover:bg-gray-50'"
      >
        <td class="px-3 py-2">
          <input
              type="checkbox"
              :checked="isChecked(item.id)"
              class="rounded border-gray-300"
              @change="toggleProduct(item)"
          />
        </td>
        <td class="px-3 py-2 text-gray-500">{{ item.id }}</td>
        <td class="px-3 py-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-medium text-gray-900">{{ item.name }}</span>
            <span
                v-if="isProductOutOfStock(item)"
                class="inline-flex items-center rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 whitespace-nowrap"
            >
              Нет в наличии
            </span>
          </div>
        </td>
        <td class="px-3 py-2 text-gray-500">{{ getProductStockQuantity(item) }}</td>
        <td class="px-3 py-2 text-gray-500">{{ item.code || "—" }}</td>
        <td class="px-3 py-2">
          <Check v-if="item.is_active" class="h-4 w-4 text-green-500"/>
          <X v-else class="h-4 w-4 text-red-500"/>
        </td>
      </tr>
      </tbody>
    </table>

    <div class="mt-3 flex items-center justify-between border-t pt-3">
      <span class="text-sm text-gray-500">
        Выбрано: <strong>{{ selectedIds.length }}</strong>
      </span>
      <Button variant="default" size="sm" type="button" @click="emits('done')">
        Готово
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, PropType} from "vue";
import {Button} from "@/components/ui/button";
import {Check, X} from "lucide-vue-next";
import {Product} from "@/models/Product";
import {getProductStockQuantity, isProductOutOfStock} from "@/utils/productStock";

const props = defineProps({
  items: {
    type: Array as PropType<Product[]>,
    default: () => [],
  },
  selectedIds: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});

const emits = defineEmits<{
  (e: "update:selectedIds", ids: number[]): void;
  (e: "done"): void;
}>();

const isChecked = (productId: number | null) => {
  return productId !== null && props.selectedIds.includes(productId);
};

const toggleProduct = (product: Product) => {
  if (!product.id) return;

  const ids = new Set(props.selectedIds);
  ids.has(product.id) ? ids.delete(product.id) : ids.add(product.id);
  emits("update:selectedIds", Array.from(ids));
};

const visibleIds = computed(() =>
    props.items
        .map((item) => item.id)
        .filter((id): id is number => typeof id === "number")
);

const allVisibleChecked = computed(() =>
    visibleIds.value.length > 0 && visibleIds.value.every((id) => props.selectedIds.includes(id))
);

const someVisibleChecked = computed(() =>
    visibleIds.value.some((id) => props.selectedIds.includes(id))
);

const toggleVisible = () => {
  const ids = new Set(props.selectedIds);

  if (allVisibleChecked.value) {
    visibleIds.value.forEach((id) => ids.delete(id));
  } else {
    visibleIds.value.forEach((id) => ids.add(id));
  }

  emits("update:selectedIds", Array.from(ids));
};
</script>

<style scoped>
input[type="checkbox"]:indeterminate {
  background-color: #6366f1;
}
</style>
