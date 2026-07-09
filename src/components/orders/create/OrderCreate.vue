<template>
  <div>
    <PageHeading :title="pageTitle" />

    <!-- Сводка ошибок валидации. Показывается сверху, чтобы оператор
         сразу понимал, что и где не заполнено, и мог кликнуть по ссылке
         для быстрого перехода к нужному блоку. -->
    <div
      v-if="errorSummary.length"
      ref="errorSummaryRef"
      role="alert"
      aria-live="polite"
      class="mt-6 rounded-md border border-red-200 bg-red-50 p-4"
    >
      <div class="flex items-start gap-3">
        <AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div class="flex-1">
          <h4 class="text-sm font-semibold text-red-800">
            Не удалось сохранить заказ — проверьте поля:
          </h4>
          <ul class="mt-2 space-y-1 text-sm text-red-700">
            <li v-for="item in errorSummary" :key="item.key">
              <button
                type="button"
                class="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                @click="focusSection(item.section)"
              >
                <span class="font-medium">{{ item.label }}:</span>
                <span>{{ item.message }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div
      class="mt-10 mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
    >
      <div
        data-section="items"
        class="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-3 lg:row-end-3"
      >
        <div class="mt-6">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-sm/6 font-medium text-gray-900">
                Позиции заказа
              </h3>
              <p class="text-sm text-gray-500">
                Добавьте товары в заказ через поиск.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <OrderProductPickerModal @select="addPosition" />
              <PromoCodeListModal
                trigger-label="Промокод"
                :client-id="formData.client_id"
                @select="onCouponSelected"
              />
              <DiscountListModal
                trigger-label="Скидка"
                :client-id="formData.client_id"
                @select="onDiscountSelected"
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
                      {{ getItemTitle(item) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Артикул: {{ getItemSku(item) }}
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
                    {{ getItemStock(item) }} шт
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

          <div
            v-if="selectedDiscount"
            class="mt-4 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"
          >
            <div class="text-sm text-blue-800">
              Скидка <span class="font-semibold">{{ selectedDiscount.name }}</span>
              ({{ formatDiscountValue(selectedDiscount) }})
              будет применена сразу после создания заказа.
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="text-blue-700 hover:text-blue-900"
              @click="selectedDiscount = null"
            >
              Снять
            </Button>
          </div>

          <!-- Активная промо-акция: подарок (с выбором размера) или скидка/промокод -->
          <OrderPromotionBlock :promotion="promotion" />

          <div v-if="data.items.length" class="mt-4 space-y-1">
            <Label for="delivery_method">Способ доставки</Label>
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <Select
                  id="delivery_method"
                  v-model="formData.delivery_method_id"
                  :options="deliveryMethodOptions"
                  option-label="name"
                  option-value="id"
                  placeholder="Выберите способ доставки"
                  searchable
                  search-placeholder="Поиск по способам доставки..."
                />
              </div>
              <Button
                v-if="canPickOnMap"
                type="button"
                variant="outline"
                class="shrink-0"
                @click="onPickOnMap"
              >
                <MapPin class="mr-2 h-4 w-4" />
                Выбрать на карте
              </Button>
            </div>
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
            @click="handleCreate"
            :disabled="isLoading"
            class="rounded-md bg-red-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <span v-if="!isLoading">Создать</span>
            <span v-else>Создание...</span>
          </button>
        </div>
      </div>

      <div ref="clientSectionRef">
        <OrderQuickClientCreate
          :clients="clients"
          :refresh-clients="getClients"
          :errors="validationErrors"
          @created="handleQuickClientCreated"
        />
      </div>

      <div ref="recipientSectionRef">
        <OrderRecipientDetails
          v-model:recipient="formData.recipient"
          :errors="recipientErrors"
        />
      </div>

      <div ref="deliverySectionRef">
        <OrderDeliveryDetails
          v-model:delivery-address="formData.delivery_address"
          :errors="validationErrors"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import axios from "axios";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { Trash2, AlertCircle, MapPin } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

import PageHeading from "@/components/common/PageHeading.vue";
import OrderProductPickerModal from "@/components/orders/modals/OrderProductPickerModal.vue";
import PromoCodeListModal from "@/components/orders/modals/PromoCodeListModal.vue";
import DiscountListModal from "@/components/orders/modals/DiscountListModal.vue";
import OrderPromotionBlock from "@/components/orders/create/OrderPromotionBlock.vue";
import { usePromotionForOrder } from "@/composables/orders/usePromotionForOrder";
import DynamicForm from "@/components/dynamics/DynamicForm.vue";
import OrderQuickClientCreate from "@/components/orders/create/OrderQuickClientCreate.vue";
import OrderRecipientDetails from "@/components/orders/create/OrderRecipientDetails.vue";
import OrderDeliveryDetails from "@/components/orders/create/OrderDeliveryDetails.vue";
import Button from "@/components/ui/button/Button.vue";
import { Label } from "@/components/ui/label";
import Select from "@/components/dynamics/Dropdown/Select.vue";
import { useProductFunctions } from "@/composables/useProductFunctions";
import { useStatusFunctions } from "@/composables/useStatusFunctions";
import { useOrderPaymentMethods } from "@/composables/orders/useOrderPaymentMethods";
import { ORDER_SOURCE_OPTIONS } from "@/composables/orders/orderSourceOptions";

const store = useStore();
const router = useRouter();
const route = useRoute();
const { toast } = useToast();

const initialClientIdFromQuery = (() => {
  const raw = route.query.client_id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value != null ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
})();
// `products` — кэш списка товаров для отображения уже добавленных позиций
// (имя, артикул, остаток). Сам выбор товара переехал внутрь
// OrderProductPickerModal, поэтому отдельный поиск/инпут здесь не нужен.
const products = ref([]);
const appliedCouponCode = ref("");
const pendingCouponCode = ref("");
const couponSavings = ref(0);
const couponNotApplicableCount = ref(0);
// Ручная скидка, выбранная до создания заказа. Применяется через
// /orders/{id}/apply-discount сразу после успешного create — на этапе
// создания бэкенд её не принимает в payload, поэтому делаем follow-up POST.
const selectedDiscount = ref(null);
const validationErrors = ref({});
// Ошибки выбора промокода и скидки выводим в общий блок-сводку сверху,
// чтобы оператор видел их рядом с остальной валидацией формы (а не только
// в исчезающем toast). Хранятся отдельно от validationErrors — иначе
// сбрасывались бы при каждом нажатии «Создать».
const promoCodeError = ref("");
const discountError = ref("");

// Refs на DOM-секции — для автоскролла к блоку с ошибкой.
const errorSummaryRef = ref(null);
const clientSectionRef = ref(null);
const recipientSectionRef = ref(null);
const deliverySectionRef = ref(null);

const { getProducts: getProductsFromApi } = useProductFunctions();
const { getAllStatuses, getStatuses } = useStatusFunctions();
const { paymentMethodOptions, fetchPaymentMethods } = useOrderPaymentMethods();

const pageTitle = "Добавить заказ";

const data = reactive({
  items: [],
});

// === Промо-акция (Promotion) =============================================
// items/total для проверки применимых акций. ВАЖНО: подарочные позиции (is_gift)
// в payload check-applicable не отправляем — иначе акция могла бы попытаться
// применить саму себя; считаем сумму строго по обычным позициям клиента.
// ВАЖНО: эти computed обращаются к `data.items`, поэтому объявлены ПОСЛЕ
// `const data = reactive(...)` — иначе TDZ-ошибка при инициализации.
const promotionCheckItems = computed(() =>
  (data.items || [])
    .filter((it) => !it.is_gift)
    .map((it) => ({
      product_id: it.product_id,
      quantity: Number(it.quantity || 0),
      price: Number(it.price || 0),
    }))
    .filter((it) => it.product_id && it.quantity > 0),
);
const promotionCheckTotal = computed(() =>
  promotionCheckItems.value.reduce(
    (acc, it) => acc + it.price * it.quantity,
    0,
  ),
);
const promotion = usePromotionForOrder(promotionCheckItems, promotionCheckTotal);
// =======================================================================

const formData = reactive({
  client_id: initialClientIdFromQuery,
  user: {
    first_name: "",
    last_name: "",
    phone: "",
  },
  recipient: {
    first_name: "",
    last_name: "",
    middle_name: "",
    phone: "",
  },
  delivery_address: {
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
  },
  source: "",
  status: "new",
  payment_status: "pending",
  payment_method: "",
  delivery_method_id: null,
  delivery_method_name: "",
  address: "",
});

const MAP_PICK_DELIVERY_CODES = [
  "cdek_pickup",
  "yandex_pickup",
  "russian_post_office",
  "russian_post_on_demand",
];

const deliveryMethodOptions = ref([]);

const fetchDeliveryMethods = async () => {
  try {
    const { data } = await axios.get("/delivery/methods/admin", {
      params: { active: 1 },
    });
    const items = Array.isArray(data?.data) ? data.data : [];
    deliveryMethodOptions.value = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      code: item.delivery_type_code ?? item.code ?? null,
    }));

    // Если способ ещё не выбран, по умолчанию выберем «Курьером», если он есть
    if (!formData.delivery_method_id) {
      const fallback =
        deliveryMethodOptions.value.find((m) => m.code === "courier") ||
        deliveryMethodOptions.value[0] ||
        null;
      if (fallback) {
        formData.delivery_method_id = fallback.id;
        formData.delivery_method_name = fallback.name;
      }
    }
  } catch {
    deliveryMethodOptions.value = [];
  }
};

