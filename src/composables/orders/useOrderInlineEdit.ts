import { ref } from "vue";
import { useOrderFunctions } from "@/composables/useOrderFunctions";

/**
 * Composable для inline-редактирования заказа на странице просмотра.
 * Собирает полный payload из текущего состояния order + патч и вызывает PUT /orders/{id}.
 *
 * Используется во всех редактируемых секциях OrderView.vue.
 */
export function useOrderInlineEdit() {
  const { updateOrder } = useOrderFunctions();
  const isSaving = ref(false);

  /**
   * Нормализует позиции заказа в формат payload для PUT.
   *
   * Сохраняет legacy-позиции (импортированные из InSales и т.п., у которых
   * product_id/variant не разрешились в локальные сущности): для них
   * передаём legacy_sku/legacy_name, чтобы бэкенд не считал такие позиции
   * невалидными и не удалял их при сохранении.
   */
  const normalizeItems = (items: any[]): any[] => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => {
        const productId = item?.product_id ?? item?.product?.id ?? null;
        const legacySku = item?.legacy_sku ?? null;
        const legacyName = item?.legacy_name ?? item?.name ?? null;
        // Позиция должна быть либо привязана к каталогу (product_id),
        // либо иметь legacy-данные. Иначе — мусор, отбрасываем.
        if (!productId && !legacySku && !legacyName) return null;

        const quantity = Number(item?.quantity ?? 1) || 1;
        const candidates = [
          item?.unit_price,
          item?.price_per_unit,
          item?.variant?.price,
        ];
        let unitPrice = 0;
        for (const c of candidates) {
          const n = Number(c);
          if (!Number.isNaN(n) && c !== null && c !== undefined) {
            unitPrice = n;
            break;
          }
        }
        if (!unitPrice) {
          const linePrice = Number(item?.price ?? 0);
          unitPrice = quantity > 0 ? linePrice / quantity : linePrice;
        }
        return {
          product_id: productId,
          variant_id:
            item?.variant_id ??
            item?.product_variant_id ??
            item?.variant?.id ??
            null,
          product_variant_id:
            item?.variant_id ??
            item?.product_variant_id ??
            item?.variant?.id ??
            null,
          color_id: item?.color_id ?? item?.color?.id ?? null,
          legacy_sku: legacySku,
          legacy_name: legacyName,
          quantity,
          price: Number.isFinite(unitPrice) ? unitPrice : 0,
        };
      })
      .filter(Boolean);
  };

  /**
   * Собирает полный payload из текущего order + локальный патч.
   * Используется как "база" - PUT принимает полный объект.
   */
  const buildPayload = (order: any, patch: Record<string, any> = {}): any => {
    const orderAddress = order?.delivery_address || {};
    const client = order?.client || {};
    const profile = client?.profile || {};

    const basePayload: any = {
      client_id: order?.client_id ?? client?.id ?? null,
      user: {
        first_name: profile.first_name || client.first_name || "",
        last_name: profile.last_name || client.last_name || "",
        phone: profile.phone || client.phone || "",
      },
      recipient: {
        first_name:
          orderAddress.recipient_first_name ||
          profile.first_name ||
          client.first_name ||
          "",
        last_name:
          orderAddress.recipient_last_name ||
          profile.last_name ||
          client.last_name ||
          "",
        middle_name:
          orderAddress.recipient_middle_name || profile.middle_name || "",
        phone:
          orderAddress.recipient_phone || profile.phone || client.phone || "",
      },
      delivery_address: {
        country: orderAddress.country || "",
        region: orderAddress.region || "",
        city: orderAddress.city || "",
        postal_code: orderAddress.postal_code || "",
        address: orderAddress.address || order?.delivery_target?.name || "",
        entrance: orderAddress.entrance || "",
        floor: orderAddress.floor || "",
        intercom: orderAddress.intercom || "",
        delivery_comment: orderAddress.delivery_comment || "",
        buyer_comment: orderAddress.buyer_comment || "",
        delivery_date:
          orderAddress.delivery_date || order?.delivery_date || null,
      },
      delivery_date:
        orderAddress.delivery_date || order?.delivery_date || null,
      source: order?.source || null,
      // ВАЖНО: items в базовый payload не кладём.
      // Раньше тут было `items: normalizeItems(order.items)`, но из-за этого
      // любой PUT (смена статуса, менеджера и т.п.) присылал items, которые
      // нормализатор фильтровал по product_id. Для импортированных
      // (legacy-)позиций product_id = null, поэтому массив приходил пустой,
      // и бэкенд (OrderUpdateService::updateOrderItems) их сносил. Теперь
      // items передаются только если patch явно их содержит — см. ниже.
      status:
        typeof order?.status === "object"
          ? (order?.status?.value ?? order?.status?.code ?? null)
          : order?.status ?? null,
      payment_status:
        typeof order?.payment_status === "object"
          ? (order?.payment_status?.value ??
            order?.payment_status?.code ??
            null)
          : order?.payment_status ?? null,
      payment_method:
        typeof order?.payment_method === "object"
          ? (order?.payment_method?.value ??
            order?.payment_method?.code ??
            order?.payment_method?.name ??
            null)
          : order?.payment_method ?? null,
      created_at: order?.created_at || null,
      delivery_method_id: order?.delivery_method_id ?? null,
      delivery_method: {
        name:
          order?.delivery_method?.name || order?.deliveryMethod?.name || null,
      },
      notes: order?.notes ?? null,
      ...(order?.promo_code?.code
        ? { promo_code: order.promo_code.code }
        : {}),
    };

    // Глубокий мердж вложенных объектов из патча
    const merged: any = { ...basePayload };
    for (const key of Object.keys(patch)) {
      const value = patch[key];
      // items приходят только при явной правке позиций; нормализуем здесь,
      // чтобы legacy-позиции (без product_id) тоже сохранились.
      if (key === "items") {
        merged.items = normalizeItems(Array.isArray(value) ? value : []);
        continue;
      }
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        merged[key] &&
        typeof merged[key] === "object" &&
        !Array.isArray(merged[key])
      ) {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = value;
      }
    }

    return merged;
  };

  /**
   * Сохраняет изменения заказа: применяет patch к текущему order и шлёт PUT.
   *
   * @param orderId ID заказа
   * @param order текущий объект order (как пришёл с /orders/{id}/view)
   * @param patch объект с изменёнными полями (можно вложенными)
   */
  const saveOrderPatch = async (
    orderId: number | string,
    order: any,
    patch: Record<string, any> = {},
  ): Promise<any> => {
    if (!orderId || !order) return null;
    isSaving.value = true;
    try {
      const payload = buildPayload(order, patch);
      return await updateOrder(orderId, payload);
    } finally {
      isSaving.value = false;
    }
  };

  return {
    isSaving,
    buildPayload,
    saveOrderPatch,
  };
}
