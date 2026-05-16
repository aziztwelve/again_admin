<template>
  <DynamicsDataTable
      :data="giftCards"
      :columns="columns"
      :loading="loading"
      :custom-actions="true"
      :pagination="pagination"
      :show-print-button="false"
  >

    <template #actions="{row}">

      <GiftCardResendModal
          v-if="(row.original as GiftCard).status === 'active' || (row.original as GiftCard).status === 'inactive'"
          :gift-card="row.original as GiftCard"
          @canceled-emit="emits('canceledEmit', $event)"
      />
      <GiftCardCancelModal
          v-if="(row.original as GiftCard).status === 'active'"
          :gift-card="row.original as GiftCard"
          @canceled-emit="emits('canceledEmit', $event)"
      />


    </template>

  </DynamicsDataTable>


</template>

<script setup lang="ts">
import {h} from "vue"
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue"
import {PaginationMeta} from "@/types/Types"
import type {GiftCard} from "@/features/gift-card/types"
import {usePriceFormatter} from "@/composables/usePriceFormatter"
import {useTableColumns} from "@/composables/Table/useTableColumns"
import router from "@/router"
import {useDateFormat} from "@/composables/useDateFormat";
import GiftCardCancelModal from "@/features/gift-card/components/modal/GiftCardCancelModal.vue";
import GiftCardResendModal from "@/features/gift-card/components/modal/GiftCardResendModal.vue";

interface GiftCardProps {
  giftCards: GiftCard[]
  pagination: PaginationMeta
  loading: boolean
}

const props = defineProps<GiftCardProps>()

const emits = defineEmits<{
  (e: 'canceledEmit', giftCard: GiftCard): void
}>()

const {formatPrice} = usePriceFormatter()
const {createIndexColumn, createClickableColumn} = useTableColumns()


// Функции для статусов и типов
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    inactive: 'Неактивна',
    active: 'Активна',
    used: 'Использована',
    cancelled: 'Аннулирована',
  }
  return labels[status] || status
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    electronic: 'Электронная',
    plastic: 'Пластиковая',
  }
  return labels[type] || type
}

const columns = [
  createIndexColumn(props.pagination),

  createClickableColumn(
      'code',
      'Код',
      (card: GiftCard) => {
        router.push(`/gift-card/${card.id}`)
      }
  ),

  {
    accessorKey: "nominal",
    header: "Номинал",
    cell: ({row}: any) => {
      return formatPrice(row.original.nominal)
    },
  },

  {
    accessorKey: "balance",
    header: "Баланс",
    cell: ({row}: any) => {
      return formatPrice(row.original.balance)
    },
  },

  {
    accessorKey: "recipient_name",
    header: "Получатель",
    cell: ({row}: any) => {
      const card = row.original as GiftCard
      return h('div', {class: 'space-y-1'}, [
        h('div', {class: 'font-medium'}, card.recipient_name || '—'),
        h('div', {class: 'text-xs text-gray-500'}, card.recipient_email || card.recipient_phone || '')
      ])
    },
  },

  {
    accessorKey: "type",
    header: "Тип",
    cell: ({row}: any) => {
      return getTypeLabel(row.original.type)
    },
  },

  {
    accessorKey: "status",
    header: "Статус",
    cell: ({row}: any) => {
      const status = row.original.status
      const colors: Record<string, string> = {
        inactive: 'text-gray-500',
        active: 'text-green-500',
        used: 'text-yellow-500',
        cancelled: 'text-red-500',
      }
      return h('span', {class: colors[status] || 'text-gray-500'}, getStatusLabel(status))
    },
  },

  {
    accessorKey: "created_at",
    header: "Дата создания",
    cell: ({row}: any) => {
      return useDateFormat().formatDateToRussian(row.original.created_at, true)
    }
  },
  {
    accessorKey: "send",
    header: "Отправлен",
  },
]
</script>

<style scoped>

</style>