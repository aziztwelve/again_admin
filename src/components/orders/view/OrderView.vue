<template>
  <Loader v-if="isLoading" />
  <div v-else-if="!order" class="p-6 text-sm text-gray-500">Заказ не найден</div>
  <div v-else class="space-y-6">
    <OrderHeader
      :order="order"
      :neighbors="neighbors"
      :view-order-url="viewOrderUrl"
      :copying="isCopying"
      @copy="onCopy"
    />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Основная колонка -->
      <div class="space-y-6 lg:col-span-2">
        <OrderStatuses :order="order" @update="onStatusUpdate" />
        <OrderActions
          :order="order"
          @add-position="onAddPosition"
          @coupon-select="onCouponSelected"
        />

        <div
          v-if="appliedCouponCode"
          class="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3"
        >
          <div class="text-sm text-emerald-800">
            Применён купон:
            <span class="font-semibold">{{ appliedCouponCode }}</span>
            <span v-if="couponSavings > 0">
              · скидка {{ formatPrice(couponSavings) }}
            </span>
            <span
              v-if="couponNotApplicableCount > 0"
              class="ml-2 text-amber-700"
            >
              ({{ couponNotApplicableCount }}
              {{ pluralizeProducts(couponNotApplicableCount) }} без скидки)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="text-emerald-700 hover:text-emerald-900"
            :disabled="isSavingCoupon"
            @click="clearCoupon"
          >
            Снять
          </Button>
        </div>

        <OrderItemsTable
          :items="order.items || []"
          :summary="summary"
          :saving="isSavingItems"
          @save="onItemsSave"
        />
        <OrderDeliveryRow
          :order="order"
          :saving="isSavingDelivery"
          @save="onDeliverySave"
        />
        <OrderTotals :order="order" :summary="summary" />
        <OrderCustomFields
          :fields="customFields"
          :saving="isSavingCustomFields"
          @save="onCustomFieldsSave"
        />
        <OrderComments :order="order" />
        <OrderBonuses :order="order" />
        <OrderHistory :history="history" />
        <OrderSimilarClients :clients="similarClients" />
      </div>

      <!-- Боковая колонка -->
      <aside class="space-y-6">
        <SideApps :order="order" />
        <SideDelivery
          :order="order"
          :saving="isSavingDelivery"
          @save="onDeliverySave"
        />
        <SideClient
          :client="order.client"
          :order="order"
          :stats="clientStats"
          :saving="isSavingClient"
          @save="onClientSave"
        />
        <SideTasks
          :order-id="order.id"
          :tasks="tasks"
          @refresh="fetchOrder(order.id)"
        />
        <SideCdek :order="order" />
        <SideSource :source="source" />
        <SideViewedProducts :products="viewedProducts" />
        <SidePaymentWidgets :payments="payments" />
        <SideMoySklad :order="order" />
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

import Loader from "@/components/common/Loader.vue";
import Button from "@/components/ui/button/Button.vue";
import { useToast } from "@/components/ui/toast/use-toast";

import OrderHeader from "./partials/OrderHeader.vue";
import OrderStatuses from "./partials/OrderStatuses.vue";
import OrderActions from "./partials/OrderActions.vue";
import OrderItemsTable from "./partials/OrderItemsTable.vue";
import OrderDeliveryRow from "./partials/OrderDeliveryRow.vue";
import OrderTotals from "./partials/OrderTotals.vue";
import OrderCustomFields from "./partials/OrderCustomFields.vue";
import OrderComments from "./partials/OrderComments.vue";
import OrderBonuses from "./partials/OrderBonuses.vue";
import OrderHistory from "./partials/OrderHistory.vue";
import OrderSimilarClients from "./partials/OrderSimilarClients.vue";

import SideApps from "./partials/side/SideApps.vue";
import SideDelivery from "./partials/side/SideDelivery.vue";
import SideClient from "./partials/side/SideClient.vue";
import SideTasks from "./partials/side/SideTasks.vue";
import SideCdek from "./partials/side/SideCdek.vue";
import SideSource from "./partials/side/SideSource.vue";
import SideViewedProducts from "./partials/side/SideViewedProducts.vue";
import SidePaymentWidgets from "./partials/side/SidePaymentWidgets.vue";
import SideMoySklad from "./partials/side/SideMoySklad.vue";

