<template>
  <DynamicsDataTable
      :data="data"
      :columns="columns"
      :custom-actions="true"
      :loading="loading"
  >
    <template #actions="{ row }">
      <CustomActionsForDynamicTable
          :item="row?.original"
          :edit="edit"
          @save_changes="handleSaveChanges"
          @deleted="handleDelete($event.id)"
          @cancel-production="cancelBatch($event)"
      />
    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import CustomActionsForDynamicTable from "@/components/warehouses/production/edit/CustomActionsForDynamicTable.vue";
import { BatchGet } from "@/models/BatchGet";
import { useDateFormat } from "@/composables/useDateFormat";
import {useProductionFunctions} from "@/composables/useProductionFunctions";
import {Batch} from "@/models/Batch";

const { getStatusConfig, statusClasses } = useStatus();

const props = defineProps({
  loading: Boolean,
  data: {
    type: Array as () => BatchGet,
    default: () => []
  },
  performers: {
    type: Array,
    default: () => []
  }
});

const emits = defineEmits(["deleted", "updated"]);

const edit = ref({
  title: "Редактирование партии",
  component: BatchGet,
  dynamicData: {
    performers: props.performers
  },
  loader: false
});

const columns = [
  {
    accessorKey: "base_batch_number",
    header: "№"
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }: any) => {
      const status = row.original?.status;
      if (!status) return '—';

      const config = getStatusConfig(status);
      return h('span', {
        style: {
          color: config.color,
          backgroundColor: config.bgColor,
          padding: '2px 6px',
          borderRadius: '6px',
        }
      }, config.text);
    }
  },
  {
    accessorKey: "planned_start_datetime",
    header: "Начало произ-ва",
    cell: ({ row }: any) => useDateFormat().formatDateToRussian(row.original?.planned_start_datetime)
  },
  {
    accessorKey: "planned_end_datetime",
    header: "Завершение произ-ва",
    cell: ({ row }: any) => row.original?.planned_end_datetime ?
        useDateFormat().formatDateToRussian(row.original?.planned_end_datetime) :
        'Произ-ва не завершено'
  },
  {
    accessorKey: "performers",
    header: "Исполнители",
    cell: ({ row }: any) => {
      const performers = row.original?.performers;
      return performers?.map(p => {
        return `${p?.first_name} ${p?.last_name}`;
      }).join(', ') || '—';
    }
  }
];


const cancelBatch = async (item: Batch) => {
  const res = await useProductionFunctions().cancelBatchAllBatch({
    batch_number: item.base_batch_number
  })
  emits('updated')
};

const handleDelete = async (id: number) => {
  // Логика удаления
};


const handleSaveChanges = async (data: BatchGet) => {
  // Логика сохранения
};
</script>