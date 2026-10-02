<template>
  <div class="">

    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <PromoSearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />

      <PromoAddModal
          :key="renderCreated"
          @created="fetchData(); renderCreated++"
      />

    </div>

    <Loader v-if="isLoading"/>

    <div v-else>
      <PromoListTable
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


  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import PromoListTable from "@/components/discount/Promo/PromoListTable.vue";
import PromoAddModal from "@/components/discount/Promo/PromoAddModal.vue";
import PromoSearch from "@/components/discount/Promo/PromoSearch.vue";
import {usePromoCodeFunctions} from "@/composables/usePromoCodeFunctions";
import {PromoCode} from "@/models/PromoCode";

const data = ref<PromoCode[]>();
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);
const isLoading = ref(true)
const renderTable = ref(1)
const renderCreated = ref(1)


const paramsSearch = ref({
  search: '',
})

const {getPromoCodes} = usePromoCodeFunctions()

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  isLoading.value = true
  data.value = await getPromoCodes({
    per_page: itemsPerPage.value,
    page: currentPage.value,
    code: paramsSearch.value.search,
  })
      .then(res => {
        totalItems.value = res?.meta?.total ?? 1
        return res?.data
      })

  isLoading.value = false
  renderTable.value++
}


function handleDeleted(promoCode: PromoCode) {
  data.value = data.value?.filter(d => d.id !== promoCode.id)
  renderTable.value++
}


const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData()
}

</script>
