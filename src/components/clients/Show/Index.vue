<template>
  <Loader v-if="isLoading"/>

  <div v-else-if="!client" class="p-6 text-sm text-gray-500">
    Клиент не найден
  </div>

  <div v-else class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-wrap items-center gap-3">
      <RouterLink
          to="/clients/list"
          class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft class="h-4 w-4"/>
        К списку
      </RouterLink>
      <h1 class="truncate text-xl font-semibold text-gray-900">
        {{ fullName || client.email || `Клиент #${client.id}` }}
      </h1>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Main (2/3) -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Карточка клиента -->
        <section class="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
          <header class="flex items-center justify-between border-b px-4 py-3">
            <h3 class="text-sm font-semibold text-gray-900">Карточка клиента</h3>
            <ClientEditModal
                v-if="clientForModal"
                :client="clientForModal"
                button-name="Редактировать"
                @updated="handleUpdated"
            />
          </header>

          <div class="divide-y">
            <div class="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-3">
              <FieldView label="Фамилия" :value="client.profile?.last_name"/>
              <FieldView label="Имя" :value="client.profile?.first_name"/>
              <FieldView label="Отчество" :value="client.profile?.middle_name"/>
              <FieldView label="Телефон" :value="client.profile?.phone"/>
              <FieldView label="Почта" :value="client.email"/>
              <FieldView
                  label="Бонусы"
                  :value="
                  client.bonus_balance !== undefined && client.bonus_balance !== null
                      ? Number(client.bonus_balance).toLocaleString('ru-RU')
                      : null
                "
              />
            </div>

            <div class="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-2">
              <FieldView
                  label="Дата рождения"
                  :value="
                  client.profile?.birthday
                      ? formatDateToRussian(client.profile.birthday)
                      : null
                "
              />
              <FieldView label="Адрес" :value="client.profile?.address"/>
            </div>

            <div class="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-3">
              <FieldView label="Страна" :value="client.profile?.country?.name"/>
              <FieldView label="Регион" :value="client.profile?.delivery_region"/>
              <FieldView label="Город" :value="client.profile?.city?.name"/>
              <FieldView label="Улица" :value="client.profile?.delivery_street"/>
              <FieldView label="Дом" :value="client.profile?.delivery_house"/>
              <FieldView label="Квартира" :value="client.profile?.delivery_apartment"/>
              <FieldView label="Почтовый индекс" :value="client.profile?.delivery_postal_code"/>
            </div>

            <div class="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-3">
              <FieldView
                  label="Подписан на рассылку"
                  :value="boolLabel(client.subscribed_to_newsletter)"
              />
              <FieldView
                  label="Согласие на ПД"
                  :value="boolLabel(client.personal_data_consent)"
              />
              <FieldView
                  label="Уведомления о заказе"
                  :value="boolLabel(client.messenger_subscription)"
              />
            </div>
          </div>
        </section>

        <!-- Заказы клиента -->
        <section class="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
          <header class="flex items-center justify-between border-b px-4 py-3">
            <h3 class="text-sm font-semibold text-gray-900">Заказы клиента</h3>
            <RouterLink
                :to="`/order/create?client_id=${client.id}`"
                class="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus class="h-3.5 w-3.5"/>
              Новый заказ
            </RouterLink>
          </header>

          <div v-if="ordersLoading" class="flex items-center justify-center py-10">
            <Spinner/>
          </div>

          <div
              v-else-if="!orders.length"
              class="px-4 py-10 text-center text-sm text-muted-foreground"
          >
            У клиента пока нет заказов
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/50 text-left">
              <tr>
                <th class="w-10 px-4 py-2 font-medium"></th>
                <th class="px-4 py-2 font-medium">Заказ</th>
                <th class="px-4 py-2 font-medium">Дата</th>
                <th class="px-4 py-2 text-right font-medium">Сумма</th>
                <th class="px-4 py-2 text-right font-medium">Оплачено</th>
                <th class="px-4 py-2 text-center font-medium">Статус заказа</th>
                <th class="px-4 py-2 text-center font-medium">Статус оплаты</th>
              </tr>
              </thead>
              <tbody>
              <!-- Итого -->
              <tr class="border-t bg-gray-50 font-semibold">
                <td class="px-4 py-2"></td>
                <td class="px-4 py-2">Итого</td>
                <td class="px-4 py-2 whitespace-nowrap">
                  {{ totalOrdersLabel }}
                </td>
                <td class="px-4 py-2 text-right whitespace-nowrap">
                  {{ formatPrice(statistics?.total_spent) }}
                </td>
                <td class="px-4 py-2 text-right whitespace-nowrap">
                  {{ formatPrice(statistics?.total_paid) }}
                </td>
                <td></td>
                <td></td>
              </tr>

              <tr v-for="(o, i) in orders" :key="o.id" class="border-t">
                <td class="px-4 py-2 text-gray-400">
                  {{ (ordersMeta?.current_page - 1 || 0) * ordersPerPage + i + 1 }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <RouterLink
                      :to="`/order/${o.id}`"
                      class="font-medium text-blue-600 hover:underline"
                  >
                    {{ o.order_number || o.id }}
                  </RouterLink>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  {{ formatDateToRussian(o.created_at, true) }}
                </td>
                <td class="px-4 py-2 text-right whitespace-nowrap">
                  {{ formatPrice(o.total_amount) }}
                </td>
                <td class="px-4 py-2 text-right whitespace-nowrap">
                  {{ formatPrice(o.payment_status === 'paid' ? o.total_amount : 0) }}
                </td>
                <td class="px-4 py-2 text-center">
                  <span
                      v-if="getStatus('order', String(o.status ?? '').trim())"
                      :style="{ backgroundColor: getStatus('order', String(o.status ?? '').trim())?.color }"
                      class="inline-block rounded px-2 py-1 text-white whitespace-nowrap"
                  >
                    {{ getStatus('order', String(o.status ?? '').trim())?.label }}
                  </span>
                  <span v-else class="text-muted-foreground">—</span>
                </td>
                <td class="px-4 py-2 text-center">
                  <span
                      class="inline-block rounded px-2 py-1 text-white whitespace-nowrap"
                      :style="{ backgroundColor: paymentStatusColor(o.payment_status) }"
                  >
                    {{ paymentStatusLabel(o.payment_status) }}
                  </span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div
              v-if="ordersMeta && ordersMeta.last_page > 1"
              class="flex items-center justify-between gap-3 border-t px-4 py-3"
          >
            <div class="text-xs text-muted-foreground">
              Стр. {{ ordersMeta.current_page }} из {{ ordersMeta.last_page }}
            </div>
            <div class="flex gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  :disabled="ordersMeta.current_page <= 1 || ordersLoading"
                  @click="changeOrdersPage(ordersMeta.current_page - 1)"
              >
                Назад
              </Button>
              <Button
                  variant="outline"
                  size="sm"
                  :disabled="ordersMeta.current_page >= ordersMeta.last_page || ordersLoading"
                  @click="changeOrdersPage(ordersMeta.current_page + 1)"
              >
                Вперёд
              </Button>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar (1/3) -->
      <aside class="space-y-6">
        <!-- Сводка -->
        <section class="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
          <header class="border-b px-4 py-3">
            <h3 class="text-sm font-semibold text-gray-900">Сводка</h3>
          </header>
          <table class="w-full text-sm">
            <tbody>
            <tr class="border-t">
              <td class="px-4 py-2 text-gray-500">Группа:</td>
              <td class="px-4 py-2 text-gray-900">
                {{ client.group_name || client.level?.name || 'Вне группы' }}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-4 py-2 text-gray-500">RFM:</td>
              <td class="px-4 py-2 text-gray-900">
                {{ client.rfm_segment || '—' }}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-4 py-2 text-gray-500">Скидка:</td>
              <td class="px-4 py-2 text-gray-900">
                {{ client.level?.discount_amount
                  ? `${client.level.discount_amount}${client.level.discount_type === 'percentage' ? '%' : ' ₽'}`
                  : '—' }}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-4 py-2 text-gray-500">Регистрация:</td>
              <td class="px-4 py-2 text-gray-900">
                {{ client.user_id || client.email_verified_at ? 'Да' : 'Нет' }}
              </td>
            </tr>
            <tr class="border-t">
              <td class="px-4 py-2 text-gray-500">Создан:</td>
              <td class="px-4 py-2 text-gray-900">
                {{ client.created_at ? formatDateToRussian(client.created_at) : '—' }}
              </td>
            </tr>
            <tr v-if="statistics?.last_order_date" class="border-t">
              <td class="px-4 py-2 text-gray-500">Последний заказ:</td>
              <td class="px-4 py-2 text-gray-900">
                {{ formatDateToRussian(statistics.last_order_date) }}
              </td>
            </tr>
            </tbody>
          </table>
        </section>

        <!-- События -->
        <section class="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
          <header class="border-b px-4 py-3">
            <h3 class="text-sm font-semibold text-gray-900">События</h3>
          </header>
          <div class="px-4 py-3">
            <div v-if="!events.length" class="text-sm text-muted-foreground">
              Событий пока нет
            </div>
            <ul v-else class="space-y-3 text-sm">
              <li v-for="ev in events" :key="ev.id" class="leading-snug">
                <div class="text-xs text-gray-500">
                  {{ formatDateToRussian(ev.created_at, true) }}
                  <span v-if="ev.order_number || ev.order_id">
                    —
                    <RouterLink
                        :to="`/order/${ev.order_id}`"
                        class="text-blue-600 hover:underline"
                    >
                      {{ ev.order_number || ev.order_id }}
                    </RouterLink>
                  </span>
                </div>
                <div class="text-gray-900">
                  {{ ev.description || '—' }}
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- Теги -->
        <section class="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
          <div class="px-4 py-3">
            <ClientTagsManager
                v-if="clientForModal"
                :client="clientForModal as any"
                @updated="handleTagsUpdated"
            />
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch, h} from 'vue';
import {RouterLink, useRoute} from 'vue-router';
import axios from 'axios';
import {toast} from 'vue-sonner';
import {ChevronLeft, Plus} from 'lucide-vue-next';

