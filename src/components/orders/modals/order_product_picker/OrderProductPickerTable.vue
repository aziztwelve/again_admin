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
            Артикул
          </th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
            Цена
          </th>
          <th class="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
            Остаток
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
              'hover:bg-gray-50',
              isProductChecked(item.id) ? 'bg-blue-50' : '',
            ]"
          >
            <td class="px-3 py-2">
              <input
                type="checkbox"
                :checked="isProductChecked(item.id)"
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
                v-if="hasVariants(item)"
                class="ml-2 text-xs text-gray-500"
              >
                ({{ pluralizeVariants(item.variants.length) }})
              </span>
            </td>
            <td class="px-3 py-2 text-gray-500">
              {{ item.sku || item.code || "—" }}
            </td>
            <td class="px-3 py-2 text-gray-700">
              {{ formatPriceRange(item) }}
            </td>
            <td class="px-3 py-2 text-gray-700">
              {{ getProductStock(item) }} шт
            </td>
          </tr>

          <template v-if="hasVariants(item) && isExpanded(item.id)">
            <tr
              v-for="variant in item.variants"
              :key="`v-${variant.id}`"
              :class="[
                'hover:bg-gray-50',
                isVariantChecked(item.id, variant.id) ? 'bg-blue-50' : '',
                getVariantStock(variant) <= 0 ? 'opacity-60' : '',
              ]"
            >
              <td class="px-3 py-2 pl-10">
                <input
                  type="checkbox"
                  :checked="isVariantChecked(item.id, variant.id)"
                  :disabled="isProductChecked(item.id)"
                  @change="toggleVariant(item, variant)"
                  class="rounded border-gray-300"
                />
              </td>
              <td class="px-3 py-2"></td>
              <td class="px-3 py-2 text-gray-500">{{ variant.id }}</td>
              <td class="px-3 py-2 text-gray-700 pl-4">
                ↳ {{ getVariantTitle(variant) }}
              </td>
              <td class="px-3 py-2 text-gray-500">{{ variant.sku || "—" }}</td>
              <td class="px-3 py-2 text-gray-700">
                {{ formatPrice(getVariantPrice(variant)) }}
              </td>
              <td
                class="px-3 py-2"
                :class="getVariantStock(variant) <= 0 ? 'text-red-500' : 'text-gray-700'"
              >
                {{ getVariantStock(variant) }} шт
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

<script setup>
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-vue-next";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(["select"]);

// Локально отмеченные продукты целиком
const checkedProducts = ref(new Set());
// Локально отмеченные варианты по продукту: product_id -> Set<variant_id>
const checkedVariants = ref(new Map());
// Развёрнутые продукты
const expandedRows = ref(new Set());

const hasVariants = (p) =>
  Array.isArray(p?.variants) && p.variants.some((v) => v && v.id != null);

const getVariantPrice = (variant) => Number(variant?.price ?? 0);

const getVariantStock = (variant) => {
  const stock = variant?.stock_quantity ?? variant?.inventory_balance ?? 0;
  return Number(stock) || 0;
};

const getProductStock = (product) => {
  const value = product?.stock_quantity ?? product?.inventory_balance ?? 0;
  return Number(value) || 0;
};

const formatPrice = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatPriceRange = (product) => {
  if (hasVariants(product)) {
    const prices = product.variants.map(getVariantPrice).filter((p) => p > 0);
    if (prices.length) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min !== max) return `${formatPrice(min)} — ${formatPrice(max)}`;
      return formatPrice(min);
    }
  }
  return formatPrice(Number(product?.price ?? 0));
};

const getVariantTitle = (variant) => {
  if (!variant) return "";
  const parts = [];
  if (variant.name) parts.push(variant.name);
  if (variant.color?.name) parts.push(variant.color.name);
  return parts.length ? parts.join(" / ") : `Вариант #${variant.id}`;
};

const pluralizeVariants = (count) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} вариант`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${count} варианта`;
  return `${count} вариантов`;
};

const isProductChecked = (productId) => checkedProducts.value.has(productId);
const isVariantChecked = (productId, variantId) =>
  checkedVariants.value.get(productId)?.has(variantId) ?? false;
const isExpanded = (productId) => expandedRows.value.has(productId);

const toggleExpanded = (productId) => {
  const s = new Set(expandedRows.value);
  s.has(productId) ? s.delete(productId) : s.add(productId);
  expandedRows.value = s;
};

const toggleProduct = (item) => {
  const s = new Set(checkedProducts.value);
  if (s.has(item.id)) {
    s.delete(item.id);
  } else {
    s.add(item.id);
    // При выборе всего продукта — снимаем индивидуальные варианты
    const m = new Map(checkedVariants.value);
    m.delete(item.id);
    checkedVariants.value = m;
  }
  checkedProducts.value = s;
};

const toggleVariant = (item, variant) => {
  if (isProductChecked(item.id)) return;
  const m = new Map(checkedVariants.value);
  const set = new Set(m.get(item.id) ?? []);
  if (set.has(variant.id)) {
    set.delete(variant.id);
  } else {
    set.add(variant.id);
  }
  if (set.size === 0) m.delete(item.id);
  else m.set(item.id, set);
  checkedVariants.value = m;
};

const allChecked = computed(
  () =>
    props.items.length > 0 &&
    props.items.every((i) => checkedProducts.value.has(i.id)),
);
const someChecked = computed(() =>
  props.items.some((i) => checkedProducts.value.has(i.id)),
);

const toggleAll = () => {
  if (allChecked.value) {
    checkedProducts.value = new Set();
  } else {
    const s = new Set(checkedProducts.value);
    props.items.forEach((i) => s.add(i.id));
    checkedProducts.value = s;
    // Сбросим конкретные варианты для тех, кого выбираем целиком
    const m = new Map(checkedVariants.value);
    props.items.forEach((i) => m.delete(i.id));
    checkedVariants.value = m;
  }
};

const totalCheckedCount = computed(() => {
  let count = checkedProducts.value.size;
  checkedVariants.value.forEach((s) => (count += s.size));
  return count;
});

const addSelected = () => {
  const result = [];

  // Целиком выбранные продукты — без variant
  checkedProducts.value.forEach((productId) => {
    const item = props.items.find((p) => p.id === productId);
    if (!item) return;
    result.push({ product: item, variant: null });
  });

  // Конкретные варианты — отдельная позиция на каждый
  checkedVariants.value.forEach((variantSet, productId) => {
    const item = props.items.find((p) => p.id === productId);
    if (!item) return;
    (item.variants ?? []).forEach((v) => {
      if (variantSet.has(v.id)) {
        result.push({ product: item, variant: v });
      }
    });
  });

  if (result.length === 0) return;

  emits("select", result);

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
