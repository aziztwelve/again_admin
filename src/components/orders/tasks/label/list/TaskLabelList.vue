<template>
  <div class="flex justify-between mb-2 md:space-x-4 max-md:flex-col">

    <div class="md:max-w-[400px] w-full md:flex md:space-x-2">
      <TaskLabelListSearch
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

    <TaskLabelAddModal
        @created="fetchData()"
    />
  </div>

  <Loader v-if="isLoading"/>
  <TaskLabelListTable
      v-else
      :key="renderTable"
      :items="taskLabels"
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
import {X} from "lucide-vue-next";

import TaskLabelListSearch from "@/components/orders/tasks/label/list/TaskLabelListSearch.vue";
import TaskLabelAddModal from "@/components/orders/tasks/label/TaskLabelAddModal.vue";
import TaskLabelListTable from "@/components/orders/tasks/label/list/TaskLabelListTable.vue";

import {useTaskLabelFunctions} from "@/composables/useTaskLabelFunctions";
import TaskLabel from "@/models/TaskLabel";

const searchParams = ref({
  search: '',
});

const hasActiveFilters = computed(() => {
  return !!searchParams.value.search;
});

const renderTable = ref(1);
const renderSearchComp = ref(1);

const isLoading = ref(true);
const taskLabels = ref<TaskLabel[]>([]);

const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);

onMounted(async () => {
  await fetchData();
});

const {getTaskLabels} = useTaskLabelFunctions();

async function fetchData() {
  isLoading.value = true;

  await getTaskLabels(searchParams.value)
      .then(res => {
        taskLabels.value = res?.labels ?? [];
      })
      .finally(() => {
        isLoading.value = false;
        renderTable.value++;
      });
}

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

function resetFilters() {
  searchParams.value = {search: ''};
  currentPage.value = 1;
  renderSearchComp.value++;
  fetchData();
}
</script>

<style scoped></style>
