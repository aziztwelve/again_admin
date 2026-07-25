<template>
  <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
    <h3 class="text-base font-semibold text-gray-800 mb-3">
      Конверсия в заказ
      <span v-if="hasData" class="text-sm font-normal text-gray-500">— {{ conversion.rate }}%</span>
    </h3>

    <div v-if="hasData" class="relative h-[300px]">
      <DoughnutChart :chartData="chartData" :options="options" :styles="chartStyles"/>
    </div>
    <div v-else class="h-[300px] flex items-center justify-center text-sm text-gray-400">
      Нет корзин за выбранный период
    </div>
  </div>
</template>

<script setup lang="ts">
import {DoughnutChart} from 'vue-chart-3'
import {Chart, registerables} from 'chart.js'
import {computed} from 'vue'
import type {AbandonedCartConversion} from '@/types/abandoned-cart'

Chart.register(...registerables)

const props = defineProps<{
  conversion: AbandonedCartConversion
}>()

const hasData = computed(() => (props.conversion?.total ?? 0) > 0)

// Явная высота обёртки, иначе canvas тянется к дефолтным 400px.
const chartStyles = {height: '100%', width: '100%', position: 'relative' as const}

const chartData = computed(() => ({
  labels: ['Заказы', 'Брошенные'],
  datasets: [
    {
      data: [props.conversion?.ordered ?? 0, props.conversion?.abandoned ?? 0],
      backgroundColor: ['#10B981', '#EF4444'],
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
        label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} шт. (${props.conversion.total ? ((ctx.parsed / props.conversion.total) * 100).toFixed(1) : 0}%)`,
      },
    },
  },
}
</script>