import Loader from '@/components/common/Loader.vue';
import {Spinner} from '@/components/ui/spinner';
import {Button} from '@/components/ui/button';
import ClientEditModal from '@/components/clients/Edit/ClientEditModal.vue';
import ClientTagsManager from '@/components/dialogs/chats/Client/Tag/ClientTagsManager.vue';

import {useDateFormat} from '@/composables/useDateFormat';
import {usePriceFormatter} from '@/composables/usePriceFormatter';
import {useStatusFunctions} from '@/composables/useStatusFunctions';

// Небольшой поле-рендер для карточки клиента (label + значение)
const FieldView = (props: { label: string; value: any }) => {
  const val =
      props.value === undefined || props.value === null || props.value === ''
          ? '—'
          : props.value;
  return h('div', [
    h('div', {class: 'text-xs uppercase text-gray-500'}, props.label),
    h('div', {class: 'mt-0.5 text-sm text-gray-900 break-words'}, val),
  ]);
};

const route = useRoute();
const {formatDateToRussian} = useDateFormat();
const {formatPrice} = usePriceFormatter();
const {getStatus, getAllStatuses, cachedStatuses} = useStatusFunctions();

const isLoading = ref(true);
const client = ref<any>(null);
const statistics = ref<any>(null);
const events = ref<any[]>([]);

