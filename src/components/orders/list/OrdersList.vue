<template>
  <!--
    Верхняя панель: одно большое поле быстрого поиска (по email/телефону/
    городу/адресу доставки/стране — всё через бэкендовый `search`) с
    авто-применением (debounce, без кнопки «Применить») и кнопки действий
    (создать заказ, экспорт, сброс всех фильтров). Остальные фильтры —
    в заголовках столбцов таблицы (см. OrderListTable).
  -->
  <div class="flex flex-col md:flex-row md:items-center gap-2 mb-2">
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
      <Input
          v-model="searchParams.search"
          type="text"
          class="pl-9 h-10"
          placeholder="Поиск по телефону, городу, адресу доставки, стране..."
      />
    </div>

    <div class="flex justify-end gap-2">
      <Button
          v-if="hasActiveFilters"
          variant="outline"
          @click="resetFilters"
          title="Сбросить все фильтры"
      >
        <X/>
        Сбросить
      </Button>

      <router-link to="/order/create">
        <Button variant="outline" size="icon">
          <Plus/>
        </Button>
      </router-link>

      <OrdersExport/>
    </div>
  </div>

  <OrderListTable
      :loading="sending"
      :items="orders"
      :pagination="pagination"
      :filter="searchParams"
      :manager-options="managerOptions"
      :delivery-method-options="deliveryMethodOptions"
      @filter="handleSearch"
      @deleted="fetchData()"
  />

</template>

<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue';
import axios from 'axios';
import {useRoute} from "vue-router";
import Order from "@/models/order/Order"
import OrderListTable from "@/components/orders/list/OrderListTable.vue";
import {useOrderFunctions} from "@/composables/useOrderFunctions";
import OrdersExport from "@/components/orders/Export.vue";
import Button from "@/components/ui/button/Button.vue";
import {Input} from "@/components/ui/input";
import {Plus, X, Search} from "lucide-vue-next"
import {useDebounceFn} from "@vueuse/core";
import {useStore} from "vuex";
import {PaginationMeta} from "@/types/Types";

const store = useStore();
const route = useRoute()


// Общий объект состояния всех фильтров: используется и верхней панелью
// OrderSearch, и фильтрами-кнопками в заголовках столбцов OrderListTable.
// Любое изменение в любом виджете → handleSearch() → fetchData().
const searchParams = ref({
  datePicker: {
    start: '',
    end: ''
  },
  search: '',
  // Узкий поиск по ФИО получателя — ходит ТОЛЬКО по order_addresses.recipient_*
  // на бэке (см. OrderFilterService::searchByRecipient). Используется фильтром
  // столбца «ФИО получателя», чтобы не «зацеплять» имя/фамилию клиента.
  recipient_search: '',
  email: '',
  order_number: '',
  status: '',
  payment_status: '',
  delivery_method_id: '',
  assigned_user_id: '',
  min_amount: '',
  max_amount: '',
})

const orders = ref<Order[]>([])

// Списки опций для select-фильтров (как в верхней панели, так и в заголовках).
// Грузим один раз тут, передаём вниз — чтобы не дублировать запросы.
const managerOptions = ref<{ value: number | string; label: string }[]>([])
const deliveryMethodOptions = ref<{ value: number | string; label: string }[]>([])

const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 15,
  total: 0,
})

const hasActiveFilters = computed(() => {
  const s = searchParams.value
  return !!s.search
      || !!s.recipient_search
      || !!s.email
      || !!s.order_number
      || !!s.datePicker.start
      || !!s.datePicker.end
      || !!s.status
      || !!s.payment_status
      || !!s.delivery_method_id
      || !!s.assigned_user_id
      || s.min_amount !== '' && s.min_amount !== null
      || s.max_amount !== '' && s.max_amount !== null
})

onMounted(async () => {
  await Promise.all([
    fetchData(),
    fetchManagers(),
    fetchDeliveryMethods(),
  ])
  await store.dispatch('notifications/markOrdersChecked');
})

const {getOrders, sending} = useOrderFunctions()


async function fetchData() {

  const status = route.query?.status ? `${route.query?.status}` : searchParams.value.status ? searchParams.value.status : ''

  const result = await getOrders({
    status: status,
    paginate: true,
    page: pagination.value.page,
    per_page: pagination.value.per_page,
    search: searchParams.value.search,
    recipient_search: searchParams.value.recipient_search,
    email: searchParams.value.email || null,
    order_number: searchParams.value.order_number || null,
    date_from: searchParams.value.datePicker.start,
    date_to: searchParams.value.datePicker.end,
    payment_status: searchParams.value.payment_status,
    delivery_method_id: searchParams.value.delivery_method_id || null,
    assigned_user_id: searchParams.value.assigned_user_id || null,
    min_amount: searchParams.value.min_amount === '' ? null : searchParams.value.min_amount,
    max_amount: searchParams.value.max_amount === '' ? null : searchParams.value.max_amount,
  })

  orders.value = result?.orders ?? []
  pagination.value.total = result?.meta.total ?? 0
}

async function fetchManagers() {
  try {
    // Лёгкий, целевой эндпоинт — возвращает плоский массив [{id, name}]
    // только админ-пользователей (super-admin/admin/manager). Без пагинации,
    // без ролей/permissions — чтобы фильтр на странице заказов всегда
    // получал стабильный список.
    const {data} = await axios.get('/users/managers')
    const list: Array<{id: number; name: string}> = Array.isArray(data?.managers)
        ? data.managers
        : []
    managerOptions.value = list.map((u) => ({
      value: u.id,
      label: u.name || `#${u.id}`,
    }))
  } catch (e) {
    console.error('Failed to load managers', e)
    managerOptions.value = []
  }
}

async function fetchDeliveryMethods() {
  try {
    const {data} = await axios.get('/delivery/methods/admin')
    const list = Array.isArray(data) ? data : (data?.data ?? data?.delivery_methods ?? data?.methods ?? [])
    deliveryMethodOptions.value = (list || []).map((m: any) => ({
      value: m.id,
      label: m.name || m.title || `#${m.id}`,
    }))
  } catch (e) {
    console.error('Failed to load delivery methods', e)
    deliveryMethodOptions.value = []
  }
}


const handleSearch = () => {
  pagination.value.page = 1
  fetchData()
}


function resetFilters() {
  searchParams.value = {
    datePicker: {
      start: '',
      end: ''
    },
    search: '',
    recipient_search: '',
    email: '',
    order_number: '',
    status: '',
    payment_status: '',
    delivery_method_id: '',
    assigned_user_id: '',
    min_amount: '',
    max_amount: '',
  }

  pagination.value.page = 1
  fetchData()
}


watch(
    () => [pagination.value.page, pagination.value.per_page],
    () => fetchData()
)

// Авто-поиск по верхнему полю: дебаунс 400мс, без кнопки «Применить».
// Бэкенд (OrderFilterService::search) уже умеет искать по email клиента/гостя,
// телефону (нормализуется), стране/городу/региону/адресу/индексу доставки,
// ФИО получателя и id/order_number — поэтому одного `search` достаточно.
const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  fetchData()
}, 400)

watch(() => searchParams.value.search, () => {
  debouncedSearch()
})

</script>
