<template>
  <Card>
    <CardHeader>
      <CardTitle>Условия сегмента</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Период -->
        <div v-if="conditions.period">
          <p class="text-sm text-gray-500">Период</p>
          <p class="text-sm">{{ conditions.period.label }}</p>
        </div>

        <!-- Количество заказов -->
        <div v-if="conditions.orders_count">
          <p class="text-sm text-gray-500">Количество заказов</p>
          <p class="text-sm">{{ conditions.orders_count.label }}</p>
        </div>

        <!-- Минимальная сумма -->
        <div v-if="conditions.total_amount">
          <p class="text-sm text-gray-500">Минимальная сумма покупок</p>
          <p class="text-sm">{{ conditions.total_amount.label }}</p>
        </div>

        <!-- Минимальный средний чек -->
        <div v-if="conditions.average_check">
          <p class="text-sm text-gray-500">Минимальный средний чек</p>
          <p class="text-sm">{{ conditions.average_check.label }}</p>
        </div>
      </div>

      <!-- Если условий нет -->
      <p v-if="!hasConditions" class="text-gray-500 text-sm">
        Условия не заданы
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { FormattedSegmentConditions } from '@/features/segment/types'

interface Props {
  conditions: FormattedSegmentConditions
}

const props = defineProps<Props>()

const hasConditions = computed(() => {
  return !!(
      props.conditions.period ||
      props.conditions.orders_count ||
      props.conditions.total_amount ||
      props.conditions.average_check
  )
})
</script>