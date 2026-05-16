<template>
  <div class="grid gap-4 md:grid-cols-3">
    <!-- Сводка продаж -->
    <Card>
      <CardHeader>
        <CardTitle class=" font-medium text-gray-700">Сводка продаж</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2 justify-between">
          <div>
            <p class="text-xs text-muted-foreground">Всего штук</p>
              <p class=" font-medium">{{ sales?.total_quantity ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Сумма</p>
            <p class=" font-medium">{{ formattedNumber(sales?.total_sum) }} ₽</p>
          </div>
        </div>
        <div v-if="sending" class="text-sm text-muted-foreground">Загрузка... {{ progress }}%</div>
      </CardContent>
    </Card>

    <!-- Сводка заказов -->
    <Card>
      <CardHeader>
        <CardTitle class=" font-medium text-gray-700">Сводка заказов</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex gap-2 flex-wrap justify-between">
          <div>
            <p class="text-xs text-muted-foreground">Всего заказов</p>
            <p class=" font-medium">{{ orders?.total_quantity ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Сумма заказов</p>
            <p class=" font-medium">{{ formattedNumber(orders?.total_sum) }} ₽</p>
          </div>
        </div>
        <div v-if="sending" class="text-sm text-muted-foreground">Загрузка... {{ progress }}%</div>
      </CardContent>
    </Card>

    <!-- Доход по товарам -->
    <Card>
      <CardHeader>
        <CardTitle class=" font-medium text-gray-700">Доход по товарам</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex gap-2 flex-wrap justify-between">
          <div>
            <p class="text-xs text-muted-foreground">Прибыль</p>
            <p class=" font-medium">{{ formattedNumber(products?.total_profit) }} ₽</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Выручка</p>
            <p class=" font-medium">{{ formattedNumber(products?.total_revenue) }} ₽</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Себестоимость</p>
            <p class=" font-medium">{{ formattedNumber(products?.total_cost) }} ₽</p>
          </div>
        </div>
        <div v-if="sending" class="text-sm text-muted-foreground">Загрузка... {{ progress }}%</div>
      </CardContent>
    </Card>
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
  }
}

watch(() => props.filter, fetch, { deep: true })
onMounted(fetch)

const formattedNumber = (v: any) => v == null ? '—' : new Intl.NumberFormat('ru-RU').format(v)
</script>
