<template>
  <div>
    <table class="min-w-full divide-y divide-gray-200 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-3 py-2 text-left w-8">
            <input
              type="checkbox"
              :checked="allChecked"
              :indeterminate="someChecked && !allChecked"
              @change="toggleAll"
              class="rounded border-gray-300"
            />
          </th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">ID</th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Название</th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Артикул</th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Цена</th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Остаток</th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Вариативность</th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Кол-во</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        <tr v-if="!items.length">
          <td colspan="8" class="px-3 py-6 text-center text-gray-400">Нет товаров</td>
        </tr>
        <tr
          v-for="item in items"
          :key="item.id"
          :class="[
            isAlreadySelected(item.id) ? 'bg-gray-50 opacity-50' : 'hover:bg-gray-50',
            isChecked(item.id) ? 'bg-blue-50' : '',
          ]"
        >
          <td class="px-3 py-2">
            <input
              type="checkbox"
              :checked="isChecked(item.id)"
              :disabled="isAlreadySelected(item.id)"
              @change="toggleItem(item)"
              class="rounded border-gray-300"
            />
          </td>
          <td class="px-3 py-2 text-gray-500">{{ item.id }}</td>
          <td class="px-3 py-2 font-medium text-gray-900">
            {{ item.name }}
            <span v-if="isAlreadySelected(item.id)" class="ml-2 text-xs text-green-600">✓ Уже добавлен</span>
          </td>
          <td class="px-3 py-2 text-gray-500">{{ item.sku || '—' }}</td>
          <td class="px-3 py-2 text-gray-700">{{ item.price || 0 }} ₽</td>
          <td class="px-3 py-2 text-gray-700">{{ item.stock_quantity ?? item.stock ?? 0 }}</td>
          <td class="px-3 py-2 text-gray-500">
            <span v-if="item.has_variants">
              📏 размеры{{ item.active_variants_count ? ` (${item.active_variants_count})` : '' }}
            </span>
            <span v-else>—</span>
          </td>
          <td class="px-3 py-2">
            <input
              v-model.number="quantities[item.id]"
              type="number"
              min="1"
              placeholder="1"
              :disabled="isAlreadySelected(item.id)"
              class="w-16 rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Нижняя панель -->
    <div class="mt-3 flex items-center justify-between border-t pt-3">
      <span class="text-sm text-gray-500">
        Выбрано: <strong>{{ checkedItems.length }}</strong>
      </span>
      <Button
        variant="default"
        size="sm"
        :disabled="checkedItems.length === 0"
        @click="addSelected"
      >
        Добавить выбранные ({{ checkedItems.length }})
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, PropType } from "vue";
import { Button } from "@/components/ui/button";

const props = defineProps({
  items: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  selectedList: {
    type: Array as PropType<{ product_id: number; quantity: number }[]>,
    default: () => [],
  },
});

const emits = defineEmits(["addToSelectList", "close"]);

const checkedIds = ref<Set<number>>(new Set());
const quantities = reactive<Record<number, number>>({});

const isAlreadySelected = (id: number) =>
  props.selectedList.some((item) => item.product_id === id);
const isChecked = (id: number) => checkedIds.value.has(id);

const availableItems = computed(() =>
  props.items.filter((item) => !isAlreadySelected(item.id))
);

const allChecked = computed(
  () => availableItems.value.length > 0 && availableItems.value.every((i) => checkedIds.value.has(i.id))
);
const someChecked = computed(() => availableItems.value.some((i) => checkedIds.value.has(i.id)));

const checkedItems = computed(() =>
  props.items.filter((item) => checkedIds.value.has(item.id))
);

const toggleItem = (item: any) => {
  if (isAlreadySelected(item.id)) return;
  const s = new Set(checkedIds.value);
  s.has(item.id) ? s.delete(item.id) : s.add(item.id);
  checkedIds.value = s;
};

const toggleAll = () => {
  if (allChecked.value) {
    checkedIds.value = new Set();
  } else {
    checkedIds.value = new Set(availableItems.value.map((i) => i.id));
  }
};

const addSelected = () => {
  checkedItems.value.forEach((product) => {
    emits("addToSelectList", {
      product,
      quantity: quantities[product.id] || 1,
    });
  });
  checkedIds.value = new Set();
  emits("close");
};
</script>

<style scoped>
input[type="checkbox"]:indeterminate {
  background-color: #6366f1;
}
</style>
