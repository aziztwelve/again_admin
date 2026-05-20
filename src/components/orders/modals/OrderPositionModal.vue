<template>
    <ModalDialog
        ref="modalRef"
        title="Добавить позицию"
        description="Найдите товар по названию или артикулу и добавьте его (или конкретный вариант) в заказ."
        dynamic-style="sm:max-w-3xl"
    >
        <template #trigger>
            <Button type="button" variant="outline" class="gap-2">
                <Plus class="h-4 w-4" />
                Позиция
            </Button>
        </template>

        <template #content>
            <div class="space-y-4">
                <div class="relative">
                    <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        :value="modelValue"
                        type="text"
                        placeholder="Поиск товара по названию или артикулу"
                        class="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        @input="onInput"
                    />
                </div>

                <div class="max-h-96 overflow-y-auto rounded-md border border-gray-200">
                    <div
                        v-if="products.length"
                        class="divide-y divide-gray-200"
                    >
                        <div
                            v-for="product in products"
                            :key="product.id"
                            class="bg-white"
                        >
                            <!-- Шапка товара -->
                            <div
                                class="flex w-full items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                                :class="hasVariants(product) ? 'cursor-pointer' : 'cursor-pointer'"
                                role="button"
                                tabindex="0"
                                @click="onProductClick(product)"
                                @keydown.enter.prevent="onProductClick(product)"
                            >
                                <button
                                    v-if="hasVariants(product)"
                                    type="button"
                                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200"
                                    :aria-expanded="isExpanded(product)"
                                    :aria-label="isExpanded(product) ? 'Свернуть варианты' : 'Развернуть варианты'"
                                    @click.stop="toggleExpanded(product)"
                                >
                                    <ChevronDown
                                        class="h-4 w-4 transition-transform"
                                        :class="isExpanded(product) ? 'rotate-0' : '-rotate-90'"
                                    />
                                </button>
                                <span v-else class="inline-block w-6 shrink-0" />

                                <div class="min-w-0 flex-1 text-left">
                                    <p class="truncate text-sm font-medium text-gray-900">
                                        {{ product.name }}
                                    </p>
                                    <p class="mt-1 text-xs text-gray-500">
                                        <span v-if="hasVariants(product)">
                                            {{ pluralizeVariants(getVariants(product).length) }}
                                        </span>
                                        <span v-else>
                                            Артикул: {{ product.code || product.sku || '—' }}
                                        </span>
                                    </p>
                                </div>

                                <div class="shrink-0 text-right">
                                    <p class="text-sm font-medium text-gray-900">
                                        {{ formatPriceRange(product) }}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        Остаток: {{ getProductStock(product) }} шт
                                    </p>
                                </div>
                            </div>

                            <!-- Список вариантов -->
                            <div
                                v-if="hasVariants(product) && isExpanded(product)"
                                class="bg-gray-50"
                            >
                                <button
                                    v-for="variant in getVariants(product)"
                                    :key="variant.id"
                                    type="button"
                                    class="flex w-full items-center gap-3 px-4 py-2 pl-12 text-left transition hover:bg-gray-100"
                                    :class="getVariantStock(variant) <= 0 ? 'text-gray-400' : ''"
                                    @click="handleVariantSelect(product, variant)"
                                >
                                    <div class="min-w-0 flex-1">
                                        <p class="truncate text-sm font-medium" :class="getVariantStock(variant) <= 0 ? 'text-gray-500' : 'text-gray-900'">
                                            {{ getVariantTitle(variant) }}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            Артикул: {{ variant.sku || '—' }}
                                        </p>
                                    </div>
                                    <div class="shrink-0 text-right">
                                        <p class="text-sm font-medium" :class="getVariantStock(variant) <= 0 ? 'text-gray-500' : 'text-gray-900'">
                                            {{ formatPrice(getVariantPrice(variant)) }}
                                        </p>
                                        <p class="text-xs" :class="getVariantStock(variant) <= 0 ? 'text-red-500' : 'text-gray-500'">
                                            Остаток: {{ getVariantStock(variant) }} шт
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-else class="px-4 py-6 text-sm text-gray-500">
                        Товары не найдены.
                    </div>
                </div>
            </div>
        </template>
    </ModalDialog>
</template>

<script setup>
import { ref } from 'vue';
import { Plus, Search, ChevronDown } from 'lucide-vue-next';

import ModalDialog from '@/components/dynamics/shadcn/ModalDialog.vue';
import Button from '@/components/ui/button/Button.vue';

defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    products: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['update:modelValue', 'select']);

const modalRef = ref(null);
const expandedIds = ref(new Set());

const formatPrice = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
    }).format(amount);
};

// Фильтруем варианты — оставляем только те, где у объекта есть `id` (варианты в admin-формате).
// В non-admin формате массив variants содержит только размеры без id, для них выбор недоступен.
const getVariants = (product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    return variants.filter((v) => v && v.id != null);
};

const hasVariants = (product) => getVariants(product).length > 0;

const getVariantPrice = (variant) => Number(variant?.price ?? 0);

const getVariantStock = (variant) => {
    const stock = variant?.stock_quantity ?? variant?.inventory_balance ?? 0;
    return Number(stock) || 0;
};

const getVariantTitle = (variant) => {
    if (!variant) return '';
    const parts = [];
    if (variant.name) parts.push(variant.name);
    if (variant.color?.name) parts.push(variant.color.name);
    return parts.length ? parts.join(' / ') : `Вариант #${variant.id}`;
};

const getProductStock = (product) => {
    const value = product?.stock_quantity ?? product?.inventory_balance ?? 0;
    return Number(value) || 0;
};

const formatPriceRange = (product) => {
    const variants = getVariants(product);
    if (variants.length) {
        const prices = variants.map(getVariantPrice).filter((p) => p > 0);
        if (prices.length) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            if (min !== max) {
                return `${formatPrice(min)} — ${formatPrice(max)}`;
            }
            return formatPrice(min);
        }
    }
    return formatPrice(Number(product?.price ?? 0));
};

const pluralizeVariants = (count) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} вариант`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} варианта`;
    return `${count} вариантов`;
};

const isExpanded = (product) => expandedIds.value.has(product.id);

const toggleExpanded = (product) => {
    const next = new Set(expandedIds.value);
    if (next.has(product.id)) {
        next.delete(product.id);
    } else {
        next.add(product.id);
    }
    expandedIds.value = next;
};

const onInput = (event) => {
    emit('update:modelValue', event.target?.value || '');
};

const closeAndReset = () => {
    emit('update:modelValue', '');
    expandedIds.value = new Set();
    modalRef.value?.close?.();
};

const onProductClick = (product) => {
    if (hasVariants(product)) {
        // Для товаров с вариантами клик по строке = разворачивание/сворачивание.
        toggleExpanded(product);
        return;
    }
    emit('select', { product, variant: null });
    closeAndReset();
};

const handleVariantSelect = (product, variant) => {
    emit('select', { product, variant });
    closeAndReset();
};
</script>
