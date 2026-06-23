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

export interface PromotionGiftVariantColor {
  id: number;
  name: string;
  code?: string | null;
}

export interface PromotionGiftVariant {
  id: number;
  name?: string | null;
  sku?: string | null;
  stock_quantity?: number;
  image?: string | null;
  color?: PromotionGiftVariantColor | null;
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
  // Двухшаговый выбор как на витрине: сначала цвет, потом размер. Храним
  // выбранный цвет на каждый подарок отдельно, чтобы переключение между
  // подарками не сбрасывало выбор друг друга.
  const selectedGiftColorByGiftId = ref<Record<number, number>>({});
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
    selectedGiftColorByGiftId.value = {};
    userChoice.value = "gift";
    errorMessage.value = "";
  };

  /**
   * Уникальные цвета у вариантов подарка. Используем для шага 1 в UI.
   * Возвращает [] если у подарка нет вариантов или ни у одного нет color.
   */
  const uniqueColorsForGift = (
    gift: PromotionGiftProduct | null,
  ): PromotionGiftVariantColor[] => {
    if (!gift?.variants) return [];
    const seen = new Set<number>();
    const result: PromotionGiftVariantColor[] = [];
    for (const v of gift.variants) {
      const color = v.color;
      if (!color || color.id == null) continue;
      if (!seen.has(color.id)) {
        seen.add(color.id);
        result.push({ id: color.id, name: color.name, code: color.code ?? null });
      }
    }
    return result;
  };

  // Стандартная сортировка размеров — повторяем порядок витрины, чтобы
  // не путать оператора.
  const SIZE_ORDER = [
    "XXS",
    "XS",
    "S",
    "S/M",
    "M",
    "M/L",
    "L",
    "XL",
    "XXL",
    "XXXL",
    "XXXXL",
    "XXXXXL",
  ];
  const sortBySize = (
    variants: PromotionGiftVariant[],
  ): PromotionGiftVariant[] => {
    return [...variants].sort((a, b) => {
      const ai = SIZE_ORDER.indexOf((a.name || "").toUpperCase());
      const bi = SIZE_ORDER.indexOf((b.name || "").toUpperCase());
      if (ai === -1 && bi === -1)
        return (a.name || "").localeCompare(b.name || "");
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  };

  /**
   * Варианты подарка, отфильтрованные выбранным цветом (шаг 2 в UI).
   * Если у подарка цветов нет — возвращает все варианты.
   */
  const variantsForGiftByColor = (
    gift: PromotionGiftProduct | null,
  ): PromotionGiftVariant[] => {
    if (!gift?.variants) return [];
    const colorId = selectedGiftColorByGiftId.value[gift.id];
    const filtered = colorId
      ? gift.variants.filter((v) => v.color?.id === colorId)
      : gift.variants;
    return sortBySize(filtered);
  };

  /**
   * Выбрать цвет подарка. Если ранее выбранный variant другого цвета —
   * сбрасываем, чтобы UI не оставался в противоречивом состоянии.
   */
  const selectGiftColor = (
    gift: PromotionGiftProduct | null,
    colorId: number,
  ) => {
    if (!gift) return;
    selectedGiftColorByGiftId.value = {
      ...selectedGiftColorByGiftId.value,
      [gift.id]: colorId,
    };
    const currentVariantId = selectedGiftVariantByGiftId.value[gift.id];
    if (currentVariantId) {
      const currentVariant = (gift.variants || []).find(
        (v) => v.id === currentVariantId,
      );
      if (!currentVariant || currentVariant.color?.id !== colorId) {
        const newMap = { ...selectedGiftVariantByGiftId.value };
        delete newMap[gift.id];
        selectedGiftVariantByGiftId.value = newMap;
      }
    }
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

      // Автовыбор цвета для активного подарка (но не размера — размер
      // выбирает оператор сам). Логика повторяет витрину.
      if (
        selectedGift.value &&
        selectedGift.value.has_variants &&
        Array.isArray(selectedGift.value.variants) &&
        selectedGift.value.variants.length > 0 &&
        !selectedGiftColorByGiftId.value[selectedGift.value.id]
      ) {
        const firstColor = selectedGift.value.variants[0]?.color;
        if (firstColor?.id != null) {
          selectedGiftColorByGiftId.value = {
            ...selectedGiftColorByGiftId.value,
            [selectedGift.value.id]: firstColor.id,
          };
        }
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
      // Авто-выбор цвета: если ещё не выбран — берём цвет первого варианта.
      // Размер оператор выбирает сам — это критичный шаг и автовыбор плохо
      // воспринимается (можно случайно отгрузить «не тот» размер).
      if (!selectedGiftColorByGiftId.value[gift.id]) {
        const firstColor = gift.variants[0]?.color;
        if (firstColor?.id != null) {
          selectedGiftColorByGiftId.value = {
            ...selectedGiftColorByGiftId.value,
            [gift.id]: firstColor.id,
          };
        }
      }

      // Если ранее уже был выбран variant, проверяем что он всё ещё в наличии
      // и совпадает с выбранным цветом — иначе чистим, чтобы UI был валиден.
      const already = selectedGiftVariantByGiftId.value[gift.id];
      const colorId = selectedGiftColorByGiftId.value[gift.id];
      const stillAvailable = already
        ? gift.variants.find(
            (v) => v.id === already && (!colorId || v.color?.id === colorId),
          )
        : null;
      if (!stillAvailable && already) {
        const newMap = { ...selectedGiftVariantByGiftId.value };
        delete newMap[gift.id];
        selectedGiftVariantByGiftId.value = newMap;
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
    selectedGiftColorByGiftId,
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
    // helpers (для UI: цвет → размер)
    uniqueColorsForGift,
    variantsForGiftByColor,
    // actions
    checkApplicable,
    selectGift,
    selectGiftColor,
    selectGiftVariant,
    selectDiscount,
    getPayloadFragment,
    reset,
  };
}
