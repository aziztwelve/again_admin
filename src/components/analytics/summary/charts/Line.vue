<template>
  <BarChart :chartData="chartData" :options="options" />
</template>

<script setup lang="ts">
import { BarChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const chartData = {
  labels: ['09.03', '13.03', '17.03', '21.03', '25.03', '29.03', '02.04', '06.04'],
  datasets: [
    {
      label: 'Заказано',
      data: [1585430, 1321192, 1056953, 792715, 528477, 264238, 132119, 0],
      backgroundColor: '#3b82f6'
    },
    {
      label: 'Доставлено',
      data: [1321192, 1056953, 792715, 528477, 264238, 132119, 0, 0],
      backgroundColor: '#10b981'
    },
    {
      label: 'Отменено',
      data: [264238, 264238, 264238, 264238, 264238, 132119, 132119, 0],
      backgroundColor: '#ef4444'
    }
  ]
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `${context.dataset.label}: ${new Intl.NumberFormat('ru-RU').format(context.raw)} ₽`
        }
      }
    }
  },
  scales: {
    y: {
      ticks: {
        callback: (value: any) => {
          return new Intl.NumberFormat('ru-RU').format(value) + ' ₽'
        }
      }
    }
  }
}
</script>