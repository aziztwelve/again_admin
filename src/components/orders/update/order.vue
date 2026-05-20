<template>
  <Loader v-if="isPageLoading" />
  <div v-else>
    <PageHeading :title="pageTitle" />
    <div
      class="mt-10 mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
    >
      <div
        class="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-3 lg:row-end-3"
      >
        <div class="mt-6">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-sm/6 font-medium text-gray-900">
                Позиции заказа
              </h3>
              <p class="text-sm text-gray-500">
                Измените состав заказа через поиск товаров.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <OrderPositionModal
                v-model="productSearch"
                :products="filteredProducts"
                @select="addPosition"
              />
              <PromoCodeListModal
                trigger-label="Купон"
                :client-id="formData.client_id"
                @select="onCouponSelected"
              />
            </div>
          </div>

          <p v-if="validationErrors.items" class="mt-2 text-sm text-red-600">
            {{ validationErrors.items[0] }}
          </p>

          <div class="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Товар
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Цена
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Кол-во
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Остаток
                  </th>
                  <th
                    class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Сумма
                  </th>
                  <th
                    class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500"
                  ></th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="!data.items.length">
                  <td colspan="6" class="px-4 py-6 text-sm text-gray-500">
                    Пока нет позиций. Добавьте товар через кнопку "Позиция".
                  </td>
                </tr>

                <tr
                  v-for="(item, index) in data.items"
                  :key="`${item.product_id}-${item.variant_id ?? 'default'}-${index}`"
                >
                  <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getProductName(item) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Артикул: {{ getProductSku(item) }}
                    </div>
                  </td>

                  <td class="px-4 py-3">
                    <input
                      v-model.number="item.price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="block w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </td>

                  <td class="px-4 py-3">
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      step="1"
                      class="block w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </td>

                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ getProductStock(item) }} шт
                  </td>

                  <td
                    class="px-4 py-3 text-right text-sm font-medium text-gray-900"
                  >
                    {{ formatPrice(getItemTotal(item)) }}
                  </td>

                  <td class="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      @click="removePosition(index)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="pendingCouponCode && !appliedCouponCode"
            class="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
          >
            <div class="text-sm text-amber-800">
              Купон <span class="font-semibold">{{ pendingCouponCode }}</span>
              выбран. Скидка применится автоматически после
              <template v-if="!formData.client_id && !data.items.length">
                выбора клиента и добавления позиций.
              </template>
              <template v-else-if="!formData.client_id">
                выбора клиента.
              </template>
              <template v-else>
                добавления хотя бы одной позиции.
              </template>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="text-amber-700 hover:text-amber-900"
              @click="clearCoupon"
            >
              Отменить
            </Button>
          </div>

          <div
            v-if="appliedCouponCode"
            class="mt-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3"
          >
            <div class="text-sm text-emerald-800">
              Применён купон:
              <span class="font-semibold">{{ appliedCouponCode }}</span>
              <span v-if="couponSavings > 0">
                · скидка {{ formatPrice(couponSavings) }}
              </span>
              <span
                v-if="couponNotApplicableCount > 0"
                class="text-amber-700 ml-2"
              >
                ({{ couponNotApplicableCount }} {{ pluralizeProducts(couponNotApplicableCount) }} без скидки)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="text-emerald-700 hover:text-emerald-900"
              @click="clearCoupon"
            >
              Снять
            </Button>
          </div>

          <div v-if="data.items.length" class="mt-4 space-y-1">
            <Label for="delivery_method">Способ доставки</Label>
            <Select
              id="delivery_method"
              v-model="formData.delivery_method_name"
              :options="deliveryMethodOptions"
              option-label="label"
              option-value="value"
              placeholder="Выберите способ доставки"
            />
          </div>
        </div>

        <div class="mt-6">
          <DynamicForm
            v-model="formData"
            :fields="formFields"
            :show-submit-button="false"
          />
        </div>

        <div class="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            @click="handleUpdate"
            :disabled="isSaving"
            class="rounded-md bg-red-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <span v-if="!isSaving">Сохранить</span>
            <span v-else>Сохранение...</span>
          </button>
        </div>
      </div>

      <OrderQuickClientCreate
        :clients="clients"
        :selected-client="selectedClient"
        :refresh-clients="getClients"
        :errors="validationErrors"
        @created="handleQuickClientCreated"
        @cleared="handleClientCleared"
      />

      <OrderRecipientDetails
        v-model:recipient="formData.recipient"
        :errors="recipientErrors"
      />

      <OrderDeliveryDetails
        v-model:delivery-address="formData.delivery_address"
        :errors="validationErrors"
      />

      <SideTasks
        :order-id="route.params.id"
        :tasks="orderTasks"
        @refresh="loadOrderTasks"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import axios from "axios";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { Trash2 } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

