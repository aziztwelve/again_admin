<template>
  <Card>
    <CardHeader>
      <CardTitle>Статистика использования</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
            label="Номинал"
            :value="usage.used_amount + (usage.used_amount > 0 ? usage.used_amount / (usage.usage_percentage / 100) - usage.used_amount : 0)"
            is-currency
            icon="ruble"
            icon-color="blue"
        />

        <StatCard
            label="Текущий баланс"
            :value="usage.used_amount > 0 ? usage.used_amount / (usage.usage_percentage / 100) - usage.used_amount : 0"
            is-currency
            icon="ruble"
            icon-color="green"
            description="Доступно для использования"
        />

        <StatCard
            label="Использовано"
            :value="usage.used_amount"
            is-currency
            icon="trending-down"
            icon-color="orange"
        />

        <StatCard
            label="Процент использования"
            :value="usage.usage_percentage"
            suffix="%"
            icon="activity"
            icon-color="purple"
            :progress="usage.usage_percentage"
        />

        <StatCard
            label="Количество транзакций"
            :value="transactionsCount"
            suffix="шт"
            icon="activity"
            icon-color="gray"
        />

      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card'
import StatCard from '@/components/ui/StatCard.vue'

interface Props {
  usage: {
    is_active: boolean
    is_fully_used: boolean
    used_amount: number
    usage_percentage: number
  }
  transactionsCount: number
}

defineProps<Props>()
</script>

<style scoped>

</style>