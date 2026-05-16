<template>

  <div class="flex justify-between max-md:flex-col max-md:space-y-2 max-md:mb-2">
    <UsersSearch
        class="md:w-[400px]"
        :filter="searchParams"
        @search="handlingSearch"
    />

    <UsersAdd
        class="mb-2"
        :permissions="permissions"
        :roles="roles"
        @submit="fetchData()"
    />

  </div>
  <Loader v-if="isLoading"/>
  <UsersTable
      v-else
      :key="renderTable"
      :users="users"
      @deleted="deleteUser($event)"
      @updated="fetchData()"
  />
  <div class="mt-2 flex justify-end">
    <PaginationTable
        :items-per-page="itemsPerPage"
        :total="totalItems"
        :default-page="currentPage"
        @current-page="
          currentPage = $event;
          fetchData();
        "
    />
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {ref, onMounted} from "vue"
import PaginationTable from "@/components/PaginationTable.vue";
import UsersTable from "@/components/users/Table.vue";
import UsersAdd from "@/components/users/Add/Index.vue";
import {User} from "@/models/user/User"
import Loader from "@/components/common/Loader.vue";
import {toast} from "vue-sonner";
import {PermissionsData} from "@/constants/PermissionsData";
import usePermission from "@/composables/usePermission";
import PermissionGuard from "@/components/PermissionGuard.vue";
import UsersSearch from "@/components/users/UsersSearch.vue";
import {useUsersFunctions} from "@/composables/useUsersFunctions";


const {getRoles, getPermissions} = useUsersFunctions()

const permissions = ref<any[]>([])
const roles = ref<any[]>([])

const data = ref()
const users = ref<User[]>([]);
const renderTable = ref(1)


const searchParams = ref({
  search: '',
});


const isLoading = ref(true);
const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(20);

const deleteUser = (user: any) => {
  users.value = users.value.filter(
      (item) => item.id !== user.id
  );
};

async function fetchData() {

  await axios
      .get(`/users?page=${currentPage.value}&per_page=${itemsPerPage.value}`)
      .then((res) => {
        if (res.data.users.data) {
          users.value = res.data.users.data.map((item: any) => User.fromJSON(item))
          data.value = res.data
          allUser.value = users.value
        }

        totalItems.value = res.data.users.total;
      })
      .catch((err) => {
        toast.error(err.response.data.message || err.response.data.error || 'Что пощло не так!')
        users.value = [];
      })
      .finally(() => {
        isLoading.value = false;
        renderTable.value++
      });
}

onMounted(async () => {
  await fetchData();

  roles.value = (await getRoles()) || []
  permissions.value = (await getPermissions()) || []
});


const allUser = ref<User[]>();

function handlingSearch() {
  if (!searchParams.value.search) {
    users.value = allUser.value;
  } else {
    users.value = User.searchByNameOrEmail(users.value, searchParams.value.search)
  }
  renderTable.value++
}

</script>
