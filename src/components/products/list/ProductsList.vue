<template>
  <div class="">

    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <ProductSearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />

      <div class="md:flex md:space-x-2">
        <Button @click="syncMoysklad" variant="secondary" class="max-md:w-full max-md:my-2">Синхронизировать с мой
          склад
        </Button>
        <router-link to="/products/create">
          <Button variant="outline" class="max-md:w-full">Добавить</Button>
        </router-link>
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
import {ref, onMounted} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import Button from "@/components/ui/button/Button.vue";
import ProductSearch from "@/components/products/list/ProductSearch.vue";
import ProductListTable from "@/components/products/list/ProductListTable.vue";
import {useProductFunctions} from "@/composables/useProductFunctions";
import {useMoySkladFunctions} from "@/composables/useMoySkladFunctions";

const data = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);
const isLoading = ref(true)
const renderTable = ref(1)


const paramsSearch = ref({
  search: '',
})

const {getProducts} = useProductFunctions()
const {productsSync} = useMoySkladFunctions()

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
    search: paramsSearch.value.search
  })
      .then(res => {
        totalItems.value = res.meta.total;
        return res.data;
      })


  isLoading.value = false
  renderTable.value++
}

async function syncMoysklad() {
  isLoading.value = true
  await productsSync({})
  isLoading.value = false
  renderTable.value++
}

const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData()
}

</script>
