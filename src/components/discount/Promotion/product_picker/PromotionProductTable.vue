<template>
  <div>
    <div class="max-h-[60vh] overflow-auto">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="sticky top-0 bg-gray-50">
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
            <th class="px-1 py-2 w-8"></th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">ID</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Название</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Артикул</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Цена</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Остаток</th>
            <th v-if="withQuantity" class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Кол-во</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-if="!items.length">
            <td :colspan="withQuantity ? 8 : 7" class="px-3 py-6 text-center text-gray-400">Нет товаров</td>
          </tr>

          <template v-for="item in items" :key="item.id">
            <tr
              :class="[
                isWholeAlreadySelected(item.id) ? 'bg-gray-50 opacity-50' : 'hover:bg-gray-50',
                checkedProducts.has(item.id) || checkedVariants[item.id] ? 'bg-blue-50' : '',
              ]"
            >
              <td class="px-3 py-2">
                <input
                  type="checkbox"
                  :checked="checkedProducts.has(item.id)"
                  :indeterminate="!checkedProducts.has(item.id) && !!checkedVariants[item.id]"
                  :disabled="isWholeAlreadySelected(item.id)"
                  @change="toggleProduct(item)"
                  class="rounded border-gray-300"
                />
              </td>
              <td class="px-1 py-2">
                <button v-if="variantsOf(item).length" type="button" class="p-1" :aria-label="`Варианты: ${item.name}`" @click="toggleExpanded(item.id)">
                  <ChevronDown v-if="expanded.has(item.id)" class="h-4 w-4" />
                  <ChevronRight v-else class="h-4 w-4" />
                </button>
              </td>
              <td class="px-3 py-2 text-gray-500">{{ item.id }}</td>
              <td class="px-3 py-2 font-medium text-gray-900">
                <span :class="{ 'cursor-pointer': variantsOf(item).length }" @click="toggleExpanded(item.id)">{{ item.name }}</span>
                <span v-if="variantsOf(item).length" class="ml-2 text-xs font-normal text-gray-400">вариантов: {{ variantsOf(item).length }}</span>
                <span v-if="isWholeAlreadySelected(item.id)" class="ml-2 text-xs text-green-600">✓ Уже добавлен</span>
                <span v-else-if="props.selected[item.id]" class="ml-2 text-xs text-amber-600">Добавлены не все варианты</span>
              </td>
              <td class="px-3 py-2 text-gray-500">{{ item.sku || '—' }}</td>
              <td class="px-3 py-2 text-gray-700">{{ item.price || 0 }} ₽</td>
              <td class="px-3 py-2 text-gray-700">{{ stockOf(item) }}</td>
              <td v-if="withQuantity" class="px-3 py-2">
                <input
                  v-model.number="quantities[item.id]"
                  type="number"
                  min="1"
                  placeholder="1"
                  :disabled="isWholeAlreadySelected(item.id)"
                  class="w-16 rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
                />
              </td>
            </tr>

            <template v-if="expanded.has(item.id)">
              <tr
                v-for="variant in variantsOf(item)"
                :key="`v-${variant.id}`"
                :class="isVariantAlreadySelected(item.id, variant.id) ? 'bg-gray-50 opacity-50' : 'hover:bg-gray-50'"
              >
                <td class="px-3 py-2"></td>
                <td class="px-1 py-2">
                  <input
                    type="checkbox"
                    :checked="checkedProducts.has(item.id) || isVariantChecked(item.id, variant.id) || isVariantAlreadySelected(item.id, variant.id)"
                    :disabled="checkedProducts.has(item.id) || isVariantAlreadySelected(item.id, variant.id)"
                    :aria-label="labelOf(variant)"
                    @change="toggleVariant(item.id, variant.id)"
                    class="rounded border-gray-300"
                  />
                </td>
                <td class="px-3 py-2 text-gray-400">{{ variant.id }}</td>
                <td class="cursor-pointer px-3 py-2 pl-6 text-gray-700" @click="toggleVariant(item.id, variant.id)">
                  ↳ {{ labelOf(variant) }}
                  <span v-if="isVariantAlreadySelected(item.id, variant.id)" class="ml-2 text-xs text-green-600">✓ Уже добавлен</span>
                </td>
                <td class="px-3 py-2 text-gray-500">{{ variant.sku || '—' }}</td>
                <td class="px-3 py-2 text-gray-700">{{ variant.price || 0 }} ₽</td>
                <td class="px-3 py-2 text-gray-700">{{ Number(variant.stock_quantity || 0) }}</td>
                <td v-if="withQuantity" class="px-3 py-2"></td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Нижняя панель -->
    <div class="mt-3 flex items-center justify-between border-t pt-3">
      <span class="text-sm text-gray-500">
        Выбрано: <strong>{{ totalChecked }}</strong>
      </span>
      <Button variant="default" size="sm" type="button" :disabled="totalChecked === 0" @click="addSelected">
        Добавить выбранные ({{ totalChecked }})
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, PropType } from "vue";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-vue-next";
import { variantLabel, type SelectedVariantsMap, type PickedPromotionProduct } from "./types";

