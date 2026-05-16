<script setup lang="ts">
import { ref } from 'vue'
import { Plus, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-vue-next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Данные для таблицы
const operations = ref([
  {
    id: 'OP-001',
    time: '08:00',
    organization: 'Элект-03',
    techOperation: 'Сборка корпуса',
    volume: 100,
    cost: 1250.50,
    shipped: 95,
    printed: 90,
    status: 'active',
    comment: 'Срочный заказ для клиента Premium'
  },
  {
    id: 'OP-002',
    time: '09:30',
    organization: 'Механик-05',
    techOperation: 'Покраска деталей',
    volume: 75,
    cost: 890.75,
    shipped: 60,
    printed: 55,
    status: 'pending',
    comment: 'Ожидание поставки материалов'
  },
  {
    id: 'OP-003',
    time: '11:15',
    organization: 'Элект-03',
    techOperation: 'Тестирование компонентов',
    volume: 120,
    cost: 1560.20,
    shipped: 110,
    printed: 105,
    status: 'completed',
    comment: 'Партия прошла QC проверку'
  }
])

const columns = [
  { key: 'id', label: 'ID операции', class: 'w-[120px]' },
  { key: 'time', label: 'Время', class: 'w-[90px]' },
  { key: 'organization', label: 'Цех', class: 'w-[130px]' },
  { key: 'techOperation', label: 'Технологическая операция', class: 'min-w-[220px]' },
  { key: 'volume', label: 'Объем', class: 'w-[100px] text-right' },
  { key: 'cost', label: 'Цена закупки', class: 'w-[130px] text-right' },
  { key: 'shipped', label: 'Отправка', class: 'w-[100px] text-right' },
  { key: 'printed', label: 'Печать', class: 'w-[100px] text-right' },
  { key: 'status', label: 'Статус', class: 'w-[120px]' },
  { key: 'comment', label: 'Примечания', class: 'min-w-[250px]' },
  { key: 'actions', label: '', class: 'w-[50px] text-right' }
]

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-blue-100 text-blue-800'
    case 'pending': return 'bg-amber-100 text-amber-800'
    case 'completed': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Заголовок и кнопки управления -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Технологические операции</h2>
        <p class="text-sm text-gray-500 mt-1">Последние производственные задания</p>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <Button class="gap-2">
          <Plus class="h-4 w-4" />
          Новая операция
        </Button>
      </div>
    </div>

    <!-- Таблица -->
    <div class="border rounded-xl overflow-hidden shadow-sm bg-white">
      <Table>
        <TableHeader class="bg-gray-50">
          <TableRow>
            <TableHead
                v-for="column in columns"
                :key="column.key"
                :class="['text-gray-600 font-medium text-sm', column.class]"
            >
              {{ column.label }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
              v-for="item in operations"
              :key="item.id"
              class="hover:bg-gray-50/50 transition-colors border-b"
          >
            <TableCell class="font-medium text-gray-900">
              {{ item.id }}
            </TableCell>
            <TableCell class="text-gray-600">
              {{ item.time }}
            </TableCell>
            <TableCell class="text-gray-600">
              {{ item.organization }}
            </TableCell>
            <TableCell class="font-medium text-gray-900">
              {{ item.techOperation }}
            </TableCell>
            <TableCell class="text-right font-medium">
              {{ item.volume }}
            </TableCell>
            <TableCell class="text-right font-mono font-medium">
              {{ item.cost.toFixed(2) }} ₽
            </TableCell>
            <TableCell class="text-right">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="item.shipped > 90 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">
                {{ item.shipped }}%
              </span>
            </TableCell>
            <TableCell class="text-right">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="item.printed > 90 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                {{ item.printed }}%
              </span>
            </TableCell>
            <TableCell>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(item.status)">
                {{
                  item.status === 'active' ? 'В работе' :
                      item.status === 'pending' ? 'Ожидание' : 'Завершено'
                }}
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
                  <DropdownMenuItem>Редактировать</DropdownMenuItem>
                  <DropdownMenuItem>Дублировать</DropdownMenuItem>
                  <DropdownMenuItem class="text-red-600">Удалить</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>

          <!-- Пустая строка -->
          <TableRow v-if="operations.length === 0">
            <TableCell
                :colspan="columns.length"
                class="text-center py-12 text-gray-500"
            >
              <div class="flex flex-col items-center justify-center gap-2">
                <FolderOpen class="h-8 w-8 text-gray-300" />
                <p>Нет операций для отображения</p>
                <Button variant="outline" size="sm" class="mt-2">
                  <Plus class="h-4 w-4 mr-2" />
                  Добавить операцию
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Пагинация и статистика -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
      <div class="text-gray-500">
        Показано <span class="font-medium text-gray-900">{{ operations.length }}</span> операций
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1">
          <span class="h-3 w-3 rounded-full bg-blue-500"></span>
          <span>В работе ({{ operations.filter(o => o.status === 'active').length }})</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="h-3 w-3 rounded-full bg-amber-500"></span>
          <span>Ожидание ({{ operations.filter(o => o.status === 'pending').length }})</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="h-3 w-3 rounded-full bg-green-500"></span>
          <span>Завершено ({{ operations.filter(o => o.status === 'completed').length }})</span>
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