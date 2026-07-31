<template>
  <Loader v-if="isLoading"/>
  <div v-else class="">

    <ProductSearch
        class="md:w-[400px] mb-2"
        :filter="paramsSearch"
        @search="handleSearch"
    />

    <ProductTableAll
        v-if="tab == 'all'"
        :key="renderTable"
        :items="data"
        @deleted="fetchData()"
    />

    <ProductTablePrice
        v-else-if="tab == 'price'"
        :key="renderTable + 1"
        :items="data"
        @deleted="fetchData()"
    />

    <ProductTableStock
        v-else-if="tab == 'stock'"
        :key="renderTable + 2"
        :items="data"
        @deleted="fetchData()"
    />

    <div class="flex items-center justify-end space-x-2 py-4">
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
import {ref, onMounted} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import ProductSearch from "@/components/products/list/ProductSearch.vue";
import {useProductFunctions} from "@/composables/useProductFunctions";
import ProductTableAll from "@/components/price_stock/tab/all_product/ProductTableAll.vue";
import {Product} from "@/models/Product";
import ProductTablePrice from "@/components/price_stock/tab/price_product/ProductTablePrice.vue";
import ProductTableStock from "@/components/price_stock/tab/stock_product/ProductTableStock.vue";


const props = defineProps({
  tab: {
    type: String,
    default: "all",
  }
})

const data = ref<Product[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);
const isLoading = ref(true)
const renderTable = ref(1)


const paramsSearch = ref({
  search: '',
})

const {getProducts} = useProductFunctions()

onMounted(async () => {
  await fetchData()
  console.log(data.value)
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
        const products = res.data.map((item: any) => Product.fromJSON(item));
        return products.flatMap(normalizePriceStockRows);
      })

  isLoading.value = false
  renderTable.value++
}

const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData()
}

const filled = (value: any) => value !== null && value !== undefined && value !== '';

function normalizePriceStockRows(product: Product): Product[] {
  if (!product.variants?.length) {
    return [product];
  }

  return product.variants.map((variant: Product) => {
    const row = Product.fromJSON({...variant, variants: []});

    row.product_id = product.id;
    row.name = [product.name, variant.name].filter(filled).join(' / ');
    row.cost_price = filled(variant.cost_price) ? variant.cost_price : product.cost_price;
    row.stock_quantity = filled(variant.stock_quantity) ? variant.stock_quantity : 0;
    row.price = filled(variant.price) ? variant.price : product.price;
    row.discount_percentage = filled(variant.discount_percentage) ? variant.discount_percentage : product.discount_percentage;
    row.old_price = filled(variant.old_price) ? variant.old_price : product.old_price;
    row.barcode = filled(variant.barcode) ? variant.barcode : product.barcode;
    row.variants = [];

    return row;
  });
}
</script>