import Loader from "@/components/common/Loader.vue";
import PageHeading from "@/components/common/PageHeading.vue";
import DynamicForm from "@/components/dynamics/DynamicForm.vue";
import OrderDeliveryDetails from "@/components/orders/create/OrderDeliveryDetails.vue";
import OrderRecipientDetails from "@/components/orders/create/OrderRecipientDetails.vue";
import OrderQuickClientCreate from "@/components/orders/create/OrderQuickClientCreate.vue";
import OrderPositionModal from "@/components/orders/modals/OrderPositionModal.vue";
import PromoCodeListModal from "@/components/orders/modals/PromoCodeListModal.vue";
import SideTasks from "@/components/orders/view/partials/side/SideTasks.vue";
import Button from "@/components/ui/button/Button.vue";
import { Label } from "@/components/ui/label";
import Select from "@/components/dynamics/Dropdown/Select.vue";
import { useProductFunctions } from "@/composables/useProductFunctions";
import { useStatusFunctions } from "@/composables/useStatusFunctions";
import { useOrderFunctions } from "@/composables/useOrderFunctions";
import { useTaskFunctions } from "@/composables/useTaskFunctions";
import { useOrderPaymentMethods } from "@/composables/orders/useOrderPaymentMethods";
import { ORDER_SOURCE_OPTIONS } from "@/composables/orders/orderSourceOptions";

const store = useStore();
const route = useRoute();
const router = useRouter();

const productSearch = ref("");
const products = ref([]);
const isPageLoading = ref(true);
const isSaving = ref(false);
const appliedCouponCode = ref("");
const pendingCouponCode = ref("");
const couponSavings = ref(0);
const couponNotApplicableCount = ref(0);
const itemOriginalPrices = ref(new Map());
const validationErrors = ref({});
const { toast } = useToast();
const orderMeta = ref(null);
const orderTasks = ref([]);

const { getTasks } = useTaskFunctions();

const loadOrderTasks = async () => {
  if (!route.params.id) return;
  const result = await getTasks({ order_id: route.params.id, per_page: 100 });
  orderTasks.value = result?.tasks ?? [];
};

const { getProducts: getProductsFromApi } = useProductFunctions();
const { getAllStatuses, getStatuses } = useStatusFunctions();
const { getOrderById, updateOrder } = useOrderFunctions();
const { paymentMethodOptions, fetchPaymentMethods } = useOrderPaymentMethods();

const pageTitle = computed(() => `Редактировать заказ #${route.params.id}`);

const data = reactive({
  items: [],
});

const createEmptyDeliveryAddress = () => ({
  country: "",
  region: "",
  city: "",
  postal_code: "",
  address: "",
  entrance: "",
  floor: "",
  intercom: "",
  delivery_comment: "",
  delivery_date: "",
  buyer_comment: "",
});

const createEmptyRecipient = () => ({
  first_name: "",
  last_name: "",
  middle_name: "",
  phone: "",
});

const formData = reactive({
  client_id: null,
  user: {
    first_name: "",
    last_name: "",
    phone: "",
  },
  recipient: createEmptyRecipient(),
  delivery_address: createEmptyDeliveryAddress(),
  source: "",
  status: "new",
  payment_status: "pending",
  payment_method: "",
  delivery_method_name: "Курьерская доставка",
  address: "",
});

const deliveryMethodOptions = [
  { value: "Курьерская доставка", label: "Курьерская доставка" },
  { value: "Сдэк", label: "Сдэк" },
];

