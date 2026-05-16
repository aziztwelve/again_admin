<template>
  <div class="flex justify-between mb-2 md:space-x-4 max-md:flex-col ">

    <TaskListSearch
        v-if="!isLoading"
        :filter="searchParams"
        :labels="data?.labels ?? []"
        :priorities="data?.priorities ?? []"
        :statuses="data?.statuses ?? []"
        :users="data?.users ?? []"
        @search="handleSearch"
        @clear-filters="resetFilters"
    />

    <TaskAddModal
        @created="fetchData()"
    />

  </div>

  <Loader v-if="isLoading"/>
  <TaskListTable
      v-else
      :key="renderTable"
      :items="tasks"
      @deleted="fetchData()"
      @updated="fetchData()"
  />

  <PaginationTable
      class="flex justify-end"
      :total="totalItems"
      :default-page="currentPage"
      :items-per-page="itemsPerPage"
      :sibling-count="1"
      :show-edges="true"
      @current-page="currentPage = $event; fetchData()"
  />


</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import {useTaskFunctions} from "@/composables/useTaskFunctions";
import TaskListSearch from "@/components/orders/tasks/list/TaskListSearch.vue";
import TaskAddModal from "@/components/orders/tasks/TaskAddModal.vue";
import Task from "@/models/Task";
import TaskListTable from "@/components/orders/tasks/list/TaskListTable.vue";
import {useStore} from "vuex";


const store = useStore();

const searchParams = ref({
  search: '',
  status: '',
  priority: '',
  assignee: '',
  label: '',
  dueDate: '',
  overdue: false
})


const renderTable = ref(1)
const renderSearchComp = ref(1)


const isLoading = ref(true)
const tasks = ref<Task[]>([])

const data = ref()

const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);


onMounted(async () => {
  await fetchData()
  await store.dispatch('notifications/markTasksChecked');

})


const {getTasks} = useTaskFunctions()

async function fetchData() {

  // isLoading.value = false

  // console.log(searchParams.value)
  // return

  const result = await getTasks({
    page: currentPage.value,
    per_page: itemsPerPage.value,
    ...searchParams.value
  })


  data.value = result

  tasks.value = result?.tasks ?? []

  currentPage.value = result?.meta?.page ?? 1
  itemsPerPage.value = result?.meta?.per_page ?? 10
  totalItems.value = result?.meta?.total ?? 0

  isLoading.value = false
  renderTable.value++
}


const handleSearch = () => {
  fetchData()
}


function resetFilters() {
  searchParams.value = {
    search: '',
    status: '',
    priority: '',
    assignee: '',
    label: '',
    dueDate: '',
    overdue: false
  }

  currentPage.value = 1
  renderSearchComp.value++
  fetchData()
}
</script>
