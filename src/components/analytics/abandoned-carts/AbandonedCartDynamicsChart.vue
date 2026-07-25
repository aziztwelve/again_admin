<template>
  <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
    <h3 class="text-base font-semibold text-gray-800 mb-3">Динамика корзин</h3>

    <!-- Сводка серий (стиль InSales) -->
    <div class="flex flex-wrap gap-x-10 gap-y-2 mb-4">
      <div class="flex flex-col">
        <span class="flex items-center gap-1.5 text-sm text-gray-500">
          <span class="inline-block h-2.5 w-2.5 rounded-full" style="background:#EF4444"></span>
          Брошенные корзины
        </span>
        <span class="text-xl font-semibold text-gray-800">{{ formatInt(abandonedTotal) }} шт.<span v-if="abandonedAmount" class="text-sm font-normal text-gray-400"> на {{ formatMoney(abandonedAmount) }}</span></span>
      </div>
      <div class="flex flex-col">
        <span class="flex items-center gap-1.5 text-sm text-gray-500">
          <span class="inline-block h-2.5 w-2.5 rounded-full" style="background:#10B981"></span>
          Заказы
        </span>
        <span class="text-xl font-semibold text-gray-800">
          {{ formatInt(orderedTotal) }} шт.
          <span v-if="orderedAmount" class="text-sm font-normal text-gray-400">на {{ formatMoney(orderedAmount) }}</span>
        </span>
      </div>
    </div>

    <div v-if="hasData" class="relative h-[300px]">
      <BarChart :chartData="chartData" :options="options" :styles="chartStyles"/>
    </div>
    <div v-else class="h-[300px] flex items-center justify-center text-sm text-gray-400">
      Нет данных за выбранный период
    </div>
  </div>
</template>

<script setup lang="ts">
import {BarChart} from 'vue-chart-3'
import {Chart, registerables} from 'chart.js'
import {computed} from 'vue'
import type {AbandonedCartChart} from '@/types/abandoned-cart'

Chart.register(...registerables)

const props = defineProps<{
  chart: AbandonedCartChart
}>()

const abandonedTotal = computed(() =>
    (props.chart?.abandoned ?? []).reduce((a, b) => a + b, 0),
)
const orderedTotal = computed(() =>
    (props.chart?.ordered ?? []).reduce((a, b) => a + b, 0),
)
const orderedAmount = computed(() =>
    (props.chart?.ordered_amount ?? []).reduce((a, b) => a + b, 0),
)
const abandonedAmount = computed(() => (props.chart?.abandoned_amount ?? []).reduce((a, b) => a + b, 0))

// vue-chart-3 не наследует высоту от родителя, поэтому задаём её обёртке явно,
// иначе canvas тянется к дефолтным 400px и вылезает за карточку.
const chartStyles = {height: '100%', width: '100%', position: 'relative' as const}

const formatInt = (v: number) => (v ?? 0).toLocaleString('ru-RU')
const formatMoney = (v: number) =>
    (v ?? 0).toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + ' ₽'

const hasData = computed(() =>
    [...(props.chart?.abandoned ?? []), ...(props.chart?.ordered ?? [])].some(v => v > 0),
)

const chartData = computed(() => ({
  labels: props.chart?.labels ?? [],
  datasets: [
    {
      label: 'Брошенные корзины',
      data: props.chart?.abandoned ?? [],
      backgroundColor: '#EF4444',
      borderRadius: 4,
      maxBarThickness: 28,
    },
    {
      label: 'Заказы',
      data: props.chart?.ordered ?? [],
      backgroundColor: '#10B981',
      borderRadius: 4,
      maxBarThickness: 28,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  layout: {
    padding: {bottom: 8},
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#4B5563',
        font: {family: 'Inter, sans-serif', size: 12},
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
        padding: 14,
      },
    },
  },
  scales: {
    x: {
      stacked: false,
      grid: {display: false},
      ticks: {
        color: '#6B7280',
        font: {family: 'Inter, sans-serif'},
        // Держим подписи горизонтальными и прореживаем их,
        // чтобы даты не наезжали друг на друга и не вылезали за карточку.
        autoSkip: true,
        autoSkipPadding: 12,
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      beginAtZero: true,
      grid: {color: '#F3F4F6'},
      ticks: {color: '#6B7280', precision: 0},
    },
  },
}
</script>
