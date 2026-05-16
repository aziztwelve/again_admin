<template>
  <Card>
    <CardHeader>
      <CardTitle>История транзакций</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Пустое состояние -->
      <div v-if="transactions.length === 0" class="text-center py-12">
        <Activity class="h-12 w-12 text-gray-300 mx-auto mb-3"/>
        <p class="text-gray-500">Транзакций пока нет</p>
      </div>

      <!-- Таблица транзакций -->
      <DynamicsDataTable
          v-else
          :data="transactions"
          :columns="columns"
          :loading="false"
          :custom-actions="true"
          :show-print-button="false"
          :show-pagination="false"
      />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity } from 'lucide-vue-next'
import DynamicsDataTable from '@/components/dynamics/DataTable/Index.vue'
import { useDateFormat } from '@/composables/useDateFormat'
import { usePriceFormatter } from '@/composables/usePriceFormatter'
import { useRouter } from 'vue-router'
import type { GiftCardTransaction } from '@/features/gift-card/types'

interface Props {
  transactions: GiftCardTransaction[]
}

const props = defineProps<Props>()

const router = useRouter()
const { formatDateToRussian } = useDateFormat()
const { formatPrice } = usePriceFormatter()

// Функции для типов транзакций
const getTransactionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    purchase: 'Покупка',
    use: 'Использование',
    refund: 'Возврат',
    cancel: 'Отмена',
  }
  return labels[type] || type
}

const getTransactionTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    purchase: 'text-green-600',
    use: 'text-blue-600',
    refund: 'text-orange-600',
    cancel: 'text-red-600',
  }
  return colors[type] || 'text-gray-600'
}

const columns = [
  {
    accessorKey: 'index',
    header: '№',
    cell: ({ row }: any) => {
      return row.index + 1
    },
  },

  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }: any) => {
      const type = row.original.type
      return h('span', {
        class: getTransactionTypeColor(type)
      }, getTransactionTypeLabel(type))
    },
  },

  {
    accessorKey: 'amount',
    header: 'Сумма',
    cell: ({ row }: any) => {
      const amount = row.original.amount
      const type = row.original.type

      return h('span', {
        class: type === 'use' || type === 'cancel' ? 'text-red-600' : 'text-green-600'
      }, formatPrice(amount))
    },
  },

  {
    accessorKey: 'balance_before',
    header: 'Баланс до',
    cell: ({ row }: any) => {
      return formatPrice(row.original.balance_before)
    },
  },

  {
    accessorKey: 'balance_after',
    header: 'Баланс после',
    cell: ({ row }: any) => {
      return formatPrice(row.original.balance_after)
    },
  },

  {
    accessorKey: 'order',
    header: 'Заказ',
    cell: ({ row }: any) => {
      const order = row.original.order

      if (!order) {
        return '—'
      }

      return h('button', {
        class: 'text-blue-600 hover:text-blue-800 hover:underline cursor-pointer',
        onClick: () => router.push(`/order/update/${order.id}`)
      }, `#${order.id}`)
    },
  },

  {
    accessorKey: 'notes',
    header: 'Примечания',
    cell: ({ row }: any) => {
      return row.original.notes || '—'
    },
  },

  {
    accessorKey: 'created_at',
    header: 'Дата',
    cell: ({ row }: any) => {
      return formatDateToRussian(row.original.created_at, true)
    },
  },
]
</script>

<style scoped>

</style>