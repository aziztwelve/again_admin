/**
 * Composable для работы с активной промо-акцией при создании заказа в админке.
 *
 * Поведение полностью повторяет клиентский Pinia-стор `stores/promotion.js` в nuxt-shop:
 *   1) По переданным items + total опрашиваем `/public/promotions/check-applicable`
 *   2) Берём первую (наиболее приоритетную) применимую акцию
 *   3) Даём оператору выбрать подарок и (если у подарка есть размеры) — конкретный variant
 *   4) Возвращаем готовый payload-fragment для тела запроса POST /orders
 *
 * Защита от race condition: применяется ответ только последнего запроса.
 */
import axios from "axios";
import { ref, computed, watch, type Ref } from "vue";

export interface PromotionGiftVariantOptionValue {
  id: number;
  name: string;
  value?: string | null;
  color_code?: string | null;
  option?: { id: number | null; name: string | null };
}

export interface PromotionGiftVariant {
  id: number;
  sku?: string | null;
  stock_quantity?: number;
  image?: string | null;
  option_values?: PromotionGiftVariantOptionValue[];
}

export interface PromotionGiftProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  has_variants: boolean;
  variants: PromotionGiftVariant[];
}

export interface ApplicablePromotion {
  id: number;
  name: string;
  description: string | null;
  allow_promo_codes: boolean;
  min_purchase_amount: number;
  priority: number;
  gift_products: PromotionGiftProduct[];
}

export interface CartItemForCheck {
  product_id: number;
  quantity: number;
  price: number;
}

