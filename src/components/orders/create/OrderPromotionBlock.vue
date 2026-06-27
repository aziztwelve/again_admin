<template>
  <div v-if="promotion.hasPromotion.value" class="mt-4 space-y-3">
    <div
      v-if="promotion.appliedPromotions.value.length > 1"
      class="text-sm font-semibold text-gray-900"
    >
      Подарки по акциям
    </div>

    <!-- Блок одной акции -->
    <div
      v-for="p in promotion.appliedPromotions.value"
      :key="p.id"
      class="rounded-lg border border-emerald-200 bg-emerald-50 p-4"
    >
      <div class="flex items-start gap-3">
        <div class="text-2xl leading-none">🎁</div>
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-900">{{ p.name }}</div>
          <div v-if="p.description" class="text-xs text-gray-600 mt-0.5">
            {{ p.description }}
          </div>
        </div>
      </div>

      <!-- Выбор: подарок или промокод/скидка -->
      <div v-if="p.allow_promo_codes" class="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-md border px-3 py-1.5 text-xs font-medium transition"
          :class="[
            promotion.userChoiceFor(p.id) === 'gift'
              ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400',
          ]"
          @click="chooseGiftMode(p)"
        >
          🎁 Подарок
        </button>
        <button
          type="button"
          class="rounded-md border px-3 py-1.5 text-xs font-medium transition"
          :class="[
            promotion.userChoiceFor(p.id) === 'discount'
              ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400',
          ]"
          @click="promotion.selectDiscount(p.id)"
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
          promotion.userChoiceFor(p.id) === 'gift' &&
          promotion.giftProductsFor(p).length > 0
        "
        class="mt-3 space-y-2"
      >
        <div class="text-xs font-medium text-gray-700">Выберите подарок:</div>
        <div
          v-for="gift in promotion.giftProductsFor(p)"
          :key="gift.id"
          class="rounded-md border bg-white"
          :class="[
            promotion.selectedGiftIdFor(p.id) === gift.id
              ? 'border-emerald-500 ring-1 ring-emerald-500'
              : 'border-gray-200 hover:border-emerald-400',
          ]"
        >
          <button
            type="button"
            class="flex w-full items-center gap-3 px-3 py-2 text-left"
            @click="promotion.selectGift(p.id, gift)"
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
              v-if="promotion.selectedGiftIdFor(p.id) === gift.id"
              class="text-xs font-bold text-emerald-600"
              >✓</span
            >
          </button>

          <!-- Двухшаговый выбор: цвет → размер. -->
          <div
            v-if="
              promotion.selectedGiftIdFor(p.id) === gift.id && gift.has_variants
            "
            class="border-t border-emerald-100 bg-emerald-50/50 px-3 py-2"
          >
            <template v-if="gift.variants && gift.variants.length > 0">
              <!-- Шаг 1: Цвет -->
              <template v-if="uniqueColors(gift).length > 0">
                <div class="text-xs font-medium text-gray-700 mb-1">Цвет:</div>
                <div class="flex flex-wrap gap-1.5 mb-2">
                  <button
                    v-for="color in uniqueColors(gift)"
                    :key="color.id"
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs transition"
                    :class="[
                      promotion.selectedColorIdFor(p.id, gift.id) === color.id
                        ? 'border-emerald-500 bg-emerald-100/70 text-emerald-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-400',
                    ]"
                    :title="color.name"
                    @click="promotion.selectGiftColor(p.id, gift, color.id)"
                  >
                    <span
                      class="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                      :style="{ background: color.code || '#ccc' }"
                    />
                    <span>{{ color.name }}</span>
                  </button>
                </div>
              </template>

              <!-- Шаг 2: Размер (после выбора цвета или если цветов нет вообще) -->
              <template
                v-if="
                  promotion.selectedColorIdFor(p.id, gift.id) ||
                  uniqueColors(gift).length === 0
                "
              >
                <div class="text-xs font-medium text-gray-700 mb-1">Размер:</div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="variant in variantsByColor(p.id, gift)"
                    :key="variant.id"
                    type="button"
                    class="rounded-md border px-2.5 py-1 text-xs transition"
                    :class="[
                      promotion.selectedVariantIdFor(p.id, gift.id) ===
                      variant.id
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400',
                    ]"
                    @click="promotion.selectGiftVariant(p.id, gift, variant)"
                  >
                    {{ formatVariantLabel(variant) }}
                  </button>
                </div>
              </template>

              <div
                v-if="!promotion.selectedVariantIdFor(p.id, gift.id)"
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
    </div>

    <div v-if="promotion.errorMessage.value" class="text-xs text-red-600">
      {{ promotion.errorMessage.value }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ApplicablePromotion,
  PromotionGiftProduct,
  PromotionGiftVariant,
  usePromotionForOrder,
} from "@/composables/orders/usePromotionForOrder";

const props = defineProps<{
  promotion: ReturnType<typeof usePromotionForOrder>;
}>();

// Тонкие обёртки, чтобы не тянуть в шаблон длинный путь до хелперов.
const uniqueColors = (gift: PromotionGiftProduct) =>
  props.promotion.uniqueColorsForGift(gift);
const variantsByColor = (promotionId: number, gift: PromotionGiftProduct) =>
  props.promotion.variantsForGiftByColor(promotionId, gift);

// Переключение на режим «Подарок»: гарантируем, что подарок выбран
// (сохраняем текущий выбор, иначе берём первый из списка этой акции).
const chooseGiftMode = (p: ApplicablePromotion) => {
  const current = props.promotion.selectedGiftFor(p);
  const gifts = props.promotion.giftProductsFor(p);
  props.promotion.selectGift(p.id, current || gifts[0] || null);
};

// Подпись размера: если есть `name` (S/M/L) — используем его; иначе
// собираем из option_values; в крайнем случае показываем sku.
const formatVariantLabel = (variant: PromotionGiftVariant): string => {
  if (variant?.name) return variant.name;
  const values = variant?.option_values || [];
  if (values.length === 0) return variant?.sku || `#${variant?.id}`;
  return values
    .map((v) => v.name)
    .filter(Boolean)
    .join(" / ");
};
</script>
