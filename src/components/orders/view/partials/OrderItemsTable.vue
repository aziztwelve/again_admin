<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-900">Позиции заказа</h3>
      <Button
        v-if="!editing"
        variant="outline"
        size="sm"
        type="button"
        @click="startEdit"
      >
        <Pencil class="mr-2 h-3.5 w-3.5" /> Редактировать
      </Button>
      <div v-else class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          :disabled="saving"
          @click="cancelEdit"
        >
          Отмена
        </Button>
        <Button
          variant="default"
          size="sm"
          type="button"
          :disabled="saving"
          @click="saveEdit"
        >
          {{ saving ? "Сохранение..." : "Сохранить" }}
        </Button>
      </div>
    </div>

    <div class="mt-4 overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">№</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Фото</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Артикул</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Наименование</th>
            <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Цена</th>
            <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Вес, г</th>
            <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Кол-во</th>
            <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Резерв</th>
            <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Остаток</th>
            <th class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Сумма</th>
            <th class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="!displayItems.length">
            <td colspan="11" class="px-3 py-6 text-center text-sm text-gray-500">
              Нет позиций
            </td>
          </tr>
          <tr v-for="(item, index) in displayItems" :key="item.id || `${item.product_id}-${item.variant_id ?? 0}-${index}`">
            <td class="px-3 py-2 text-sm text-gray-700">{{ index + 1 }}</td>
            <td class="px-3 py-2">
              <img
                v-if="getImage(item)"
                :src="getImage(item)"
                alt=""
                class="h-10 w-10 rounded object-cover"
              />
              <div v-else class="h-10 w-10 rounded bg-gray-100" />
            </td>
            <td class="px-3 py-2 text-sm text-gray-700">
              {{ item.variant?.sku || item.product?.code || item.legacy_sku || item.product?.sku || "—" }}
            </td>
            <td class="px-3 py-2 text-sm text-gray-900">
              <div class="flex flex-wrap items-center gap-2">
                <span>{{ item.product?.name || item.legacy_name || item.name || "—" }}</span>
                <span
                  v-if="item.is_gift"
                  class="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                  title="Подарок по акции"
                >
                  🎁 Подарок
                </span>
              </div>
              <div
                v-if="getVariantLabel(item)"
                class="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500"
              >
                <span
                  v-if="getVariantColor(item)?.code"
                  class="inline-block h-3 w-3 flex-shrink-0 rounded-full ring-1 ring-inset ring-gray-300"
                  :style="{ background: getVariantColor(item).code }"
                  :title="getVariantColor(item).name || ''"
                />
                <span>{{ getVariantLabel(item) }}</span>
              </div>
            </td>
            <td class="px-3 py-2 text-right text-sm text-gray-900">
              <Input
                v-if="editing"
                v-model.number="item.unit_price"
                type="number"
                min="0"
                step="0.01"
                class="h-8 w-24 text-right"
              />
              <span v-else-if="item.is_gift" class="text-emerald-700 font-medium">Бесплатно</span>
              <template v-else-if="Number(item.discount) > 0">
                <div class="text-xs text-gray-400 line-through">{{ formatPrice(getUnitPrice(item) + Number(item.discount)) }}</div>
                <div class="text-red-600 font-medium">{{ formatPrice(getUnitPrice(item)) }}</div>
              </template>
              <span v-else>{{ formatPrice(getUnitPrice(item)) }}</span>
            </td>
            <td class="px-3 py-2 text-right text-sm text-gray-700">
              {{ formatWeightInGrams(item.product?.weight) }}
            </td>
            <td class="px-3 py-2 text-right text-sm text-gray-900">
              <Input
                v-if="editing"
                v-model.number="item.quantity"
                type="number"
                min="1"
                class="h-8 w-20 text-right"
              />
              <span v-else>{{ item.quantity }}</span>
            </td>
            <td class="px-3 py-2 text-right text-sm text-gray-700">
              {{ item.reserved_quantity ?? "—" }}
            </td>
            <td class="px-3 py-2 text-right text-sm text-gray-700">
              {{ item.product?.stock_quantity ?? "—" }}
            </td>
            <td class="px-3 py-2 text-right text-sm font-medium text-gray-900">
              <span v-if="item.is_gift" class="text-emerald-700">Бесплатно</span>
              <template v-else-if="Number(item.discount) > 0">
                <div class="text-xs text-gray-400 line-through">{{ formatPrice((getUnitPrice(item) + Number(item.discount)) * Number(item.quantity || 0)) }}</div>
                <div class="text-red-600 font-medium">{{ formatPrice(getRowTotal(item)) }}</div>
              </template>
              <span v-else>{{ formatPrice(getRowTotal(item)) }}</span>
            </td>
            <td class="px-3 py-2 text-right">
              <Button
                v-if="editing"
                variant="ghost"
                size="icon"
                type="button"
                class="text-red-500 hover:text-red-700"
                title="Удалить позицию"
                @click="removeItem(index)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Trash2, Pencil } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import { Input } from "@/components/ui/input";

