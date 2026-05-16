<template>
  <Loader v-if="isLoading"/>
  <div v-else class="">


    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <PromoSearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />

      <PromoCodeClientAddModal
          :key="promoCodeClientAddModalRender"
          :client="props.client"
          :promoCodeClientIds="promoCodeClientIds"
          @created="handleCreated"
      />

    </div>

    <PromoCodeClientListTable
        :key="renderTable"
        :items="data ?? []"
        :client="props.client"
        @deleted="handleDeleted"
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
import PromoListTable from "@/components/discount/Promo/PromoListTable.vue";
import PromoAddModal from "@/components/discount/Promo/PromoAddModal.vue";
import PromoSearch from "@/components/discount/Promo/PromoSearch.vue";
import {usePromoCodeFunctions} from "@/composables/usePromoCodeFunctions";
import {PromoCode} from "@/models/PromoCode";
import {Client} from "@/models/client/Client";
import {usePromoCodeClientFunctions} from "@/composables/usePromoCodeClientFunctions";
import PromoCodeClientAddModal from "@/components/clients/Promo/PromoCodeClientAddModal.vue";
import {PromoCodeClient} from "@/models/PromoCodeClient";
import PromoCodeClientListTable from "@/components/clients/Promo/PromoCodeClientListTable.vue";

const data = ref<PromoCodeClient[]>();
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(20);
const isLoading = ref(true)
const renderTable = ref(1)
const promoCodeClientAddModalRender = ref(1)


const props = defineProps({
  client: Client
})

const promoCodeClientIds = ref()

const paramsSearch = ref({
  search: '',
})

const {getPromoCodeClients} = usePromoCodeClientFunctions()

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  isLoading.value = true

  data.value = await getPromoCodeClients({
    per_page: itemsPerPage.value,
    page: currentPage.value,
    promo_code: paramsSearch.value.search,
    client_id: props.client?.id
  })
      .then(res => {
        totalItems.value = res?.meta?.total ?? 1
        promoCodeClientIds.value = res?.data?.map((item: PromoCodeClient) => item.promoCode?.id)
        return res?.data
      })

  isLoading.value = false
  renderTable.value++
}


const handleCreated = (item: PromoCodeClient) => {
  if (item.id) {
    data.value?.push(item)
    renderTable.value++
  }
}
const handleDeleted = (item: PromoCodeClient) => {
  if (item.id) {

    data.value = data.value?.filter(i => i.id !== item.id)
    renderTable.value++

    promoCodeClientIds.value = promoCodeClientIds.value.filter((id: any) => id !== item.promoCode?.id)
    promoCodeClientAddModalRender.value++
  }
}

const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData()
}

</script>
