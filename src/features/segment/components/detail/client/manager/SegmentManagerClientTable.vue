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
            v-if="!isClientAttached(row.original.id) && !isClientPendingAttach(row.original.id)"
            size="sm"
            variant="outline"
            @click="handleAttach(row.original.id)"
            :disabled="sending"
        >
          <Plus class="h-4 w-4"/>

        </Button>

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
import {Plus, Trash2} from 'lucide-vue-next'
import {useDateFormat} from "@/composables/useDateFormat"
import {PaginationMeta} from "@/types/Types"
import type {SegmentClientManager} from "@/features/segment/types";
import {useTableColumns} from "@/composables/Table/useTableColumns";
import {Client} from "@/types/client";

interface PropsData {
  items: Client[]
  segmentClientManager: SegmentClientManager
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
const isClientAttached = (promoCodeId: number): boolean => {
  return props.segmentClientManager.attached.includes(promoCodeId)
}
const isClientPendingAttach = (promoCodeId: number): boolean => {
  return props.segmentClientManager.pendingAttach.includes(promoCodeId)
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
    accessorKey: "full_name",
    header: "Код",
    cell: ({row}: any) =>
        h(
            "div",
            {class: "flex items-center gap-2"},
            [
              // сам код
              h("span", {class: "font-medium"}, row.original.full_name),

              // бейдж если promo уже прикреплён
              isClientAttached(row.original.id)
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
              isClientPendingAttach(row.original.id)
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
    accessorKey: "profile.phone",
    header: "Телефон",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            row.original?.profile?.phone
        ),
  },

  {
    accessorKey: "email",
    header: "Почта",
  },


  {
    accessorKey: "profile.birthday",
    header: "Дата рождения",
    cell: (row: any) => {
      return h('span', {class: 'whitespace-nowrap'}, formatDateToRussian(row.getValue(), false));
    },
  },
  {
    accessorKey: "created_at",
    header: "Дата регистрации",
    cell: (row: any) => {
      return h('span', {class: 'whitespace-nowrap'}, formatDateToRussian(row.getValue()));
    },
  },

];

</script>