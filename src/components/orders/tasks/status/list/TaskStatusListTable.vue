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
import ContactRequest from "@/models/ContactRequest";
import {useContactRequestFunctions} from "@/composables/useContactRequestFunctions";
import {useDateFormat} from "@/composables/useDateFormat";
import TaskStatusEdit from "@/components/orders/tasks/status/TaskStatusEdit.vue";
import TaskStatus from "@/models/TaskStatus";
import {useTaskStatusFunctions} from "@/composables/useTaskStatusFunctions";
import {Check, X} from "lucide-vue-next";

const props = defineProps({
  items: {
    type: Array as PropType<TaskStatus[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

// const {deleteContactRequest, updateContactRequest} = useContactRequestFunctions();


const {updateTaskStatus, deleteTaskStatus} = useTaskStatusFunctions()


const edit = ref({
  title: "Изменение статуса",
  description: "Здесь вы можете изменить «Статус» заявки",
  component: TaskStatusEdit,
  loader: false,
});


const columns = [

  {
    accessorKey: "index",
    header: "№",
    cell: ({row}: any) => {
      return row.index + 1;
    },
  },

  {
    accessorKey: "name",
    header: "Название статуса",
  },


  {
    accessorKey: "is_default",
    header: "По умолчанию",
    cell: ({row}: any) => {
      const s = row.original
      return s.isDefault
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"})
    }
  },


  {
    accessorKey: "color",
    header: "Цвет",
    cell: ({row}: any) => {

      const s = row.original;
      return h(
          'span',
          {
            class: 'inline-block w-5 h-5 rounded-full',
            style: s?.colorStyle
          }
      )
    }
  },


  {
    accessorKey: "created_at",
    header: "Создан",
    cell: ({row}: any) => useDateFormat().formatDateToRussian(row.original?.created_at)
  },

];

const handleDeleted = async (request: TaskStatus) => {
  if (!request.id) return;
  await deleteTaskStatus(request.id);
  emits("deleted");
};
const handleSave = async (item: TaskStatus) => {

  if (!item.id) return;

  const result = await updateTaskStatus(item.id, item.toJSONForUpdate())

  emits('updated', result);
};
</script>

<style scoped></style>
