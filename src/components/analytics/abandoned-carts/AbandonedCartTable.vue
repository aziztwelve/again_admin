<template>
  <div class="space-y-3">
    <!-- Панель поиска/фильтров -->
    <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-2 md:items-center">
      <div class="relative flex-1">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
        <input
            v-model="search"
            type="text"
            placeholder="Поиск по ID, имени, телефону или email"
            class="w-full h-9 rounded-md border border-gray-300 pl-8 pr-2 text-sm"
            @keyup.enter="emitFilters"
        />
      </div>

      <select
          v-model="status"
          class="h-9 rounded-md border border-gray-300 px-2 text-sm bg-white"
          @change="emitFilters"
      >
        <option value="">Все статусы</option>
        <option value="abandoned">Брошенная</option>
        <option value="ordered">Заказанная</option>
      </select>

      <Button @click="emitFilters">Применить</Button>
    </div>

    <!-- Таблица -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID корзины</TableHead>
            <TableHead>Покупатель</TableHead>
            <TableHead>Последнее обновление</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead class="text-right">Позиций</TableHead>
            <TableHead class="text-right">Сумма</TableHead>
            <TableHead class="text-center">Канал</TableHead>
            <TableHead>Коммуникация</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="10" class="text-center text-sm text-gray-400 py-6">
              Загрузка…
            </TableCell>
          </TableRow>

          <TableRow v-else-if="!rows.length">
            <TableCell colspan="10" class="text-center text-sm text-gray-400 py-6">
              Корзин за выбранный период нет
            </TableCell>
          </TableRow>

          <TableRow v-for="row in rows" :key="row.id">
            <TableCell class="font-medium">
              <div class="flex flex-col">
                <span>#{{ row.id }}</span>
                <span v-if="row.versions_count > 1" class="text-xs font-normal text-gray-400">
                  {{ row.versions_count }} {{ versionsWord(row.versions_count) }}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <div class="flex flex-col gap-0.5">
                <span v-if="row.customer.name" class="font-medium text-gray-800">{{ row.customer.name }}</span>
                <span v-else class="font-medium text-gray-400">—</span>
                <span v-if="row.customer.phone" class="text-xs text-gray-500">{{ row.customer.phone }}</span>
                <span v-if="row.customer.email" class="text-xs text-gray-500">{{ row.customer.email }}</span>
              </div>
            </TableCell>

            <TableCell class="text-sm text-gray-600">{{ formatDate(row.updated_at) }}</TableCell>

            <TableCell>
              <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="statusBadgeClass(row.status)"
              >
                {{ statusLabel(row.status) }}
              </span>
            </TableCell>

            <TableCell class="text-right">
              <span :title="`${row.items_qty} шт`">{{ row.positions_count }}</span>
            </TableCell>

            <TableCell class="text-right font-semibold">{{ formatMoney(row.total) }}</TableCell>

            <TableCell class="text-center">
              <span
                  v-if="row.last_communication?.channel && row.last_communication.channel !== 'none'"
                  class="inline-flex items-center gap-1 text-xs text-gray-600"
                  :title="row.last_communication.channel"
              >
                <component :is="channelIcon(row.last_communication.channel)" class="h-4 w-4 text-gray-500"/>
                {{ channelLabel(row.last_communication.channel) }}
              </span>
              <span v-else class="text-gray-300">—</span>
            </TableCell>

            <TableCell class="text-sm text-gray-600">
              {{ row.last_communication?.sent_at ? formatDate(row.last_communication.sent_at) : '—' }}
            </TableCell>

            <TableCell class="text-sm text-gray-600">
              {{ row.last_communication ? communicationTypeLabel(row.last_communication.type) : '—' }}
            </TableCell>

            <TableCell class="text-right">
              <button
                  type="button"
                  class="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  :title="row.status === 'ordered' ? 'Заказ оформлен' : 'Отправить напоминание'"
                  :disabled="row.status === 'ordered' || sendingId === row.id"
                  @click="$emit('remind', row.id)"
              >
                <Send class="h-4 w-4"/>
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Пагинация -->
    <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :per-page="perPage"
        :total-items="totalItems"
        :total-pages="totalPages"
        @update:current-page="$emit('page-change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {Button} from '@/components/ui/button'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import Pagination from '@/components/common/Pagination.vue'
import {Search, Mail, Send, MessageCircle, Globe} from 'lucide-vue-next'
import type {AbandonedCartRow, CartStatus} from '@/types/abandoned-cart'

const props = defineProps<{
  rows: AbandonedCartRow[]
  loading: boolean
  currentPage: number
  perPage: number
  totalItems: number
  totalPages: number
  sendingId?: number | null
}>()

const emit = defineEmits<{
  (e: 'filter', payload: {search: string; status: CartStatus | ''}): void
  (e: 'page-change', page: number): void
  (e: 'remind', cartId: number): void
}>()

const search = ref('')
const status = ref<CartStatus | ''>('')

const emitFilters = () => {
  emit('filter', {search: search.value, status: status.value})
}

// Склонение слова «версия» по числу (1 версия / 2 версии / 5 версий).
const versionsWord = (n: number): string => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'версия'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'версии'
  return 'версий'
}

const statusLabel = (s: CartStatus) =>
    s === 'abandoned' ? 'Брошенная' : s === 'ordered' ? 'Заказанная' : 'Активная'

const statusBadgeClass = (s: CartStatus) =>
    s === 'abandoned'
        ? 'bg-red-100 text-red-700'
        : s === 'ordered'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600'

const communicationTypeLabel = (type: string) =>
    type === 'trigger' ? 'По триггеру' : type === 'manual' ? 'Вручную' : type

const channelIcon = (channel?: string) => {
  switch (channel) {
    case 'email':
      return Mail
    case 'telegram':
      return Send
    case 'whatsapp':
      return MessageCircle
    case 'vk':
      return Globe
    default:
      return Globe
  }
}

const channelLabel = (channel?: string): string => {
  switch (channel) {
    case 'email':
      return 'Email'
    case 'telegram':
      return 'Telegram'
    case 'whatsapp':
      return 'WhatsApp'
    case 'vk':
      return 'VK'
    default:
      return channel ?? ''
  }
}

const formatMoney = (v: number) =>
    (v ?? 0).toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + ' ₽'

const formatDate = (value: string | null): string => {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Сбрасываем локальные поля поиска при внешней смене фильтров не требуется,
// но держим их реактивными на случай программного сброса.
watch(() => props.loading, () => {})
</script>
