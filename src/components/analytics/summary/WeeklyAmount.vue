<template>
  <Card class="">
    <CardHeader class="">
      <CardTitle class="text-lg font-medium text-gray-700 flex items-center gap-2">
        <CalendarIcon class="h-4 w-4 text-blue-500"/>
        Еженедельная статистика заказов
      </CardTitle>
    </CardHeader>

    <CardContent class="p-0">
      <div v-if="sending" class="flex items-center justify-center py-6">
        <div class="text-center">
          <div
              class="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-1.5"></div>
          <p class="text-xs text-gray-500">Загрузка... {{ progress }}%</p>
        </div>
      </div>

      <div v-else-if="weeks?.length" class="overflow-hidden rounded-lg border border-gray-200">
        <div class="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
          <div class="grid grid-cols-12 gap-3 text-xs text-muted-foreground tracking-wide">
            <div class="col-span-4">Период</div>
            <div class="col-span-2 text-center">Все заказы</div>
            <div class="col-span-3 text-center">Завершенные</div>
            <div class="col-span-3 text-center">Отмененные</div>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-for="(w, index) in weeks" :key="w.start_date"
               class="px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
               :class="{'bg-blue-50/30': index % 2 === 0}">
            <div class="grid grid-cols-12 gap-3 items-center">
              <!-- Период -->
              <div class="col-span-4">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <div>
                    <p class="text-xs text-gray-800">{{ formatDateRange(w.start_date, w.end_date) }}</p>
                    <p class="text-xs text-gray-400">{{ getWeekDuration(w.start_date, w.end_date) }}</p>
                  </div>
                </div>
              </div>

              <!-- Все заказы -->
              <div class="col-span-2 text-center">
                <div class="bg-blue-50 text-blue-700 py-1.5 px-2 rounded-md font-medium text-xs">
                  {{ formattedNumber(w.total_by_status.orders ?? 0) }} ₽
                </div>
              </div>

              <!-- Завершенные -->
              <div class="col-span-3 text-center">
                <div
                    class="bg-green-50 text-green-700 py-1.5 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1">
                  <CheckCircleIcon class="h-3.5 w-3.5"/>
                  {{ formattedNumber(w.total_by_status.completed ?? 0) }} ₽
                </div>
              </div>

              <!-- Отмененные -->
              <div class="col-span-3 text-center">
                <div
                    class="bg-red-50 text-red-700 py-1.5 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1">
                  <XCircleIcon class="h-3.5 w-3.5"/>
                  {{ formattedNumber(w.total_by_status.cancelled ?? 0) }} ₽
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Итоги -->
        <div class="bg-gray-300 px-4 py-3">
          <div class="grid grid-cols-12 gap-3 text-white">
            <div class="col-span-4 font-medium text-xs">Итого:</div>
            <div class="col-span-2 text-center font-semibold text-blue-500 text-xs">
              {{ formattedNumber(totalOrders) }} ₽
            </div>
            <div class="col-span-3 text-center font-semibold text-green-500 text-xs">
              {{ formattedNumber(totalCompleted) }} ₽
            </div>
            <div class="col-span-3 text-center font-semibold text-red-500 text-xs">
              {{ formattedNumber(totalCancelled) }} ₽
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <FileTextIcon class="h-8 w-8 text-gray-300 mx-auto mb-2"/>
        <p class="text-gray-500 text-xs">Нет данных для отображения</p>
        <p class="text-gray-400 text-xs mt-0.5">Выберите другой период или настройки</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {ref, onMounted, watch, computed} from 'vue'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {useAnalyticsFunctions} from '@/composables/useAnalyticsFunctions'
import {CalendarIcon, CheckCircleIcon, XCircleIcon, FileTextIcon} from 'lucide-vue-next'

const props = defineProps<{ filter?: any }>()
const {getWeeklyAmount, sending, progress} = useAnalyticsFunctions()
const weeks = ref<any[]>([])

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
  const res = await getWeeklyAmount(params)
  if (res?.weeks) weeks.value = res.weeks
}

onMounted(fetch)
watch(() => props.filter, fetch, {deep: true})

const formattedNumber = (v: any) => v == null ? '—' : new Intl.NumberFormat('ru-RU').format(v)

// Вычисляемые свойства для итогов
const totalOrders = computed(() =>
    weeks.value.reduce((sum, week) => sum + (week.total_by_status?.orders || 0), 0)
)

const totalCompleted = computed(() =>
    weeks.value.reduce((sum, week) => sum + (week.total_by_status?.completed || 0), 0)
)

const totalCancelled = computed(() =>
    weeks.value.reduce((sum, week) => sum + (week.total_by_status?.cancelled || 0), 0)
)

// Форматирование дат
const formatDateRange = (start: string, end: string) => {
  return `${formatDate(start)} — ${formatDate(end)}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getWeekDuration = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return `${diffDays} дней`
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}
</style>