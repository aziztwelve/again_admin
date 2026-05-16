<template>
  <DynamicsDataTable
      :data="users"
      :columns="columns"
      :edit="edit"
      :loading="loading"
      :deletePermission="hasPermission(PermissionsData.USERS_DELETE, false)"
      @save_changes="handlingUpdateUser"
      @deleted="
      useUserFunctions().deleteUser($event.id);
      emits('deleted', $event);
    "
      @restore="
      useUserFunctions().restoreUser($event.id)
    "
  />
</template>

<script setup lang="ts">
import UsersEdit from '@/components/users/Edit/Index.vue'
import {Check, X} from "lucide-vue-next";
import {h, onMounted, PropType, ref} from "vue";
import {useUserFunctions} from "@/composables/userFunctions";
import DynamicsDataTable from "@/components/dynamics/DataTable/Index.vue";
import {User} from "@/models/user/User";
import usePermission from "@/composables/usePermission";
import {PermissionsData} from "@/constants/PermissionsData";


const props = defineProps({
  users: {
    type: Array as PropType<User[]>,
    default: () => []
  },
  loading: Boolean,
});

const emits = defineEmits(["deleted", "updated"]);

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
    cell: (cell: any) => {
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
    cell: (row: any) => {
      return row.getValue()
          ? h(Check, {class: "h-4 w-4 text-green-500"})
          : h(X, {class: "h-4 w-4 text-red-500"});
    },
  },
];

const {hasPermission} = usePermission()

async function handlingUpdateUser(user: any) {
  await useUserFunctions().changeUser(user)
  emits('updated')
}

</script>

<style scoped></style>
