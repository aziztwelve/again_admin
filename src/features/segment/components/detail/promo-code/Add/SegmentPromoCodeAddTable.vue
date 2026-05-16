<template>
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :custom-actions="true"
      :show-print-button="false"
      :pagination="pagination"
      :loading="sending"
  >
    <template #actions="{row}">
      <div class="flex items-center gap-2">
        <!-- Кнопка "Добавить" -->
        <Button
            v-if="!isPromoCodeAttached(row.original.id) && !isPromoCodePendingAttach(row.original.id)"
            size="sm"
            variant="outline"
            @click="handleAttach(row.original.id)"
            :disabled="sending"
        >
          <Plus class="h-4 w-4"/>

        </Button>

        <!-- Кнопка "Удалить" (если уже добавлен) -->
        <Button
            v-else
            size="sm"
            variant="destructive"
            @click="handleDetach(row.original.id)"
            :disabled="sending"
        >
          <Trash2 class="h-4 w-4"/>
        </Button>

      </div>
    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h} from "vue"
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue"
import {Button} from "@/components/ui/button"
import {Check, X, Plus, Trash2} from 'lucide-vue-next'
import {PromoCode} from "@/models/PromoCode"
import {useDateFormat} from "@/composables/useDateFormat"
import {PaginationMeta} from "@/types/Types"
import type {SegmentPromoCodeManager} from "@/features/segment/types";
import {useTableColumns} from "@/composables/Table/useTableColumns";

interface PropsData {
  items: PromoCode[]
  segmentPromoCodeManager: SegmentPromoCodeManager
  pagination: PaginationMeta
  sending: boolean
}

const props = defineProps<PropsData>()

const emits = defineEmits<{
  attach: [promoCodeId: number]
  detach: [promoCodeId: number]
}>()

const {formatDateToRussian} = useDateFormat()

// Проверка, добавлен ли промокод в сегмент
const isPromoCodeAttached = (promoCodeId: number): boolean => {
  return props.segmentPromoCodeManager.attached.includes(promoCodeId)
}
const isPromoCodePendingAttach = (promoCodeId: number): boolean => {
  return props.segmentPromoCodeManager.pendingAttach.includes(promoCodeId)
}

// Добавить промокод
const handleAttach = (promoCodeId: number) => {
  emits('attach', promoCodeId)
}

// Удалить промокод
const handleDetach = (promoCodeId: number) => {
  emits('detach', promoCodeId)
}


const {createIndexColumn} = useTableColumns()
const columns = [

  createIndexColumn(props.pagination),

  {
    accessorKey: "code",
    header: "Код",
    cell: ({row}: any) =>
        h(
            "div",
            {class: "flex items-center gap-2"},
            [
              // сам код
              h("span", {class: "font-medium"}, row.original.code),

              // бейдж если promo уже прикреплён
              isPromoCodeAttached(row.original.id)
                  ? h(
                      "span",
                      {
                        class:
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      },
                      "В сегменте"
                  )
                  : null,

              // бейдж если promo в процессе прикрепления
              isPromoCodePendingAttach(row.original.id)
                  ? h(
                      "span",
                      {
                        class:
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                      },
                      "Ожидает добавления"
                  )
                  : null
            ].filter(Boolean)
        )
  },


  {
    accessorKey: "discountTypeLabel",
    header: "Тип скидки",
  },
  {
    accessorKey: "formattedValue",
    header: "Значение",
  },
  {
    accessorKey: "startsAt",
    header: "Начало",
    cell: ({row}: any) => formatDateToRussian(row.original.startsAt)
  },
  {
    accessorKey: "expiresAt",
    header: "Окончание",
    cell: ({row}: any) => formatDateToRussian(row.original.expiresAt)
  },
  {
    accessorKey: "maxUses",
    header: "Макс. использований",
  },
  {
    accessorKey: "timesUsed",
    header: "Использовано",
  },
  {
    accessorKey: "description",
    header: "Описание",

  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({row}: any) => {
      return row.original.isActive
          ? h("span", {class: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"}, [
            h(Check, {class: "h-3 w-3 mr-1"}),
            "Активен"
          ])
          : h("span", {class: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"}, [
            h(X, {class: "h-3 w-3 mr-1"}),
            "Неактивен"
          ])
    },
  },
]
</script>