<template>
  <div>
    <DynamicsDataTable
        :data="items"
        :columns="columns"
        :show-print-button="false"
        :edit="edit"
        @deleted="handleDeleted"
        @save_changes="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import {h, PropType, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import TaskLabel from "@/models/TaskLabel";
import {useTaskLabelFunctions} from "@/composables/useTaskLabelFunctions";
import {useDateFormat} from "@/composables/useDateFormat";
import TaskLabelEdit from "@/components/orders/tasks/label/TaskLabelEdit.vue";

const props = defineProps({
  items: {
    type: Array as PropType<TaskLabel[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

const {deleteTaskLabel, updateTaskLabel} = useTaskLabelFunctions();

const edit = ref({
  title: "Изменение метки",
  description: "Здесь вы можете изменить метку задачи",
  component: TaskLabelEdit,
  loader: false,
});

const columns = [
  {
    accessorKey: "index",
    header: "№",
    cell: ({row}: any) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Название",
  },

  {
    accessorKey: "tasks_count",
    header: "Кол-во задач",
  },

  {
    accessorKey: "color",
    header: "Цвет",
    cell: ({row}: any) => {
      const s = row.original;

      console.log(row.original)

      const style = s?.colorStyle || {backgroundColor: s?.color || 'transparent'};
      return h(
          'span',
          {
            class: 'inline-block w-5 h-5 rounded-full',
            style
          }
      )
    }
  },
  {
    accessorKey: "created_at",
    header: "Создано",
    cell: ({row}: any) => useDateFormat().formatDateToRussian(row.original?.created_at)
  },
];

const handleDeleted = async (item: TaskLabel) => {
  if (!item.id) return;
  await deleteTaskLabel(item.id);
  emits("deleted");
};

const handleSave = async (item: TaskLabel) => {
  if (!item.id) return;
  const result = await updateTaskLabel(item.id, item.toJSONForUpdate());
  emits('updated', result);
};
</script>

<style scoped></style>
