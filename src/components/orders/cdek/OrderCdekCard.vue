<template>
  <div v-if="isLoading" class="flex justify-center py-20">
    <Loader />
  </div>

  <div v-else-if="!order" class="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-gray-500">
    Заказ не найден.
  </div>

  <div v-else class="cdek-order">
    <div class="cdek-order__nav">
      <div class="cdek-order__brand">
        <span class="cdek-order__brand-mark"></span>
        СДЭК
      </div>
      <div class="cdek-order__nav-right">
        <router-link :to="`/order/${order.id}`" class="cdek-order__back">
          ← К заказу №{{ orderNumber }}
        </router-link>
        <a
          v-if="trackingUrl"
          :href="trackingUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="cdek-order__link"
        >Отследить на cdek.ru <ExternalLink :size="13" class="inline-block" /></a>
      </div>
    </div>

    <div class="cdek-order__banner">
      <div>
        <h3>ВАШ ЗАКАЗ<br>№{{ orderNumber }}</h3>
        <p v-if="cdekOrder?.cdek_number" class="cdek-order__banner-sub">
          Номер СДЭК: {{ cdekOrder.cdek_number }}
        </p>
      </div>
      <Package class="cdek-order__banner-ico" :size="130" :stroke-width="1.1" />
    </div>

    <div class="cdek-order__body">
      <template v-if="isCdekDelivery">
        <div class="cdek-order__statusbar">
          <div class="cdek-status">
            <span class="cdek-status__label">Создание</span>
            <span class="cdek-status__value">
              <span class="cdek-badge" :class="`cdek-badge--${creationStateClass}`">
                {{ cdekOrder?.creation_state || "заявка ещё не создана" }}
              </span>
            </span>
          </div>
          <div class="cdek-status">
            <span class="cdek-status__label">Статус</span>
            <span class="cdek-status__value">{{ cdekOrder?.status_name || cdekOrder?.status_code || "—" }}</span>
          </div>
          <div class="cdek-status">
            <span class="cdek-status__label">Синхронизация</span>
            <span class="cdek-status__value">{{ formatDateTime(cdekOrder?.last_synced_at) || "—" }}</span>
          </div>
        </div>

        <h4>Товары в заказе</h4>

        <div class="cdek-items">
          <div class="cdek-items__row cdek-items__row--head">
            <div class="cdek-items__main">
              <small>Артикул</small>
              Наименование товара
              <small>Вес товара</small>
            </div>
            <div class="cdek-items__nums">
              <div class="cdek-items__grid">
                <div class="greenka greenka--head">Количество<br>штук</div>
                <div class="greenka greenka--head">Стоимость<br>товара</div>
                <div class="greenka greenka--head">Объявленная<br>стоимость</div>
              </div>
              <small class="cdek-items__vat">В том числе НДС: ставка (сумма РУБ)</small>
            </div>
          </div>

          <hr class="mid-line" />

          <div v-for="(item, i) in orderItems" :key="item.id || i" class="cdek-items__row">
            <div class="cdek-items__main">
              <small>Артикул: {{ itemSku(item) }}</small>
              <span class="cdek-items__name">{{ itemName(item) }}</span>
              <small>Вес: {{ itemWeight(item) }} гр.</small>
            </div>
            <div class="cdek-items__nums">
              <div class="cdek-items__grid">
                <div class="greenka">{{ itemQty(item) }} шт.</div>
                <div class="greenka">{{ formatRub(itemUnitPrice(item)) }}</div>
                <div class="greenka">{{ formatRub(itemDeclaredCost(item)) }}</div>
              </div>
              <small class="cdek-items__vat">В том числе НДС: без НДС</small>
            </div>
          </div>

          <p v-if="!orderItems.length" class="cdek-empty">Позиций нет.</p>
        </div>

        <hr class="mid-line" />
        <h4>Информация о доставке</h4>

        <div class="bot-flex">
          <div class="bot-flex__col">
            <p class="bot-flex__title">Получатель</p>
            <p class="info-line">
              <User class="info-line__ico" :size="18" />
              <span>{{ recipientName || "—" }}</span>
            </p>
            <p class="info-line">
              <Phone class="info-line__ico" :size="18" />
              <span>{{ recipientPhone || "—" }}</span>
            </p>
            <p v-if="order.email" class="info-line">
              <Mail class="info-line__ico" :size="18" />
              <span>{{ order.email }}</span>
            </p>
          </div>
          <div class="bot-flex__col">
            <p class="bot-flex__title">Оплата</p>
            <p class="info-line">
              <Banknote class="info-line__ico" :size="18" />
              <span>Стоимость доставки<br><span class="green-sum">{{ formatRub(deliveryPrice) }}</span></span>
            </p>
            <p class="info-line">
              <Wallet class="info-line__ico" :size="18" />
              <span>{{ paymentLabel || "—" }}</span>
            </p>
          </div>
        </div>

        <div class="bot-flex">
          <div class="bot-flex__col">
            <p class="bot-flex__title">Адрес доставки</p>
            <p class="info-line">
              <MapPin class="info-line__ico" :size="18" />
              <span>
                {{ destinationPlace || fullAddress || "—" }}
                <template v-if="isPickup"><br><b>В пункт ПВЗ</b>: {{ pvzLine }}</template>
                <template v-else-if="destinationPlace && fullAddress"><br>{{ fullAddress }}</template>
              </span>
            </p>
          </div>
          <div class="bot-flex__col">
            <p class="bot-flex__title">Тариф</p>
            <p class="info-line">
              <Route class="info-line__ico" :size="18" />
              <span>{{ tariffLine }}</span>
            </p>
            <p v-if="periodLine" class="info-line">
              <CalendarClock class="info-line__ico" :size="18" />
              <span>Срок: {{ periodLine }}</span>
            </p>
            <p v-if="deliveryLabel" class="info-line">
              <Truck class="info-line__ico" :size="18" />
              <span>{{ deliveryLabel }}</span>
            </p>
          </div>
        </div>

        <hr class="mid-line" />

        <p
          v-if="cdekOrder?.last_error"
          class="cdek-order__error"
        >{{ cdekOrder.last_error }}</p>

        <div class="cdek-order__actions">
          <button class="cdek-btn-main" type="button" :disabled="loading" @click="createOrSync">
            {{ cdekOrder?.cdek_uuid ? "Обновить статус заявки" : "Отправить данные в СДЭК" }}
          </button>
          <Button
            v-if="cdekOrder?.cdek_uuid && !isFinal"
            size="sm"
            variant="destructive"
            :disabled="loading"
            @click="cancel"
          >Отменить доставку</Button>
        </div>

        <div class="cdek-order__history">
          <h4>История статусов</h4>
          <ol v-if="statusEvents.length" class="cdek-timeline">
            <li v-for="(event, i) in statusEvents" :key="event.id || i" class="cdek-timeline__item">
              <span class="cdek-timeline__dot" :class="{ 'cdek-timeline__dot--active': i === 0 }"></span>
              <span v-if="i < statusEvents.length - 1" class="cdek-timeline__line"></span>
              <div class="cdek-timeline__body">
                <p class="cdek-timeline__title">{{ event.status_name || event.status_code }}</p>
                <p class="cdek-timeline__meta">
                  {{ formatDateTime(event.status_at) || "дата неизвестна" }}
                  <span v-if="event.source" class="cdek-timeline__source">{{ event.source }}</span>
                </p>
              </div>
            </li>
          </ol>
          <p v-else class="cdek-empty">
            Событий пока нет — статус появится после создания заявки и первой синхронизации.
          </p>
        </div>
      </template>

      <section v-else class="cdek-empty cdek-order__notcdek">
        Для этого заказа не выбрана доставка СДЭК
        <span v-if="order.delivery_method?.name"> (текущий способ: {{ order.delivery_method.name }})</span>.
      </section>
    </div>

    <div class="cdek-order__footer">
      <div class="cdek-order__footer-logo"><span class="cdek-order__footer-mark"></span>СДЭК</div>
      <p class="cdek-order__footer-text">Доставка — СДЭК</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Loader from "@/components/common/Loader.vue";
