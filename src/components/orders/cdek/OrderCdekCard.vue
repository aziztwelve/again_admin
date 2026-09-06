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
                {{ creationStateLabel }}
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

        <div class="cdek-order__table-wrap">
          <table class="cdek-table">
            <thead>
              <tr>
                <th class="cdek-table__num">№</th>
                <th>Фото</th>
                <th>Артикул</th>
                <th>Наименование</th>
                <th class="cdek-table__right">Вес, г</th>
                <th class="cdek-table__right">Кол-во</th>
                <th class="cdek-table__right">Цена</th>
                <th class="cdek-table__right">Сумма</th>
                <th class="cdek-table__right">Объявл. стоимость</th>
                <th class="cdek-table__right">НДС</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in orderItems" :key="item.id || i">
                <td class="cdek-table__num">{{ i + 1 }}</td>
                <td>
                  <img
                    v-if="itemImage(item)"
                    :src="itemImage(item)"
                    alt=""
                    class="cdek-table__thumb"
                  />
                  <div v-else class="cdek-table__thumb cdek-table__thumb--empty"></div>
                </td>
                <td>{{ itemSku(item) }}</td>
                <td>
                  <div class="cdek-table__name">
                    {{ itemName(item) }}
                    <span v-if="item.is_gift" class="cdek-table__gift">Подарок</span>
                  </div>
                  <div v-if="variantLabel(item)" class="cdek-table__variant">
                    <span
                      v-if="variantColor(item)"
                      class="cdek-table__dot"
                      :style="{ background: variantColor(item) }"
                    ></span>
                    {{ variantLabel(item) }}
                  </div>
                </td>
                <td class="cdek-table__right">{{ itemWeight(item) }}</td>
                <td class="cdek-table__right">{{ itemQty(item) }}</td>
                <td class="cdek-table__right">
                  <span v-if="item.is_gift" class="cdek-table__free">Бесплатно</span>
                  <template v-else>{{ formatRub(itemUnitPrice(item)) }}</template>
                </td>
                <td class="cdek-table__right cdek-table__strong">
                  <span v-if="item.is_gift" class="cdek-table__free">Бесплатно</span>
                  <template v-else>{{ formatRub(itemUnitPrice(item) * itemQty(item)) }}</template>
                </td>
                <td class="cdek-table__right">{{ formatRub(itemDeclaredCost(item) * itemQty(item)) }}</td>
                <td class="cdek-table__right">
                  <template v-if="vatRate">{{ vatRate }}% ({{ formatRub(itemVat(item)) }})</template>
                  <span v-else class="cdek-table__muted">без НДС</span>
                </td>
              </tr>
              <tr v-if="!orderItems.length">
                <td colspan="10" class="cdek-table__empty">Позиций нет.</td>
              </tr>
            </tbody>
            <tfoot v-if="orderItems.length">
              <tr>
                <td colspan="4" class="cdek-table__strong">Итого</td>
                <td class="cdek-table__right">{{ itemsTotalWeight }}</td>
                <td class="cdek-table__right">{{ itemsTotalQty }}</td>
                <td></td>
                <td class="cdek-table__right cdek-table__strong">{{ formatRub(itemsTotalSum) }}</td>
                <td class="cdek-table__right cdek-table__strong">{{ formatRub(itemsTotalDeclared) }}</td>
                <td class="cdek-table__right cdek-table__strong">
                  <template v-if="vatRate">{{ formatRub(itemsTotalVat) }}</template>
                  <span v-else class="cdek-table__muted">—</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p class="cdek-table__note">
          Объявленная стоимость — по настройкам СДЭК: фиксированное значение, иначе процент, иначе цена позиции.
          НДС — по ставке из настроек СДЭК, выделяется из цены (цена включает НДС).
        </p>
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

        <template v-if="!cdekOrder?.cdek_uuid">
          <div class="cdek-order__actions">
            <button class="cdek-btn-main" type="button" :disabled="loading || creationQueued" @click="createOrSync">
              {{ creationQueued ? "Заявка отправлена в СДЭК" : "Отправить данные в СДЭК" }}
            </button>
          </div>
        </template>

        <template v-else>
          <div class="cdek-order__history">
            <h4>История статусов заказа</h4>
            <div class="cdek-order__table-wrap">
              <table class="cdek-table cdek-table--history">
                <thead>
                  <tr>
                    <th class="cdek-history__date">Дата</th>
                    <th>Статус заказа</th>
                    <th>Город</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(event, i) in statusEvents" :key="event.id || i">
                    <td>{{ formatDateTime(event.status_at) || "—" }}</td>
                    <td>{{ event.status_name || event.status_code }}</td>
                    <td>{{ event.city || "—" }}</td>
                  </tr>
                  <tr v-if="!statusEvents.length">
                    <td colspan="3" class="cdek-table__empty">Событий пока нет.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="cdek-order__actions">
            <button class="cdek-btn-main" type="button" :disabled="loading" @click="printWaybill">
              Печать накладной
            </button>
            <button class="cdek-btn-main" type="button" :disabled="loading" @click="printBarcode">
              Печать ШК
            </button>
            <Button
              variant="outline"
              :disabled="loading"
              @click="createOrSync"
            >Обновить историю статусов</Button>
            <Button
              variant="destructive"
              :disabled="loading"
              @click="removeClaim"
            >Удалить</Button>
          </div>
        </template>
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
const creationQueued = computed(() =>
  ["QUEUED", "ACCEPTED"].includes(String(cdekOrder.value?.creation_state || "")),
);
const creationStateLabel = computed(() => {
  const state = cdekOrder.value?.creation_state;
  return state === "QUEUED" ? "В очереди на создание" : state || "заявка ещё не создана";
});

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

