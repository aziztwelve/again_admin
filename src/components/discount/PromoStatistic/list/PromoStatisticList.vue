<template>
  <div>
    <div class="space-y-2 mb-2">
      <div class="flex flex-col">
        <div>
        <span class="">
          Промокод:
        </span>
          <span class="text-blue-500 font-medium">
          {{ promo.code ?? '' }}
        </span>
        </div>
        <div>

        <span class="">
          Использован:
        </span>
          <span class="font-medium text-blue-500">
          {{ promo.timesUsed ?? 0 }}
        </span>
        </div>
      </div>

      <PromoStatisticSearch
          :filter="searchParams"
          @search="fetchData()"
      />

    </div>
    <Loader v-if="isLoading"/>
    <promo-statistic-table
        v-else
        :key="renderTable"
        :items="promoCodeStatistic"
        :pagination="pagination"
        :show-total="showTotal"
        @deleted="fetchData()"
        @pagination-change="fetchData()"
    />

  </div>

</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import Loader from "@/components/common/Loader.vue";
import DynamicTitle from "@/components/dynamics/DynamicTitle.vue";
import {useStore} from "vuex";
import PromoStatisticTable from "@/components/discount/PromoStatistic/list/PromoStatisticTable.vue";
import {usePromoCodeUsage} from "@/composables/usePromoCodeUsage";
import {PromoCode} from "@/models/PromoCode";
import PromoStatisticSearch from "@/components/discount/PromoStatistic/list/PromoStatisticSearch.vue";

const store = useStore();
const promo: PromoCode = store.getters['tabs/getDynamicData']('promoStatistic');

const searchParams = ref({
  datePicker: {
    start: '',
    end: ''
  },
  payment_status: '',
  order_status: '',
  client_email: '',
})

const showTotal = ref({
  title: 'Итого:',
  total: 0,
  original_total: 0,
})
const pagination = ref({
  page: 1,
  per_page: 15,
  total: 0,
})

const renderTable = ref(1)
const isLoading = ref(true)
const promoCodeStatistic = ref<any[]>([])

onMounted(async () => {
  await fetchData()
  await store.dispatch('notifications/markOrdersChecked');

})

const {getPromoCodeUsageDetails} = usePromoCodeUsage()

async function fetchData() {

  isLoading.value = true

  let params = {
    per_page: pagination.value.per_page ?? 15,
    page: pagination.value.page ?? 1,
    promoCodeId: promo.id!,
    date_from: '',
    date_to: '',
    order_status: '',
    payment_status: '',
  }

  Object.keys(searchParams.value)
      .forEach((key) => {
        if (key === 'datePicker') {
          params.date_from = searchParams.value[key]?.start || ''
          params.date_to = searchParams.value[key].end || ''
        } else {
          params[key] = searchParams.value[key] || ''
        }
      })


  await getPromoCodeUsageDetails(params)
      .then(res => {
        promoCodeStatistic.value = res?.data ?? []

        pagination.value.page = res?.meta?.page ?? 1
        pagination.value.total = res?.meta.total ?? 0

        showTotal.value.total = res?.summary.total_salse ?? 0
        showTotal.value.original_total = res?.summary.total_salse ?? 0
      })

  isLoading.value = false
  renderTable.value++
}


</script>