import { useOrderInlineEdit } from "@/composables/orders/useOrderInlineEdit";

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const order = ref(null);
const summary = ref(null);
const clientStats = ref(null);
const history = ref([]);
const payments = ref([]);
const tasks = ref([]);
const customFields = ref([]);
const viewedProducts = ref([]);
const source = ref({});
const neighbors = ref({ prev_id: null, next_id: null });
const similarClients = ref([]);
const viewOrderUrl = ref(null);

const { saveOrderPatch } = useOrderInlineEdit();
const { toast } = useToast();

const isSavingItems = ref(false);
const isSavingDelivery = ref(false);
const isSavingClient = ref(false);
const isSavingCoupon = ref(false);
const isSavingCustomFields = ref(false);

// Состояние купона
const appliedCouponCode = ref("");
const couponSavings = ref(0);
const couponNotApplicableCount = ref(0);

const fetchOrder = async (id) => {
  isLoading.value = true;
  try {
    const { data } = await axios.get(`/orders/${id}/view`);
    order.value = data?.order ?? null;
    summary.value = data?.summary ?? null;
    clientStats.value = data?.client_stats ?? null;
    history.value = data?.history ?? [];
    payments.value = data?.payments ?? [];
    tasks.value = data?.tasks ?? [];
    customFields.value = data?.custom_fields ?? [];
    viewedProducts.value = data?.viewed_products ?? [];
    source.value = data?.source ?? {};
    neighbors.value = data?.neighbors ?? { prev_id: null, next_id: null };
    similarClients.value = Array.isArray(data?.similar_clients)
      ? data.similar_clients
      : [];
    viewOrderUrl.value = data?.view_order_url ?? null;

    // Синхронизируем состояние купона с заказом
    appliedCouponCode.value = order.value?.promo_code?.code || "";
    couponSavings.value = Number(order.value?.total_promo_discount || 0);
  } catch (e) {
    console.error("Failed to load order view", e);
    order.value = null;
  } finally {
    isLoading.value = false;
  }
};

/**
 * Универсальный сейв: применяет patch к текущему order и шлёт PUT /orders/{id}.
 * После успешного сохранения перечитывает заказ.
 */
const applyPatch = async (patch, savingRef) => {
  if (!order.value || !route.params.id) return false;
  if (savingRef) savingRef.value = true;
  try {
    await saveOrderPatch(route.params.id, order.value, patch);
    await fetchOrder(route.params.id);
    return true;
  } catch (e) {
    console.error("Failed to save order patch", e);
    return false;
  } finally {
    if (savingRef) savingRef.value = false;
  }
};

// === Хендлеры секций ===

// Статусы и менеджер: auto-save при выборе
const onStatusUpdate = async (patch) => {
  await applyPatch(patch);
};

// Позиции: сохранение через явную кнопку Сохранить
const onItemsSave = async (newItems) => {
  await applyPatch({ items: newItems }, isSavingItems);
};

// Добавление позиции: сразу аппендим в items и сохраняем
// Принимает либо {product, variant} (новая модалка с выбором вариантов),
// либо просто product (на случай старого вызова).
const onAddPosition = async (payload) => {
  const product = payload?.product ?? payload;
  const variant = payload?.variant ?? null;
  if (!product?.id) return;

  const variantId = variant?.id ?? null;
  const price = Number(variant?.price ?? product?.price ?? 0);
  const stockQty = variant
    ? Number(variant.stock_quantity ?? variant.inventory_balance ?? 0)
    : Number(product.stock_quantity ?? 0);

  const existingItems = Array.isArray(order.value?.items)
    ? order.value.items.map((it) => ({ ...it }))
    : [];

  // Если такая позиция уже есть — увеличим количество
  const existing = existingItems.find(
    (it) =>
      `${it.product_id ?? it.product?.id ?? ""}` === `${product.id}` &&
      `${it.variant_id ?? it.product_variant_id ?? it.variant?.id ?? ""}` ===
        `${variantId ?? ""}`,
  );

  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + 1;
  } else {
    existingItems.push({
      product_id: product.id,
      variant_id: variantId,
      product_variant_id: variantId,
      color_id: variant?.color?.id ?? null,
      quantity: 1,
      unit_price: price,
      price,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        weight: product.weight ?? null,
        stock_quantity: product.stock_quantity ?? 0,
        images: product.images ?? [],
      },
      variant: variant
        ? {
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stock_quantity: stockQty,
          }
        : null,
    });
  }

  await applyPatch({ items: existingItems });
};

// Доставка
const onDeliverySave = async (payload) => {
  const { onSuccess, ...patch } = payload || {};
  const ok = await applyPatch(patch, isSavingDelivery);
  if (ok && typeof onSuccess === "function") onSuccess();
};

