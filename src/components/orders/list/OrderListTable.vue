<template>
  <div>
    <DynamicsDataTable
        :data="items"
        :columns="columns"
        :custom-actions="true"
        :show-print-button="true"
        :pagination="pagination"
        :loading="loading"
    >
      <template #actions="{row}">
        <IconButtons
            :buttons="[
              {
                type: 'edit',
                onClick: () => handlerEdit(row.original)
              },
              {
                type: 'delete',
                onClick: () => handleDeleted(row.original)
              },
             ]"
        />

      </template>
    </DynamicsDataTable>
  </div>
</template>

<script setup lang="ts">
import {h} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {RouterLink, useRouter} from "vue-router";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import Order from "@/models/order/Order";
import {useOrderFunctions} from "@/composables/useOrderFunctions";
import {useDateFormat} from "@/composables/useDateFormat";
import {useStatusFunctions} from "@/composables/useStatusFunctions";
import {PaginationMeta} from "@/types/Types";
import {useSelectableColumn} from "@/composables/useSelectableColumn";


interface Props {
  items: Order[];
  loading?: boolean;
  pagination: PaginationMeta;
}

const props = defineProps<Props>();

const emits = defineEmits(["deleted", "updated"]);

const router = useRouter();
const {formatDateToRussian} = useDateFormat()

const handlerEdit = (row: Order) => {

  router.push(`/order/update/${row.id}`)
}


const {getStatus} = useStatusFunctions()
const {indexColumn} = useSelectableColumn(props.pagination)


const columns = [
  indexColumn,

  {
    accessorKey: 'id',
    header: 'Номер заказа',
    cell: ({row}: any) => {
      const id = row.original.id
      return h(
          RouterLink,
          {
            to: `/order/${id}`,
            class: 'text-blue-500 hover:underline',
          },
          {default: () => id}
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Создан",
    cell: ({row}: any) => {
      return formatDateToRussian(row.original.created_at)
    }

  },
  {
    accessorKey: "total_amount",
    header: "Сумма",
  },
  {
    accessorKey: "client.full_name",
    header: "ФИО получателя",
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({row}: any) => {
      const raw = row.original?.status ?? ''
      const value = String(raw).trim()
      const status = getStatus('order', value)

      return h(
          'span',
          {
            style: {backgroundColor: status?.color},
            class: 'px-2 py-1 rounded text-white whitespace-nowrap',
            title: status?.label,
            'aria-label': status?.label,
          },
          status?.label
      )
    },
  },

  {
    accessorKey: "payment_status",
    header: "Оплата",
    cell: ({row}: any) => {
      const status = getStatus('payment', row.original.payment_status)

      return h('span',
          {
            style: {backgroundColor: status?.color},
            class: `px-2 py-1 rounded text-white whitespace-nowrap`,
          },
          status?.label
      )
    },
  },

  {
    accessorKey: "delivery_method.name",
    header: "Доставка",
  },

];


const {deleteOrder} = useOrderFunctions()

const handleDeleted = async (order: Order) => {

  if (!order.id) return

  await deleteOrder(order.id)
  emits('deleted')

}

</script>

<style scoped></style>
