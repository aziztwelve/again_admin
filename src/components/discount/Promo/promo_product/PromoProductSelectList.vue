<template>
  <div>
    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <PromoProductSearch
        class="md:w-[400px]"
        :filter="paramsSearch"
        @search="handleSearch"
      />
    </div>

    <Loader v-if="isLoading" />
    <PromoProductSelectTable
      v-else
      :key="renderTable"
      :items="data"
      :selected-list="selectedList"
      @add-products="emits('addProducts', $event)"
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
import PromoProductSelectTable from "@/components/discount/Promo/promo_product/PromoProductSelectTable.vue";
import PromoProductSearch from "@/components/discount/Promo/promo_product/PromoProductSearch.vue";
import { useProductFunctions } from "@/composables/useProductFunctions";
import { Product } from "@/models/Product";

const emits = defineEmits(["addProducts"]);

const props = defineProps({
  selectedList: {
    type: Array as PropType<Product[]>,
    default: () => [],
  },
});

const data = ref<Product[]>([]);
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
</script>

<style scoped></style>