const getClients = () => store.dispatch("clients/getClients");
const clients = computed(() => store.getters["clients/clients"]);
const filteredProducts = computed(() => products.value);
const selectedClient = computed(() => {
  if (!formData.client_id) {
    return null;
  }

  return (
    (clients.value || []).find(
      (client) => `${client?.id}` === `${formData.client_id}`,
    ) ||
    (`${orderMeta.value?.client?.id ?? ""}` === `${formData.client_id}`
      ? orderMeta.value?.client
      : null)
  );
});
const addressOptions = computed(() => {
  const rawList = (clients.value || [])
    .map((client) => client?.profile?.address || client?.address || "")
    .filter((addr) => typeof addr === "string" && addr.trim().length > 0);
  const unique = Array.from(new Set(rawList));
  return unique.map((a) => ({ value: a, label: a }));
});

const formFields = computed(() => [
  [
    {
      name: "status",
      component: "select",
      label: "Статус заказа",
      required: true,
      options: getStatuses("order"),
      optionLabel: "label",
      optionValue: "value",
    },
    {
      name: "payment_status",
      component: "select",
      label: "Статус оплаты",
      required: true,
      options: [
        { value: "pending", label: "Ожидание" },
        { value: "paid", label: "Оплачено" },
      ],
      optionLabel: "label",
      optionValue: "value",
    },
  ],
  [
    {
      name: "payment_method",
      component: "select",
      label: "Способ оплаты",
      required: false,
      placeholder: "Выберите способ оплаты",
      options: paymentMethodOptions.value,
      optionLabel: "label",
      optionValue: "value",
    },
    {
      name: "source",
      component: "select",
      label: "Источник",
      required: false,
      placeholder: "Выберите источник",
      options: ORDER_SOURCE_OPTIONS,
      optionLabel: "label",
      optionValue: "value",
    },
  ],
  [
    {
      name: "address",
      component: "select",
      label: "Адрес",
      required: false,
      placeholder: "Выберите адрес",
      options: addressOptions.value,
      optionLabel: "label",
      optionValue: "value",
    },
  ],
]);

onMounted(async () => {
  loadOrderTasks();
  await Promise.all([
    getAllStatuses(),
    fetchPaymentMethods(),
    getClients(),
    fetchProducts(),
  ]);
  await loadOrder(route.params.id);
});

const normalizeProductsResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  return [];
};

const fetchProducts = async (search = "") => {
  const response = await getProductsFromApi({
    per_page: 50,
    paginate: false,
    admin: true,
    is_active: 1,
    search: search || undefined,
  });

  products.value = normalizeProductsResponse(response);
};

const getProductById = (productId) => {
  return (products.value || []).find(
    (product) => `${product.id}` === `${productId}`,
  );
};

const getVariantById = (productId, variantId) => {
  if (!variantId) return null;
  const product = getProductById(productId);
  if (!product || !Array.isArray(product.variants)) return null;
  return product.variants.find((v) => `${v?.id ?? ""}` === `${variantId}`) || null;
};

const getFallbackItemProductData = (item) => ({
  name: item.product_name || item.product?.name || `Товар #${item.product_id}`,
  sku: item.product_sku || item.product?.sku || item.variant?.name || "—",
  stock_quantity: Number(
    item.stock_quantity ?? item.product?.stock_quantity ?? 0,
  ),
});

const getProductName = (item) => {
  const baseName =
    getProductById(item.product_id)?.name ||
    getFallbackItemProductData(item).name;
  const variant = getVariantById(item.product_id, item.variant_id);
  const variantName = variant?.name || item.variant_name || item.variant?.name;
  return variantName ? `${baseName} (${variantName})` : baseName;
};

const getProductSku = (item) => {
  const variant = getVariantById(item.product_id, item.variant_id);
  return (
    variant?.sku ||
    item.variant_sku ||
    getProductById(item.product_id)?.sku ||
    getFallbackItemProductData(item).sku
  );
};

const getProductStock = (item) => {
  const variant = getVariantById(item.product_id, item.variant_id);
  if (variant) {
    return Number(variant.stock_quantity ?? variant.inventory_balance ?? 0);
  }
  const product = getProductById(item.product_id);
  return Number(
    product?.stock_quantity ??
      getFallbackItemProductData(item).stock_quantity ??
      0,
  );
};

