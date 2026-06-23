<template>
  <div>
    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <div class="md:flex md:space-x-2 max-md:space-y-2 md:w-[400px] max-md:w-full">
        <DynamicsFilter
          class="w-full"
          :columns="filterColumns"
          :filter="paramsSearch"
          @search="handleSearch"
        />
        <Button
          v-if="paramsSearch.search"
          variant="outline"
          @click="paramsSearch.search = ''"
        >
          <X />
        </Button>
      </div>
    </div>

    <Loader v-if="isLoading" />
    <OrderProductPickerTable
      v-else
      :key="renderTable"
      :items="data"
      @select="emits('select', $event)"
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

<script setup>
import { ref, onMounted, watch } from "vue";
import { X } from "lucide-vue-next";
import { useDebounceFn } from "@vueuse/core";
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import { Button } from "@/components/ui/button";
import DynamicsFilter from "@/components/dynamics/Filter/Index.vue";
import OrderProductPickerTable from "@/components/orders/modals/order_product_picker/OrderProductPickerTable.vue";
import { useProductFunctions } from "@/composables/useProductFunctions";

const emits = defineEmits(["select"]);

const data = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);
const isLoading = ref(true);
const renderTable = ref(1);

const paramsSearch = ref({
  search: "",
});

const filterColumns = ref([
  {
    type: "text",
    placeholder: "Поиск товаров...",
    field: "search",
  },
]);

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
    withVariants: true,
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

const debouncedSearch = useDebounceFn(handleSearch, 400);

watch(
  () => paramsSearch.value.search,
  () => {
    debouncedSearch();
  },
);
</script>

<style scoped></style>
