<template>
  <div class="">

    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <ProductSearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />

      <div class="flex gap-2 max-md:w-full">
        <AlertDialog
            button-name="Инициализировать порядок"
            button-variant="outline"
            title="Инициализировать порядок товаров?"
            :description="initializeDescription"
            :disabled-button="isInitializing"
            @continue="handleInitializeOrders"
        />
      </div>

    </div>
    <Loader v-if="isLoading"/>
    <div v-else>

      <ProductListTable
          :key="renderTable"
          :items="data"
          @deleted="fetchData()"
          @updated="fetchData()"
      />

      <div class="flex items-center justify-end space-x-2 py-4">
        <PaginationTable
            :total="totalItems"
            :default-page="currentPage"
            :items-per-page="itemsPerPage"
            :sibling-count="1"
            :show-edges="true"
            :show-per-page-option="true"
            @items-per-page-change="itemsPerPage = $event;"
            @current-page="currentPage = $event; fetchData()"
        />
      </div>


    </div>

  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import ProductSearch from "@/components/products/list/online/ProductSearch.vue";
import ProductListTable from "@/components/products/list/online/ProductListTable.vue";
import {useProductFunctions} from "@/composables/useProductFunctions";
import {useProductOrderFunctions} from "@/composables/useProductOrderFunctions";
import AlertDialog from "@/components/dynamics/AlertDialog.vue";

const data = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);
const isLoading = ref(true)
const isInitializing = ref(false)

const renderTable = ref(1)


const initializeDescription = computed(() =>
    `Это инициализирует поле "порядок отображения" для всех активных товаров.\n\n` +
    `Товары будут отсортированы по дате создания и получат порядки 1, 2, 3...\n\n` +
    `⚠️ Это действие выполняется только один раз!`
)


const paramsSearch = ref({
  search: '',
})

const {getProducts} = useProductFunctions()

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  isLoading.value = true
  data.value = await getProducts({
    per_page: itemsPerPage.value,
    page: currentPage.value,
    paginate: true,
    admin: true,
    search: paramsSearch.value.search,
    is_active: 1,
    sort_by: 'display_order',
    sort_order: 'asc',
  })
      .then(res => {
        totalItems.value = res.meta.total;
        return res.data;
      })


  isLoading.value = false
  renderTable.value++
}


const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData()
}


const {initializeOrders} = useProductOrderFunctions()

const handleInitializeOrders = async () => {
  isInitializing.value = true

  try {
    const result = await initializeOrders()

    if (result?.success) {
      await fetchData()

    }
  } catch (error) {
  } finally {
    isInitializing.value = false
  }
}

</script>