const formatPrice = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(amount);
};

const getItemTotal = (item) => {
  return Number(item.price || 0) * Number(item.quantity || 0);
};

const getApiPrice = (product) => {
  return Number(product?.price ?? 0);
};

const addPosition = (payload) => {
  // Поддерживаем оба варианта: {product, variant} и просто product (на случай старого вызова).
  const product = payload?.product ?? payload;
  const variant = payload?.variant ?? null;

  if (!product?.id) return;

  const variantId = variant?.id ?? null;
  const existingItem = data.items.find(
    (item) =>
      `${item.product_id}` === `${product.id}` &&
      `${item.variant_id ?? ""}` === `${variantId ?? ""}`,
  );

  if (existingItem) {
    existingItem.quantity = Number(existingItem.quantity || 0) + 1;
    return;
  }

  const price = variant ? Number(variant.price ?? 0) : getApiPrice(product);
  const stockQty = variant
    ? Number(variant.stock_quantity ?? variant.inventory_balance ?? 0)
    : Number(product.stock_quantity ?? 0);

  data.items.push({
    product_id: product.id,
    variant_id: variantId,
    product_variant_id: variantId,
    quantity: 1,
    price,
    product_name: product.name || `Товар #${product.id}`,
    product_sku: product.sku || "—",
    variant_name: variant?.name ?? null,
    variant_sku: variant?.sku ?? null,
    stock_quantity: stockQty,
  });
};

const removePosition = (index) => {
  data.items.splice(index, 1);

  if (!data.items.length) {
    clearCoupon();
  } else if (appliedCouponCode.value) {
    revalidateCoupon();
  }
};

const itemKey = (item) =>
  `${item.product_id}-${item.variant_id ?? item.product_variant_id ?? "default"}`;

const snapshotOriginalPrices = () => {
  itemOriginalPrices.value = new Map(
    data.items.map((item) => [itemKey(item), Number(item.price) || 0]),
  );
};

const clearCoupon = () => {
  if (itemOriginalPrices.value.size) {
    data.items.forEach((item) => {
      const original = itemOriginalPrices.value.get(itemKey(item));
      if (original !== undefined) {
        item.price = original;
      }
    });
  }
  appliedCouponCode.value = "";
  pendingCouponCode.value = "";
  couponSavings.value = 0;
  couponNotApplicableCount.value = 0;
  itemOriginalPrices.value = new Map();
};

const buildPromoCheckUrl = (code) => {
  const params = new URLSearchParams();
  params.append("code", code);

  if (formData.client_id) {
    params.append("client_id", String(formData.client_id));
  }

  data.items.forEach((item) => {
    const productId = item.product_id;
    const variantId = item.variant_id ?? item.product_variant_id ?? null;
    if (variantId) {
      params.append(`product_ids[${productId}][]`, String(variantId));
    } else {
      params.append(`product_ids[${productId}]`, "");
    }
  });

  return `/promo-codes/validate?${params.toString()}`;
};

const applyCouponResponse = (responseData) => {
  const applicable = responseData?.applicable_products ?? [];
  const notApplicable = responseData?.not_applicable_products ?? [];

  let totalSavings = 0;

  data.items.forEach((item) => {
    const variantId = item.variant_id ?? item.product_variant_id ?? null;

    const found = applicable.find(
      (p) =>
        p.product_id === item.product_id &&
        ((!p.variant_id && !variantId) || p.variant_id === variantId),
    );

    if (found) {
      const finalPrice = Number(found.final_price ?? item.price);
      const original =
        itemOriginalPrices.value.get(itemKey(item)) ?? Number(item.price);
      totalSavings += (original - finalPrice) * Number(item.quantity || 0);
      item.price = finalPrice;
    }
  });

  couponSavings.value = Math.max(0, Math.round(totalSavings * 100) / 100);
  couponNotApplicableCount.value = notApplicable.length;
};

