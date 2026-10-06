<template>
  <DynamicsDataTable
      :data="items"
      :columns="columns"
      :show-print-button="false"
      :edit="edit"
      @deleted="handleDeleted"
      @save_changes="handleSave"
  >
    <template #addActions="{item}">
      <AlertDialog
          v-if="!item?.completed_at"
          title="Завершить задачу?"
          description="Вы уверены, что хотите отметить эту задачу как завершённую? Это действие изменит её статус и зафиксирует дату завершения."
          icon-style="text-green-400 hover:text-green-500"
          :show-icon="true"
          :icon="SquareCheckBig"
          @continue="handleComplete(item.id)"
      />
    </template>
  </DynamicsDataTable>
</template>

<script setup lang="ts">
import {h, PropType, ref} from "vue";
import {RouterLink} from "vue-router";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import Task from "@/models/Task";
import {useTaskFunctions} from "@/composables/useTaskFunctions";
import {useDateFormat} from "@/composables/useDateFormat";
import TaskEdit from "@/components/orders/tasks/TaskEdit.vue";
import TaskPriority from "@/models/TaskPriority";
import AlertDialog from "@/components/dynamics/AlertDialog.vue";
import {SquareCheckBig} from 'lucide-vue-next';
import TaskDescriptionPreview from "@/components/orders/tasks/list/TaskDescriptionPreview.vue";

const props = defineProps({
  items: {
    type: Array as PropType<Task[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

const {deleteTask, updateTask, completeTask} = useTaskFunctions();
const {formatDateToRussian} = useDateFormat();

const edit = ref({
  title: "Изменение задачи",
  description: "Здесь вы можете изменить задачу",
  component: TaskEdit,
  dynamicStyle: '2xl:min-w-[70vw] xl:min-w-[80vw] max-md:min-w-full md:min-w-[95vw] min-h-[75vh]',
  loader: false,
});

const userName = (user: any): string =>
    user?.profile?.full_name ?? user?.profile?.fullName ?? user?.fullName ?? user?.name ?? '—';

// Состав повторяет список задач InSales: индикатор приоритета и шесть
// колонок данных. Другие поля задачи доступны в карточке редактирования.
const columns = [
  {
    accessorKey: "priority",
    header: "",
    cell: ({row}: any) => {
      const priority: TaskPriority | undefined = row.original?.priority;

      return h('span', {
        class: 'block h-2.5 w-2.5 rounded-full',
        style: {backgroundColor: priority?.color ?? '#9CA3AF'},
        title: priority?.name ?? 'Без приоритета',
      });
    },
  },
  {
    accessorKey: "order.order_number",
    header: "№ заказа",
    cell: ({row}: any) => {
      const order = row.original?.order;
      if (!order) return '—';

      return h(RouterLink, {
        to: `/order/${order.id}`,
        class: 'text-blue-500 hover:underline',
      }, {default: () => order.order_number || order.id});
    },
  },
  {
    accessorKey: "due_date",
    header: "Срок исполнения",
    cell: ({row}: any) => h(
        'span',
        {class: 'whitespace-nowrap'},
        formatDateToRussian(row.original?.due_date) || '—'
    ),
  },
  {
    accessorKey: "created_at",
    header: "Дата создания",
    cell: ({row}: any) => h(
        'span',
        {class: 'whitespace-nowrap'},
        formatDateToRussian(row.original?.created_at)
    ),
  },
  {
    accessorKey: "title",
    header: "Что сделать",
    cell: ({row}: any) => h(TaskDescriptionPreview, {text: row.original?.title}),
  },
  {
    accessorKey: "assignee",
    header: "Назначена на",
    cell: ({row}: any) => userName(row.original?.assignee),
  },
  {
    accessorKey: "creator",
    header: "Кем назначена",
    cell: ({row}: any) => userName(row.original?.creator),
  },
];

const handleDeleted = async (task: Task) => {
  if (!task.id) return;
  const result = await deleteTask(task.id);
  if (result) emits("deleted");
};

const handleSave = async (task: Task) => {
  if (!task.id) return;
  const result = await updateTask(task.id, task.toJSONForUpdate());
  if (result) emits('updated', result);
};

const handleComplete = async (id: number) => {
  const result = await completeTask(id);
  if (result) emits("updated", result);
};
</script>
