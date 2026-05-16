<template>
  <div>
    <DynamicsDataTable
        :data="items"
        :columns="columns"
        :custom-actions="true"
        :show-print-button="true"
        :pagination="props.pagination"
        :show-total="showTotal"
        @pagination-change="emits('paginationChange')"
    >
      <template #actions="{row}">


        <PromoStatisticShowModal
            :data="row.original?.order?.items ?? []"
        />

      </template>
    </DynamicsDataTable>
  </div>
</template>

<script setup lang="ts">
import {h, PropType, ref, watch} from "vue";
import {useRouter} from "vue-router";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {PromoCodeUsage} from "@/models/PromoCodeUsage";
import {Pagination, ShowTotalType} from "@/types/Types";
import {useDateFormat} from "@/composables/useDateFormat";
import {usePriceFormatter} from "@/composables/usePriceFormatter";
import {useSelectableColumn} from "@/composables/useSelectableColumn";
import ProductShowModal from "@/components/products/ProductShowModal.vue";
import PromoStatisticShowModal from "@/components/discount/PromoStatistic/Show/PromoStatisticShowModal.vue";
import {useStatusFunctions} from "@/composables/useStatusFunctions";

const router = useRouter();


const props = defineProps({
  items: {
    type: Array as PropType<PromoCodeUsage[]>,
    default: () => []
  },
  loading: Boolean,
  pagination: Object as PropType<Pagination>,

  showTotal: {
    type: Object as PropType<ShowTotalType>,
    default: null
  },
});

const emits = defineEmits(["deleted", "updated", "paginationChange", "viewDetails"]);

const {getStatus} = useStatusFunctions();
const {formatDateToRussian} = useDateFormat();
const {formatPrice} = usePriceFormatter();

const {selectedIds, selectColumn, indexColumn} = useSelectableColumn(props.pagination)

const columns = [
  selectColumn,
  indexColumn,
  {
    header: "Дата",
    accessorKey: "used_at",
    cell: ({row}: any) => {
      return formatDateToRussian(row.original.used_at);
    }
  },
  {
    header: "Клиент",
    accessorKey: "client.name",
    cell: ({row}: any) => {
      const client = row.original.client;
      return h('div', {class: 'space-y-0.5'}, [
        h('div', {class: 'font-medium'}, client?.name || 'N/A'),
        h('div', {class: 'text-xs text-muted-foreground'}, client?.phone || '')
      ]);
    }
  },
  {
    header: "Email",
    accessorKey: "client.email",
  },
  {
    header: "№ заказа",
    accessorKey: "order.id",
    cell: ({row}: any) => {
      return row.original.order?.id || `#${row.original.order?.id}`;
    }
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({row}: any) => {
      const raw = row.original?.order.status ?? ''
      const value = String(raw).trim()
      const status = getStatus('order', value)

      const bg = status?.color ?? '#8a8a8a'
      const label = status?.label ?? 'Неизвестный'

      return h(
          'span',
          {
            style: {backgroundColor: bg},
            class: 'px-2 py-1 rounded text-white whitespace-nowrap',
            title: label,
            'aria-label': label,
          },
          label
      )
    },
  },

  {
    accessorKey: "payment_status",
    header: "Оплата",
    cell: ({row}: any) => {
      const status = getStatus('payment', row.original?.order?.payment_status)

      return h('span',
          {
            style: {backgroundColor: status.color},
            class: `px-2 py-1 rounded text-white whitespace-nowrap`,
          },
          status.label
      )
    },
  },
  {
    header: "Товаров",
    accessorKey: "order.items_count",
  },
  {
    header: "Сумма",
    accessorKey: "order.total_amount_original",
    cell: ({row}: any) => {
      return formatPrice(row.original?.order?.total_amount_original || 0);
    }
  },
  {
    header: "Товары",
    accessorKey: "order.total_items_discount",
    cell: ({row}: any) => {
      return h('span', {class: 'text-red-600 font-medium'},
          `-${formatPrice(row?.original?.order?.total_items_discount || 0)}`
      );
    }
  },
  {
    header: "Промокод",
    accessorKey: "order.total_promo_discount",
    cell: ({row}: any) => {
      return h('span', {class: 'text-red-600 font-medium'},
          `-${formatPrice(row.original?.order?.total_promo_discount || 0)}`
      );
    }
  },

  {
    header: "Итого",
    accessorKey: "order.total_amount",
    cell: ({row}: any) => {
      return h('span', {class: 'font-semibold'},
          formatPrice(row.original?.order?.total_amount || 0)
      );
    }
  },
];

// Функции для действий
const viewDetails = (usage: PromoCodeUsage) => {
  emits('viewDetails', usage);
};

const goToClient = (usage: PromoCodeUsage) => {
  if (usage.client?.id) {
    router.push(`/clients/${usage.client.id}`);
  }
};

const goToOrder = (usage: PromoCodeUsage) => {
  if (usage.order?.id) {
    router.push(`/orders/${usage.order.id}`);
  }
};


watch(
    () => selectedIds.value,
    (newVal) => {
      if (newVal?.length) {
        const filterData = props.items?.filter((item) => newVal.includes(item.id!)) || [];

        const totalSum = filterData.reduce((sum, item) => {
          return sum + (Number(item.order?.total_amount) || 0);
        }, 0);

        if (props.showTotal) {
          props.showTotal.title = `Выделено: ${filterData.length} |  Итого:`;
          props.showTotal.total = totalSum;
        }

        console.log('Выбранные элементы:', filterData);
        console.log('Сумма total_amount:', totalSum);
      } else {
        if (props.showTotal) {
          props.showTotal.title = 'Итого:'
          props.showTotal.total = props.showTotal.original_total;
        }
      }
    },
    {deep: true}
);


</script>

<style scoped></style>