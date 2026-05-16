<template>
  <Loader v-if="isLoading" />
  <div v-else>
    <div class="md:flex justify-between md:mb-2">
      <BackButton title="Параметры товаров" />
      <AddProductParam
          class="max-md:my-2"
          @submit="fetchData()"
      />
    </div>
    <ProductParamsTable
        :params="productParams"
        @deleted="deleteParam($event)"
        @updated="fetchData"
        :key="productParams.length"
    />
    <div class="mt-2 flex justify-end">
      <PaginationTable
          :items-per-page="itemsPerPage"
          :total="totalItems"
          :default-page="currentPage"
          @current-page="
            currentPage = $event;
            fetchData();
          "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import BackButton from "@/components/BackButton.vue";
import ProductParamsTable from "@/components/settings/product_params//Table.vue";
import AddProductParam from "@/components/settings/product_params/Add/Index.vue";
import { ProductParam } from "@/models/ProductParam";

const productParams = ref<ProductParam[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(15);

const deleteParam = (param: ProductParam) => {
  productParams.value = productParams.value.filter(
      (item) => item.id !== param.id
  );
};

async function fetchData() {
  isLoading.value = true;

  try {
    const response = await axios.get(
        `/product-params?page=${currentPage.value}&per_page=${itemsPerPage.value}`
    );

    if (response.data?.params) {
      productParams.value = response.data.params.data.map((item: any) =>
          ProductParam.fromJSON(item)
      );
      totalItems.value = response.data.params.total;
    }
  } catch (error) {
    console.error("Error fetching product params:", error);
    productParams.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>