import Button from "@/components/ui/button/Button.vue";
import { toast } from "vue-sonner";
import { useOrderPaymentMethods } from "@/composables/orders/useOrderPaymentMethods";
import {
  Banknote,
  CalendarClock,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  Route,
  Truck,
  User,
  Wallet,
} from "lucide-vue-next";

const route = useRoute();
const isLoading = ref(true);
const loading = ref(false);
const order = ref(null);
const cdekSettings = ref({});
const paymentOptions = ref([]);

const { fetchPaymentMethods } = useOrderPaymentMethods();

const delivery = computed(() => order.value?.delivery_data || {});
const cdekOrder = computed(
  () => order.value?.cdek_order || order.value?.cdekOrder || null,
);
const statusEvents = computed(
  () => cdekOrder.value?.status_events || cdekOrder.value?.statusEvents || [],
);
const isCdekDelivery = computed(() =>
  String(order.value?.delivery_method?.code || order.value?.deliveryMethod?.code || "").startsWith("cdek_"),
);
const isFinal = computed(() =>
  ["DELIVERED", "NOT_DELIVERED", "RETURNED_TO_SENDER"].includes(cdekOrder.value?.status_code),
);
const trackingUrl = computed(
  () => cdekOrder.value?.tracking_url || delivery.value?.tracking_url || null,
);
const deliveryPrice = computed(() => cdekOrder.value?.price ?? delivery.value?.price ?? null);
const orderNumber = computed(() => order.value?.order_number || order.value?.id);
const isPickup = computed(() =>
  ["pickup", "postamat"].includes(delivery.value?.delivery_type || cdekOrder.value?.delivery_type),
);
const destinationPlace = computed(() => {
  const d = delivery.value?.destination || {};
  if (d.city) return `Россия, г. ${d.city}`;
  if (d.region) return `Россия, ${d.region}`;
  return null;
});
const pvzLine = computed(() => {
  const pvz = delivery.value?.pvz;
  if (pvz?.code || pvz?.address) return [pvz.code, pvz.address].filter(Boolean).join(", ");
  if (cdekOrder.value?.pvz_code) return `код ${cdekOrder.value.pvz_code}`;
  return "—";
});
const tariffLine = computed(() => {
  if (delivery.value?.tariff_name) return delivery.value.tariff_name;
  const code = cdekOrder.value?.tariff_code || delivery.value?.tariff_code;
  if (code) return `Код тарифа ${code}`;
  return "—";
});
const deliveryLabel = computed(() => {
  const type = cdekOrder.value?.delivery_type || delivery.value?.delivery_type;
  const label = { courier: "Курьер", pickup: "Пункт выдачи", postamat: "Постамат" }[type] || type;
  return label || null;
});
const periodLine = computed(() => {
  const period = delivery.value?.period;
  if (!period) return null;
  if (typeof period === "string") return period;
  const min = Number(period.min);
  const max = Number(period.max);
  if (min && max) return min === max ? `${min} дн.` : `${min}–${max} дн.`;
  return null;
});
const creationStateClass = computed(() => String(cdekOrder.value?.creation_state || "none").toLowerCase());