const orders = ref<any[]>([]);
const ordersMeta = ref<any | null>(null);
const ordersLoading = ref(false);
const ordersPage = ref(1);
const ordersPerPage = 25;

const PAYMENT_STATUS_META: Record<string, {label: string; color: string}> = {
  paid: {label: 'Оплачен', color: '#10B981'},
  pending: {label: 'Не оплачен', color: '#979797'},
  failed: {label: 'Ошибка оплаты', color: '#ec5353'},
  refunded: {label: 'Возврат оплаты', color: '#f1ad41'},
};

function paymentStatusLabel(value: string | undefined | null): string {
  if (!value) return '—';
  return PAYMENT_STATUS_META[value]?.label ?? value;
}

function paymentStatusColor(value: string | undefined | null): string {
  if (!value) return '#9ca3af';
  return PAYMENT_STATUS_META[value]?.color ?? '#9ca3af';
}

function boolLabel(value: any): string {
  if (value === undefined || value === null) return '—';
  return value ? 'Да' : 'Нет';
}

const fullName = computed(() => {
  if (!client.value) return '';
  const p = client.value.profile || {};
  return (
      [p.last_name, p.first_name, p.middle_name]
          .filter(Boolean)
          .join(' ')
          .trim() || client.value.name || ''
  );
});

