<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h2 class="text-2xl font-medium tracking-tight">Заказы</h2>
      <DashboardPeriodFilter v-model="period"/>
    </div>

    <loader v-if="isLoading"/>
    <template v-else-if="data">

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Новые заказы -->
      <RouterLink to="/orders?status=new">
        <Card class="group hover:shadow-lg transition-all duration-300 hover:border-primary hover:translate-y-[-2px]">
          <CardHeader class="pb-2">
            <CardDescription class="flex items-center gap-2">
              <span>Новые заказы</span>
              <div class="h-2 w-2 rounded-full bg-red-500 animate-pulse"/>
            </CardDescription>
            <CardTitle class="text-4xl text-primary group-hover:text-primary/90 transition-colors">
              {{ data?.new?.count ?? 0 }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ formatPrice(data?.new?.total_amount, '₽') }}</span>
              <ChevronRight class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors"/>
            </div>
          </CardContent>
        </Card>
      </RouterLink>

      <!-- В обработке -->
      <RouterLink to="/orders?status=processing">
        <Card class="group hover:shadow-lg transition-all duration-300 hover:border-amber-500 hover:translate-y-[-2px]">
          <CardHeader class="pb-2">
            <CardDescription class="flex items-center gap-2">
              <span>В обработке</span>
              <div class="h-2 w-2 rounded-full bg-amber-500"/>
            </CardDescription>
            <CardTitle class="text-4xl text-amber-500 group-hover:text-amber-500/90 transition-colors">
              {{ data?.processing?.count ?? 0 }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ formatPrice(data?.processing?.total_amount, '₽') }} </span>
              <ChevronRight class="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors"/>
            </div>
          </CardContent>
        </Card>
      </RouterLink>

      <!-- Все заказы -->
      <RouterLink to="/orders">
        <Card class="group hover:shadow-lg transition-all duration-300 hover:border-[#00ba13] hover:translate-y-[-2px]">
          <CardHeader class="pb-2">
            <CardDescription class="flex items-center gap-2">
              <span>Все заказы</span>
              <div class="h-2 w-2 rounded-full bg-[#00ba13]"/>
            </CardDescription>
            <CardTitle class="text-4xl text-[#00ba13] group-hover:text-[#00ba13]/90 transition-colors">
              {{ data?.total?.count ?? 0 }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ formatPrice(data?.total?.total_amount, '₽') }} </span>
              <ChevronRight class="h-4 w-4 text-muted-foreground group-hover:text-[#00ba13] transition-colors"/>
            </div>
          </CardContent>
        </Card>
      </RouterLink>
    </div>


    <HomeChart :chartData="data.chartData" :period="period"/>

    </template>
  </div>
</template>

<script setup lang="ts">
import {ChevronRight} from 'lucide-vue-next'
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {onMounted, ref, watch} from "vue";
import Loader from "@/components/common/Loader.vue";
import HomeChart from "@/components/dashboard/charts/HomeChart.vue";
import DashboardPeriodFilter, {type PeriodRange} from "@/components/dashboard/DashboardPeriodFilter.vue";
import {toast} from "vue-sonner";
import {usePriceFormatter} from "@/composables/usePriceFormatter";

const {formatPrice} = usePriceFormatter()

const isLoading = ref<boolean>(true)
const data = ref<any>(null)

// Период по умолчанию — месяц (соответствует пресету "Месяц").
const initialTo = new Date()
const initialFrom = new Date()
initialFrom.setDate(initialTo.getDate() - 29)
const fmt = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const period = ref<PeriodRange>({from: fmt(initialFrom), to: fmt(initialTo), preset: 'month'})

let fetchAbort: AbortController | null = null

async function fetchData() {
  fetchAbort?.abort()
  fetchAbort = new AbortController()
  isLoading.value = true
  try {
    const params: Record<string, string> = {}
    if (period.value.preset === 'all') {
      params.preset = 'all'
    } else if (period.value.from && period.value.to) {
      params.from = period.value.from
      params.to = period.value.to
    }
    const res = await axios.get('/orders/stats', {
      params,
      signal: fetchAbort.signal,
    })
    data.value = res.data
  } catch (err: any) {
    if (axios.isCancel(err) || err?.name === 'CanceledError') return
    console.log(err)
    toast.error('Не удалось загрузить статистику')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
watch(() => [period.value.from, period.value.to, period.value.preset], fetchData)


</script>