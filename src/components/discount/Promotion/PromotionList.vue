<template>
  <div class="">
    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <PromotionSearch
        class="md:w-[400px]"
        :filter="paramsSearch"
        @search="handleSearch"
      />

      <PromotionAddModal
        :key="renderCreated"
        @created="
          fetchData();
          renderCreated++;
        "
      />
    </div>

    <Loader v-if="isLoading" />
    <div
      v-else-if="!data || data.length === 0"
      class="text-center py-8 text-gray-500"
    >
      Акции не найдены. Создайте первую акцию!
    </div>
    <PromotionListTable
      v-else
      :key="renderTable"
      :items="data"
      @deleted="handleDeleted"
      @updated="fetchData()"
    />

    <PaginationTable
      class="flex justify-end w-full"
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
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import PromotionSearch from "@/components/discount/Promotion/PromotionSearch.vue";
import PromotionAddModal from "@/components/discount/Promotion/PromotionAddModal.vue";
import PromotionListTable from "@/components/discount/Promotion/PromotionListTable.vue";
import { Promotion } from "@/models/Promotion";
import { usePromotionFunctions } from "@/composables/usePromotionFunctions";

const data = ref<Promotion[]>();
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);
const isLoading = ref(true);
const renderTable = ref(1);
const renderCreated = ref(1);

const paramsSearch = ref({
  search: "",
});

const { getPromotions } = usePromotionFunctions();

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  isLoading.value = true;
  const result = await getPromotions({
    per_page: itemsPerPage.value,
    page: currentPage.value,
    paginate: true,
    name: paramsSearch.value.search,
  });

  if (result) {
    data.value = result.data || [];
    totalItems.value = result.meta?.total ?? 0;
  } else {
    data.value = [];
    totalItems.value = 0;
  }

  isLoading.value = false;
  renderTable.value++;
}

function handleDeleted(promotion: Promotion) {
  data.value = data.value?.filter((d) => d.id !== promotion.id);
  renderTable.value++;
}

const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData();
};
</script>
