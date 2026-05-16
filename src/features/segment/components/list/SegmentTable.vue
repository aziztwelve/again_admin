<template>
  <DynamicsDataTable
      :data="segments"
      :columns="columns"
      :loading="loading"
      :edit="edit"
      :pagination="pagination"
      :show-print-button="false"
      @save_changes="emits('updateEmit', $event)"
      @deleted="emits('deleteEmit', $event)"
  >

    <template #addActions="{item}">

      <button
          @click="handleRecalculate(item)"
          v-if="(item as Segment).recalculate_frequency !== 'manual'"
          aria-disabled="true"
          class="inline-flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-500"
      >
        <RefreshCcw size="17"/>
      </button>

      <button
          @click="handleExport(item.id)"
          aria-disabled="true"
          class="inline-flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-500"
      >
        <Download size="17"/>
      </button>

    </template>

  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {PaginationMeta} from "@/types/Types";
import {Segment} from "@/features/segment/types/segment.types";
import {Check, X, RefreshCcw, Download} from "lucide-vue-next";
import {usePriceFormatter} from "@/composables/usePriceFormatter";
import {getRecalculateLabel} from "@/features/segment/types";
import SegmentEdit from "@/features/segment/components/edit/SegmentEdit.vue";
import {useSegments} from "@/features/segment/composables/useSegments";
import {useTableColumns} from "@/composables/Table/useTableColumns";
import router from "@/router";


interface segmentProps {
  segments: Segment[];
  pagination: PaginationMeta;
  loading: boolean;
}

const props = defineProps<segmentProps>();

const emits = defineEmits<{
  deleteEmit: (segment: Segment) => void,
  updateEmit: (segment: Segment) => void,
  recalculatedEmit: any,
}>();


const {formatPrice} = usePriceFormatter()
const {recalculateSegment, exportSegment} = useSegments()

const edit = ref({
  title: "Редактирование сегмента",
  description: "Измените данные сегмента",
  component: SegmentEdit,
  loader: false,
  dynamicStyle: "md:min-w-[50%]"
});


const handleRecalculate = async (segment: Segment) => {

  try {
    await recalculateSegment(segment.id)
    emits('recalculatedEmit')
  } catch (error) {
    console.error(error);
  }

}


const handleExport = async (id: number) => {
  try {
    await exportSegment(id)
  } catch {
  }
}

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
    accessorKey: "created_at",
    header: "Дата создания",
  },


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

  {
    accessorKey: "last_recalculated_at",
    header: "Последний пересчёт",
  },

  {
    accessorKey: "tags",
    header: "Теги",
  },


];
</script>

<style scoped>

</style>