const selectedDeliveryMethod = computed(() =>
  deliveryMethodOptions.value.find(
    (m) => m.id === formData.delivery_method_id,
  ) || null,
);

const canPickOnMap = computed(() =>
  MAP_PICK_DELIVERY_CODES.includes(selectedDeliveryMethod.value?.code),
);

const onPickOnMap = () => {
  // TODO: открыть модалку с картой и выбором ПВЗ.
  toast({
    title: "Выбор на карте",
    description: "Выбор пункта выдачи на карте будет добавлен позже.",
  });
};

// Синхронизируем имя метода с выбранным id, чтобы payload в handleCreate
// продолжал работать (бэкенд резолвит метод по name через delivery_method.name).
watch(
  () => formData.delivery_method_id,
  (newId) => {
    const method = deliveryMethodOptions.value.find((m) => m.id === newId);
    formData.delivery_method_name = method?.name || "";
  },
);

const getProducts = () => store.dispatch("products/getProducts");
const getClients = () => store.dispatch("clients/getClients");
const clients = computed(() => store.getters["clients/clients"]);
const status = computed(() => store.getters["orderActions/status"]);
const isLoading = computed(() => store.getters["orderActions/isLoading"]);

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
]);

onMounted(async () => {
  await getAllStatuses();
  await fetchPaymentMethods();
  getProducts();
  getClients();
  fetchProducts();
  fetchDeliveryMethods();
});

