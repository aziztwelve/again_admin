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
          <th class="px-3 py-2 text-left w-8"></th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
            ID
          </th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
            Название
          </th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
            Код
          </th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
            Штрих-код
          </th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
            Активен
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        <tr v-if="!items.length">
          <td colspan="7" class="px-3 py-6 text-center text-gray-400">
            Нет товаров
          </td>
        </tr>

        <template v-for="item in items" :key="item.id">
          <tr
            :class="[
              isWholeAlreadySelected(item.id)
                ? 'bg-gray-50 opacity-50'
                : 'hover:bg-gray-50',
              isProductChecked(item.id) ? 'bg-blue-50' : '',
            ]"
          >
            <td class="px-3 py-2">
              <input
                type="checkbox"
                :checked="isProductChecked(item.id)"
                :disabled="isWholeAlreadySelected(item.id)"
                @change="toggleProduct(item)"
                class="rounded border-gray-300"
              />
            </td>
            <td class="px-3 py-2">
              <button
                v-if="hasVariants(item)"
                type="button"
                class="p-1"
                @click="toggleExpanded(item.id)"
              >
                <ChevronDown v-if="isExpanded(item.id)" class="w-4 h-4" />
                <ChevronRight v-else class="w-4 h-4" />
              </button>
            </td>
            <td class="px-3 py-2 text-gray-500">{{ item.id }}</td>
            <td class="px-3 py-2 font-medium text-gray-900">
              {{ item.name }}
              <span
                v-if="isWholeAlreadySelected(item.id)"
                class="ml-2 text-xs text-green-600"
                >✓ Уже добавлен</span
              >
              <span
                v-else-if="hasPartialSelection(item.id)"
                class="ml-2 text-xs text-amber-600"
                >Выбраны не все варианты</span
              >
            </td>
            <td class="px-3 py-2 text-gray-500">{{ item.code || "—" }}</td>
            <td class="px-3 py-2 text-gray-500">{{ item.barcode || "—" }}</td>
            <td class="px-3 py-2">
              <Check
                v-if="item.is_active"
                class="h-4 w-4 text-green-500"
              />
              <X v-else class="h-4 w-4 text-red-500" />
            </td>
          </tr>

          <template v-if="hasVariants(item) && isExpanded(item.id)">
            <tr
              v-for="variant in item.variants"
              :key="`v-${variant.id}`"
              :class="[
                isVariantAlreadySelected(item.id, variant.id) ||
                isWholeAlreadySelected(item.id)
                  ? 'bg-gray-50 opacity-50'
                  : 'hover:bg-gray-50',
                isVariantChecked(item.id, variant.id) ? 'bg-blue-50' : '',
              ]"
            >
              <td class="px-3 py-2 pl-10">
                <input
                  type="checkbox"
                  :checked="isVariantChecked(item.id, variant.id)"
                  :disabled="
                    isVariantAlreadySelected(item.id, variant.id) ||
                    isWholeAlreadySelected(item.id) ||
                    isProductChecked(item.id)
                  "
                  @change="toggleVariant(item, variant)"
                  class="rounded border-gray-300"
                />
              </td>
              <td class="px-3 py-2"></td>
              <td class="px-3 py-2 text-gray-500">{{ variant.id }}</td>
              <td class="px-3 py-2 text-gray-700 pl-4">
                ↳ {{ variant.name }}
                <span
                  v-if="isVariantAlreadySelected(item.id, variant.id)"
                  class="ml-2 text-xs text-green-600"
                  >✓ Уже добавлен</span
                >
              </td>
              <td class="px-3 py-2 text-gray-500">{{ variant.code || "—" }}</td>
              <td class="px-3 py-2 text-gray-500">
                {{ variant.barcode || "—" }}
              </td>
              <td class="px-3 py-2">
                <Check
                  v-if="variant.is_active"
                  class="h-4 w-4 text-green-500"
                />
                <X v-else class="h-4 w-4 text-red-500" />
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>

    <!-- Нижняя панель -->
    <div class="mt-3 flex items-center justify-between border-t pt-3">
      <span class="text-sm text-gray-500">
        Выбрано: <strong>{{ totalCheckedCount }}</strong>
      </span>
      <Button
        variant="default"
        size="sm"
        :disabled="totalCheckedCount === 0"
        @click="addSelected"
      >
        Добавить выбранные ({{ totalCheckedCount }})
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from "vue";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronDown, ChevronRight } from "lucide-vue-next";
import { Product } from "@/models/Product";

const props = defineProps({
  items: {
    type: Array as PropType<Product[]>,
    default: () => [],
  },
  selectedList: {
    type: Array as PropType<Product[]>,
    default: () => [],
  },
});

const emits = defineEmits(["addProducts"]);