const variantColor = (item) =>
  item?.color?.code || item?.variant?.table_color?.code || item?.variant?.color?.code || null;

const itemImage = (item) =>
  item?.variant?.images?.[0]?.url || item?.product?.images?.[0]?.url || null;

const itemName = (item) =>
  item?.product?.name || item?.legacy_name || item?.name || "—";

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

const itemWeight = (item) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(itemWeightValue(item));

const itemWeightValue = (item) =>
  Number(item?.variant?.weight || item?.product?.weight || defaultPackage.value?.weight || 500) || 0;

const itemDeclaredCost = (item) => {
  const price = itemUnitPrice(item);
  const value = Number(declaredSettings.value?.value || 0);
  if (value > 0) return value;
  const percent = Number(declaredSettings.value?.percent || 0);
  if (percent > 0) return Math.round((price * percent) / 100 * 100) / 100;
  return price;
};

const vatRate = computed(() => {
  const rate = Number(cdekSettings.value?.delivery_vat || 0);
  return [0, 5, 7, 10, 16, 22].includes(rate) ? rate : 0;
});

const itemVat = (item) => {
  if (!vatRate.value || item?.is_gift) return null;
  const total = itemUnitPrice(item) * itemQty(item);
  return Math.round(((total * vatRate.value) / (100 + vatRate.value)) * 100) / 100;
};

const itemsTotalQty = computed(() =>
  orderItems.value.reduce((sum, item) => sum + itemQty(item), 0),
);
const itemsTotalSum = computed(() =>
  orderItems.value.reduce((sum, item) => sum + itemUnitPrice(item) * itemQty(item), 0),
);
const itemsTotalDeclared = computed(() =>
  orderItems.value.reduce((sum, item) => sum + itemDeclaredCost(item) * itemQty(item), 0),
);
const itemsTotalVat = computed(() =>
  orderItems.value.reduce((sum, item) => sum + (itemVat(item) || 0), 0),
);

