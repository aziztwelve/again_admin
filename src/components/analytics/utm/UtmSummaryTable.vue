<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Метка</TableHead>
          <TableHead>Канал</TableHead>
          <TableHead>Тег</TableHead>
          <TableHead>UTM-ссылка</TableHead>
          <TableHead class="text-right">Посещения</TableHead>
          <TableHead class="text-right">Заказы</TableHead>
          <TableHead class="text-right">Оборот</TableHead>
          <TableHead class="text-right">Покупки</TableHead>
          <TableHead class="text-right">Сумма покупок</TableHead>
          <TableHead class="text-right">Конв. в заказ</TableHead>
          <TableHead class="text-right">Конв. в покупку</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow v-if="!rows.length">
          <TableCell colspan="11" class="text-center text-sm text-gray-400 py-6">
            Нет данных за выбранный период
          </TableCell>
        </TableRow>

        <TableRow v-for="row in rows" :key="row.link_id">
          <TableCell class="font-medium">{{ row.name }}</TableCell>
          <TableCell>{{ row.channel ?? '—' }}</TableCell>
          <TableCell>{{ row.tag ?? '—' }}</TableCell>
          <TableCell>
            <div class="flex items-center gap-1.5 max-w-[260px]">
              <span class="truncate text-xs text-gray-500" :title="row.tracking_url">
                {{ row.tracking_url }}
              </span>
              <button
                  type="button"
                  class="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  title="Копировать ссылку"
                  @click="copy(row.tracking_url)"
              >
                <Copy class="h-3.5 w-3.5"/>
              </button>
            </div>
          </TableCell>
          <TableCell class="text-right">{{ formatInt(row.visits) }}</TableCell>
          <TableCell class="text-right">{{ formatInt(row.orders) }}</TableCell>
          <TableCell class="text-right font-semibold">{{ formatMoney(row.orders_amount) }}</TableCell>
          <TableCell class="text-right">{{ formatInt(row.purchases) }}</TableCell>
          <TableCell class="text-right">{{ formatMoney(row.purchases_amount) }}</TableCell>
          <TableCell class="text-right">{{ row.cr_order }}%</TableCell>
          <TableCell class="text-right">{{ row.cr_purchase }}%</TableCell>
        </TableRow>
      </TableBody>

      <TableFooter v-if="rows.length">
        <TableRow>
          <TableCell class="font-semibold" colspan="4">Всего</TableCell>
          <TableCell class="text-right font-semibold">{{ formatInt(totals.visits) }}</TableCell>
          <TableCell class="text-right font-semibold">{{ formatInt(totals.orders) }}</TableCell>
          <TableCell class="text-right font-semibold">{{ formatMoney(totals.orders_amount) }}</TableCell>
          <TableCell class="text-right font-semibold">{{ formatInt(totals.purchases) }}</TableCell>
          <TableCell class="text-right font-semibold">{{ formatMoney(totals.purchases_amount) }}</TableCell>
          <TableCell class="text-right font-semibold">{{ totals.cr_order }}%</TableCell>
          <TableCell class="text-right font-semibold">{{ totals.cr_purchase }}%</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
</template>

<script setup lang="ts">
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {Copy} from 'lucide-vue-next'
import {toast} from 'vue-sonner'
import type {UtmAnalyticsRow, UtmAnalyticsTotals} from '@/types/utm'

defineProps<{
  rows: UtmAnalyticsRow[]
  totals: UtmAnalyticsTotals
}>()

const formatInt = (v: number) => (v ?? 0).toLocaleString('ru-RU')

const formatMoney = (v: number) =>
    (v ?? 0).toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + ' ₽'

const copy = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Ссылка скопирована в буфер')
  } catch (e) {
    toast.error('Не удалось скопировать ссылку')
  }
}
</script>
