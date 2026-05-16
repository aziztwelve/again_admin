<template>
  <DynamicsDataTable
      :data="clients"
      :columns="columns"
      :custom-actions="true"
      :show-print-button="false"
      :loading="sending"
      :pagination="pagination"
  >
    <template #actions="{row}">
      <div class="flex items-center gap-2">
        <!-- Кнопка "Добавить" -->
        <Button
            v-if="isClientPendingDetach(row.original.id)"
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
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {SegmentClient, type SegmentClientManager} from "@/features/segment/types";
import {useTableColumns} from "@/composables/Table/useTableColumns";
import {usePriceFormatter} from "@/composables/usePriceFormatter";
import {PaginationMeta} from "@/types/Types";
import {h} from "vue";
import {Button} from "@/components/ui/button";
import {Trash2, Plus} from "lucide-vue-next";
import {useDateFormat} from "@/composables/useDateFormat";

interface PropsData {
  clients: SegmentClient[];
  sending: boolean;
  pagination: PaginationMeta
  segmentClientManager: SegmentClientManager;
}

const props = defineProps<PropsData>();


console.log(props.clients)
const {createIndexColumn} = useTableColumns();
const {formatPrice} = usePriceFormatter()
const {formatDateToRussian} = useDateFormat()


const isClientPendingDetach = (promoCodeId: number): boolean => {
  return props.segmentClientManager.attached.includes(promoCodeId)
}


const handleAttach = (id: number) => {
  const s = props.segmentClientManager

  s.attached = s.attached.filter(i => i !== id)
  s.pendingDetach = s.pendingDetach.filter(i => i !== id)

}
const handleDetach = (id: number) => {
  const s = props.segmentClientManager

  s.attached.push(id)

  s.pendingDetach.push(id)
}


const columns = [
  createIndexColumn(),

  {
    accessorKey: "full_name",
    header: "Код",
    cell: ({row}: any) =>
        h(
            "div",
            {class: "flex items-center gap-2"},
            [
              h("span", {class: "font-medium"}, row.original.full_name),

              isClientPendingDetach(row.original.id)
                  ? h(
                      "span",
                      {
                        class:
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                      },
                      "Ожидает удаление"
                  )
                  : null
            ].filter(Boolean)
        )
  },


  {
    accessorKey: "email",
    header: "Email",
  },

  {
    accessorKey: "phone",
    header: "Телефон",
    cell: ({row}: any) => {

      return h('span', {
            class: 'whitespace-nowrap',
          },
          row.original.profile?.phone
      );

    }
  },

  {
    accessorKey: "birthday",
    header: "День рождения",
    cell: ({row}: any) => {
      return h('span', {
            class: 'whitespace-nowrap',
          },
          formatDateToRussian(row.original.profile.birthday)
      );
    }
  },
  {
    accessorKey: "added_to_segment_at",
    header: "Дата доб в сегменте",
    cell: ({row}: any) => {
      return h('span', {
            class: 'whitespace-nowrap',
          },
          row.original.added_to_segment_at
      );
    }
  },

  {
    accessorKey: "orders_count",
    header: "Заказов",
    cell: ({row}: any) => {
      return row.original.orders_count || 0;
    }
  },

  {
    accessorKey: "total_amount",
    header: "Сумма заказов",
    cell: ({row}: any) => {
      return formatPrice(row.original.total_amount || 0);
    }
  },

  {
    accessorKey: "average_check",
    header: "Средний чек",
    cell: ({row}: any) => {
      return formatPrice(row.original.average_check || 0);
    }
  },


  {
    accessorKey: "tags",
    header: "Теги",
    cell: ({ row }: any) => {
      const tags = row.original.tags as Array<{ id: number; name: string }> | undefined;

      if (!tags || tags.length === 0) {
        return h('span', { class: 'text-muted-foreground' }, '—');
      }

      return h(
          'div',
          { class: 'flex flex-wrap gap-1 max-w-[320px]' },
          tags.map(t =>
              h(
                  'span',
                  {
                    key: t.id,
                    class:
                        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-muted/40 whitespace-nowrap',
                    title: t.name,
                  },
                  t.name
              )
          )
      );
    },
  },


  {
    accessorKey: "profile.address",
    header: "Адрес",
  },
];

</script>

<style scoped></style>