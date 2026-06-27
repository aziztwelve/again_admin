/**
 * Composable для работы с применёнными промо-акциями при создании заказа в админке.
 *
 * Мультиакционная (стекируемая) модель — повторяет витрину `stores/promotion.js`:
 *   1) По items + total опрашиваем `/public/promotions/check-applicable` — бэк
 *      возвращает ИТОГОВЫЙ набор применённых акций (с учётом is_stackable + priority).
 *   2) Рисуем все акции из ответа, по блоку на акцию. У каждой оператор выбирает
 *      ОДИН подарок (+ цвет→размер) либо «скидку вместо подарка».
 *   3) getPayloadFragment() возвращает массив promotions[] для тела POST /orders.
 *
 * Нюанс админки: цвет подарка автоселектится, а РАЗМЕР выбирает оператор вручную
 * (автовыбор размера опасен — можно случайно отгрузить «не тот» размер).
 *
 * Дубли подарков разрешены (Q3): один и тот же товар-подарок от двух акций —
 * два независимых выбора, поэтому ключи цвета/размера включают promotionId.
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
  is_stackable?: boolean;
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
  // Итоговый набор применённых акций (как пришёл с бэка)
  const appliedPromotions = ref<ApplicablePromotion[]>([]);
  // Выбранный подарок по каждой акции: { [promotionId]: giftId }
  const selectedGiftByPromotionId = ref<Record<number, number>>({});
  // Выбранный размер по ключу `${promotionId}:${giftId}`
  const selectedGiftVariantByKey = ref<Record<string, number>>({});
  // Выбранный цвет по ключу `${promotionId}:${giftId}`
  const selectedGiftColorByKey = ref<Record<string, number>>({});
  // Режим по каждой акции: 'gift' | 'discount'
  const userChoiceByPromotionId = ref<Record<number, "gift" | "discount">>({});
  const isLoading = ref(false);
  const errorMessage = ref<string>("");

  let requestId = 0;

  const keyOf = (promotionId: number, giftId: number) =>
    `${promotionId}:${giftId}`;

  // ========================================
  // HELPERS (по конкретной акции)
  // ========================================

  const giftProductsFor = (
    promotion: ApplicablePromotion | null | undefined,
  ): PromotionGiftProduct[] => promotion?.gift_products || [];

  const userChoiceFor = (promotionId: number): "gift" | "discount" =>
    userChoiceByPromotionId.value[promotionId] || "gift";

  const useDiscountInsteadFor = (promotionId: number): boolean =>
    userChoiceFor(promotionId) === "discount";

  const selectedGiftIdFor = (promotionId: number): number | null =>
    selectedGiftByPromotionId.value[promotionId] ?? null;

  const selectedGiftFor = (
    promotion: ApplicablePromotion | null | undefined,
  ): PromotionGiftProduct | null => {
    if (!promotion) return null;
    const giftId = selectedGiftByPromotionId.value[promotion.id];
    if (!giftId) return null;
    return giftProductsFor(promotion).find((g) => g.id === giftId) || null;
  };

  const selectedColorIdFor = (
    promotionId: number,
    giftId: number,
  ): number | null =>
    selectedGiftColorByKey.value[keyOf(promotionId, giftId)] ?? null;

  const selectedVariantIdFor = (
    promotionId: number,
    giftId: number,
  ): number | null =>
    selectedGiftVariantByKey.value[keyOf(promotionId, giftId)] ?? null;

  const selectedVariantFor = (
    promotion: ApplicablePromotion | null | undefined,
  ): PromotionGiftVariant | null => {
    const gift = selectedGiftFor(promotion);
    if (!gift || !promotion) return null;
    const variantId = selectedVariantIdFor(promotion.id, gift.id);
    if (!variantId) return null;
    return (gift.variants || []).find((v) => v.id === variantId) || null;
  };

  const needsVariantSelectionFor = (
    promotion: ApplicablePromotion | null | undefined,
  ): boolean => {
    const gift = selectedGiftFor(promotion);
    if (!gift) return false;
    if (!gift.has_variants) return false;
    return (gift.variants || []).length > 0;
  };

  /**
   * Уникальные цвета у вариантов подарка. Используем для шага 1 в UI.
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

  // Стандартная сортировка размеров — повторяет порядок витрины.
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
   * Варианты подарка для конкретной акции, отфильтрованные выбранным цветом.
   */
  const variantsForGiftByColor = (
    promotionId: number,
    gift: PromotionGiftProduct | null,
  ): PromotionGiftVariant[] => {
    if (!gift?.variants) return [];
    const colorId = selectedGiftColorByKey.value[keyOf(promotionId, gift.id)];
    const filtered = colorId
      ? gift.variants.filter((v) => v.color?.id === colorId)
      : gift.variants;
    return sortBySize(filtered);
  };

  // ========================================
  // COMPUTED
  // ========================================

  const hasPromotion = computed(() => appliedPromotions.value.length > 0);

  // Промокоды разрешены, только если ВСЕ применённые акции их разрешают.
  const allowPromoCodes = computed(() => {
    if (appliedPromotions.value.length === 0) return true;
    return appliedPromotions.value.every((p) => !!p.allow_promo_codes);
  });

  // Акции, запрещающие промокоды (для пояснения оператору).
  const promoBlockingPromotions = computed(() =>
    appliedPromotions.value.filter((p) => !p.allow_promo_codes),
  );

  // Выбор завершён по ВСЕМ применённым акциям.
  const isGiftSelectionComplete = computed(() => {
    if (appliedPromotions.value.length === 0) return true;
    return appliedPromotions.value.every((p) => {
      if (useDiscountInsteadFor(p.id)) return true;
      const gift = selectedGiftFor(p);
      if (!gift) return false;
      if (!gift.has_variants) return true;
      const variants = gift.variants || [];
      if (variants.length === 0) return false;
      return !!selectedVariantIdFor(p.id, gift.id);
    });
  });

  // ========================================
  // ACTIONS
  // ========================================

  const reset = () => {
    appliedPromotions.value = [];
    selectedGiftByPromotionId.value = {};
    selectedGiftVariantByKey.value = {};
    selectedGiftColorByKey.value = {};
    userChoiceByPromotionId.value = {};
    errorMessage.value = "";
  };

  /**
   * Пересобрать карты выбора под актуальный набор акций. Сохраняет валидный
   * прошлый выбор, чистит устаревшее, автоселектит подарок и ЦВЕТ (но не размер —
   * размер выбирает оператор). Акции, выпавшие из набора, теряют свой выбор;
   * остальные сохраняются.
   */
  const rebuildSelections = (promotions: ApplicablePromotion[]) => {
    const nextGift: Record<number, number> = {};
    const nextColor: Record<string, number> = {};
    const nextVariant: Record<string, number> = {};
    const nextChoice: Record<number, "gift" | "discount"> = {};

    for (const p of promotions) {
      const gifts = giftProductsFor(p);

      let choice = userChoiceByPromotionId.value[p.id] || "gift";
      if (!p.allow_promo_codes) choice = "gift";
      nextChoice[p.id] = choice;

      if (choice === "discount") continue;

      const prevGiftId = selectedGiftByPromotionId.value[p.id];
      let gift = prevGiftId ? gifts.find((g) => g.id === prevGiftId) : null;
      if (!gift && gifts.length > 0) gift = gifts[0];
      if (!gift) continue;
      nextGift[p.id] = gift.id;

      if (
        gift.has_variants &&
        Array.isArray(gift.variants) &&
        gift.variants.length > 0
      ) {
        const key = keyOf(p.id, gift.id);

        // Цвет: сохраняем валидный, иначе цвет первого варианта (автоселект).
        let colorId: number | null = selectedGiftColorByKey.value[key] ?? null;
        const colorValid =
          colorId != null && gift.variants.some((v) => v.color?.id === colorId);
        if (!colorValid) {
          colorId = gift.variants[0]?.color?.id ?? null;
        }
        if (colorId != null) nextColor[key] = colorId;

        // Размер: сохраняем валидный прошлый выбор (совпадающий с цветом),
        // но НЕ автоселектим новый — это делает оператор.
        const prevVariantId = selectedGiftVariantByKey.value[key];
        const variantValid =
          prevVariantId != null &&
          gift.variants.some(
            (v) =>
              v.id === prevVariantId &&
              (colorId == null || v.color?.id === colorId),
          );
        if (variantValid) nextVariant[key] = prevVariantId;
      }
    }

    selectedGiftByPromotionId.value = nextGift;
    selectedGiftColorByKey.value = nextColor;
    selectedGiftVariantByKey.value = nextVariant;
    userChoiceByPromotionId.value = nextChoice;
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

      appliedPromotions.value = promos;
      rebuildSelections(promos);
    } catch (e: any) {
      if (myRequestId === requestId) {
        errorMessage.value =
          e?.response?.data?.message || "Не удалось проверить доступные акции";
        // не сбрасываем стейт, чтобы оператор не потерял выбор подарка
      }
    } finally {
      if (myRequestId === requestId) {
        isLoading.value = false;
      }
    }
  };

  const selectGift = (
    promotionId: number,
    gift: PromotionGiftProduct | null,
  ) => {
    userChoiceByPromotionId.value = {
      ...userChoiceByPromotionId.value,
      [promotionId]: "gift",
    };

    if (!gift) return;

    selectedGiftByPromotionId.value = {
      ...selectedGiftByPromotionId.value,
      [promotionId]: gift.id,
    };

    if (
      gift.has_variants &&
      Array.isArray(gift.variants) &&
      gift.variants.length > 0
    ) {
      const key = keyOf(promotionId, gift.id);

      // Авто-выбор цвета (но не размера — размер выбирает оператор).
      if (!selectedGiftColorByKey.value[key]) {
        const firstColor = gift.variants[0]?.color;
        if (firstColor?.id != null) {
          selectedGiftColorByKey.value = {
            ...selectedGiftColorByKey.value,
            [key]: firstColor.id,
          };
        }
      }

      // Если ранее выбранный размер не совпадает с цветом/недоступен — чистим.
      const already = selectedGiftVariantByKey.value[key];
      const colorId = selectedGiftColorByKey.value[key];
      const stillAvailable = already
        ? gift.variants.find(
            (v) => v.id === already && (!colorId || v.color?.id === colorId),
          )
        : null;
      if (!stillAvailable && already) {
        const newMap = { ...selectedGiftVariantByKey.value };
        delete newMap[key];
        selectedGiftVariantByKey.value = newMap;
      }
    }
  };

  const selectGiftColor = (
    promotionId: number,
    gift: PromotionGiftProduct | null,
    colorId: number,
  ) => {
    if (!gift) return;
    const key = keyOf(promotionId, gift.id);
    selectedGiftColorByKey.value = {
      ...selectedGiftColorByKey.value,
      [key]: colorId,
    };
    const currentVariantId = selectedGiftVariantByKey.value[key];
    if (currentVariantId) {
      const currentVariant = (gift.variants || []).find(
        (v) => v.id === currentVariantId,
      );
      if (!currentVariant || currentVariant.color?.id !== colorId) {
        const newMap = { ...selectedGiftVariantByKey.value };
        delete newMap[key];
        selectedGiftVariantByKey.value = newMap;
      }
    }
  };

  const selectGiftVariant = (
    promotionId: number,
    gift: PromotionGiftProduct | null,
    variant: PromotionGiftVariant,
  ) => {
    if (!gift || !variant) return;
    selectedGiftVariantByKey.value = {
      ...selectedGiftVariantByKey.value,
      [keyOf(promotionId, gift.id)]: variant.id,
    };
  };

  const selectDiscount = (promotionId: number) => {
    const promotion = appliedPromotions.value.find((p) => p.id === promotionId);
    if (promotion && !promotion.allow_promo_codes) return;
    userChoiceByPromotionId.value = {
      ...userChoiceByPromotionId.value,
      [promotionId]: "discount",
    };
    const newGiftMap = { ...selectedGiftByPromotionId.value };
    delete newGiftMap[promotionId];
    selectedGiftByPromotionId.value = newGiftMap;
  };

  /**
   * Формирует часть payload-а для POST /orders — массив promotions[].
   * Если применённых акций нет — возвращает пустой объект (ничего не добавляет).
   */
  const getPayloadFragment = (): Record<string, unknown> => {
    if (appliedPromotions.value.length === 0) return {};

    const promotions = appliedPromotions.value.map((p) => {
      const useDiscount = useDiscountInsteadFor(p.id);
      const entry: Record<string, unknown> = {
        promotion_id: p.id,
        use_discount_instead: useDiscount,
      };
      if (!useDiscount) {
        const gift = selectedGiftFor(p);
        if (gift) {
          entry.gift_product_id = gift.id;
          if (gift.has_variants) {
            const variant = selectedVariantFor(p);
            if (variant) entry.gift_product_variant_id = variant.id;
          }
        }
      }
      return entry;
    });

    return { promotions };
  };

  // Авто-обновление при изменении корзины/суммы
  watch(
    [items, total],
    () => {
      checkApplicable();
    },
    { deep: true },
  );

  return {
    // state
    appliedPromotions,
    selectedGiftByPromotionId,
    selectedGiftVariantByKey,
    selectedGiftColorByKey,
    userChoiceByPromotionId,
    isLoading,
    errorMessage,
    // computed
    hasPromotion,
    allowPromoCodes,
    promoBlockingPromotions,
    isGiftSelectionComplete,
    // helpers (per-promotion)
    giftProductsFor,
    userChoiceFor,
    useDiscountInsteadFor,
    selectedGiftIdFor,
    selectedGiftFor,
    selectedColorIdFor,
    selectedVariantIdFor,
    selectedVariantFor,
    needsVariantSelectionFor,
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
