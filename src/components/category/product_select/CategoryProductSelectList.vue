<template>
  <div>
    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <CategoryProductSearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />
    </div>

    <Loader v-if="isLoading"/>
    <CategoryProductSelectTable
        v-else
        :key="renderTable"
        :items="data"
        :selected-ids="selectedIds"
        @update:selected-ids="emits('update:selectedIds', $event)"
        @done="emits('done')"
    />

    <div class="flex items-center justify-end space-x-2 py-1">
      <PaginationTable
          :total="totalItems"
          :default-page="currentPage"
          :items-per-page="itemsPerPage"
          :sibling-count="1"
          :show-edges="true"
          @current-page="currentPage = $event; fetchData()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, PropType, ref} from "vue";
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import CategoryProductSearch from "@/components/category/product_select/CategoryProductSearch.vue";
import CategoryProductSelectTable from "@/components/category/product_select/CategoryProductSelectTable.vue";
import {useProductFunctions} from "@/composables/useProductFunctions";
import {Product} from "@/models/Product";

defineProps({
  selectedIds: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});

const emits = defineEmits<{
  (e: "update:selectedIds", ids: number[]): void;
  (e: "done"): void;
}>();

const data = ref<Product[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);
const isLoading = ref(true);
const renderTable = ref(1);

const paramsSearch = ref({
  search: "",
});

const {getProducts} = useProductFunctions();

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  isLoading.value = true;

  const result = await getProducts({
    per_page: itemsPerPage.value,
    page: currentPage.value,
    paginate: true,
    admin: true,
    search: paramsSearch.value.search,
    is_active: 1,
    sort_by: "display_order",
    sort_order: "asc",
  });

  data.value = result?.data?.map((item: any) => Product.fromJSON(item)) ?? [];
  totalItems.value = result?.meta?.total ?? 0;

  isLoading.value = false;
  renderTable.value++;
}

const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData();
};
</script>
