<template>
  <div>
    <!--
      :key пересоздаёт таблицу, когда подгружаются опции селект-фильтров
      (менеджеры, способы доставки). DynamicsDataTable капчурит `columns`
      один раз при маунте (`let columns = props.columns`), поэтому без
      remount-а после async-загрузки опций в дропдаунах фильтров остаётся
      пусто.
    -->
    <DynamicsDataTable
        :key="`orders-${managerOptions.length}-${deliveryMethodOptions.length}`"
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
import {h, computed} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {RouterLink, useRouter} from "vue-router";
import IconButtons from "@/components/dynamics/IconButtons.vue";
import ColumnHeaderFilter from "@/components/dynamics/DataTable/ColumnHeaderFilter.vue";
import Order from "@/models/order/Order";
import {useOrderFunctions} from "@/composables/useOrderFunctions";
import {useDateFormat} from "@/composables/useDateFormat";
import {useStatusFunctions} from "@/composables/useStatusFunctions";
import {PaginationMeta} from "@/types/Types";
import {useSelectableColumn} from "@/composables/useSelectableColumn";


interface FilterOption {
  value: number | string;
  label: string;
}

interface Props {
  items: Order[];
  loading?: boolean;
  pagination: PaginationMeta;
  /** Общий объект searchParams из OrdersList — пишем в него из фильтров-заголовков. */
  filter: Record<string, any>;
  managerOptions?: FilterOption[];
  deliveryMethodOptions?: FilterOption[];
}

const props = withDefaults(defineProps<Props>(), {
  managerOptions: () => [],
  deliveryMethodOptions: () => [],
});

const emits = defineEmits(["deleted", "updated", "filter"]);

const router = useRouter();
const {formatDateToRussian} = useDateFormat()

const handlerEdit = (row: Order) => {
  router.push(`/order/${row.id}`)
}


const {getStatus, getStatuses} = useStatusFunctions()
const {indexColumn} = useSelectableColumn(props.pagination)

const onFilterApply = () => emits('filter');

/**
 * Хелпер для рендера заголовка с фильтром-кнопкой.
 *   label  — текст заголовка столбца;
 *   column — конфиг виджета фильтра (тот же формат, что в DynamicsFilter).
 */
const headerWithFilter = (label: string, column: Record<string, any>) => {
  return () => h(ColumnHeaderFilter, {
    label,
    column,
    filter: props.filter,
    onApply: onFilterApply,
    onClear: onFilterApply,
  });
};


// «Менеджер»: добавляем псевдо-опцию «Без менеджера» поверх реального списка
// пользователей. Бэкенд понимает строковое 'null' как `WHERE assigned_user_id IS NULL`.
const managerFilterOptions = computed<FilterOption[]>(() => [
  {value: 'null', label: '— без менеджера —'},
  ...props.managerOptions,
]);

