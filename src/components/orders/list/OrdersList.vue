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
      <select
          v-model="sortMode"
          class="h-10 rounded-md border border-input bg-background px-3 text-sm"
          title="Порядок заказов в списке"
          @change="handleSortChange"
      >
        <option value="date">Сначала новые (по дате)</option>
        <option value="number_desc">По номеру: от большего</option>
        <option value="number_asc">По номеру: от меньшего</option>
      </select>

      <div
          v-if="promoFilter.id"
          class="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 h-10 text-sm text-blue-700"
          title="Заказы, в которых применён этот промокод"
      >
        <span>Промокод: <span class="font-medium">{{ promoFilter.code || `#${promoFilter.id}` }}</span></span>
        <button
            class="text-blue-400 hover:text-blue-700"
            title="Убрать фильтр по промокоду"
            @click="removePromoFilter"
        >
          <X class="w-4 h-4"/>
        </button>
      </div>

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
import {useRoute, useRouter} from "vue-router";
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
const router = useRouter()

// Фильтр по промокоду, пришедший извне ссылкой (например, из статистики
// промокода: /orders/list?promo_code_id=N&promo_code=code). id — точный
// фильтр на бэке (orders.promo_code_id), code — только для отображения.
const promoFilter = ref<{ id: number | null; code: string }>({
  id: route.query.promo_code_id ? Number(route.query.promo_code_id) : null,
  code: route.query.promo_code ? String(route.query.promo_code) : '',
})


// Общий объект состояния всех фильтров: используется и верхней панелью
// OrderSearch, и фильтрами-кнопками в заголовках столбцов OrderListTable.
// Любое изменение в любом виджете → handleSearch() → fetchData().
const createDefaultFilters = () => ({
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
  status: [] as string[],
  payment_status: [] as string[],
  delivery_service: [] as string[],
  assigned_user_id: '' as string | number,
  min_amount: '' as string | number,
  max_amount: '' as string | number,
})

// Фильтры и страница запоминаются на время работы во вкладке: после входа в
// заказ и возврата «назад» список остаётся в том же состоянии. Если список
// открыт ссылкой с параметрами (статус, промокод) — сохранённое не применяем.
const FILTERS_STORAGE_KEY = 'orders-list-filters'
const readSavedState = (): { filters: ReturnType<typeof createDefaultFilters>; page: number; per_page: number } | null => {
  if (route.query.status || route.query.promo_code_id) return null
  try {
    const raw = sessionStorage.getItem(FILTERS_STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    const base = createDefaultFilters()
    const filters: any = {...base}
    for (const key of Object.keys(base) as Array<keyof typeof base>) {
      const value = saved?.filters?.[key]
      if (value === undefined || value === null) continue
      if (key === 'datePicker') {
        filters.datePicker = {start: String(value.start ?? ''), end: String(value.end ?? '')}
      } else if (Array.isArray(base[key])) {
        if (Array.isArray(value)) filters[key] = value
      } else {
        filters[key] = value
      }
    }
    return {
      filters,
      page: Number(saved?.page) > 0 ? Number(saved.page) : 1,
      per_page: Number(saved?.per_page) > 0 ? Number(saved.per_page) : 15,
    }
  } catch {
    return null
  }
}
const savedState = readSavedState()

const searchParams = ref(savedState?.filters ?? createDefaultFilters())

const orders = ref<Order[]>([])

// Порядок списка: по дате создания (по умолчанию, как раньше) или по номеру.
// Выбор запоминается в браузере; если localStorage недоступен — просто по дате.
type SortMode = 'date' | 'number_desc' | 'number_asc'
const SORT_STORAGE_KEY = 'orders-list-sort'
const readSortMode = (): SortMode => {
  try {
    const v = localStorage.getItem(SORT_STORAGE_KEY)
    return v === 'number_desc' || v === 'number_asc' ? v : 'date'
  } catch {
    return 'date'
  }
}
const sortMode = ref<SortMode>(readSortMode())

const sortParams = computed(() => {
  if (sortMode.value === 'number_desc') return {sort_by: 'order_number', sort_order: 'desc'}
  if (sortMode.value === 'number_asc') return {sort_by: 'order_number', sort_order: 'asc'}
  return {sort_by: 'created_at', sort_order: 'desc'}
})

function handleSortChange() {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, sortMode.value)
  } catch {
    // хранилище недоступно — не критично
  }
  pagination.value.page = 1
  fetchData()
}