const create = (payload) => store.dispatch("orderActions/createOrder", payload);

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

const getItemTitle = (item) => {
  const productName =
    getProductById(item.product_id)?.name ||
    item.product_name ||
    `Товар #${item.product_id}`;
  const variant = getVariantById(item.product_id, item.variant_id);
  const variantName = variant?.name || item.variant_name;
  return variantName ? `${productName} (${variantName})` : productName;
};

const getItemSku = (item) => {
  const variant = getVariantById(item.product_id, item.variant_id);
  return (
    variant?.sku ||
    item.variant_sku ||
    getProductById(item.product_id)?.sku ||
    item.product_sku ||
    "—"
  );
};

const getItemStock = (item) => {
  // Сначала смотрим в кэше товаров (он мог быть обновлён), но если там
  // ничего не нашли — fall back на остаток, который мы запомнили в момент
  // добавления позиции в корзину (заполняется в addPosition из picker'а).
  const variant = getVariantById(item.product_id, item.variant_id);
  if (variant) {
    return Number(variant.stock_quantity ?? variant.inventory_balance ?? 0);
  }
  const cached = getProductById(item.product_id);
  if (cached) {
    return Number(cached.stock_quantity ?? cached.inventory_balance ?? 0);
  }
  return Number(item.stock_quantity ?? 0);
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
  // Поддерживаем оба варианта: {product, variant} (новый API модалки) и просто product (на всякий случай).
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
  const stock = variant
    ? Number(variant.stock_quantity ?? variant.inventory_balance ?? 0)
    : Number(product.stock_quantity ?? product.inventory_balance ?? 0);

  data.items.push({
    product_id: product.id,
    product_name: product.name,
    product_sku: product.sku,
    variant_id: variantId,
    variant_name: variant?.name ?? null,
    variant_sku: variant?.sku ?? null,
    quantity: 1,
    price,
    // Кэшируем остаток с момента добавления — нужен для preflight-чека,
    // чтобы заранее показать все позиции с проблемами по остатку.
    stock_quantity: stock,
  });
};

