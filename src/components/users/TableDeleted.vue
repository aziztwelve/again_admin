<template>
  <DynamicsDataTable
      v-if="users?.length"
      :data="users"
      :columns="columns"
      :restore-actions="true"
      :loading="loading"
      @hard_deleted="
      useUserFunctions().forceDestroy($event.id);
      emits('deleted', $event);
    "
      @restore="
      useUserFunctions().restoreUser($event.id);
     emits('restore')
    "
  />
</template>

<script setup lang="ts">
import UsersEdit from '@/components/users/Edit/Index.vue'
import {Check, X} from "lucide-vue-next";
import {h, PropType, ref} from "vue";
import {useUserFunctions} from "@/composables/userFunctions";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {User} from "@/models/user/User";


const props = defineProps({
  users: {
    type: Array as PropType<User[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "restore"]);

const isOpen = ref(false);
const edit = ref({
  title: "Редактирование пользователя",
  description: "Измените данные пользователя",
  component: UsersEdit,
  loader: false,
});


const columns = [

  {
    accessorKey: "id",
    header: "No",
    cell: (cell) => {
      return (cell.row.index += 1);
    },
  },
  {
    accessorKey: "fullName",
    header: "Имя",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "getPhone",
    header: "Номер",
  },
  {
    accessorKey: "getRoleNames",
    header: "Роль",
  },
  {
    accessorKey: "isActive",
    header: "Активировано",
    cell: (row) => {
      return row.getValue()
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
];

</script>

<style scoped></style>
