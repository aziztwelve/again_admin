<template>
  <div>
    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <TriggerProductSearch
        class="md:w-[400px]"
        :filter="paramsSearch"
        @search="handleSearch"
      />
    </div>

    <Loader v-if="isLoading" />
    <TriggerProductListTable
      v-else
      :key="renderTable"
      :items="data"
      :selected-list="selectedList"
      @add-to-select-list="emits('addToSelectList', $event)"
    />

    <div class="flex items-center justify-end space-x-2 py-1">
      <PaginationTable
        :total="totalItems"
        :default-page="currentPage"
        :items-per-page="itemsPerPage"
        :sibling-count="1"
        :show-edges="true"
        @current-page="
          currentPage = $event;
          fetchData();
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, PropType } from "vue";
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import TriggerProductListTable from "@/components/discount/Promotion/trigger_product/TriggerProductListTable.vue";
import TriggerProductSearch from "@/components/discount/Promotion/trigger_product/TriggerProductSearch.vue";
import { useProductFunctions } from "@/composables/useProductFunctions";

const emits = defineEmits(["addToSelectList"]);

const props = defineProps({
  selectedList: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});

const data = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);
const isLoading = ref(true);
const renderTable = ref(1);

const paramsSearch = ref({
  search: "",
});

const { getProductsSimple } = useProductFunctions();

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  isLoading.value = true;
  const result = await getProductsSimple({
    per_page: itemsPerPage.value,
    page: currentPage.value,
    search: paramsSearch.value.search,
  });

  if (result && result.data) {
    data.value = result.data;
    totalItems.value = result.meta?.total || 0;
  } else {
    data.value = [];
    totalItems.value = 0;
  }

  isLoading.value = false;
  renderTable.value++;
}

const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData();
};
</script>

<style scoped></style>