export function usePromotionForOrder(
  items: Ref<CartItemForCheck[]>,
  total: Ref<number>,
) {
  const activePromotion = ref<ApplicablePromotion | null>(null);
  const selectedGift = ref<PromotionGiftProduct | null>(null);
  const selectedGiftVariantByGiftId = ref<Record<number, number>>({});
  // 'gift' | 'discount' — выбор оператора между подарком и скидкой/промокодом
  const userChoice = ref<"gift" | "discount">("gift");
  const isLoading = ref(false);
  const errorMessage = ref<string>("");

  let requestId = 0;

  const hasPromotion = computed(() => !!activePromotion.value);

  const allowPromoCodes = computed(() => {
    if (!activePromotion.value) return true;
    return !!activePromotion.value.allow_promo_codes;
  });

  const giftProducts = computed<PromotionGiftProduct[]>(() => {
    if (!activePromotion.value) return [];
    return activePromotion.value.gift_products || [];
  });

  const useDiscountInstead = computed(() => userChoice.value === "discount");

  const selectedGiftVariant = computed<PromotionGiftVariant | null>(() => {
    if (!selectedGift.value) return null;
    const variantId = selectedGiftVariantByGiftId.value[selectedGift.value.id];
    if (!variantId) return null;
    return (
      (selectedGift.value.variants || []).find((v) => v.id === variantId) ||
      null
    );
  });

  const needsVariantSelection = computed(() => {
    if (!selectedGift.value) return false;
    if (!selectedGift.value.has_variants) return false;
    return (selectedGift.value.variants || []).length > 0;
  });

  const isGiftSelectionComplete = computed(() => {
    if (!activePromotion.value) return true;
    if (useDiscountInstead.value) return true;
    if (!selectedGift.value) return false;
    if (!needsVariantSelection.value) return true;
    return !!selectedGiftVariant.value;
  });

  const reset = () => {
    activePromotion.value = null;
    selectedGift.value = null;
    selectedGiftVariantByGiftId.value = {};
    userChoice.value = "gift";
    errorMessage.value = "";
  };

  const checkApplicable = async () => {
    if (!items.value || items.value.length === 0 || total.value <= 0) {
      requestId += 1;
      reset();
      return;
    }

    const myRequestId = ++requestId;
    isLoading.value = true;
    errorMessage.value = "";

    try {
      const response = await axios.post("public/promotions/check-applicable", {
        items: items.value,
        total: total.value,
      });

      if (myRequestId !== requestId) return;

      const promos: ApplicablePromotion[] = response.data?.data || [];

      if (promos.length === 0) {
        reset();
        return;
      }

      activePromotion.value = promos[0];
      const giftList = activePromotion.value.gift_products || [];

      // Сохраняем выбор подарка, если он всё ещё доступен в новой выборке акции
      const previouslySelectedGiftId = selectedGift.value?.id;
      const stillAvailable = previouslySelectedGiftId
        ? giftList.find((g) => g.id === previouslySelectedGiftId)
        : null;

      if (stillAvailable) {
        selectedGift.value = stillAvailable;
      } else if (giftList.length > 0) {
        selectedGift.value = giftList[0];
      } else {
        selectedGift.value = null;
      }

      // Чистим устаревшие выборы variant'ов
      const validGiftIds = new Set(giftList.map((g) => g.id));
      const cleaned: Record<number, number> = {};
      for (const [k, v] of Object.entries(selectedGiftVariantByGiftId.value)) {
        const giftId = Number(k);
        if (!validGiftIds.has(giftId)) continue;
        const g = giftList.find((x) => x.id === giftId);
        if (g && (g.variants || []).find((variant) => variant.id === v)) {
          cleaned[giftId] = v;
        }
      }
      selectedGiftVariantByGiftId.value = cleaned;

      // Автовыбор первого доступного variant для активного подарка
      if (
        selectedGift.value &&
        selectedGift.value.has_variants &&
        Array.isArray(selectedGift.value.variants) &&
        selectedGift.value.variants.length > 0 &&
        !selectedGiftVariantByGiftId.value[selectedGift.value.id]
      ) {
        selectedGiftVariantByGiftId.value = {
          ...selectedGiftVariantByGiftId.value,
          [selectedGift.value.id]: selectedGift.value.variants[0].id,
        };
      }

      // Если промокоды не разрешены — принудительно выбираем подарок
      if (!activePromotion.value.allow_promo_codes) {
        userChoice.value = "gift";
      }
    } catch (e: any) {
      if (myRequestId === requestId) {
        errorMessage.value =
          e?.response?.data?.message ||
          "Не удалось проверить доступные акции";
        // не сбрасываем стейт, чтобы оператор не потерял выбор подарка
      }
    } finally {
      if (myRequestId === requestId) {
        isLoading.value = false;
      }
    }
  };

  const selectGift = (gift: PromotionGiftProduct | null) => {
    selectedGift.value = gift;
    userChoice.value = "gift";

    if (
      gift &&
      gift.has_variants &&
      Array.isArray(gift.variants) &&
      gift.variants.length > 0
    ) {
      const already = selectedGiftVariantByGiftId.value[gift.id];
      const stillAvailable = already
        ? gift.variants.find((v) => v.id === already)
        : null;
      if (!stillAvailable) {
        selectedGiftVariantByGiftId.value = {
          ...selectedGiftVariantByGiftId.value,
          [gift.id]: gift.variants[0].id,
        };
      }
    }
  };

  const selectGiftVariant = (variant: PromotionGiftVariant) => {
    if (!selectedGift.value || !variant) return;
    selectedGiftVariantByGiftId.value = {
      ...selectedGiftVariantByGiftId.value,
      [selectedGift.value.id]: variant.id,
    };
  };

  const selectDiscount = () => {
    if (!allowPromoCodes.value) return;
    userChoice.value = "discount";
    selectedGift.value = null;
  };

  /**
   * Формирует часть payload-а для POST /orders с информацией об акции.
   * Если активной акции нет — возвращает пустой объект.
   */
  const getPayloadFragment = (): Record<string, unknown> => {
    if (!activePromotion.value) return {};
    const out: Record<string, unknown> = {
      promotion_id: activePromotion.value.id,
      use_discount_instead: useDiscountInstead.value,
    };
    if (!useDiscountInstead.value && selectedGift.value) {
      out.gift_product_id = selectedGift.value.id;
      if (selectedGift.value.has_variants && selectedGiftVariant.value) {
        out.gift_product_variant_id = selectedGiftVariant.value.id;
      }
    }
    return out;
  };

  // Авто-обновление при изменении корзины/суммы
  watch([items, total], () => {
    checkApplicable();
  }, { deep: true });

  return {
    // state
    activePromotion,
    selectedGift,
    selectedGiftVariantByGiftId,
    userChoice,
    isLoading,
    errorMessage,
    // computed
    hasPromotion,
    allowPromoCodes,
    giftProducts,
    useDiscountInstead,
    selectedGiftVariant,
    needsVariantSelection,
    isGiftSelectionComplete,
    // actions
    checkApplicable,
    selectGift,
    selectGiftVariant,
    selectDiscount,
    getPayloadFragment,
    reset,
  };
}