const removePosition = (index) => {
  data.items.splice(index, 1);

  if (!data.items.length) {
    clearCoupon();
  } else if (appliedCouponCode.value) {
    // Перезапрашиваем расчёт скидки если убрали позицию при применённом купоне
    revalidateCoupon();
  }
};

// Снапшот цен «до купона» — чтобы корректно откатывать при снятии/смене купона
const itemOriginalPrices = ref(new Map());

const itemKey = (item) =>
  `${item.product_id}-${item.variant_id ?? item.product_variant_id ?? "default"}`;

const snapshotOriginalPrices = () => {
  itemOriginalPrices.value = new Map(
    data.items.map((item) => [itemKey(item), Number(item.price) || 0]),
  );
};

const clearCoupon = () => {
  // Возвращаем оригинальные цены если они были сохранены
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
  promoCodeError.value = "";
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
      const original = itemOriginalPrices.value.get(itemKey(item)) ?? Number(item.price);
      totalSavings += (original - finalPrice) * Number(item.quantity || 0);
      item.price = finalPrice;
    }
  });

  couponSavings.value = Math.max(0, Math.round(totalSavings * 100) / 100);
  couponNotApplicableCount.value = notApplicable.length;
};

const onDiscountSelected = (discount) => {
  if (!discount?.id) return;
  selectedDiscount.value = discount;
  // Свежий выбор обнуляет прошлую ошибку — реальную проверку сделает
  // /orders/{id}/apply-discount после создания.
  discountError.value = "";
  toast({
    title: "Скидка выбрана",
    description: `«${discount.name}» применится сразу после создания заказа.`,
  });
};

const formatDiscountValue = (discount) => {
  const value = Number(discount?.value || 0);
  if (discount?.type === "percentage") return `−${value}%`;
  return `−${new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value)}`;
};