// Полный формат «X заказов/заказ»
const totalOrdersLabel = computed(() => {
  const n = Number(statistics.value?.total_orders ?? 0);
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = 'заказов';
  if (mod10 === 1 && mod100 !== 11) word = 'заказ';
  else if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) word = 'заказа';
  return `${n} ${word}`;
});

// Для передачи в ClientEditModal (ожидает тип из @/types/client)
const clientForModal = computed(() => {
  if (!client.value) return null;
  const c = client.value;
  return {
    id: c.id,
    name: fullName.value || c.email || '',
    email: c.email ?? '',
    profile: c.profile ?? undefined,
    tags: c.tags ?? undefined,
    created_at: c.created_at ?? '',
    updated_at: c.updated_at ?? undefined,
  };
});

async function fetchClient(id: number | string) {
  isLoading.value = true;
  try {
    const {data} = await axios.get(`/clients/${id}`);
    client.value = data?.client ?? data ?? null;
    statistics.value = data?.statistics ?? null;
    events.value = Array.isArray(data?.events) ? data.events : [];
  } catch (e) {
    console.error('Не удалось загрузить клиента', e);
    toast.error('Не удалось загрузить клиента');
    client.value = null;
    statistics.value = null;
    events.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function fetchOrders(id: number | string) {
  ordersLoading.value = true;
  try {
    if (!cachedStatuses.value) {
      await getAllStatuses();
    }
    const {data} = await axios.get('/orders', {
      params: {
        client_id: id,
        per_page: ordersPerPage,
        page: ordersPage.value,
      },
    });
    orders.value = data?.data ?? [];
    ordersMeta.value = data?.meta ?? null;
  } catch (e) {
    console.error(e);
    toast.error('Не удалось загрузить заказы клиента');
    orders.value = [];
    ordersMeta.value = null;
  } finally {
    ordersLoading.value = false;
  }
}

function changeOrdersPage(p: number) {
  ordersPage.value = p;
  if (client.value?.id) fetchOrders(client.value.id);
}

function handleUpdated() {
  if (client.value?.id) {
    fetchClient(client.value.id);
  }
}

function handleTagsUpdated(tags: any[]) {
  if (client.value) client.value.tags = tags;
}

onMounted(async () => {
  const id = route.params.id;
  if (!id) return;
  await fetchClient(id as string);
  if (client.value?.id) fetchOrders(client.value.id);
});

// На случай перехода между /clients/:id -> /clients/:другой_id
watch(
    () => route.params.id,
    async (newId, oldId) => {
      if (!newId || newId === oldId) return;
      ordersPage.value = 1;
      await fetchClient(newId as string);
      if (client.value?.id) fetchOrders(client.value.id);
    },
);
</script>