const onCouponSelected = async (promoCode) => {
  if (!promoCode?.code) return;

  if (appliedCouponCode.value) {
    clearCoupon();
  }

  // Если ещё нет клиента или позиций — запоминаем выбор и применим автоматически
  // как только оба условия будут выполнены (см. watcher ниже).
  if (!formData.client_id || !data.items.length) {
    pendingCouponCode.value = promoCode.code;
    toast({
      title: "Купон выбран",
      description: !formData.client_id
        ? "Скидка применится после выбора клиента."
        : "Скидка применится после добавления позиций.",
    });
    return;
  }

  pendingCouponCode.value = "";
  snapshotOriginalPrices();

  try {
    const url = buildPromoCheckUrl(promoCode.code);
    const { data: response } = await axios.get(url);

    if (!response?.success) {
      itemOriginalPrices.value = new Map();
      toast({
        title: "Промокод не применён",
        description: response?.message || "Не удалось применить промокод",
        variant: "destructive",
      });
      return;
    }

    appliedCouponCode.value = promoCode.code;
    applyCouponResponse(response);

    toast({
      title: "Купон применён",
      description: response.message || `Промокод ${promoCode.code} применён к заказу.`,
    });
  } catch (error) {
    itemOriginalPrices.value = new Map();
    const message =
      error?.response?.data?.message || "Ошибка при применении промокода";
    toast({
      title: "Промокод не применён",
      description: message,
      variant: "destructive",
    });
  }
};

const revalidateCoupon = async () => {
  if (!appliedCouponCode.value) return;
  const code = appliedCouponCode.value;
  clearCoupon();
  await onCouponSelected({ code });
};

// Когда пользователь выбрал купон до клиента/позиций — дожидаемся обоих условий
// и автоматически применяем.
watch(
  () => [formData.client_id, data.items.length],
  ([clientId, itemsLen]) => {
    if (!pendingCouponCode.value) return;
    if (!clientId || !itemsLen) return;
    const code = pendingCouponCode.value;
    pendingCouponCode.value = "";
    onCouponSelected({ code });
  },
);

const pluralizeProducts = (count) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
    return "товара";
  return "товаров";
};

const handleQuickClientCreated = (client) => {
  formData.client_id = client.id ?? null;
  formData.user.first_name = client.first_name || "";
  formData.user.last_name = client.last_name || "";
  formData.user.phone = client.phone || "";

  // Автозаполнение получателя из клиента — оператор всегда сможет переписать вручную.
  if (!formData.recipient.first_name) {
    formData.recipient.first_name = client.first_name || "";
  }
  if (!formData.recipient.last_name) {
    formData.recipient.last_name = client.last_name || "";
  }
  if (!formData.recipient.middle_name) {
    formData.recipient.middle_name =
      client.middle_name || client.profile?.middle_name || "";
  }
  if (!formData.recipient.phone) {
    formData.recipient.phone = client.phone || "";
  }
};

// Ошибки только для блока «Получатель», прокидываются в OrderRecipientDetails.
const recipientErrors = computed(() => validationErrors.value?.recipient || {});

const handleClientCleared = () => {
  formData.client_id = null;
  formData.user.first_name = "";
  formData.user.last_name = "";
  formData.user.phone = "";
};

const syncUserFromClient = (clientId) => {
  const client = (clients.value || []).find(
    (item) => `${item?.id}` === `${clientId}`,
  );
  if (!client) return;

  formData.user.first_name = client.first_name || "";
  formData.user.last_name = client.last_name || "";
  formData.user.phone = client.phone || "";
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";

  const stringValue = String(value).trim();

  // Если формат только дата (YYYY-MM-DD), добавляем время по умолчанию
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return `${stringValue}T00:00`;
  }

  // Пробуем распарсить дату
  let date = new Date(value);

  // Если дата невалидна, пробуем другие форматы
  if (Number.isNaN(date.getTime())) {
    // Пробуем заменить пробел на T для ISO формата
    const isoValue = stringValue.replace(" ", "T");
    date = new Date(isoValue);
  }

  if (Number.isNaN(date.getTime())) {
    console.warn("Invalid date format:", value);
    return "";
  }

  const pad = (num) => String(num).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizeOrderItemPrice = (item) => {
  const quantity = Number(item?.quantity ?? 1) || 1;
  const candidates = [
    item?.unit_price,
    item?.price_per_unit,
    item?.variant?.price,
  ];

  for (const candidate of candidates) {
    const amount = Number(candidate);
    if (
      !Number.isNaN(amount) &&
      candidate !== null &&
      candidate !== undefined
    ) {
      return amount;
    }
  }

  const linePrice = Number(item?.price ?? 0);
  return quantity > 0 ? linePrice / quantity : linePrice;
};

const normalizeOrderItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const productId = item?.product_id ?? item?.product?.id ?? null;

      if (!productId) {
        return null;
      }

      return {
        product_id: productId,
        variant_id:
          item?.variant_id ??
          item?.product_variant_id ??
          item?.variant?.id ??
          null,
        quantity: Number(item?.quantity ?? 1) || 1,
        price: normalizeOrderItemPrice(item),
        product_name:
          item?.product?.name || item?.name || `Товар #${productId}`,
        product_sku: item?.product?.sku || item?.variant?.name || "—",
        stock_quantity: Number(item?.product?.stock_quantity ?? 0),
        product: item?.product,
        variant: item?.variant,
        color_id: item?.color_id ?? item?.color?.id ?? null,
      };
    })
    .filter(Boolean);
};

const fillFormFromOrder = (order) => {
  Object.assign(formData.user, {
    first_name: order?.user?.first_name || order?.client?.first_name || "",
    last_name: order?.user?.last_name || order?.client?.last_name || "",
    phone: order?.user?.phone || order?.client?.phone || "",
  });

  formData.client_id = order?.client_id ?? order?.client?.id ?? null;
  formData.source = order?.source || "";
  formData.status = order?.status || "new";
  formData.payment_status = order?.payment_status || "pending";
  formData.payment_method = order?.payment_method || "";
  formData.delivery_method_name =
    order?.delivery_method?.name || "Курьерская доставка";

  // Заполняем delivery_address
  const emptyAddress = createEmptyDeliveryAddress();
  const orderAddress = order?.delivery_address || {};

  formData.delivery_address.country =
    orderAddress.country || emptyAddress.country;
  formData.delivery_address.region = orderAddress.region || emptyAddress.region;
  formData.delivery_address.city = orderAddress.city || emptyAddress.city;
  formData.delivery_address.postal_code =
    orderAddress.postal_code || emptyAddress.postal_code;
  formData.delivery_address.address =
    orderAddress.address ||
    order?.delivery_target?.name ||
    emptyAddress.address;
  formData.delivery_address.entrance =
    orderAddress.entrance || emptyAddress.entrance;
  formData.delivery_address.floor = orderAddress.floor || emptyAddress.floor;
  formData.delivery_address.intercom =
    orderAddress.intercom || emptyAddress.intercom;
  formData.delivery_address.delivery_comment =
    orderAddress.delivery_comment || emptyAddress.delivery_comment;
  formData.delivery_address.buyer_comment =
    orderAddress.buyer_comment || emptyAddress.buyer_comment;

  // Дата доставки может быть в delivery_address.delivery_date или в order.delivery_date
  const deliveryDateValue = orderAddress.delivery_date || order?.delivery_date;
  formData.delivery_address.delivery_date = formatDateTimeLocal(deliveryDateValue);

  formData.address = formData.delivery_address.address || "";

  // Заполняем получателя из order_addresses (recipient_*) с фолбэком
  // на контактные данные клиента, если в адресе ничего не сохранено.
  const emptyRecipient = createEmptyRecipient();
  formData.recipient.first_name =
    orderAddress.recipient_first_name ||
    order?.client?.profile?.first_name ||
    order?.client?.first_name ||
    emptyRecipient.first_name;
  formData.recipient.last_name =
    orderAddress.recipient_last_name ||
    order?.client?.profile?.last_name ||
    order?.client?.last_name ||
    emptyRecipient.last_name;
  formData.recipient.middle_name =
    orderAddress.recipient_middle_name ||
    order?.client?.profile?.middle_name ||
    emptyRecipient.middle_name;
  formData.recipient.phone =
    orderAddress.recipient_phone ||
    order?.client?.profile?.phone ||
    order?.client?.phone ||
    emptyRecipient.phone;

  data.items.splice(0, data.items.length, ...normalizeOrderItems(order?.items));

  // Если на заказ уже применён промокод — отображаем его как «применённый»,
  // но пересчёт цен уже выполнен бэком и сохранён в order_items.price.
  // Поэтому запоминаем текущие цены как «исходные» — снять купон без полной
  // перезагрузки заказа корректно не получится, но оператор всё ещё может выбрать
  // другой купон (тогда revalidateCoupon перезапросит расчёт от текущих цен).
  appliedCouponCode.value = order?.promo_code?.code || "";
  if (appliedCouponCode.value) {
    couponSavings.value = Number(order?.total_promo_discount ?? 0);
    couponNotApplicableCount.value = 0;
  }
};