const itemsTotalWeight = computed(() =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
    orderItems.value.reduce((sum, item) => sum + itemWeightValue(item) * itemQty(item), 0),
  ),
);

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
  if (loading.value || creationQueued.value) return;

  loading.value = true;
  try {
    const { data } = await axios.post(`/orders/${order.value.id}/cdek-delivery/create`);
    const message = data?.message || "Готово";
    const returnedError = data?.cdek_order?.last_error;
    if (returnedError) {
      // Бэкенд ответил 200, но заявка не создана: причина сохранена в заявке
      // (например, в заказе не выбран тариф СДЭК).
      toast.error(message, { description: returnedError });
    } else {
      toast.success(message);
    }
    await fetchOrder(order.value.id);
  } catch (e) {
    toast.error(e?.response?.data?.message || "Не удалось обновить заявку СДЭК");
    // Причина отказа сохраняется в заявке — перечитываем заказ, чтобы она
    // осталась на странице после закрытия всплывающего сообщения.
    await fetchOrder(order.value.id);
  } finally {
    loading.value = false;
  }
};

const readBlobErrorMessage = async (blob) => {
  try {
    return JSON.parse((await blob?.text?.()) || "{}")?.message || "";
  } catch {
    return "";
  }
};

const openPrintUrl = async (kind) => {
  // Окно открываем синхронно до запроса, иначе блокировщик всплывающих окон
  // съест window.open, вызванный после await. PDF отдаётся прокси-ответом
  // (ссылки СДЭК требуют OAuth), поэтому качаем blob и подставляем в окно.
  const win = window.open("", "_blank");
  loading.value = true;
  try {
    const { data } = await axios.get(`/orders/${order.value.id}/cdek-delivery/${kind}`, {
      responseType: "blob",
    });
    if (data && data.type === "application/pdf") {
      const url = URL.createObjectURL(data);
      if (win) {
        win.location.href = url;
        win.onbeforeunload = () => URL.revokeObjectURL(url);
      } else {
        window.open(url, "_blank");
      }
    } else {
      win?.close();
      toast.error("Не удалось получить документ СДЭК", {
        description: await readBlobErrorMessage(data),
      });
    }
  } catch (e) {
    win?.close();
    toast.error("Не удалось получить документ СДЭК", {
      description: await readBlobErrorMessage(e?.response?.data),
    });
  } finally {
    loading.value = false;
  }
};

const printWaybill = () => openPrintUrl("waybill");
const printBarcode = () => openPrintUrl("barcode");

const removeClaim = async () => {
  if (!window.confirm("Удалить заявку в СДЭК? После удаления её можно будет создать заново.")) return;
  loading.value = true;
  try {
    await axios.post(`/orders/${order.value.id}/cdek-delivery/cancel`);
    toast.success("Заявка СДЭК удалена");
    await fetchOrder(order.value.id);
  } catch (e) {
    toast.error("Не удалось удалить заявку", {
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

.cdek-order__table-wrap {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.cdek-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #374151;
  min-width: 980px;
}

.cdek-table th {
  padding: 9px 12px;
  background: #f9fafb;
  color: #6b7280;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  text-align: left;
  white-space: nowrap;
}

.cdek-table td {
  padding: 10px 12px;
  border-top: 1px solid #f3f4f6;
  vertical-align: middle;
}

.cdek-table tfoot td {
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 10px 12px;
}

.cdek-table__right {
  text-align: right;
  white-space: nowrap;
}

.cdek-table__num {
  width: 34px;
  color: #9ca3af;
}

.cdek-table__strong {
  font-weight: 600;
  color: #111827;
}

.cdek-table__thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  display: block;
}

.cdek-table__thumb--empty {
  background: #f3f4f6;
}

.cdek-table__name {
  color: #111827;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.cdek-table__variant {
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.cdek-table__dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  flex-shrink: 0;
}

.cdek-table__gift {
  padding: 1px 8px;
  border-radius: 999px;
  background: #d1fae5;
  color: #047857;
  font-size: 11px;
  font-weight: 600;
}

.cdek-table__free {
  color: #059669;
  font-weight: 600;
}

.cdek-table__empty {
  padding: 22px 12px;
  text-align: center;
  color: #9ca3af;
}

.cdek-table__muted {
  color: #9ca3af;
}

.cdek-table__note {
  margin: 8px 0 0;
  color: #9ca3af;
  font-size: 12px;
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

.cdek-table--history {
  min-width: 0;
}

.cdek-history__date {
  width: 170px;
  white-space: nowrap;
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
}
</style>
