<template>
  <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
    <h3 class="text-base font-semibold text-gray-800 mb-3">Конверсия писем</h3>

    <div v-if="hasData" class="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
      <span class="flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        Заказы
      </span>
      <span class="flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
        Без заказа
      </span>
    </div>

    <div v-if="hasData" class="grid h-[272px] grid-cols-3 gap-3">
      <div
          v-for="item in emails"
          :key="item.label"
          class="flex min-w-0 flex-col items-center justify-center"
          @mouseenter="hoveredLabel = item.label"
          @mouseleave="hoveredLabel = null"
      >
        <p class="mb-2 text-sm font-medium text-gray-600">{{ item.label }}</p>
        <div class="relative h-28 w-28">
          <DoughnutChart :chartData="item.chartData" :options="options" :styles="chartStyles"/>
          <span
              v-if="hoveredLabel !== item.label"
              class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-800"
          >
            {{ item.rate }}%
          </span>
        </div>
        <p class="mt-2 text-xs text-gray-500">{{ item.ordered }} из {{ item.sent }}</p>
      </div>
    </div>
    <div v-else class="h-[300px] flex items-center justify-center text-sm text-gray-400">
      Нет отправленных писем за выбранный период
    </div>
  </div>
</template>

<script setup lang="ts">
import {DoughnutChart} from 'vue-chart-3'
import {Chart, registerables} from 'chart.js'
import {computed, ref} from 'vue'
import type {AbandonedCartEmailConversion} from '@/types/abandoned-cart'

Chart.register(...registerables)

const props = defineProps<{
  conversion: AbandonedCartEmailConversion
}>()

const hasData = computed(() => (props.conversion?.sent ?? []).some(value => value > 0))
const hoveredLabel = ref<string | null>(null)
const chartStyles = {height: '100%', width: '100%', position: 'relative' as const}

const emails = computed(() => (props.conversion?.labels ?? []).map((label, index) => {
  const sent = props.conversion?.sent?.[index] ?? 0
  const ordered = props.conversion?.ordered?.[index] ?? 0
  const rate = props.conversion?.rates?.[index] ?? 0

  return {
    label,
    sent,
    ordered,
    rate,
    chartData: {
      labels: ['Заказы', 'Без заказа'],
      datasets: [{
        data: [ordered, Math.max(sent - ordered, 0)],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: '#ffffff',
        borderWidth: 2,
      }],
    },
  }
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {display: false},
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0)
          const rate = total ? ((context.parsed / total) * 100).toFixed(1) : 0
          return ` ${context.label}: ${context.parsed} корзин (${rate}%)`
        },
      },
    },
  },
}
</script>
