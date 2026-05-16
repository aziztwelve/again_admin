<template>
  <Card>
    <CardHeader>
      <CardTitle>Статистика</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
            label="Клиентов"
            :value="statistics.clients_count"
            icon="users"
            icon-color="blue"
        />
        <StatCard
            label="Общая сумма"
            :value="statistics.total_amount"
            is-currency
            icon="ruble"
            icon-color="green"
        />
        <StatCard
            label="Средний чек"
            :value="statistics.average_check"
            is-currency
            icon="trending-up"
            icon-color="purple"
        />
        <StatCard
            label="Всего заказов"
            :value="statistics.total_orders"
            suffix="шт"
            icon="shopping-cart"
            icon-color="orange"
        />
      </div>

      <!-- Топ клиенты (только для полной статистики) -->
      <div v-if="hasTopClients">
        <h3 class="text-lg font-semibold mb-4">Топ-10 клиентов</h3>
        <div class="space-y-2">
          <div
              v-for="(client, index) in fullStatistics.top_clients"
              :key="client.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span
                  class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                {{ index + 1 }}
              </span>
              <div>
                <p class="font-medium text-gray-900">{{ client.full_name }}</p>
                <p class="text-sm text-gray-500">{{ client.email }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">{{ formatAmount(client.total_amount) }} ₽</p>
              <p class="text-sm text-gray-500">{{ client.orders_count }}
                {{ pluralize(client.orders_count, 'заказ', 'заказа', 'заказов') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Если топ клиентов нет -->
      <div v-else-if="isFullStatistics" class="text-center py-8 text-gray-500">
        <p>Пока нет клиентов в этом сегменте</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card'
import StatCard from '@/components/ui/StatCard.vue'
import type {SegmentBriefStatistics, SegmentStatistics} from '@/features/segment/types'

interface Props {
  statistics: SegmentBriefStatistics | SegmentStatistics
}

const props = defineProps<Props>()

// Проверяем, является ли это полной статистикой
const isFullStatistics = computed(() => {
  return 'top_clients' in props.statistics
})

// Приводим к полной статистике для топ клиентов
const fullStatistics = computed(() => {
  return props.statistics as SegmentStatistics
})

// Есть ли топ клиенты
const hasTopClients = computed(() => {
  return isFullStatistics.value &&
      fullStatistics.value.top_clients &&
      fullStatistics.value.top_clients.length > 0
})

// Форматирование суммы
const formatAmount = (amount: number) => {
  return amount.toLocaleString('ru-RU')
}

// Склонение слов (1 заказ, 2 заказа, 5 заказов)
const pluralize = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  } else if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
    return few
  } else {
    return many
  }
}
</script>