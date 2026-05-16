<template>
  <div class="flex justify-between mb-2 md:space-x-4 max-md:flex-col">

    <div class="md:max-w-[400px] w-full md:flex md:space-x-2">
      <TaskPriorityListSearch
          :key="renderSearchComp"
          :filter="searchParams"
          @search="handleSearch"
      />

      <Button
          v-if="hasActiveFilters"
          variant="outline"
          @click="resetFilters"
      >
        <X/>
      </Button>

    </div>


    <TaskPriorityAddModal
        @created="fetchData()"
    />


  </div>

  <Loader v-if="isLoading"/>
  <TaskPriorityListTable
      v-else
      :key="renderTable"
      :items="taskStatus"
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
import {ref, onMounted, computed} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import Button from "@/components/ui/button/Button.vue";
import {X} from "lucide-vue-next"
import TaskListSearch from "@/components/orders/tasks/list/TaskListSearch.vue";
import {useTaskStatusFunctions} from "@/composables/useTaskStatusFunctions";
import TaskStatusAddModal from "@/components/orders/tasks/status/TaskStatusAddModal.vue";
import TaskStatusListTable from "@/components/orders/tasks/status/list/TaskStatusListTable.vue";
import TaskStatus from "@/models/TaskStatus";
import TaskStatusListSearch from "@/components/orders/tasks/status/list/TaskStatusListSearch.vue";
import TaskPriorityListSearch from "@/components/orders/tasks/priority/list/TaskPriorityListSearch.vue";
import TaskPriorityAddModal from "@/components/orders/tasks/priority/TaskPriorityAddModal.vue";
import TaskPriorityListTable from "@/components/orders/tasks/priority/list/TaskPriorityListTable.vue";
import {useTaskPriorityFunctions} from "@/composables/useTaskPriorityFunctions";
import TaskPriority from "@/models/TaskPriority";


const searchParams = ref({
  search: '',
})


const hasActiveFilters = computed(() => {
  return !!searchParams.value.search
})

const renderTable = ref(1)
const renderSearchComp = ref(1)


const isLoading = ref(true)
const taskStatus = ref<TaskPriority[]>([])

const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);


onMounted(async () => {
  await fetchData()
})

const {getTaskPriorities} = useTaskPriorityFunctions()

async function fetchData() {

  isLoading.value = true

  await getTaskPriorities(searchParams.value)
      .then(res => {
        taskStatus.value = res?.priorities ?? []
      })


  isLoading.value = false
  renderTable.value++
}


const handleSearch = () => {
  fetchData()
}


function resetFilters() {
  searchParams.value = {
    search: '',
  }

  currentPage.value = 1
  renderSearchComp.value++
  fetchData()
}

</script>
