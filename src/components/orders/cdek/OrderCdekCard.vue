<template>
  <div v-if="isLoading" class="flex justify-center py-20">
    <Loader />
  </div>

  <div v-else-if="!order" class="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-gray-500">
    Заказ не найден.
  </div>

  <div v-else class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Шапка -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <router-link
          :to="`/order/${order.id}`"
          class="text-xs font-medium text-gray-500 hover:text-gray-900 hover:underline"
        >← К заказу №{{ order.order_number || order.id }}</router-link>
        <h1 class="mt-1 text-xl font-semibold text-gray-900">
          СДЭК — заявка по заказу №{{ order.order_number || order.id }}
        </h1>
        <p v-if="cdekOrder?.cdek_number" class="mt-1 text-sm text-gray-500">
          Номер СДЭК: <span class="font-medium text-gray-900">{{ cdekOrder.cdek_number }}</span>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <a
          v-if="trackingUrl"
          :href="trackingUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-9 items-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >Отследить на cdek.ru</a>
        <Button
          v-if="isCdekDelivery"
          size="sm"
          :disabled="loading"
          @click="createOrSync"
        >{{ cdekOrder?.cdek_uuid ? "Обновить статус" : "Создать заявку" }}</Button>
        <Button
          v-if="cdekOrder?.cdek_uuid && !isFinal"
          size="sm"
          variant="destructive"
          :disabled="loading"
          @click="cancel"
        >Отменить доставку</Button>
      </div>
    </div>

    <template v-if="isCdekDelivery">
      <p
        v-if="cdekOrder?.last_error"
        class="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-600/10"
      >{{ cdekOrder.last_error }}</p>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Отправление -->
        <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5 lg:col-span-2">
          <h3 class="text-sm font-semibold text-gray-900">Отправление</h3>
          <dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div><dt class="text-xs uppercase text-gray-500">Создание</dt><dd class="mt-0.5">{{ cdekOrder?.creation_state || "Заявка ещё не создана" }}</dd></div>
            <div><dt class="text-xs uppercase text-gray-500">Статус</dt><dd class="mt-0.5">{{ cdekOrder?.status_name || cdekOrder?.status_code || "—" }}</dd></div>
            <div><dt class="text-xs uppercase text-gray-500">Номер СДЭК</dt><dd class="mt-0.5">{{ cdekOrder?.cdek_number || "—" }}</dd></div>
            <div><dt class="text-xs uppercase text-gray-500">UUID</dt><dd class="mt-0.5 break-all text-xs text-gray-600">{{ cdekOrder?.cdek_uuid || "—" }}</dd></div>
            <div><dt class="text-xs uppercase text-gray-500">Тариф</dt><dd class="mt-0.5">{{ delivery.tariff_name || cdekOrder?.tariff_code || "—" }}</dd></div>
            <div><dt class="text-xs uppercase text-gray-500">Тип / режим</dt><dd class="mt-0.5">{{ deliveryLabel }}</dd></div>
            <div v-if="delivery.pvz?.address || cdekOrder?.pvz_code">
              <dt class="text-xs uppercase text-gray-500">ПВЗ</dt>
              <dd class="mt-0.5">{{ delivery.pvz?.address || `код ${cdekOrder.pvz_code}` }}</dd>
            </div>
            <div v-if="destinationLabel">
              <dt class="text-xs uppercase text-gray-500">Город получателя</dt>
              <dd class="mt-0.5">{{ destinationLabel }}</dd>
            </div>
            <div><dt class="text-xs uppercase text-gray-500">Стоимость доставки</dt><dd class="mt-0.5">{{ formatPrice(deliveryPrice) }}</dd></div>
            <div v-if="delivery.period"><dt class="text-xs uppercase text-gray-500">Срок</dt><dd class="mt-0.5">{{ delivery.period }}</dd></div>
            <div><dt class="text-xs uppercase text-gray-500">Синхронизация</dt><dd class="mt-0.5">{{ formatDateTime(cdekOrder?.last_synced_at) || "—" }}</dd></div>
          </dl>
        </section>

        <!-- Получатель -->
        <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
          <h3 class="text-sm font-semibold text-gray-900">Получатель</h3>
          <dl class="mt-3 space-y-3 text-sm">
            <div><dt class="text-xs uppercase text-gray-500">Имя</dt><dd class="mt-0.5">{{ recipientName || "—" }}</dd></div>
            <div><dt class="text-xs uppercase text-gray-500">Телефон</dt><dd class="mt-0.5">{{ recipientPhone || "—" }}</dd></div>
            <div v-if="order.email"><dt class="text-xs uppercase text-gray-500">Email</dt><dd class="mt-0.5">{{ order.email }}</dd></div>
            <div v-if="fullAddress"><dt class="text-xs uppercase text-gray-500">Адрес</dt><dd class="mt-0.5">{{ fullAddress }}</dd></div>
          </dl>
        </section>

        <!-- История статусов -->
        <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5 lg:col-span-2">
          <h3 class="text-sm font-semibold text-gray-900">История статусов</h3>
          <ol v-if="statusEvents.length" class="mt-4 space-y-0">
            <li v-for="(event, i) in statusEvents" :key="event.id || i" class="relative flex gap-4 pb-5 last:pb-0">
              <span v-if="i < statusEvents.length - 1" class="absolute left-[5px] top-4 -bottom-1 w-px bg-gray-200"></span>
              <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" :class="i === 0 ? 'bg-blue-600' : 'bg-gray-300'"></span>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ event.status_name || event.status_code }}</p>
                <p class="mt-0.5 text-xs text-gray-500">
                  {{ formatDateTime(event.status_at) || "дата неизвестна" }}
                  <span v-if="event.source" class="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase text-gray-500">{{ event.source }}</span>
                </p>
              </div>
            </li>
          </ol>
          <p v-else class="mt-3 text-sm text-gray-500">Событий пока нет — статус появится после создания заявки и первой синхронизации.</p>
        </section>

        <!-- Состав заказа -->
        <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
          <h3 class="text-sm font-semibold text-gray-900">Состав заказа</h3>
          <ul class="mt-3 space-y-3 text-sm">
            <li v-for="(item, i) in orderItems" :key="item.id || i" class="flex justify-between gap-3">
              <span class="min-w-0 text-gray-900">
                {{ item.product?.name || item.legacy_name || item.name || "—" }}
                <span class="text-xs text-gray-500">× {{ item.quantity }}</span>
              </span>
              <span class="shrink-0 text-gray-600">{{ formatPrice(Number(item.unit_price || 0) * Number(item.quantity || 0)) }}</span>
            </li>
          </ul>
          <p v-if="!orderItems.length" class="mt-3 text-sm text-gray-500">Позиций нет.</p>
        </section>
      </div>
    </template>

    <section v-else class="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm ring-1 ring-gray-900/5">
      Для этого заказа не выбрана доставка СДЭК
      <span v-if="order.delivery_method?.name"> (текущий способ: {{ order.delivery_method.name }})</span>.
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Loader from "@/components/common/Loader.vue";
import Button from "@/components/ui/button/Button.vue";
import { toast } from "vue-sonner";

const route = useRoute();
const isLoading = ref(true);
const loading = ref(false);
const order = ref(null);

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
const destinationLabel = computed(() => {
  const d = delivery.value?.destination || {};
  return [d.city, d.region].filter(Boolean).join(", ") || null;
});
const deliveryLabel = computed(() => {
  const type = cdekOrder.value?.delivery_type || delivery.value?.delivery_type;
  const mode = cdekOrder.value?.delivery_mode || delivery.value?.delivery_mode;
  return [type, mode].filter(Boolean).join(" / ") || "—";
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

const orderItems = computed(() => order.value?.items || []);

const formatPrice = (value) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(n);
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

onMounted(() => fetchOrder(route.params.id));
watch(
  () => route.params.id,
  (id) => id && fetchOrder(id),
);
</script>
