<template>
  <div
    v-if="promotion.hasPromotion.value"
    class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4"
  >
    <div class="flex items-start gap-3">
      <div class="text-2xl leading-none">🎁</div>
      <div class="flex-1">
        <div class="text-sm font-semibold text-gray-900">
          {{ promotion.activePromotion.value?.name }}
        </div>
        <div
          v-if="promotion.activePromotion.value?.description"
          class="text-xs text-gray-600 mt-0.5"
        >
          {{ promotion.activePromotion.value.description }}
        </div>
      </div>
    </div>

    <!-- Выбор: подарок или промокод/скидка -->
    <div
      v-if="promotion.allowPromoCodes.value"
      class="mt-3 flex flex-wrap gap-2"
    >
      <button
        type="button"
        class="rounded-md border px-3 py-1.5 text-xs font-medium transition"
        :class="[
          promotion.userChoice.value === 'gift'
            ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
            : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400',
        ]"
        @click="
          promotion.selectGift(promotion.giftProducts.value[0] || null)
        "
      >
        🎁 Подарок
      </button>
      <button
        type="button"
        class="rounded-md border px-3 py-1.5 text-xs font-medium transition"
        :class="[
          promotion.userChoice.value === 'discount'
            ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
            : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400',
        ]"
        @click="promotion.selectDiscount()"
      >
        🏷 Промокод / скидка
      </button>
    </div>
    <div
      v-else
      class="mt-3 rounded border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-700"
    >
      Промокоды и скидки не действуют с этой акцией. Доступен только подарок.
    </div>

    <!-- Список подарков -->
    <div
      v-if="
        promotion.userChoice.value === 'gift' &&
        promotion.giftProducts.value.length > 0
      "
      class="mt-3 space-y-2"
    >
      <div class="text-xs font-medium text-gray-700">Выберите подарок:</div>
      <div
        v-for="gift in promotion.giftProducts.value"
        :key="gift.id"
        class="rounded-md border bg-white"
        :class="[
          promotion.selectedGift.value?.id === gift.id
            ? 'border-emerald-500 ring-1 ring-emerald-500'
            : 'border-gray-200 hover:border-emerald-400',
        ]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-3 py-2 text-left"
          @click="promotion.selectGift(gift)"
        >
          <img
            v-if="gift.image"
            :src="gift.image"
            class="h-10 w-10 shrink-0 rounded object-cover"
            :alt="gift.name"
          />
          <div v-else class="h-10 w-10 shrink-0 rounded bg-gray-100" />
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">
              {{ gift.name }}
              <span class="text-xs text-gray-500"> ×{{ gift.quantity }}</span>
            </div>
            <div class="text-xs text-emerald-700">Бесплатно</div>
          </div>
          <span
            v-if="promotion.selectedGift.value?.id === gift.id"
            class="text-xs font-bold text-emerald-600"
            >✓</span
          >
        </button>

        <!-- Варианты (размеры/цвета) -->
        <div
          v-if="
            promotion.selectedGift.value?.id === gift.id && gift.has_variants
          "
          class="border-t border-emerald-100 bg-emerald-50/50 px-3 py-2"
        >
          <template v-if="gift.variants && gift.variants.length > 0">
            <div class="text-xs font-medium text-gray-700 mb-1">
              Выберите вариант:
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="variant in gift.variants"
                :key="variant.id"
                type="button"
                class="rounded-md border px-2.5 py-1 text-xs transition"
                :class="[
                  promotion.selectedGiftVariantByGiftId.value[gift.id] ===
                  variant.id
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400',
                ]"
                @click="promotion.selectGiftVariant(variant)"
              >
                {{ formatVariantLabel(variant) }}
              </button>
            </div>
            <div
              v-if="!promotion.selectedGiftVariantByGiftId.value[gift.id]"
              class="mt-1 text-xs text-amber-700"
            >
              Выберите вариант для подарка
            </div>
          </template>
          <div v-else class="text-xs text-red-600">
            У этого подарка нет вариантов в наличии. Выберите другой подарок.
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="promotion.errorMessage.value"
      class="mt-2 text-xs text-red-600"
    >
      {{ promotion.errorMessage.value }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  PromotionGiftVariant,
  usePromotionForOrder,
} from "@/composables/orders/usePromotionForOrder";

defineProps<{
  promotion: ReturnType<typeof usePromotionForOrder>;
}>();

const formatVariantLabel = (variant: PromotionGiftVariant): string => {
  const values = variant?.option_values || [];
  if (values.length === 0) return variant.sku || `#${variant.id}`;
  return values
    .map((v) => v.name)
    .filter(Boolean)
    .join(" / ");
};
</script>