const columns = computed(() => [
  indexColumn,

  {
    accessorKey: 'id',
    header: headerWithFilter('Номер заказа', {
      type: 'text',
      field: 'order_number',
      placeholder: 'Номер или ID заказа',
    }),
    cell: ({row}: any) => {
      const id = row.original.id
      const num = row.original.order_number || id
      return h(
          RouterLink,
          {
            to: `/order/${id}`,
            class: 'text-blue-500 hover:underline',
          },
          {default: () => num}
      )
    },
  },
  {
    accessorKey: "created_at",
    header: headerWithFilter('Создан', {
      type: 'date_range',
      field: 'datePicker',
      placeholder: 'Период создания',
      // Inline-режим: календарь сразу видимый внутри outer-popover'а
      // ColumnHeaderFilter (см. /UI/date_range/Index.vue). Без этого
      // вложенный popover-триггер скрывал кнопку «Применить».
      inline: true,
    }),
    // В этом столбце дополнительно показываем назначенного менеджера —
    // чтобы видеть «когда + кто ведёт заказ» в одной колонке без скролла.
    // Полноценный столбец «Менеджер» (с фильтром) остаётся ниже.
    cell: ({row}: any) => {
      const date = formatDateToRussian(row.original.created_at)
      const u = row.original?.assigned_user
      let manager = ''
      if (u) {
        const p = u.profile || {}
        manager = [p.first_name, p.last_name].filter(Boolean).join(' ').trim()
            || u.full_name
            || u.email
            || `#${u.id}`
      }
      return h('div', {class: 'flex flex-col leading-tight'}, [
        h('span', {}, date),
        h('span', {class: 'text-xs text-muted-foreground min-h-[1em]'}, manager || '\u00A0'),
      ])
    }
  },
  {
    accessorKey: "total_amount",
    header: headerWithFilter('Сумма', {
      type: 'number_range',
      field: 'amount',
      fieldFrom: 'min_amount',
      fieldTo: 'max_amount',
      placeholderFrom: 'от',
      placeholderTo: 'до',
    }),
  },
  {
    accessorKey: "address.recipient_full_name",
    // Узкий поиск по ФИО получателя — отдельный параметр `recipient_search`,
    // который на бэке (OrderFilterService::searchByRecipient) ищет ТОЛЬКО
    // по order_addresses.recipient_first_name/last_name/middle_name. Общий
    // `search` подмешивает имя/фамилию клиента из user_profiles, из-за чего
    // при «смагин» возвращался заказ Чеботаевой, оформленный клиентом Смагиным.
    header: headerWithFilter('ФИО получателя', {
      type: 'text',
      field: 'recipient_search',
      placeholder: 'Фамилия / имя / отчество',
    }),
    // СТРОГО из адреса доставки (order_addresses.recipient_*) — без fallback'а
    // на клиента, чтобы в столбце «ФИО получателя» никогда не появлялось
    // имя оформителя (например, клиент Смагин оформил заказ для Чеботаевой —
    // в столбце должна быть Чеботаева или прочерк, но никогда не Смагин).
    cell: ({row}: any) => {
      const a = row.original?.address || {}
      const fromAddress = [a.recipient_last_name, a.recipient_first_name, a.recipient_middle_name]
        .filter(Boolean).join(' ').trim()
      return fromAddress || '—'
    },
  },
  {
    accessorKey: "client.email",
    header: headerWithFilter('Email', {
      type: 'text',
      field: 'email',
      placeholder: 'Email клиента',
    }),
    cell: ({row}: any) => {
      const email = row.original?.client?.email || row.original?.email || '—'
      return h('span', {class: 'text-sm text-gray-700 break-all'}, email)
    },
  },
  {
    accessorKey: "assigned_user",
    header: headerWithFilter('Менеджер', {
      type: 'select',
      field: 'assigned_user_id',
      placeholder: 'Выберите менеджера',
      options: managerFilterOptions.value,
      optionValue: 'value',
      optionLabel: 'label',
    }),
    cell: ({row}: any) => {
      const u = row.original?.assigned_user
      if (!u) return '—'
      const p = u.profile || {}
      const fullName = [p.first_name, p.last_name].filter(Boolean).join(' ').trim()
      return fullName || u.full_name || u.email || `#${u.id}`
    },
  },
  {
    accessorKey: "status",
    header: headerWithFilter('Статус', {
      type: 'select',
      field: 'status',
      placeholder: 'Выберите статус',
      options: getStatuses('order'),
      optionValue: 'value',
      optionLabel: 'label',
    }),
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
    header: headerWithFilter('Оплата', {
      type: 'select',
      field: 'payment_status',
      placeholder: 'Выберите статус оплаты',
      options: getStatuses('payment'),
      optionValue: 'value',
      optionLabel: 'label',
    }),
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
    header: headerWithFilter('Доставка', {
      type: 'select',
      field: 'delivery_method_id',
      placeholder: 'Способ доставки',
      options: props.deliveryMethodOptions,
      optionValue: 'value',
      optionLabel: 'label',
    }),
  },

]);


const {deleteOrder} = useOrderFunctions()

const handleDeleted = async (order: Order) => {

  if (!order.id) return

  await deleteOrder(order.id)
  emits('deleted')

}

</script>

<style scoped></style>
