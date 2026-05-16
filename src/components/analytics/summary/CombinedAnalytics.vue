<template>
  <div>
    <div class="flex gap-4 mb-4">
      <Card class="flex-1">
        <CardHeader><CardTitle>Сводка продаж</CardTitle></CardHeader>
        <CardContent>
          <p class="text-sm">Всего: {{ sales?.total_quantity ?? '—' }}</p>
          <p class="text-lg font-medium">{{ formattedNumber(sales?.total_sum) }} ₽</p>
        </CardContent>
      </Card>

      <Card class="flex-1">
        <CardHeader><CardTitle>Сводка заказов</CardTitle></CardHeader>
        <CardContent>
          <p class="text-sm">Всего: {{ orders?.total_quantity ?? '—' }}</p>
          <p class="text-lg font-medium">{{ formattedNumber(orders?.total_sum) }} ₽</p>
        </CardContent>
      </Card>

      <Card class="flex-1">
        <CardHeader><CardTitle>Доход по товарам</CardTitle></CardHeader>
        <CardContent>
          <p class="text-sm">Прибыль: {{ formattedNumber(products?.total_profit) }} ₽</p>
          <p class="text-sm">Выручка: {{ formattedNumber(products?.total_revenue) }} ₽</p>
        </CardContent>
      </Card>
    </div>

    <!-- Можно добавить подробные графики при необходимости -->
    <div v-if="sending" class="text-sm text-muted-foreground">Загрузка... {{ progress }}%</div>
<!--    <pre v-if="raw" class="bg-slate-50 p-3 rounded text-xs mt-3 overflow-auto">{{ raw }}</pre>-->
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnalyticsFunctions } from '@/composables/useAnalyticsFunctions'

const props = defineProps<{ filter?: any }>()
const { getCombinedAnalytics, sending, progress } = useAnalyticsFunctions()

const sales = ref<any | null>(null)
const orders = ref<any | null>(null)
const products = ref<any | null>(null)
const raw = ref<string | null>(null)

const formatParam = (d: any, end = false) => {
  if (!d) return undefined
  const dt = new Date(d)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
}

const fetch = async () => {
  const params: any = {}
  if (props.filter?.datePicker?.start) params.from = formatParam(props.filter.datePicker.start)
  if (props.filter?.datePicker?.end) params.to = formatParam(props.filter.datePicker.end, true)
  const res = await getCombinedAnalytics(params)
  if (res) {
    sales.value = res.sales_summary
    orders.value = res.orders_summary
    products.value = res.products_summary
    raw.value = JSON.stringify(res, null, 2)
  }
}

watch(() => props.filter, fetch, { deep: true })
onMounted(fetch)

const formattedNumber = (v: any) => v == null ? '—' : new Intl.NumberFormat('ru-RU').format(v)
</script>

<style scoped></style>