// Списки опций для select-фильтров (как в верхней панели, так и в заголовках).
// Грузим один раз тут, передаём вниз — чтобы не дублировать запросы.
const managerOptions = ref<{ value: number | string; label: string }[]>([])
const deliveryMethodOptions = ref<{ value: number | string; label: string }[]>([])

const pagination = ref<PaginationMeta>({
  page: savedState?.page ?? 1,
  per_page: savedState?.per_page ?? 15,
  total: 0,
})

// Сохраняем состояние при любом изменении фильтров и страницы.
watch(
    () => [searchParams.value, pagination.value.page, pagination.value.per_page],
    () => {
      try {
        sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({
          filters: searchParams.value,
          page: pagination.value.page,
          per_page: pagination.value.per_page,
        }))
      } catch {
        // хранилище недоступно — фильтры просто не запомнятся
      }
    },
    {deep: true},
)

// Оплата и доставка: мультивыбор даёт массив, верхняя панель — одиночное значение.
// В запрос уходит всегда массив; пустой массив axios не отправляет.
const toArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (value === null || value === undefined || value === '') return []
  return Array.isArray(value) ? value : [value]
}

const hasActiveFilters = computed(() => {
  const s = searchParams.value
  return !!s.search
      || !!s.recipient_search
      || !!s.email
      || !!s.order_number
      || !!s.datePicker.start
      || !!s.datePicker.end
      || s.status.length > 0
      || toArray(s.payment_status).length > 0
      || toArray(s.delivery_service).length > 0
      || !!s.assigned_user_id
      || s.min_amount !== '' && s.min_amount !== null
      || s.max_amount !== '' && s.max_amount !== null
      || !!promoFilter.value.id
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

  const status = route.query?.status
      ? (Array.isArray(route.query.status) ? route.query.status.map(String) : [String(route.query.status)])
      : searchParams.value.status

  const result = await getOrders({
    status: status,
    paginate: true,
    page: pagination.value.page,
    per_page: pagination.value.per_page,
    search: searchParams.value.search,
    recipient_search: searchParams.value.recipient_search,
    email: searchParams.value.email || null,
    order_number: searchParams.value.order_number || null,
    promo_code_id: promoFilter.value.id ?? null,
    date_from: searchParams.value.datePicker.start,
    date_to: searchParams.value.datePicker.end,
    payment_status: toArray(searchParams.value.payment_status),
    delivery_service: toArray(searchParams.value.delivery_service),
    assigned_user_id: searchParams.value.assigned_user_id || null,
    min_amount: searchParams.value.min_amount === '' ? null : searchParams.value.min_amount,
    max_amount: searchParams.value.max_amount === '' ? null : searchParams.value.max_amount,
    ...sortParams.value,
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
    // Только актуальные службы (config/delivery_services.php), не все способы доставки.
    const {data} = await axios.get('/delivery/services/filter')
    const list = Array.isArray(data) ? data : (data?.data ?? [])
    deliveryMethodOptions.value = (list || []).map((s: any) => ({
      value: s.value,
      label: s.label,
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
  searchParams.value = createDefaultFilters()

  pagination.value.page = 1
  clearPromoFilter()
  fetchData()
}


function clearPromoFilter() {
  promoFilter.value = {id: null, code: ''}
  // Убираем query-параметры, чтобы фильтр не вернулся при перезагрузке
  if (route.query.promo_code_id || route.query.promo_code) {
    router.replace({query: {...route.query, promo_code_id: undefined, promo_code: undefined}})
  }
}

function removePromoFilter() {
  clearPromoFilter()
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

// Повторный переход по ссылке /orders/list?promo_code_id=N, когда список
// заказов уже открыт: компонент переиспользуется и onMounted не сработает.
watch(() => route.query.promo_code_id, (val) => {
  promoFilter.value = {
    id: val ? Number(val) : null,
    code: route.query.promo_code ? String(route.query.promo_code) : '',
  }
  pagination.value.page = 1
  fetchData()
})

</script>
