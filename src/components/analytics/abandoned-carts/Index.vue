<template>
  <div class="space-y-4">
    <!-- Заголовок -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <DynamicTitle title="Брошенные корзины"/>
    </div>

    <!-- Фильтр периода -->
    <AbandonedCartFilters v-model="analyticsFilters" @apply="onPeriodChange"/>

    <!-- Карточки-метрики -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 grid-cols-1">
      <StatCard
          label="Средняя стоимость корзины"
          :value="Math.round(analytics?.average_cart_value ?? 0)"
          icon="shopping-cart"
          icon-color="blue"
          is-currency
      />
      <StatCard
          label="Упущенный доход"
          :value="analytics?.lost_revenue ?? 0"
          icon="trending-down"
          icon-color="red"
          is-currency
      />
      <StatCard
          label="Незаказанные брошенные корзины"
          :value="analytics?.abandoned_count ?? 0"
          icon="package"
          icon-color="orange"
          suffix="шт"
      />
    </div>

    <!-- Графики -->
    <div class="grid gap-4 lg:grid-cols-3 grid-cols-1">
      <div class="lg:col-span-3">
        <AbandonedCartDynamicsChart
            :key="`${analytics?.chart?.from ?? ''}-${analytics?.chart?.to ?? ''}-${analytics?.chart?.granularity ?? ''}`"
            :chart="analytics?.chart ?? emptyChart"
        />
      </div>
      <AbandonedCartConversionChart :conversion="analytics?.conversion ?? emptyConversion"/>
    </div>

    <!-- Таблица корзин -->
    <div>
      <h3 class="text-base font-semibold text-gray-800 mb-2">
        Корзины
        <span v-if="periodLabel" class="text-sm font-normal text-gray-500"> {{ periodLabel }}</span>
      </h3>
      <AbandonedCartTable
          :rows="carts?.data ?? []"
          :loading="loadingCarts"
          :current-page="listFilters.page ?? 1"
          :per-page="carts?.per_page ?? perPage"
          :total-items="carts?.total ?? 0"
          :total-pages="carts?.last_page ?? 1"
          :sending-id="sendingId"
          @filter="onTableFilter"
          @page-change="onPageChange"
          @remind="onRemind"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import DynamicTitle from '@/components/dynamics/DynamicTitle.vue'
import StatCard from '@/components/ui/StatCard.vue'
import AbandonedCartFilters from '@/components/analytics/abandoned-carts/AbandonedCartFilters.vue'
import AbandonedCartDynamicsChart from '@/components/analytics/abandoned-carts/AbandonedCartDynamicsChart.vue'
import AbandonedCartConversionChart from '@/components/analytics/abandoned-carts/AbandonedCartConversionChart.vue'
import AbandonedCartTable from '@/components/analytics/abandoned-carts/AbandonedCartTable.vue'
import {useAbandonedCartFunctions} from '@/composables/useAbandonedCartFunctions'
import type {
  AbandonedCartAnalytics,
  AbandonedCartAnalyticsFilters,
  AbandonedCartChart,
  AbandonedCartConversion,
  AbandonedCartListFilters,
  AbandonedCartRow,
  CartStatus,
  Paginated,
} from '@/types/abandoned-cart'

const {getAnalytics, getCarts, sendReminder, loadingCarts} = useAbandonedCartFunctions()

const perPage = 10

const analytics = ref<AbandonedCartAnalytics | undefined>(undefined)
const carts = ref<Paginated<AbandonedCartRow> | undefined>(undefined)
const sendingId = ref<number | null>(null)

const analyticsFilters = ref<AbandonedCartAnalyticsFilters>({
  date_from: undefined,
  date_to: undefined,
})

const listFilters = ref<AbandonedCartListFilters>({
  status: '',
  search: '',
  per_page: perPage,
  page: 1,
})

const emptyChart: AbandonedCartChart = {
  labels: [], abandoned: [], abandoned_amount: [], ordered: [], ordered_amount: [],
  granularity: 'day', from: '', to: '',
}

const emptyConversion: AbandonedCartConversion = {
  ordered: 0, abandoned: 0, total: 0, rate: 0,
}

const periodLabel = computed(() => {
  if (!analytics.value?.period?.from || !analytics.value?.period?.to) return ''
  const fmt = (s: string) => s.split('-').reverse().join('.')
  return `за период ${fmt(analytics.value.period.from)} — ${fmt(analytics.value.period.to)}`
})

const loadAnalytics = async () => {
  analytics.value = await getAnalytics(analyticsFilters.value)
}

const loadCarts = async () => {
  // Список фильтруем тем же периодом, что и аналитику.
  listFilters.value.date_from = analyticsFilters.value.date_from
  listFilters.value.date_to = analyticsFilters.value.date_to
  carts.value = await getCarts(listFilters.value)
}

const reload = async () => {
  await Promise.all([loadAnalytics(), loadCarts()])
}

const onPeriodChange = async () => {
  // Смена периода сбрасывает страницу списка и обновляет всё.
  listFilters.value.page = 1
  await reload()
}

const onTableFilter = async (payload: {search: string; status: CartStatus | ''}) => {
  listFilters.value.search = payload.search
  listFilters.value.status = payload.status
  listFilters.value.page = 1
  await loadCarts()
}

const onPageChange = async (page: number) => {
  listFilters.value.page = page
  await loadCarts()
}

// Ручная отправка напоминания по строке таблицы (шаг F).
const onRemind = async (cartId: number) => {
  sendingId.value = cartId
  try {
    const ok = await sendReminder(cartId)
    if (ok) {
      // Обновляем список, чтобы отразить новую коммуникацию (канал/дата/тип).
      await loadCarts()
    }
  } finally {
    sendingId.value = null
  }
}

onMounted(reload)
</script>
