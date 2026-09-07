<template>
  <div v-if="isLoading" class="loading">Загрузка...</div>
  <div v-else-if="!order" class="loading">Заказ не найден</div>
  <div v-else class="letter_template">
    <div class="wrapper">
      <table class="generalInfo">
        <tbody>
          <tr>
            <th>Поставщик:</th>
            <td>{{ supplier }}</td>
          </tr>
          <tr>
            <th>Покупатель:</th>
            <td>{{ buyerName }}</td>
          </tr>
          <tr v-if="buyerPhone">
            <td>Телефон:</td>
            <td>{{ buyerPhone }}</td>
          </tr>
          <tr v-if="buyerEmail">
            <td>e-mail:</td>
            <td>{{ buyerEmail }}</td>
          </tr>
          <tr v-if="paymentMethodLabel">
            <td>Способ оплаты:</td>
            <td>{{ paymentMethodLabel }}</td>
          </tr>
          <tr v-if="deliveryAddressText">
            <td>Адрес доставки:</td>
            <td>{{ deliveryAddressText }}</td>
          </tr>
        </tbody>
      </table>

      <center>
        <h1 class="letter_template_header">
          Товарный чек №{{ receiptNumber }} от {{ receiptDate }}
        </h1>
      </center>

      <table class="itemsInfo">
        <tbody>
          <tr>
            <th>№</th>
            <th>Артикул</th>
            <th style="width: 220px;">Товар</th>
            <th>Ед.</th>
            <th>Цена</th>
            <th>Кол-во</th>
            <th>Сумма</th>
          </tr>

          <tr v-for="(item, index) in items" :key="item.id || index">
            <td class="center">{{ index + 1 }}</td>
            <td class="center">{{ getSku(item) }}</td>
            <td>{{ getName(item) }}</td>
            <td class="center">шт</td>
            <td class="money">{{ formatMoney(getUnitPrice(item)) }}</td>
            <td class="center">{{ item.quantity }}</td>
            <td class="money">{{ formatMoney(getRowTotal(item)) }}</td>
          </tr>

          <tr v-if="discountAmount > 0">
            <td></td>
            <td colspan="3">Скидка{{ discountLabel ? ': ' + discountLabel : '' }}</td>
            <td class="money"></td>
            <td class="center"></td>
            <td class="money">-{{ formatMoney(discountAmount) }}</td>
          </tr>

          <tr>
            <td></td>
            <td colspan="3">Доставка{{ deliveryMethodLabel ? ': ' + deliveryMethodLabel : '' }}</td>
            <td class="money"></td>
            <td class="center"></td>
            <td class="money">{{ formatMoney(deliveryCost) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary">Итого:&nbsp;&nbsp;{{ formatMoney(totalAmount) }}</div>

      <p>Всего наименований {{ items.length }}, на сумму {{ formatMoney(totalAmount) }}</p>

      <table class="signs">
        <tbody>
          <tr>
            <td>Отпустил___________________________________</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();

const isLoading = ref(true);
const order = ref(null);

const supplier = "ООО ЭГЕЙН";

const PAYMENT_METHOD_LABELS = {
  // Актуальные коды (после нормализации)
  card_ru: "Оплата картами РФ, TPay, СБП",
  sberpay: "SberPay, рассрочка, иностранная карта",
  yandex_pay: "Яндекс Пэй и Сплит",
  yandex_pay_split: "Яндекс Сплит",
  cash_on_delivery: "Наличными или картой при получении",
  pickup_payment: "Оплата в точке самовывоза",
  podeli: "Подели",
  robokassa_mokka: "Robokassa X Мокка",
  robokassa_yandex_split: "Robokassa X Яндекс Сплит",
  // Легаси-коды (на случай старых данных)
  card: "Оплата картой РФ",
  yookassa: "Оплата картой РФ",
  online: "Оплата картой РФ",
  split: "Яндекс Пэй и Сплит",
  cash: "Наличными или картой при получении",
  cod: "Наличными или картой при получении",
  sbp: "SberPay, рассрочка, иностранная карта",
  bank_transfer: "Оплата картой РФ",
};

const items = computed(() =>
  Array.isArray(order.value?.items) ? order.value.items : [],
);

const buyerName = computed(() => {
  const o = order.value;
  if (!o) return "";
  const address = o.delivery_address || {};
  const profile = o.client?.profile || {};
  const parts = [
    address.recipient_last_name || profile.last_name,
    address.recipient_first_name || profile.first_name || o.first_name,
    address.recipient_middle_name || profile.middle_name,
  ].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return o.client?.email || "—";
});

const buyerPhone = computed(() => {
  const o = order.value;
  if (!o) return "";
  return (
    o.delivery_address?.recipient_phone ||
    o.client?.profile?.phone ||
    o.phone ||
    ""
  );
});

const buyerEmail = computed(() => order.value?.client?.email || "");

const paymentMethodLabel = computed(() => {
  const m = order.value?.payment_method;
  if (!m) return "";
  return PAYMENT_METHOD_LABELS[m] || m;
});

const deliveryAddressText = computed(() => {
  const a = order.value?.delivery_address;
  if (!a) return "";
  if (typeof a === "string") return a;
  const parts = [a.country, a.region, a.city, a.address].filter(Boolean);
  return parts.join(", ");
});

const deliveryMethodLabel = computed(() => {
  const o = order.value;
  return (
    o?.delivery_method?.name ||
    o?.delivery_target?.name ||
    o?.legacy_delivery_method ||
    ""
  );
});

const deliveryCost = computed(() => Number(order.value?.delivery_cost || 0));
const totalAmount = computed(() => Number(order.value?.total_amount || 0));

const discountAmount = computed(() => {
  const o = order.value;
  if (!o) return 0;
  return (
    Number(o.discount_amount || 0) +
    Number(o.total_promo_discount || 0) +
    Number(o.total_items_discount || 0)
  );
});

const discountLabel = computed(() => {
  const o = order.value;
  return o?.promo_code?.code || o?.promotion?.name || "";
});

const receiptNumber = computed(() => {
  const o = order.value;
  return o?.order_number || o?.id || "";
});

const receiptDate = computed(() => {
  const value = order.value?.created_at || new Date().toISOString();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
});

const getSku = (item) =>
  item.variant?.sku || item.product?.code || item.legacy_sku || item.product?.sku || "—";

const getName = (item) => {
  const base = item.product?.name || item.name || item.legacy_name || "—";
  const optionValues =
    item.variant?.option_values || item.variant?.optionValues || [];
  const optionLabels = Array.isArray(optionValues)
    ? optionValues
        .map((ov) => ov?.name || ov?.value)
        .filter(Boolean)
    : [];
  const extras = [
    ...optionLabels,
    !optionLabels.length && item.variant?.name ? item.variant.name : null,
    item.color?.name,
    item.is_gift ? "🎁 подарок" : null,
  ].filter(Boolean);
  return extras.length ? `${base} (${extras.join(" / ")})` : base;
};

const getUnitPrice = (item) => {
  const candidates = [item.unit_price, item.price, item.variant?.price];
  for (const c of candidates) {
    const n = Number(c);
    if (!Number.isNaN(n) && c !== null && c !== undefined) return n;
  }
  return 0;
};

const getRowTotal = (item) =>
  getUnitPrice(item) * Number(item.quantity || 0);

const formatMoney = (value) => {
  const n = Number(value || 0);
  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)} руб`;
};

const fetchOrder = async (id) => {
  isLoading.value = true;
  try {
    const { data } = await axios.get(`/orders/${id}/view`);
    order.value = data?.order ?? null;
  } catch (e) {
    console.error("Failed to load order for print", e);
    order.value = null;
  } finally {
    isLoading.value = false;
    setTimeout(() => {
      if (order.value) window.print();
    }, 300);
  }
};

onMounted(() => {
  document.title = `Товарный чек №${route.params.id}`;
  fetchOrder(route.params.id);
});
</script>

<style scoped>
.loading {
  padding: 40px;
  font-family: sans-serif;
  font-size: 14px;
  color: #333;
}

.letter_template {
  font-size: 12px;
  color: #000;
  background-color: #fff;
  font-family: sans-serif;
  margin: 30px;
}

.wrapper {
  width: 700px;
  page-break-after: always;
}

.wrapper:last-child {
  page-break-after: auto;
}

.letter_template_header {
  font-weight: normal;
  font-size: 16px;
  margin: 30px 0 20px;
}

table {
  border-spacing: 4px;
  font-size: 12px;
}

table.generalInfo th {
  text-align: left;
  padding-right: 50px;
}

table.itemsInfo {
  border-collapse: collapse;
  width: 100%;
}

table.itemsInfo th {
  text-align: center;
  font-weight: bold;
}

table.itemsInfo th,
table.itemsInfo td {
  border: solid 1px #000;
  padding: 3px;
}

td.center {
  text-align: center;
}

td.money {
  text-align: right;
  width: 120px;
}

table.signs {
  margin-top: 50px;
}

table.signs td {
  width: 350px;
  vertical-align: top;
  line-height: 200%;
}

.summary {
  width: 100%;
  text-align: right;
  font-weight: bold;
  margin-top: 10px;
}

@media print {
  .letter_template {
    margin: 0;
  }
}
</style>
