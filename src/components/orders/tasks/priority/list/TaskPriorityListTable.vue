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
import { h, PropType, ref } from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import TaskPriority from "@/models/TaskPriority";
import { useTaskPriorityFunctions } from "@/composables/useTaskPriorityFunctions";
import { useDateFormat } from "@/composables/useDateFormat";
import TaskPriorityEdit from "@/components/orders/tasks/priority/TaskPriorityEdit.vue";
import { Check, X } from "lucide-vue-next";

const props = defineProps({
  items: {
    type: Array as PropType<TaskPriority[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

const { deleteTaskPriority, updateTaskPriority } = useTaskPriorityFunctions();

const edit = ref({
  title: "Изменение приоритета",
  description: "Здесь вы можете изменить приоритет задачи",
  component: TaskPriorityEdit,
  loader: false,
});

const columns = [
  {
    accessorKey: "index",
    header: "№",
    cell: ({ row }: any) => {
      return row.index + 1;
    },
  },
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "level",
    header: "Уровень",
    cell: ({ row }: any) => {
      const s = row.original;
      return s.level ?? ""; // если нужно можно форматировать
    }
  },
  {
    accessorKey: "color",
    header: "Цвет",
    cell: ({ row }: any) => {
      const s = row.original;
      const style = s?.colorStyle || { backgroundColor: s?.color || 'transparent' };
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
    cell: ({ row }: any) => useDateFormat().formatDateToRussian(row.original?.created_at)
  },
];

const handleDeleted = async (item: TaskPriority) => {
  if (!item.id) return;
  await deleteTaskPriority(item.id);
  emits("deleted");
};

const handleSave = async (item: TaskPriority) => {
  if (!item.id) return;
  const result = await updateTaskPriority(item.id, item.toJSONForUpdate());
  emits('updated', result);
};
</script>

<style scoped></style>
