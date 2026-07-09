<template>
  <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
    <h3 class="text-base font-semibold text-gray-800 mb-3">Посещения по меткам</h3>

    <div v-if="hasData" class="relative h-[300px]">
      <BarChart :chartData="chartData" :options="options" :styles="{ height: '100%' }"/>
    </div>
    <div v-else class="h-[300px] flex items-center justify-center text-sm text-gray-400">
      Нет посещений за выбранный период
    </div>
  </div>
</template>

<script setup lang="ts">
import {BarChart} from 'vue-chart-3'
import {Chart, registerables} from 'chart.js'
import {computed} from 'vue'
import type {UtmAnalyticsChartSeries, UtmAnalyticsRow} from '@/types/utm'

Chart.register(...registerables)

const props = defineProps<{
  chart: { labels: string[]; series: UtmAnalyticsChartSeries[] }
  // Строки аналитики по метке (link_id → row) для подробного тултипа.
  rowsByLink?: Record<number, UtmAnalyticsRow>
}>()

const fmtInt = (v: number) => (v ?? 0).toLocaleString('ru-RU')
const fmtMoney = (v: number) =>
    (v ?? 0).toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + ' ₽'

const PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#A855F7', '#DC2626', '#22C55E', '#EAB308',
]

const hasData = computed(() =>
    (props.chart?.series ?? []).some(s => (s.data ?? []).some(v => v > 0))
)

const chartData = computed(() => ({
  labels: props.chart?.labels ?? [],
  datasets: (props.chart?.series ?? []).map((s, i) => ({
    label: s.name,
    data: s.data ?? [],
    backgroundColor: PALETTE[i % PALETTE.length],
    borderRadius: 4,
    maxBarThickness: 28,
    // link_id прокидываем в датасет, чтобы в тултипе достать кол-во заказов метки.
    linkId: s.link_id,
  })),
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
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
    tooltip: {
      // Разрешаем многострочный тултип с полной разбивкой по метке.
      displayColors: false,
      callbacks: {
        // Основная строка: «Метка: N посещений» (за конкретный день/бакет).
        label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y} посещений`,
        // Полная разбивка по метке за период (заказы/покупки/оборот, гость/клиент).
        afterBody: (items: any[]) => {
          const ctx = items?.[0]
          if (!ctx) return []
          const linkId = ctx.dataset.linkId
          const row = props.rowsByLink?.[linkId]
          const b = row?.breakdown
          if (!b) return []
          return [
            '',
            'За период по метке:',
            `Заказы: ${fmtInt(b.orders_total)} (клиенты ${fmtInt(b.orders_client)}, гости ${fmtInt(b.orders_guest)})`,
            `Покупки: ${fmtInt(b.purchases_total)} (клиенты ${fmtInt(b.purchases_client)}, гости ${fmtInt(b.purchases_guest)})`,
            `Оборот: ${fmtMoney(b.amount_total)}`,
            `  • клиенты: ${fmtMoney(b.amount_client)}`,
            `  • гости: ${fmtMoney(b.amount_guest)}`,
            `Посещения всего: ${fmtInt(row!.visits)}`,
            `Клиентов (уник.): ${fmtInt(row!.clients)}`,
          ]
        },
      },
    },
  },
  scales: {
    x: {
      stacked: false,
      grid: {display: false},
      ticks: {color: '#6B7280', font: {family: 'Inter, sans-serif'}},
    },
    y: {
      beginAtZero: true,
      grid: {color: '#F3F4F6'},
      ticks: {color: '#6B7280', precision: 0},
    },
  },
}
</script>
