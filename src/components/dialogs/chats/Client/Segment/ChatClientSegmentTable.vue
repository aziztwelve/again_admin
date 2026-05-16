<template>
  <DynamicsDataTable
      :data="segments"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :custom-actions="true"
      :show-print-button="false"
  >

    <template #actions="{row}">

      <div class="flex items-center gap-2">
        <!-- Кнопка "Добавить" -->
        <Button
            v-if="!isSegmentToClient(row?.original)"
            size="sm"
            variant="outline"
            @click="emits('addClientToSegment', row.original)"
            :disabled="loading"
        >
          <Plus class="h-4 w-4"/>

        </Button>

        <Button
            v-else
            size="sm"
            variant="destructive"
            @click="emits('deleteClientToSegment', row.original)"
            :disabled="loading"
        >
          <Trash2 class="h-4 w-4"/>
        </Button>

      </div>

    </template>

  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {PaginationMeta} from "@/types/Types";
import {Segment} from "@/features/segment/types/segment.types";
import {Check, X, Plus, Trash2} from "lucide-vue-next";
import {usePriceFormatter} from "@/composables/usePriceFormatter";
import {useTableColumns} from "@/composables/Table/useTableColumns";
import router from "@/router";
import {Button} from "@/components/ui/button";
import {Client} from "@/types/client";
import {getRecalculateLabel} from "@/features/segment/types";


interface segmentProps {
  segments: Segment[];
  client: Client;
  pagination: PaginationMeta;
  loading: boolean;
}

const props = defineProps<segmentProps>();

const emits = defineEmits<{
  (e: 'addClientToSegment', segment: Segment): void;
  (e: 'deleteClientToSegment', segment: Segment): void;
}>();

const isSegmentToClient = (segment: Segment): boolean => {
  return props.client?.segments?.some(i => i.id == segment.id) === true;
}


const {formatPrice} = usePriceFormatter()
const {createIndexColumn, createClickableColumn} = useTableColumns()

const columns = [

  createIndexColumn(props.pagination),

  createClickableColumn(
      'name',
      'Название',
      (s: Segment) => {
        router.push(`/segments/${s.id}`);
      }
  ),

  {
    accessorKey: "clients_count",
    header: "Клиентов",
  },

  {
    accessorKey: "statistics.total_amount",
    header: "Общая сумма",
    cell: ({row}: any) => {
      const amount = row.original.statistics?.total_amount || 0;
      return formatPrice(amount)
    },
  },
  {
    accessorKey: "statistics.average_check",
    header: "Средний чек",
    cell: ({row}: any) => {
      const avg = row.original.statistics?.average_check || 0;
      return formatPrice(avg)

    },
  },

  {
    accessorKey: "promo_codes_count",
    header: "Промокодов",
  },

  {
    accessorKey: "is_active",
    header: "Активен",
    cell: ({row}: any) => {
      return row.original.is_active
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },

  {
    accessorKey: "recalculate_frequency",
    header: "Пересчёт",
    cell: ({row}: any) => {
      const recalculate = row.original.recalculate_frequency
      return getRecalculateLabel(recalculate)
    },
  },

];
</script>

<style scoped>

</style>