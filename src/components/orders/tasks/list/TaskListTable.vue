<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import {h, PropType, ref} from "vue";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import Task from "@/models/Task";
import {useTaskFunctions} from "@/composables/useTaskFunctions";
import {useDateFormat} from "@/composables/useDateFormat";
import TaskEdit from "@/components/orders/tasks/TaskEdit.vue";
import TaskStatus from "@/models/TaskStatus";
import TaskPriority from "@/models/TaskPriority";
import TaskLabel from "@/models/TaskLabel";
import AlertDialog from "@/components/dynamics/AlertDialog.vue"
import {SquareCheckBig} from 'lucide-vue-next';


const props = defineProps({
  items: {
    type: Array as PropType<Task[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

const {deleteTask, updateTask, completeTask, sending} = useTaskFunctions();
const {formatDateToRussian} = useDateFormat();

const edit = ref({
  title: "Изменение задачи",
  description: "Здесь вы можете изменить задачу",
  component: TaskEdit,
  dynamicStyle: '2xl:min-w-[70vw] xl:min-w-[80vw] max-md:min-w-full md:min-w-[95vw] min-h-[75vh]',
  loader: false,
});

const formatMinutes = (mins: number | null | undefined) => {
  if (mins === null || mins === undefined) return '';
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
};

const isOverdue = (due: string | null | undefined) => {
  if (!due) return false;
  const dueDate = new Date(due);
  const now = new Date();
  return dueDate < now;
};

const columns = [
  {
    accessorKey: "index",
    header: "№",
    cell: ({row}: any) => row.index + 1,
  },

  {
    accessorKey: "title",
    header: "Заголовок",
  },
  {
    accessorKey: "description",
    header: "Описание",
  },

  {
    accessorKey: "status",
    header: "Статус",
    cell: ({row}: any) => {
      const p: TaskStatus | undefined = row.original?.status;
      if (!p) return '';
      const name = p.name ?? '';
      const color = p.color;

      const classes = ['px-2', 'py-1', 'rounded', 'whitespace-nowrap'];
      if (color) {
        classes.push('text-white');
      }


      return h(
          "span",
          {
            class: classes.join(' '),
            style: {backgroundColor: color}
          },
          name
      );
    }
  },
  {
    accessorKey: "priority",
    header: "Приоритет",
    cell: ({row}: any) => {
      const p: TaskPriority | undefined = row.original?.priority;
      if (!p) return '';
      const name = p.name ?? '';
      const color = p.color;

      const classes = ['px-2', 'py-1', 'rounded', 'whitespace-nowrap'];
      if (color) {
        classes.push('text-white');
      }

      return h(
          "span",
          {
            class: classes.join(' '),
            style: {backgroundColor: color}
          },
          name
      );
    }
  },


  {
    accessorKey: "labels",
    header: "Метки",
    cell: ({row}: any) => {
      const labels: TaskLabel[] | undefined = row.original?.labels;
      if (!labels || !labels.length) return '';
      // отображаем несколько небольших бейджей
      return h(
          "div",
          {class: "flex flex-wrap gap-1"},
          labels.map((l: any) =>
              h(
                  "span",
                  {
                    class: "px-2 py-0.5 rounded text-white text-xs",
                    style: {backgroundColor: l?.color ?? '#6B7280'}
                  },
                  l?.name ?? ''
              )
          )
      );
    }
  },


  {
    accessorKey: "created_at",
    header: "Создан",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            formatDateToRussian(row.original?.created_at)
        ),
  },

  {
    accessorKey: "started_at",
    header: "Начало",
    cell: ({row}: any) =>
        h(
            "span",
            {class: "whitespace-nowrap"},
            formatDateToRussian(row.original?.started_at)
        ),
  },

  {
    accessorKey: "due_date",
    header: "Срок",
    cell: ({row}: any) => {
      const due = row.original?.due_date;
      const formatted = formatDateToRussian(due);
      const overdue = isOverdue(due) && !row.original?.completed_at;
      return h(
          "span",
          {
            class: [
              "whitespace-nowrap",
              overdue ? "text-red-600 font-medium" : ""
            ].join(" "),
          },
          formatted
      );
    },
  },


  {
    accessorKey: "creator",
    header: "Создал",
    cell: ({row}: any) => {
      const c = row.original?.creator;
      const name = c?.name ?? '';
      const email = c?.email ?? '';
      const avatar = c?.profile?.image ?? null;

      return h('div', {class: 'flex items-center gap-2'}, [
        // avatar или буква-заглушка
        avatar
            ? h('img', {
              src: avatar,
              class: 'w-8 h-8 rounded-full object-cover',
              alt: name || 'Avatar'
            })
            : h('div', {
              class: 'w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-600',
              title: name || ''
            }, name ? name[0].toUpperCase() : '?'),

        // текст: имя + email (маленьким и muted)
        h('div', {class: 'min-w-0'}, [
          h('div', {
            class: 'truncate',
            title: name || ''
          }, name || '—'),
          email
              ? h('div', {
                class: 'truncate',
                title: email
              }, email)
              : null
        ])
      ])
    }
  },
  {
    accessorKey: "assignee",
    header: "Исполнитель",
    cell: ({row}: any) => {
      const a = row.original?.assignee;
      const name = a?.profile?.fullName ?? a?.fullName ?? a?.name ?? '';
      const email = a?.email ?? '';
      const avatar = a?.profile?.image ?? null;

      return h('div', {class: 'flex items-center gap-2'}, [
        avatar
            ? h('img', {
              src: avatar,
              class: 'w-8 h-8 rounded-full object-cover',
              alt: name || 'Avatar'
            })
            : h('div', {
              class: 'w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-600',
              title: name || ''
            }, name ? name[0].toUpperCase() : '?'),

        h('div', {class: 'min-w-0'}, [
          h('div', {
            class: 'truncate',
            title: name || ''
          }, name || '—'),
          email
              ? h('div', {
                class: 'truncate',
                title: email
              }, email)
              : null
        ])
      ])
    }
  },


  {
    accessorKey: "estimated_time",
    header: "План. время",
    cell: ({row}: any) => formatMinutes(row.original?.estimated_time),
  },

  {
    accessorKey: "spent_time",
    header: "Потрачено",
    cell: ({row}: any) => {
      const spent = row.original?.spent_time;


      return h("span", {class: "text-blue-600 font-medium"}, formatMinutes(spent));
    }
  },


  {
    accessorKey: "completed_at",
    header: "Завершена",
    cell: ({row}: any) => {
      const completed = row.original?.completed_at;
      if (!completed) {
        return h("span", {class: "text-gray-400 italic"}, "—");
      }

      const formatted = formatDateToRussian(completed);
      return h(
          "span",
          {class: "text-green-600 font-medium"},
          formatted
      );
    }
  },

];

const handleDeleted = async (task: Task) => {
  if (!task.id) return;
  const result = await deleteTask(task.id);
  if (result) {
    emits("deleted");
  }
};


const handleSave = async (task: Task) => {
  if (!task.id) return;


  const result = await updateTask(task.id, task.toJSONForUpdate());

  if (result) {
    emits('updated', result);
  }
};


const handleComplete = async (id: number) => {
  const res = await completeTask(id);
  if (res) {
    emits("updated", res);
  }
}

</script>

<style scoped></style>