const recipientName = computed(() => {
  const o = order.value || {};
  const c = o.client || {};
  const addr = o.address || {};
  const clientName = [c.last_name, c.first_name, c.middle_name].filter(Boolean).join(" ")
    || c.name
    || [c.profile?.last_name, c.profile?.first_name, c.profile?.middle_name].filter(Boolean).join(" ")
    || null;
  return clientName
    || [addr.recipient_last_name, addr.recipient_first_name, addr.recipient_middle_name].filter(Boolean).join(" ")
    || [o.last_name, o.first_name].filter(Boolean).join(" ")
    || null;
});

const recipientPhone = computed(() => {
  const o = order.value || {};
  return o.client?.profile?.phone || o.client?.phone || o.address?.recipient_phone || o.phone || null;
});

const fullAddress = computed(() => {
  const a = order.value?.address || {};
  return [a.postal_code, a.city || a.settlement, a.street, a.house, a.apartment]
    .filter(Boolean)
    .join(", ") || null;
});

const paymentLabel = computed(() => {
  const value = order.value?.payment_method;
  if (!value) return null;
  return paymentOptions.value.find((option) => option.value === value)?.label || value;
});

const orderItems = computed(() => order.value?.items || []);

const declaredSettings = computed(() => cdekSettings.value?.declared || {});
const defaultPackage = computed(() => cdekSettings.value?.default_package || {});

const itemSku = (item) =>
  item?.variant?.sku || item?.product?.code || item?.legacy_sku || item?.product?.sku || item?.id || "—";

