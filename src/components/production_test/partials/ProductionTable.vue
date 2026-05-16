<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Plus, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-vue-next'
import { Production } from '@/models/Production'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Состояния
const productions = ref<Production[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchProductions = async () => {
  try {
    const { data } = await axios.get('/production')
    const serverData = data.data.map((item: any) => {
      const production = Production.fromAPI(item)
      return {
        ...production,
        time: new Date(production.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        organization: production.createdBy.name,
        startTime: new Date(production.createdAt).toLocaleString(),
        endTime: new Date(new Date(production.createdAt).getTime() + 3600000).toLocaleString(),
        planned: 100,
        produced: Math.floor(Math.random() * 100),
        shipped: Math.floor(Math.random() * 90),
        printed: Math.floor(Math.random() * 80),
        status: ['active', 'completed', 'pending'][Math.floor(Math.random() * 3)],
        comment: production.recipe.productVariant.product
      }
    })

    const testData = [
      {
        id: 1,
        time: '10:00',
        organization: 'Цех A',
        startTime: '2025-04-08 10:00',
        endTime: '2025-04-08 11:00',
        planned: 100,
        produced: 80,
        shipped: 70,
        printed: 60,
        status: 'active',
        comment: 'Тестовый продукт 1'
      },
      {
        id: 2,
        time: '11:00',
        organization: 'Цех B',
        startTime: '2025-04-08 11:00',
        endTime: '2025-04-08 12:00',
        planned: 120,
        produced: 110,
        shipped: 100,
        printed: 90,
        status: 'completed',
        comment: 'Тестовый продукт 2'
      },
      {
        id: 3,
        time: '12:00',
        organization: 'Цех C',
        startTime: '2025-04-08 12:00',
        endTime: '2025-04-08 13:00',
        planned: 90,
        produced: 60,
        shipped: 50,
        printed: 40,
        status: 'pending',
        comment: 'Тестовый продукт 3'
      },
      {
        id: 4,
        time: '13:00',
        organization: 'Цех D',
        startTime: '2025-04-08 13:00',
        endTime: '2025-04-08 14:00',
        planned: 150,
        produced: 140,
        shipped: 130,
        printed: 120,
        status: 'active',
        comment: 'Тестовый продукт 4'
      }
    ]

    productions.value = serverData.length ? serverData : testData
  } catch (err) {
    error.value = 'Ошибка загрузки данных'
    console.error(err)
    // Если ошибка — тоже добавим тестовые данные
    productions.value = [
      {
        id: 1,
        time: '10:00',
        organization: 'Цех A',
        startTime: '2025-04-08 10:00',
        endTime: '2025-04-08 11:00',
        planned: 100,
        produced: 80,
        shipped: 70,
        printed: 60,
        status: 'active',
        comment: 'Тестовый продукт 1'
      },
      {
        id: 2,
        time: '11:00',
        organization: 'Цех B',
        startTime: '2025-04-08 11:00',
        endTime: '2025-04-08 12:00',
        planned: 120,
        produced: 110,
        shipped: 100,
        printed: 90,
        status: 'completed',
        comment: 'Тестовый продукт 2'
      },
      {
        id: 3,
        time: '12:00',
        organization: 'Цех C',
        startTime: '2025-04-08 12:00',
        endTime: '2025-04-08 13:00',
        planned: 90,
        produced: 60,
        shipped: 50,
        printed: 40,
        status: 'pending',
        comment: 'Тестовый продукт 3'
      },
      {
        id: 4,
        time: '13:00',
        organization: 'Цех D',
        startTime: '2025-04-08 13:00',
        endTime: '2025-04-08 14:00',
        planned: 150,
        produced: 140,
        shipped: 130,
        printed: 120,
        status: 'active',
        comment: 'Тестовый продукт 4'
      }
    ]
  } finally {
    isLoading.value = false
  }
}


onMounted(() => {
  fetchProductions()
})

// Колонки таблицы
const columns = [
  { key: 'id', label: 'ID', class: 'w-[100px]' },
  { key: 'time', label: 'Время', class: 'w-[90px]' },
  { key: 'organization', label: 'Цех', class: 'w-[150px]' },
  { key: 'startTime', label: 'Начало', class: 'w-[180px]' },
  { key: 'endTime', label: 'Завершение', class: 'w-[180px]' },
  { key: 'planned', label: 'План', class: 'w-[100px] text-right' },
  { key: 'produced', label: 'Факт', class: 'w-[100px] text-right' },
  { key: 'shipped', label: 'Отправка', class: 'w-[100px] text-right' },
  { key: 'printed', label: 'Печать', class: 'w-[100px] text-right' },
  { key: 'status', label: 'Статус', class: 'w-[120px]' },
  { key: 'comment', label: 'Комментарий', class: 'min-w-[250px]' },
  { key: 'actions', label: '', class: 'w-[50px]' }
]

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-amber-100 text-amber-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'В работе'
    case 'completed': return 'Завершено'
    case 'pending': return 'Ожидание'
    default: return status
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Заголовок и кнопки -->
<!--    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">-->
<!--      <div>-->
<!--        <h1 class="text-2xl font-bold text-gray-900">Производственные задания</h1>-->
<!--        <p class="text-sm text-gray-500 mt-1">Активные и завершенные производственные процессы</p>-->
<!--      </div>-->
<!--      <div class="flex gap-2 w-full sm:w-auto">-->
<!--        <Button>-->
<!--          <Plus class="h-4 w-4 mr-2" />-->
<!--          Новое задание-->
<!--        </Button>-->
<!--      </div>-->
<!--    </div>-->

    <!-- Таблица -->
    <div class="border rounded-xl overflow-hidden shadow-sm bg-white">
      <Table>
        <TableHeader class="bg-gray-50">
          <TableRow>
            <TableHead
                v-for="column in columns"
                :key="column.key"
                :class="['text-gray-600 font-medium text-sm py-3', column.class]"
            >
              {{ column.label }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Скелетон загрузки -->
          <template v-if="isLoading">
            <TableRow v-for="i in 5" :key="`skeleton-${i}`">
              <TableCell v-for="column in columns" :key="`${i}-${column.key}`" class="py-4">
                <div class="h-4 bg-gray-100 rounded-full animate-pulse"></div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Данные -->
          <template v-else-if="productions.length > 0">
            <TableRow
                v-for="item in productions"
                :key="item.id"
                class="hover:bg-gray-50/50 transition-colors border-b"
            >
              <TableCell class="font-medium text-gray-900">
                #{{ item.id }}
              </TableCell>
              <TableCell class="text-gray-600 font-mono">
                {{ item.time }}
              </TableCell>
              <TableCell class="text-gray-600">
                {{ item.organization }}
              </TableCell>
              <TableCell class="text-gray-600 text-sm">
                {{ item.startTime }}
              </TableCell>
              <TableCell class="text-gray-600 text-sm">
                {{ item.endTime }}
              </TableCell>
              <TableCell class="text-right font-medium">
                {{ item.planned }}
              </TableCell>
              <TableCell class="text-right">
                <span
                    class="font-medium"
                    :class="{
                    'text-green-600': item.produced >= item.planned * 0.9,
                    'text-amber-600': item.produced >= item.planned * 0.5 && item.produced < item.planned * 0.9,
                    'text-red-600': item.produced < item.planned * 0.5
                  }"
                >
                  {{ item.produced }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                    'bg-green-100 text-green-800': item.shipped >= 90,
                    'bg-amber-100 text-amber-800': item.shipped >= 50 && item.shipped < 90,
                    'bg-red-100 text-red-800': item.shipped < 50
                  }"
                >
                  {{ item.shipped }}%
                </span>
              </TableCell>
              <TableCell class="text-right">
                <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                    'bg-green-100 text-green-800': item.printed >= 90,
                    'bg-blue-100 text-blue-800': item.printed >= 50 && item.printed < 90,
                    'bg-gray-100 text-gray-800': item.printed < 50
                  }"
                >
                  {{ item.printed }}%
                </span>
              </TableCell>
              <TableCell>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(item.status)">
                  {{ getStatusLabel(item.status) }}
                </span>
              </TableCell>
              <TableCell class="text-gray-600 text-sm">
                {{ item.comment }}
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                      <MoreVertical class="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-40">
                    <DropdownMenuItem>Подробнее</DropdownMenuItem>
                    <DropdownMenuItem>Редактировать</DropdownMenuItem>
                    <DropdownMenuItem class="text-red-600">Отменить</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </template>

          <!-- Пустое состояние -->
          <TableRow v-else>
            <TableCell
                :colspan="columns.length"
                class="text-center py-12 text-gray-500"
            >
              <div class="flex flex-col items-center justify-center gap-2">
                <PackageOpen class="h-8 w-8 text-gray-300" />
                <p>Нет производственных заданий</p>
<!--                <Button variant="outline" size="sm" class="mt-2">-->
<!--                  <Plus class="h-4 w-4 mr-2" />-->
<!--                  Создать задание-->
<!--                </Button>-->
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Пагинация и статистика -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
      <div class="text-gray-500">
        Показано <span class="font-medium text-gray-900">{{ productions.length }}</span> из {{ productions.length }} заданий
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1">
          <span class="h-3 w-3 rounded-full bg-blue-500"></span>
          <span>В работе ({{ productions.filter(p => p.status === 'active').length }})</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="h-3 w-3 rounded-full bg-green-500"></span>
          <span>Завершено ({{ productions.filter(p => p.status === 'completed').length }})</span>
        </div>
        <div class="flex gap-1">
          <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>