// Локально отмеченные продукты целиком (все варианты)
const checkedProducts = ref<Set<number>>(new Set());
// Локально отмеченные варианты по продукту: product_id -> Set<variant_id>
const checkedVariants = ref<Map<number, Set<number>>>(new Map());
// Развёрнутые продукты
const expandedRows = ref<Set<number>>(new Set());

const hasVariants = (p: Product) => Array.isArray(p.variants) && p.variants.length > 0;

const findSelected = (productId: number) =>
  props.selectedList.find((p) => p.id === productId);

// Продукт уже добавлен «целиком» (без указания конкретных вариантов)
const isWholeAlreadySelected = (productId: number) => {
  const found = findSelected(productId);
  if (!found) return false;
  return !found.variants || found.variants.length === 0;
};

// Конкретный вариант уже выбран ранее
const isVariantAlreadySelected = (productId: number, variantId: number) => {
  const found = findSelected(productId);
  if (!found || !found.variants) return false;
  return found.variants.some((v: any) => v.id === variantId);
};

// У продукта частично выбраны варианты (показываем подсказку)
const hasPartialSelection = (productId: number) => {
  const found = findSelected(productId);
  return !!found && !!found.variants && found.variants.length > 0;
};

const isProductChecked = (productId: number) =>
  checkedProducts.value.has(productId);

const isVariantChecked = (productId: number, variantId: number) =>
  checkedVariants.value.get(productId)?.has(variantId) ?? false;

const isExpanded = (productId: number) => expandedRows.value.has(productId);

const toggleExpanded = (productId: number) => {
  const s = new Set(expandedRows.value);
  s.has(productId) ? s.delete(productId) : s.add(productId);
  expandedRows.value = s;
};

const toggleProduct = (item: Product) => {
  if (isWholeAlreadySelected(item.id!)) return;
  const s = new Set(checkedProducts.value);
  if (s.has(item.id!)) {
    s.delete(item.id!);
  } else {
    s.add(item.id!);
    // При выборе всего продукта — снимаем индивидуальные варианты
    const m = new Map(checkedVariants.value);
    m.delete(item.id!);
    checkedVariants.value = m;
  }
  checkedProducts.value = s;
};

const toggleVariant = (item: Product, variant: Product) => {
  if (
    isVariantAlreadySelected(item.id!, variant.id!) ||
    isWholeAlreadySelected(item.id!) ||
    isProductChecked(item.id!)
  )
    return;
  const m = new Map(checkedVariants.value);
  const set = new Set(m.get(item.id!) ?? []);
  if (set.has(variant.id!)) {
    set.delete(variant.id!);
  } else {
    set.add(variant.id!);
  }
  if (set.size === 0) m.delete(item.id!);
  else m.set(item.id!, set);
  checkedVariants.value = m;
};

// Доступные товары (не уже добавленные целиком)
const availableItems = computed(() =>
  props.items.filter((i) => !isWholeAlreadySelected(i.id!))
);

const allChecked = computed(
  () =>
    availableItems.value.length > 0 &&
    availableItems.value.every((i) => checkedProducts.value.has(i.id!))
);
const someChecked = computed(() =>
  availableItems.value.some((i) => checkedProducts.value.has(i.id!))
);

const toggleAll = () => {
  if (allChecked.value) {
    checkedProducts.value = new Set();
  } else {
    const s = new Set(checkedProducts.value);
    availableItems.value.forEach((i) => s.add(i.id!));
    checkedProducts.value = s;
    // Сбросим конкретные варианты для тех, кого выбираем целиком
    const m = new Map(checkedVariants.value);
    availableItems.value.forEach((i) => m.delete(i.id!));
    checkedVariants.value = m;
  }
};

const totalCheckedCount = computed(() => {
  let count = checkedProducts.value.size;
  checkedVariants.value.forEach((s) => (count += s.size));
  return count;
});

const addSelected = () => {
  const result: Product[] = [];

  // Целиком выбранные продукты (variants: [])
  checkedProducts.value.forEach((productId) => {
    const item = props.items.find((p) => p.id === productId);
    if (!item) return;
    const clone: any = { ...item, variants: [] };
    result.push(clone);
  });

  // Конкретные варианты
  checkedVariants.value.forEach((variantSet, productId) => {
    const item = props.items.find((p) => p.id === productId);
    if (!item) return;
    const selectedVariants = (item.variants ?? []).filter((v: any) =>
      variantSet.has(v.id)
    );
    if (selectedVariants.length === 0) return;
    const clone: any = { ...item, variants: selectedVariants };
    result.push(clone);
  });

  if (result.length === 0) return;

  emits("addProducts", result);

  // Сброс
  checkedProducts.value = new Set();
  checkedVariants.value = new Map();
};
</script>

<style scoped>
input[type="checkbox"]:indeterminate {
  background-color: #6366f1;
}
</style>
