<template>
  <!--  <div class="flex justify-between mb-2 max-md:flex-wrap">-->
  <!--    <div class="flex items-center gap-2 md:w-[500px]">-->
  <!--      <CityZoneCustomerSearch-->
  <!--          @search="handleSearchEvent"-->
  <!--          :filter="searchParams"-->
  <!--      />-->
  <!--      <Button-->
  <!--          v-if="showResetButton"-->
  <!--          variant="outline"-->
  <!--          size="sm"-->
  <!--          @click="resetFilters"-->
  <!--      >-->
  <!--        Сбросить фильтры-->
  <!--      </Button>-->
  <!--    </div>-->

  <!--  </div>-->

  <div>
    <Loader v-if="isLoading"/>
    <CityZoneDetailsTable
        v-else
        :key="renderTable"
        :data="cityZoneCustomers"
        @deleted="fetchData();"
        @updated="fetchData();"
    />
    <div v-show="!isLoading" class="w-full flex justify-end mt-1">
      <PaginationTable
          :total="totalItems"
          :default-page="currentPage"
          :items-per-page="itemsPerPage"
          :sibling-count="1"
          :show-edges="true"
          @current-page="page => { currentPage = page; fetchData(); }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, computed} from "vue";
import axios from "axios";
import {CityZoneCustomer} from "~/services/CityZoneCustomer";
import {toast} from "vue-sonner";

const config = useRuntimeConfig();

const props = defineProps({
  city_zone: {
    type: Object,
    default: null
  }
});

const isLoading = ref(true);
const renderTable = ref(1);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);

const searchParams = ref({
  search: '',
});

const cityZoneCustomers = ref<CityZoneCustomer[]>([]);

// Вычисляемое свойство для отображения кнопки сброса
const showResetButton = computed(() => {
  return searchParams.value.search || props.city_zone;
});

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  isLoading.value = true;
  try {
    let endpoint;

    if (searchParams.value.search) {
      // Если есть поисковый запрос
      endpoint = `${config.public.apiUrl}/api/city-zone-customer/name/${encodeURIComponent(searchParams.value.search)}`;
    } else if (props.city_zone) {
      // Если передан city_zone
      endpoint = `${config.public.apiUrl}/api/city-zone/customers/${props.city_zone.id}`;
    } else {
      // Общий endpoint для всех клиентов зон
      endpoint = `${config.public.apiUrl}/api/city-zone-customer`;
    }

    endpoint += `?page=${currentPage.value}&per_page=${itemsPerPage.value}`;

    const response = await axios.get(endpoint);
    totalItems.value = response.data.meta.count || cityZoneCustomers.value.length;

    if (!response.data.data?.length) {
      toast.error('Записи не найдены');
      cityZoneCustomers.value = [];
      return;
    }

    cityZoneCustomers.value = response.data.data.map((item: any) => CityZoneCustomer.fromJSON(item));

  } catch (error: any) {
    toast.error(error.message || 'Произошла ошибка при загрузке данных');
    cityZoneCustomers.value = [];
  } finally {
    isLoading.value = false;
    renderTable.value++;
  }
}

function handleSearchEvent() {
  currentPage.value = 1;
  fetchData();
}

function resetFilters() {
  searchParams.value.search = '';
  currentPage.value = 1;
  fetchData();
}
</script>
