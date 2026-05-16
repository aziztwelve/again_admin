<template>
  <div class="">

    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <DiscountSearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />

      <DiscountAddModal
          :key="renderCreated"
          @created="fetchData(); renderCreated++"
      />

    </div>

    <Loader v-if="isLoading"/>
    <DiscountListTable
        v-else
        :key="renderTable"
        :items="data ?? []"
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
        @current-page="currentPage = $event; fetchData()"
    />

  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import DiscountSearch from "@/components/discount/DiscountSearch.vue";
import DiscountAddModal from "@/components/discount/DiscountAddModal.vue";
import DiscountListTable from "@/components/discount/DiscountListTable.vue";
import {useDiscountFunctions} from "@/composables/useDiscountFunctions";
import {Discount} from "@/models/Discount";

const data = ref<Discount[]>();
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);
const isLoading = ref(true)
const renderTable = ref(1)
const renderCreated = ref(1)


const paramsSearch = ref({
  search: '',
})

const {getDiscounts} = useDiscountFunctions()

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  isLoading.value = true
  data.value = await getDiscounts({
    per_page: itemsPerPage.value,
    page: currentPage.value,
    paginate: true,
    name: paramsSearch.value.search,
  })
      .then(res => {
        totalItems.value = res?.meta.total ?? 1
        return res?.data
      })

  isLoading.value = false
  renderTable.value++
}


function handleDeleted(discount: Discount) {
  data.value = data.value?.filter(d => d.id !== discount.id)
  renderTable.value++
}


const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData()
}

</script>