const props = defineProps({
  items: { type: Array, default: () => [] },
  summary: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);

const editing = ref(false);
const draftItems = ref([]);

const displayItems = computed(() => (editing.value ? draftItems.value : props.items));

const cloneItems = () =>
  props.items.map((item) => ({
    ...item,
    unit_price: getUnitPrice(item),
    quantity: Number(item.quantity || 0),
  }));

const startEdit = () => {
  draftItems.value = cloneItems();
  editing.value = true;
};

const cancelEdit = () => {
  editing.value = false;
  draftItems.value = [];
};

const removeItem = (index) => {
  draftItems.value.splice(index, 1);
};

const saveEdit = async () => {
  // Преобразуем драфт в формат items, который понимает payload-builder
  const normalized = draftItems.value.map((it) => ({
    ...it,
    unit_price: Number(it.unit_price || 0),
    quantity: Number(it.quantity || 0),
  }));
  emit("save", normalized);
};

// Когда родитель обновил items после успешного сохранения — выходим из режима редактирования
watch(
  () => props.items,
  () => {
    if (editing.value && !props.saving) {
      editing.value = false;
      draftItems.value = [];
    }
  },
);

const formatPrice = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatWeightInGrams = (weightInGrams) => {
  if (weightInGrams === null || weightInGrams === undefined || weightInGrams === "") {
    return "—";
  }

  const grams = Number(weightInGrams);
  if (!Number.isFinite(grams)) return "—";

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(grams);
};

function getUnitPrice(item) {
  // Подарок по акции — всегда 0 ₽ независимо от того, что в БД.
  // На случай, если where-то price у gift-позиции не обнулился.
  if (item?.is_gift) return 0;

  // Источник истины — order_items.price (item.price): это та цена, по которой
  // позиция реально проведена в заказ. variant.price/product.price используются
  // только как фолбэк, если по каким-то причинам item.price отсутствует
  // (например, при черновом редактировании в режиме editing — там
  // используется item.unit_price).
  const candidates = [item?.unit_price, item?.price_per_unit, item?.price, item?.variant?.price];
  for (const c of candidates) {
    if (c === null || c === undefined || c === "") continue;
    const n = Number(c);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

const getRowTotal = (item) => getUnitPrice(item) * Number(item.quantity || 0);

const getImage = (item) => {
  return (
    item?.variant?.images?.[0]?.url ||
    item?.product?.images?.[0]?.url ||
    null
  );
};

/**
 * Возвращает читаемое название варианта позиции, например:
 *   "Цвет: Чёрный, Размер: M".
 * Источники данных (в порядке приоритета):
 *   1. item.variant.option_values — нормальная EAV-система атрибутов
 *      (сейчас не заполнена, оставлено на будущее).
 *   2. item.color — собственный color_id у OrderItem (заполняется при
 *      создании заказа).
 *   3. item.variant.table_color — цвет, привязанный к самому варианту
 *      (фолбэк для случаев, когда OrderItem.color_id не записался,
 *      например для подарков по акции).
 *   4. item.variant.name — легаси-поле, в которое сейчас кладут размер
 *      ("XS", "S", "M", …).
 * Используется в т.ч. для подарков с вариативностью, чтобы сборщик
 * сразу видел, какой именно цвет и размер класть в посылку.
 */
const getVariantLabel = (item) => {
  const optionValues = item?.variant?.option_values || item?.variant?.optionValues;
  if (Array.isArray(optionValues) && optionValues.length > 0) {
    return optionValues
      .map((ov) => {
        const optionName = ov?.option?.name;
        const valueName = ov?.name || ov?.value;
        if (optionName && valueName) return `${optionName}: ${valueName}`;
        return valueName;
      })
      .filter(Boolean)
      .join(", ");
  }

  const parts = [];

  // Цвет: сначала собственный у OrderItem (item.color), потом — у варианта
  const color =
    item?.color ||
    item?.variant?.table_color ||
    item?.variant?.color ||
    null;
  if (color?.name) parts.push(`Цвет: ${color.name}`);

  // Размер: в текущей схеме хранится в product_variants.name
  if (item?.variant?.name) parts.push(`Размер: ${item.variant.name}`);

  return parts.length > 0 ? parts.join(", ") : null;
};

const getVariantColor = (item) =>
  item?.color || item?.variant?.table_color || item?.variant?.color || null;
</script>