// Клиент
const onClientSave = async (payload) => {
  const { onSuccess, ...patch } = payload || {};
  const ok = await applyPatch(patch, isSavingClient);
  if (ok && typeof onSuccess === "function") onSuccess();
};

// Поля заказа (кастомные поля)
const onCustomFieldsSave = async (payload) => {
  const { onSuccess, ...patch } = payload || {};
  const ok = await applyPatch(patch, isSavingCustomFields);
  if (ok && typeof onSuccess === "function") onSuccess();
};

// Купон: валидация, применение и снятие.
// Логика повторяет OrderCreate, но применяется к существующему заказу через PUT.
const formatPrice = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(amount);
};

const pluralizeProducts = (count) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
    return "товара";
  return "товаров";
};

const buildPromoCheckUrl = (code) => {
  const params = new URLSearchParams();
  params.append("code", code);

  const clientId = order.value?.client?.id ?? order.value?.client_id ?? null;
  if (clientId) {
    params.append("client_id", String(clientId));
  }

  const items = Array.isArray(order.value?.items) ? order.value.items : [];
  items.forEach((item) => {
    const productId = item.product_id ?? item.product?.id;
    if (!productId) return;
    const variantId =
      item.variant_id ?? item.product_variant_id ?? item.variant?.id ?? null;
    if (variantId) {
      params.append(`product_ids[${productId}][]`, String(variantId));
    } else {
      params.append(`product_ids[${productId}]`, "");
    }
  });

  return `/promo-codes/validate?${params.toString()}`;
};

const onCouponSelected = async (promoCode) => {
  if (!promoCode?.code) return;
  if (appliedCouponCode.value === promoCode.code) return;

  const clientId = order.value?.client?.id ?? order.value?.client_id ?? null;
  const items = Array.isArray(order.value?.items) ? order.value.items : [];

  if (!clientId) {
    toast({
      title: "Купон не применён",
      description: "Сначала выберите клиента для заказа.",
      variant: "destructive",
    });
    return;
  }

  if (!items.length) {
    toast({
      title: "Купон не применён",
      description: "Добавьте хотя бы одну позицию в заказ.",
      variant: "destructive",
    });
    return;
  }

  // Превалидация — чтобы получить читаемое сообщение и показать предполагаемую скидку.
  try {
    const url = buildPromoCheckUrl(promoCode.code);
    const { data: response } = await axios.get(url);

    if (!response?.success) {
      toast({
        title: "Промокод не применён",
        description: response?.message || "Не удалось применить промокод",
        variant: "destructive",
      });
      return;
    }

    couponNotApplicableCount.value = Array.isArray(
      response?.not_applicable_products,
    )
      ? response.not_applicable_products.length
      : 0;

    const ok = await applyPatch(
      { promo_code: promoCode.code },
      isSavingCoupon,
    );
    if (ok) {
      appliedCouponCode.value = promoCode.code;
      toast({
        title: "Купон применён",
        description:
          response.message || `Промокод ${promoCode.code} применён к заказу.`,
      });
    }
  } catch (error) {
    const message =
      error?.response?.data?.message || "Ошибка при применении промокода";
    toast({
      title: "Промокод не применён",
      description: message,
      variant: "destructive",
    });
  }
};

const clearCoupon = async () => {
  if (!appliedCouponCode.value) return;
  const ok = await applyPatch({ promo_code: null }, isSavingCoupon);
  if (ok) {
    appliedCouponCode.value = "";
    couponSavings.value = 0;
    couponNotApplicableCount.value = 0;
    toast({ title: "Купон снят с заказа" });
  }
};

const isCopying = ref(false);

const onCopy = async () => {
  if (!confirm(`Скопировать заказ №${order.value?.order_number}? Будет создан новый заказ с теми же товарами и данными клиента.`)) {
    return;
  }

  isCopying.value = true;
  try {
    const { data } = await axios.post(`/orders/${order.value.id}/duplicate`);
    if (data?.success) {
      toast({ title: `Заказ скопирован → №${data.order.order_number}` });
      router.push(`/order/${data.order.id}`);
    } else {
      toast({ title: "Ошибка при копировании заказа", variant: "destructive" });
    }
  } catch (e) {
    console.error("duplicate error", e);
    toast({ title: "Ошибка при копировании заказа", variant: "destructive" });
  } finally {
    isCopying.value = false;
  }
};

onMounted(() => fetchOrder(route.params.id));

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchOrder(newId);
    }
  },
);
</script>
