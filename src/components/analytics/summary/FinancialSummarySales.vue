<template>
  <div>
    <Card class="">
      <CardHeader>
        <CardTitle class="text-lg font-medium text-gray-700">Финансовая сводка — Продажи</CardTitle>
        <div class="text-sm text-muted-foreground">
          <template v-if="sending">Загрузка... {{ progress }}%</template>
          <!--          <template v-else>Последние данные</template>-->
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex justify-normal gap-4 mb-4">
          <div>
            <p class="text-xs text-muted-foreground">Всего позиций</p>
            <p class="text-lg font-medium">{{ data?.total_quantity ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Сумма</p>
            <p class="text-lg font-medium">{{ formattedNumber(data?.total_sum) }} ₽</p>
          </div>

        </div>

        <div v-if="chartData">
          <LineChart :chartData="chartData" :options="options"/>
        </div>

        <div v-else class="text-sm text-muted-foreground">Нет данных для отображения</div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, onMounted, computed} from 'vue'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {useAnalyticsFunctions} from '@/composables/useAnalyticsFunctions'
import {LineChart} from 'vue-chart-3'
import {Chart, registerables} from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{ filter?: any }>()
const {getFinancialSummarySales, sending, progress} = useAnalyticsFunctions()

const data = ref<any | null>(null)

const formatParam = (d: any, end = false) => {
  if (!d) return undefined
  const dt = new Date(d)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
}


const fetch = async () => {
  const params: any = {}
  if (props.filter?.datePicker?.start) params.from = formatParam(props.filter.datePicker.start)
  if (props.filter?.datePicker?.end) params.to = formatParam(props.filter.datePicker.end, true)
  const res = await getFinancialSummarySales(params)
  if (res) data.value = res
  buildChart()
}

watch(() => props.filter, fetch, {deep: true})
onMounted(fetch)

const formattedNumber = (v: any) => {
  if (v == null) return '—'
  return new Intl.NumberFormat('ru-RU').format(v)
}

const chartData = ref<any | null>(null)
const options = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  }
}

function buildChart() {
  if (!data.value?.series?.length) {
    chartData.value = null
    return
  }
  chartData.value = {
    labels: data.value.series.map((s: any) => s.date),
    datasets: [
      {label: 'Сумма', data: data.value.series.map((s: any) => s.sum)},
      {label: 'Шт.', data: data.value.series.map((s: any) => s.quantity)},
    ]
  }
}
</script>

<style scoped></style>