const loadOrder = async (id) => {
  isPageLoading.value = true;

  try {
    const order = await getOrderById(id);
    orderMeta.value = order;
    fillFormFromOrder(order);
  } finally {
    isPageLoading.value = false;
  }
};

const handleUpdate = async () => {
  if (!route.params.id) return;

  isSaving.value = true;
  validationErrors.value = {};

  const payload = {
    client_id: formData.client_id,
    user: formData.user,
    recipient: formData.recipient,
    delivery_address: formData.delivery_address,
    delivery_date: formData.delivery_address.delivery_date || null,
    source: formData.source || null,
    items: data.items.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_variant_id: item.variant_id,
      color_id: item.color_id ?? null,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
    })),
    status: formData.status,
    payment_status: formData.payment_status,
    payment_method: formData.payment_method || null,
    created_at: orderMeta.value?.created_at || null,
    delivery_method_id: orderMeta.value?.delivery_method_id ?? null,
    delivery_method: {
      name: formData.delivery_method_name,
    },
    notes: orderMeta.value?.notes ?? null,
    ...(appliedCouponCode.value ? { promo_code: appliedCouponCode.value } : {}),
  };

  try {
    await updateOrder(route.params.id, payload);

    await router.push("/orders/list");
  } catch (error) {
    if (error?.response?.data?.errors) {
      const errors = error.response.data.errors;

      // Преобразуем ошибки вида "delivery_address.city" / "recipient.first_name" в вложенную структуру
      const processedErrors = {};
      Object.keys(errors).forEach((key) => {
        if (key.startsWith("delivery_address.")) {
          const field = key.replace("delivery_address.", "");
          processedErrors[field] = errors[key];
        } else if (key.startsWith("user.")) {
          const field = key.replace("user.", "");
          if (!processedErrors.user) processedErrors.user = {};
          processedErrors.user[field] = errors[key];
        } else if (key.startsWith("recipient.")) {
          const field = key.replace("recipient.", "");
          if (!processedErrors.recipient) processedErrors.recipient = {};
          processedErrors.recipient[field] = errors[key];
        } else {
          processedErrors[key] = errors[key];
        }
      });

      validationErrors.value = processedErrors;
    }
    // Error is already handled by useErrorHandler in useOrderFunctions
    // Just prevent navigation on error
  } finally {
    isSaving.value = false;
  }
};

watch(
  clients,
  (newClients) => {
    if (!formData.client_id && Array.isArray(newClients) && newClients.length) {
      formData.client_id = newClients[0].id;
    }

    if (formData.client_id) {
      syncUserFromClient(formData.client_id);
    }
  },
  { immediate: true },
);

watch(
  () => formData.client_id,
  (newValue, oldValue) => {
    if (!newValue || newValue === oldValue) return;
    syncUserFromClient(newValue);
  },
);

watch(
  paymentMethodOptions,
  (newOptions) => {
    if (
      !formData.payment_method &&
      Array.isArray(newOptions) &&
      newOptions.length
    ) {
      formData.payment_method = newOptions[0].value;
    }
  },
  { immediate: true },
);

watch(productSearch, (value) => {
  fetchProducts(value);
});

watch(
  () => formData.delivery_address.address,
  (newVal) => {
    if (formData.address !== newVal) {
      formData.address = newVal || "";
    }
  },
  { immediate: true },
);

watch(
  () => formData.address,
  (newVal) => {
    if (formData.delivery_address.address !== newVal) {
      formData.delivery_address.address = newVal || "";
    }
  },
);
</script>
