<template>
  <div class="flex justify-between mb-2 md:space-x-4 max-md:flex-col">


    <div class="w-full  flex md:space-x-2 max-md:space-y-2 max-md:flex-col">
      <OrderSearch
          :key="renderSearchComp"
          :filter="searchParams"
          @search="handleSearch"
      />

      <div class="flex gap-2">
        <router-link to="/order/create">
          <Button variant="outline" size="icon">
            <Plus/>
          </Button>
        </router-link>

        <!-- Добавляем кнопку экспорта -->
        <OrdersExport />

        <Button
            v-if="hasActiveFilters"
            variant="outline"
            @click="resetFilters"
        >
          <X/>
        </Button>
      </div>

    </div>
  </div>

  <OrderListTable
      :loading="sending"
      :items="orders"
      :pagination="pagination"
      @deleted="fetchData()"
  />

</template>

<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue';
import {useRoute} from "vue-router";
import Order from "@/models/order/Order"
import OrderListTable from "@/components/orders/list/OrderListTable.vue";
import {useOrderFunctions} from "@/composables/useOrderFunctions";
import OrderSearch from "@/components/orders/list/OrderSearch.vue";
import OrdersExport from "@/components/orders/Export.vue";
import Button from "@/components/ui/button/Button.vue";
import {Plus, X} from "lucide-vue-next"
import {useStore} from "vuex";
import {PaginationMeta} from "@/types/Types";

const store = useStore();
const route = useRoute()


const searchParams = ref({
  datePicker: {
    start: '',
    end: ''
  },
  search: '',
  status: '',
  payment_status: ''
})

const orders = ref<Order[]>([])

const renderSearchComp = ref(1)
const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 15,
  total: 0,
})

const hasActiveFilters = computed(() => {
  return !!searchParams.value.search || !!searchParams.value.datePicker.start || !!searchParams.value.datePicker.end || !!searchParams.value.status
})

onMounted(async () => {
  await fetchData()
  await store.dispatch('notifications/markOrdersChecked');
})

const {getOrders, sending} = useOrderFunctions()


async function fetchData() {

  const status = route.query?.status ? `${route.query?.status}` : searchParams.value.status ? searchParams.value.status : ''

  const result = await getOrders({
    status: status,
    paginate: true,
    page: pagination.value.page,
    per_page: pagination.value.per_page,
    search: searchParams.value.search,
    date_from: searchParams.value.datePicker.start,
    date_to: searchParams.value.datePicker.end,
    payment_status: searchParams.value.payment_status
  })

  orders.value = result?.orders ?? []
  pagination.value.total = result?.meta.total ?? 0
}


const handleSearch = () => {
  fetchData()
}


function resetFilters() {
  searchParams.value = {
    datePicker: {
      start: '',
      end: ''
    },
    search: '',
    status: '',
  }

  pagination.value.page = 1
  renderSearchComp.value++
  fetchData()
}


watch(
    () => [pagination.value.page, pagination.value.per_page],
    () => fetchData()
)

</script>
