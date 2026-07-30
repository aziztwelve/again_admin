<template>
  <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
    <h3 class="text-base font-semibold text-gray-800 mb-3">Конверсия писем</h3>

    <div v-if="hasData" class="relative h-[300px]">
      <BarChart :chartData="chartData" :options="options" :styles="chartStyles"/>
    </div>
    <div v-else class="h-[300px] flex items-center justify-center text-sm text-gray-400">
      Нет отправленных писем за выбранный период
    </div>
  </div>
</template>

<script setup lang="ts">
import {BarChart} from 'vue-chart-3'
import {Chart, registerables} from 'chart.js'
import {computed} from 'vue'
import type {AbandonedCartEmailConversion} from '@/types/abandoned-cart'

Chart.register(...registerables)

const props = defineProps<{
  conversion: AbandonedCartEmailConversion
}>()

const hasData = computed(() => (props.conversion?.sent ?? []).some(value => value > 0))
const chartStyles = {height: '100%', width: '100%', position: 'relative' as const}

const chartData = computed(() => ({
  labels: props.conversion?.labels ?? [],
  datasets: [
    {
      label: 'Конверсия',
      data: props.conversion?.rates ?? [],
      backgroundColor: '#3B82F6',
      borderRadius: 4,
      maxBarThickness: 56,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {display: false},
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const index = context.dataIndex
          const sent = props.conversion?.sent?.[index] ?? 0
          const ordered = props.conversion?.ordered?.[index] ?? 0
          return ` Конверсия: ${context.parsed.y}% (${ordered} из ${sent})`
        },
      },
    },
  },
  scales: {
    x: {
      grid: {display: false},
      ticks: {color: '#6B7280', font: {family: 'Inter, sans-serif'}},
    },
    y: {
      beginAtZero: true,
      max: 100,
      grid: {color: '#F3F4F6'},
      ticks: {
        color: '#6B7280',
        callback: (value: string | number) => `${value}%`,
      },
    },
  },
}
</script>
