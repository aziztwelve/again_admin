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
import type {UtmAnalyticsChartSeries} from '@/types/utm'

Chart.register(...registerables)

const props = defineProps<{
  chart: { labels: string[]; series: UtmAnalyticsChartSeries[] }
}>()

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