const variantLabel = (item) => {
  const color = item?.color?.name || item?.variant?.table_color?.name || item?.variant?.color?.name;
  const size = item?.variant?.name;
  return [color, size].filter(Boolean).join(" / ") || null;
};

const itemName = (item) => {
  const name = item?.product?.name || item?.legacy_name || item?.name || "—";
  const variant = variantLabel(item);
  return variant ? `${name} (${variant})` : name;
};

const itemUnitPrice = (item) => {
  if (item?.is_gift) return 0;
  const candidates = [item?.price, item?.unit_price, item?.price_per_unit];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === "") continue;
    const n = Number(candidate);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
};

const itemQty = (item) => Number(item?.quantity || 0);

const itemWeight = (item) => {
  const weight = Number(
    item?.variant?.weight || item?.product?.weight || defaultPackage.value?.weight || 500,
  );
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(weight || 0);
};

const itemDeclaredCost = (item) => {
  const price = itemUnitPrice(item);
  const value = Number(declaredSettings.value?.value || 0);
  if (value > 0) return value;
  const percent = Number(declaredSettings.value?.percent || 0);
  if (percent > 0) return Math.round((price * percent) / 100 * 100) / 100;
  return price;
};

const formatRub = (value) => {
  const n = Number(value || 0);
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n)} РУБ.`;
};

const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fetchOrder = async (id) => {
  isLoading.value = true;
  try {
    const { data } = await axios.get(`/orders/${id}/view`);
    order.value = data?.order ?? null;
  } catch {
    order.value = null;
    toast.error("Не удалось загрузить заявку СДЭК");
  } finally {
    isLoading.value = false;
  }
};

const fetchCdekSettings = async () => {
  try {
    const { data } = await axios.get("third-party-integrations/cdek/settings");
    cdekSettings.value = data?.settings ?? {};
  } catch {
    cdekSettings.value = {};
  }
};

const createOrSync = async () => {
  loading.value = true;
  try {
    const { data } = await axios.post(`/orders/${order.value.id}/cdek-delivery/create`);
    const message = data?.message || "Готово";
    if (cdekOrder.value?.cdek_uuid) toast.success(message);
    else toast.success(message, { description: "Статус обновится после синхронизации с СДЭК." });
    await fetchOrder(order.value.id);
  } catch (e) {
    toast.error("Не удалось обновить заявку СДЭК", {
      description: e?.response?.data?.message || "",
    });
  } finally {
    loading.value = false;
  }
};

const cancel = async () => {
  if (!window.confirm("Отменить заявку в СДЭК?")) return;
  loading.value = true;
  try {
    await axios.post(`/orders/${order.value.id}/cdek-delivery/cancel`);
    toast.success("Заявка СДЭК отменена");
    await fetchOrder(order.value.id);
  } catch (e) {
    toast.error("Не удалось отменить заявку", {
      description: e?.response?.data?.message || "",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrder(route.params.id);
  fetchCdekSettings();
  fetchPaymentMethods().then((options) => {
    paymentOptions.value = options || [];
  });
});
watch(
  () => route.params.id,
  (id) => id && fetchOrder(id),
);
</script>

<style scoped>
.cdek-order {
  max-width: 1100px;
  margin: 0 auto 40px;
  font-family: Arial, Helvetica, sans-serif;
  color: #050505;
}

.cdek-order__nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 12px;
}

.cdek-order__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #008b16;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cdek-order__brand-mark {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: #008b16;
}

.cdek-order__nav-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
}

.cdek-order__back {
  color: #5a6b7b;
  font-size: 14px;
  text-decoration: none;
}

.cdek-order__back:hover {
  color: #0c5ba0;
  text-decoration: underline;
}

.cdek-order__link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #0c5ba0;
  font-size: 14px;
  text-decoration: none;
}

.cdek-order__link:hover {
  text-decoration: underline;
}

.cdek-order__banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-radius: 8px;
  overflow: hidden;
  padding: 38px 40px;
  background: linear-gradient(115deg, #0b4f8f 0%, #1877c9 100%);
}

.cdek-order__banner h3 {
  margin: 0;
  color: #fff;
  font-size: 38px;
  line-height: 1.25;
  font-weight: 700;
}

.cdek-order__banner-sub {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
}

.cdek-order__banner-ico {
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.cdek-order__body {
  background: #fff;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  padding: 20px 28px 28px;
}

.cdek-order__body h4 {
  margin: 22px 0 14px;
  color: #008b16;
  font-size: 21px;
  font-weight: 700;
}

.cdek-order__statusbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 40px;
  padding: 4px 0 16px;
  border-bottom: 1px solid #ebebeb;
}

.cdek-status__label {
  display: block;
  color: #8a8a8a;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.cdek-status__value {
  display: block;
  margin-top: 3px;
  font-size: 14px;
  color: #333;
}

.cdek-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #f0f0f0;
  color: #555;
}

.cdek-badge--invalid {
  background: #fde8e8;
  color: #b42318;
}

.cdek-badge--created,
.cdek-badge--valid {
  background: #e6f6ea;
  color: #0b6b25;
}

.cdek-items__row {
  display: flex;
  gap: 18px;
  padding: 8px 0;
}

.cdek-items__main {
  flex: 1 1 54%;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 15px;
}

.cdek-items__row--head .cdek-items__main {
  gap: 6px;
}

.cdek-items__main small {
  color: #8a8a8a;
  font-size: 12px;
}

.cdek-items__name {
  font-weight: 600;
}

.cdek-items__nums {
  flex: 1 1 46%;
}

.cdek-items__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.greenka {
  background: #eaf6ec;
  color: #116027;
  text-align: center;
  padding: 8px 6px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.3;
}

.greenka--head {
  background: #008b16;
  color: #fff;
  font-weight: 600;
}

.cdek-items__vat {
  display: block;
  margin-top: 6px;
  color: #8a8a8a;
  font-size: 11.5px;
  text-align: center;
}

.mid-line {
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 14px 0;
}

.bot-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 48px;
  margin-bottom: 22px;
}

.bot-flex__col {
  flex: 1 1 320px;
}

.bot-flex__title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
}

.info-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 7px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.info-line__ico {
  color: #0c5ba0;
  flex-shrink: 0;
  margin-top: 2px;
}

.green-sum {
  color: #008b16;
  font-weight: 700;
}

.cdek-order__error {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 6px;
  background: #fdecea;
  color: #b42318;
  font-size: 14px;
}

.cdek-order__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 22px 0 10px;
}

.cdek-btn-main {
  background: #20a53a;
  color: #fff;
  border: 0;
  border-radius: 5px;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.38);
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.cdek-btn-main:hover:not(:disabled) {
  background: #179431;
}

.cdek-btn-main:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cdek-order__history h4 {
  margin-top: 26px;
}

.cdek-timeline {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}

.cdek-timeline__item {
  position: relative;
  display: flex;
  gap: 14px;
  padding-bottom: 18px;
}

.cdek-timeline__item:last-child {
  padding-bottom: 0;
}

.cdek-timeline__dot {
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: 999px;
  background: #cdcdcd;
  flex-shrink: 0;
}

.cdek-timeline__dot--active {
  background: #0c5ba0;
}

.cdek-timeline__line {
  position: absolute;
  left: 4.5px;
  top: 17px;
  bottom: 0;
  width: 1px;
  background: #e0e0e0;
}

.cdek-timeline__item:last-child .cdek-timeline__line {
  display: none;
}

.cdek-timeline__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #050505;
}

.cdek-timeline__meta {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: #8a8a8a;
}

.cdek-timeline__source {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 4px;
  background: #f0f0f0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.cdek-empty {
  color: #8a8a8a;
  font-size: 14px;
}

.cdek-order__notcdek {
  padding: 10px 0;
}

.cdek-order__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 24px;
  margin-top: 12px;
  padding: 16px;
  border-radius: 8px;
  background: #008b16;
}

.cdek-order__footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cdek-order__footer-mark {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  background: #fff;
}

.cdek-order__footer-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}

@media (max-width: 720px) {
  .cdek-order__banner {
    padding: 26px 22px;
  }

  .cdek-order__banner h3 {
    font-size: 27px;
  }

  .cdek-order__banner-ico {
    display: none;
  }

  .cdek-order__body {
    padding: 16px 16px 20px;
  }

  .cdek-items__row {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