const props = defineProps({
  items: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  selected: {
    type: Object as PropType<SelectedVariantsMap>,
    default: () => ({}),
  },
  withQuantity: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits<{
  addToSelectList: [picked: PickedPromotionProduct];
  close: [];
}>();

// Отмеченные в этом окне: товары целиком и отдельные варианты по товарам.
const checkedProducts = ref<Set<number>>(new Set());
const checkedVariants = ref<Record<number, number[]>>({});
const expanded = ref<Set<number>>(new Set());
const quantities = reactive<Record<number, number>>({});

const variantsOf = (item: any): any[] =>
  item.has_variants ? (item.variants || []).filter((v: any) => v.is_active) : [];

const labelOf = (variant: any) => variantLabel(variant, variant.table_color?.name);

const stockOf = (item: any) => {
  const variants = variantsOf(item);
  if (!variants.length) return Number(item.stock_quantity ?? item.stock ?? 0);
  return variants.reduce((sum, v) => sum + Number(v.stock_quantity || 0), 0);
};

// null в selected — товар уже добавлен целиком.
const isWholeAlreadySelected = (productId: number) => props.selected[productId] === null;
const isVariantAlreadySelected = (productId: number, variantId: number) =>
  isWholeAlreadySelected(productId) || !!props.selected[productId]?.includes(variantId);
const isVariantChecked = (productId: number, variantId: number) =>
  !!checkedVariants.value[productId]?.includes(variantId);

const toggleExpanded = (productId: number) => {
  const next = new Set(expanded.value);
  next.has(productId) ? next.delete(productId) : next.add(productId);
  expanded.value = next;
};

const toggleProduct = (item: any) => {
  if (isWholeAlreadySelected(item.id)) return;
  const next = new Set(checkedProducts.value);
  if (next.has(item.id)) {
    next.delete(item.id);
  } else {
    next.add(item.id);
    delete checkedVariants.value[item.id];
  }
  checkedProducts.value = next;
};

const toggleVariant = (productId: number, variantId: number) => {
  if (checkedProducts.value.has(productId) || isVariantAlreadySelected(productId, variantId)) return;
  const current = checkedVariants.value[productId] || [];
  const next = current.includes(variantId) ? current.filter((id) => id !== variantId) : [...current, variantId];
  if (next.length) checkedVariants.value[productId] = next;
  else delete checkedVariants.value[productId];
};

const availableItems = computed(() => props.items.filter((i) => !isWholeAlreadySelected(i.id)));
const allChecked = computed(
  () => availableItems.value.length > 0 && availableItems.value.every((i) => checkedProducts.value.has(i.id)),
);
const someChecked = computed(() =>
  availableItems.value.some((i) => checkedProducts.value.has(i.id) || checkedVariants.value[i.id]),
);

const toggleAll = () => {
  checkedProducts.value = allChecked.value ? new Set() : new Set(availableItems.value.map((i) => i.id));
  checkedVariants.value = {};
};

const totalChecked = computed(
  () => checkedProducts.value.size + Object.values(checkedVariants.value).reduce((sum, ids) => sum + ids.length, 0),
);

const addSelected = () => {
  props.items.forEach((product) => {
    const whole = checkedProducts.value.has(product.id);
    const variantIds = checkedVariants.value[product.id];
    if (!whole && !variantIds) return;

    const labels: Record<number, string> = {};
    variantsOf(product).forEach((v) => (labels[v.id] = labelOf(v)));

    emits("addToSelectList", {
      product,
      variantIds: whole ? null : [...variantIds],
      labels,
      quantity: quantities[product.id] || undefined,
    });
  });
  checkedProducts.value = new Set();
  checkedVariants.value = {};
  emits("close");
};
</script>
