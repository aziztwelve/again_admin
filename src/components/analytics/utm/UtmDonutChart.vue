<template>
  <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
    <h3 class="text-base font-semibold text-gray-800 mb-3">Клиенты по меткам</h3>

    <div v-if="hasData" class="relative h-[300px]">
      <DoughnutChart :chartData="chartData" :options="options" :styles="{ height: '100%' }"/>
    </div>
    <div v-else class="h-[300px] flex items-center justify-center text-sm text-gray-400">
      Нет данных за выбранный период
    </div>
  </div>
</template>

<script setup lang="ts">
import {DoughnutChart} from 'vue-chart-3'
import {Chart, registerables} from 'chart.js'
import {computed} from 'vue'

Chart.register(...registerables)

const props = defineProps<{
  pie: { labels: string[]; data: number[] }
}>()

// Палитра цветов для секторов
const PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#A855F7', '#DC2626', '#22C55E', '#EAB308',
]

const hasData = computed(() => (props.pie?.data ?? []).some(v => v > 0))

const chartData = computed(() => ({
  labels: props.pie?.labels ?? [],
  datasets: [
    {
      data: props.pie?.data ?? [],
      backgroundColor: (props.pie?.labels ?? []).map((_, i) => PALETTE[i % PALETTE.length]),
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
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
      callbacks: {
        label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} клиентов`,
      },
    },
  },
}
</script>
