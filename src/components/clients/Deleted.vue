<template>
  <Loader v-if="isLoading"/>
  <div v-else>

    <div
        v-if="users.length === 0"
        class="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed bg-background text-center space-y-3"
    >
      <UsersIcon class="w-12 h-12 text-muted-foreground" />
      <h3 class="text-lg font-medium text-foreground">
        Нет удалённых пользователей
      </h3>
      <p class="text-sm text-muted-foreground max-w-md">
        Корзина пользователей пуста. Здесь будут отображаться удалённые учётные записи, доступные для восстановления.
      </p>
    </div>


    <template v-else>
    <TableDeleted
        :users="users"
        :key="users.length"
        @deleted="fetchData()"
        @restore="fetchData()"
        :restore-action="true"
    />
    <div
        class="mt-2 flex justify-end"
    >
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
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {ref, onMounted} from "vue"
import PaginationTable from "@/components/PaginationTable.vue";
import {User} from "@/models/user/User"
import Loader from "@/components/common/Loader.vue";
import TableDeleted from "@/components/users/TableDeleted.vue";
import { UsersIcon, RefreshCwIcon } from 'lucide-vue-next'


const data = ref()
const users = ref<User[]>([]);

const isLoading = ref(true);
const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(15);

const deleteUser = (user) => {
  users.value = users.value.filter(
      (item) => item.id !== user.id
  );
};

async function fetchData() {

  await axios
      .get(
          `/users/deleted?page=${currentPage.value}&per_page=${itemsPerPage.value}`
      )
      .then((res) => {
        if (res.data.users.data) {
          users.value = res.data.users.data.map(item => User.fromJSON(item))
          data.value = res.data
        }

        totalItems.value = res.data.users.total;
      })
      .catch(() => {
        users.value = [];
      })
      .finally(() => {
        isLoading.value = false;
      });
}

onMounted((res) => {
  fetchData();
});
</script>