const onCouponSelected = async (promoCode) => {
  if (!promoCode?.code) return;

  // Любая новая попытка выбора сбрасывает прошлую ошибку.
  promoCodeError.value = "";

  // Снимаем предыдущий, если был, чтобы корректно посчитать с нуля
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
    // Используем validateStatus, чтобы вручную обрабатывать 4xx (бэкенд
    // отдаёт «Промокод недоступен этому клиенту» статусом 422 без
    // success-обёртки — иначе попадаем в catch и теряем читаемое сообщение).
    const { data: response } = await axios.get(url, {
      validateStatus: (status) => status >= 200 && status < 500,
    });

    if (!response?.success) {
      itemOriginalPrices.value = new Map();
      const message = response?.message || "Не удалось применить промокод";
      promoCodeError.value = message;
      toast({
        title: "Промокод не применён",
        description: message,
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
    promoCodeError.value = message;
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
// и автоматически применяем. Watch объединённый, чтобы не дёргать validate дважды.
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

// Прокидываем во вложенный компонент только ошибки получателя.
const recipientErrors = computed(() => validationErrors.value?.recipient || {});

// Человекочитаемая сводка ошибок для блока сверху формы.
// Группируем ошибки по секциям: позиции / клиент / получатель / доставка / общие.
const FIELD_LABELS = {
  items: { label: "Позиции заказа", section: "items" },
  promo_code: { label: "Промокод", section: "items" },
  discount: { label: "Скидка", section: "items" },
  client_id: { label: "Клиент", section: "client" },
  "user.first_name": { label: "Имя клиента", section: "client" },
  "user.last_name": { label: "Фамилия клиента", section: "client" },
  "user.phone": { label: "Телефон клиента", section: "client" },
  "recipient.first_name": { label: "Имя получателя", section: "recipient" },
  "recipient.last_name": { label: "Фамилия получателя", section: "recipient" },
  "recipient.middle_name": { label: "Отчество получателя", section: "recipient" },
  "recipient.phone": { label: "Телефон получателя", section: "recipient" },
  country: { label: "Страна доставки", section: "delivery" },
  region: { label: "Регион доставки", section: "delivery" },
  city: { label: "Город доставки", section: "delivery" },
  postal_code: { label: "Почтовый индекс", section: "delivery" },
  address: { label: "Адрес доставки", section: "delivery" },
  entrance: { label: "Подъезд", section: "delivery" },
  floor: { label: "Этаж", section: "delivery" },
  intercom: { label: "Домофон", section: "delivery" },
  delivery_comment: { label: "Комментарий к доставке", section: "delivery" },
  delivery_date: { label: "Дата доставки", section: "delivery" },
  buyer_comment: { label: "Комментарий покупателя", section: "delivery" },
};

const errorSummary = computed(() => {
  const result = [];
  const seen = new Set();
  const push = (key, label, section, message) => {
    if (!message) return;
    const id = `${key}|${message}`;
    if (seen.has(id)) return;
    seen.add(id);
    result.push({ key: id, label, section, message });
  };

  const errs = validationErrors.value || {};
  // Плоские ключи (items, client_id, и «опущенные» delivery_address.* → city/address/...)
  for (const [key, val] of Object.entries(errs)) {
    if (val && typeof val === "object" && !Array.isArray(val)) continue;
    let meta = FIELD_LABELS[key];
    if (!meta) {
      if (key.startsWith("items.")) {
        // items.0, items.1 — конкретные позиции корзины (например,
        // INSUFFICIENT_STOCK). Подписываем «Позиция #N» и ведём в секцию items.
        const idx = Number(key.slice("items.".length));
        meta = {
          label: Number.isFinite(idx) ? `Позиция #${idx + 1}` : "Позиции заказа",
          section: "items",
        };
      } else if (key === "general") {
        meta = { label: "Ошибка", section: "items" };
      } else {
        meta = { label: key, section: "delivery" };
      }
    }
    const msg = Array.isArray(val) ? val[0] : val;
    push(key, meta.label, meta.section, msg);
  }
  // Вложенные (user.*, recipient.*)
  for (const group of ["user", "recipient"]) {
    const sub = errs[group];
    if (sub && typeof sub === "object") {
      for (const [field, val] of Object.entries(sub)) {
        const fullKey = `${group}.${field}`;
        const meta = FIELD_LABELS[fullKey] || {
          label: fullKey,
          section: group === "user" ? "client" : "recipient",
        };
        const msg = Array.isArray(val) ? val[0] : val;
        push(fullKey, meta.label, meta.section, msg);
      }
    }
  }

  // Локальные ошибки выбора промокода и ручной скидки. Поднимаем в общий
  // блок сверху, чтобы пользователь видел причину рядом с остальной
  // валидацией формы (а не только в исчезающем toast).
  if (promoCodeError.value) {
    push("promo_code", FIELD_LABELS.promo_code.label, FIELD_LABELS.promo_code.section, promoCodeError.value);
  }
  if (discountError.value) {
    push("discount", FIELD_LABELS.discount.label, FIELD_LABELS.discount.section, discountError.value);
  }

  return result;
});

const focusSection = (section) => {
  const map = {
    items: () => document.querySelector('[data-section="items"]'),
    client: () => clientSectionRef.value,
    recipient: () => recipientSectionRef.value,
    delivery: () => deliverySectionRef.value,
  };
  const el = map[section]?.();
  if (el && typeof el.scrollIntoView === "function") {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Подсветим первый инпут в секции
    const firstInput = el.querySelector?.("input, textarea, select");
    setTimeout(() => firstInput?.focus?.({ preventScroll: true }), 300);
  }
};

const scrollToErrorSummary = () => {
  requestAnimationFrame(() => {
    errorSummaryRef.value?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  });
};

const handleCreate = async () => {
  validationErrors.value = {};

  // Если есть применимая акция и оператор оставил вариант "подарок", но
  // у выбранного подарка есть варианты, а размер не выбран — блокируем создание.
  if (promotion.hasPromotion.value && !promotion.isGiftSelectionComplete.value) {
    toast({
      title: "Выберите размер подарка",
      description:
        "Для подарка по акции нужно выбрать конкретный вариант (размер/цвет).",
      variant: "destructive",
    });
    return;
  }

  // Если в акции стоит запрет на промокоды, и при этом купон уже применён —
  // предупреждаем оператора, чтобы не получить ошибку с бэка.
  if (
    promotion.hasPromotion.value &&
    !promotion.allowPromoCodes.value &&
    appliedCouponCode.value
  ) {
    toast({
      title: "Купон несовместим с акцией",
      description:
        "Выбранная акция не разрешает использование промокодов. Снимите купон или откажитесь от подарка.",
      variant: "destructive",
    });
    return;
  }

  // Клиентский preflight по остаткам: бэкенд тоже валидирует, но возвращает
  // ошибку только по части позиций (его поведение зависит от внутреннего
  // источника stock_quantity). Здесь же проходим по всем позициям корзины и
  // выводим в общий блок ВСЕ позиции с нехваткой остатка — оператор сразу
  // видит полную картину и может скорректировать корзину.
  const preflightErrors = {};
  (data.items || []).forEach((item, index) => {
    const qty = Number(item.quantity || 0);
    const stock = getItemStock(item);
    if (qty > 0 && stock < qty) {
      const title = getItemTitle(item);
      preflightErrors[`items.${index}`] = [
        `Недостаточно товара '${title}' на складе (доступно: ${stock}, нужно: ${qty})`,
      ];
    }
  });
  if (Object.keys(preflightErrors).length > 0) {
    validationErrors.value = preflightErrors;
    toast({
      title: "Проверьте остатки",
      description:
        "Есть позиции с недостаточным остатком — подробности в красном блоке сверху.",
      variant: "destructive",
    });
    scrollToErrorSummary();
    return;
  }

  try {
    const result = await create({
      client_id: formData.client_id,
      user: formData.user,
      recipient: formData.recipient,
      delivery_address: formData.delivery_address,
      source: formData.source || null,
      items: data.items,
      status: formData.status,
      payment_status: formData.payment_status,
      payment_method: formData.payment_method || null,
      delivery_method_id: formData.delivery_method_id || null,
      delivery_method: {
        name: formData.delivery_method_name,
      },
      ...(appliedCouponCode.value
        ? { promo_code: appliedCouponCode.value }
        : {}),
      ...promotion.getPayloadFragment(),
    });

    // Скидку прикрепляем follow-up запросом — endpoint /orders POST не
    // принимает discount_id, но /orders/{id}/apply-discount работает на
    // уже сохранённом заказе. Ошибки не «ломают» создание: заказ создан,
    // максимум — оператор увидит предупреждение и применит скидку руками.
    const createdOrderId =
      result?.data?.order?.id ?? result?.order?.id ?? null;
    if (selectedDiscount.value?.id && createdOrderId) {
      try {
        await axios.post(`/orders/${createdOrderId}/apply-discount`, {
          discount_id: selectedDiscount.value.id,
        });
        toast({
          title: "Скидка применена",
          description: `«${selectedDiscount.value.name}» применена к новому заказу.`,
        });
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          "Не удалось применить скидку к новому заказу.";
        discountError.value = message;
        toast({
          title: "Скидка не применена",
          description: message,
          variant: "destructive",
        });
      }
    }
  } catch (error) {
    const data = error?.response?.data;
    const errors = data?.errors;
    const processedErrors = {};

    if (Array.isArray(errors)) {
      // Бэкенд возвращает ошибки позиций массивом объектов вида
      // { item, message, available, requested, code } — например при
      // INSUFFICIENT_STOCK. Раскладываем их по ключам items.<index>,
      // которые errorSummary рендерит как «Позиция #N».
      errors.forEach((e, i) => {
        const itemIndex =
          typeof e?.item === "number" ? e.item : i;
        const key = `items.${itemIndex}`;
        const message = e?.message || "Ошибка позиции";
        // Дополним полезной деталью про остаток, если она есть.
        const detail =
          typeof e?.available === "number" && typeof e?.requested === "number"
            ? ` (доступно: ${e.available}, нужно: ${e.requested})`
            : "";
        processedErrors[key] = [message + detail];
      });
    } else if (errors && typeof errors === "object") {
      // Преобразуем ошибки вида "delivery_address.city" / "recipient.first_name" в вложенную структуру
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
    }

    // Если бэк не положил массив errors, но дал общее сообщение —
    // покажем его как «общую» ошибку, иначе пользователь увидит только
    // toast и не поймёт, что пошло не так.
    if (Object.keys(processedErrors).length === 0 && data?.message) {
      processedErrors.general = [data.message];
    }

    if (Object.keys(processedErrors).length > 0) {
      validationErrors.value = processedErrors;

      toast({
        title: "Проверьте форму",
        description:
          "Есть ошибки валидации — подробности в красном блоке сверху.",
        variant: "destructive",
      });
      scrollToErrorSummary();
    }
  }
};

watch(status, (newValue) => {
  if (newValue) {
    router.push("/orders/list");
  }
});

watch(
  clients,
  (newClients) => {
    if (!formData.client_id && Array.isArray(newClients) && newClients.length) {
      formData.client_id = newClients[0].id;
    }
  },
  { immediate: true },
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

// Синхронизация адреса между DynamicForm (поле «Адрес») и строкой в delivery_address
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
