<template>
  <div class="flex items-center mb-4">
    <div class="flex justify-between  w-full max-md:flex-wrap">
      <div class="flex space-x-2 w-full">
        <Input
            class="max-w-sm"
            placeholder="Поиск по отзыву и товару..."
            v-model="searchQuery"
            @keyup.enter="handleSearch"
        />
        <Button @click="handleSearch">Найти</Button>
        <Button
            v-if="searchQuery"
            variant="outline"
            @click="clearSearch"
        >
          <X/>
        </Button>
      </div>

    </div>
  </div>

  <Loader v-if="isLoading"/>
  <div v-else>
    <div class="w-full">
      <ReviewsTable
          :reviews="reviewsData"
          @refresh="fetchData()"
      />
    </div>
    <div class="flex items-center justify-end space-x-2 py-4">
      <div class="space-x-2">
        <PaginationTable
            :total="totalItems"
            :default-page="currentPage"
            :items-per-page="itemsPerPage"
            :sibling-count="1"
            :show-edges="true"
            @current-page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from "vue";
import axios from "axios";
import {toast} from "vue-sonner";

import Loader from "@/components/common/Loader.vue";
import ReviewsTable from "@/components/products/reviews/ReviewsTable.vue";
import PaginationTable from "@/components/PaginationTable.vue";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Review} from "@/models/Review";
import {X} from "lucide-vue-next"
import {useDebounceFn} from "@vueuse/core";
import {useStore} from "vuex";


const store = useStore();

const searchQuery = ref('');
const reviewsData = ref([]);
const isLoading = ref(true);

const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);


const debounce = useDebounceFn(() => {
  fetchData()
}, 500)


watch(
    () => searchQuery.value,
    () => {
      debounce()
    }
)


// Fetch on mount
onMounted(async () => {
  await fetchData();
  await store.dispatch('notifications/markReviewsChecked');
});

// Fetch reviews with pagination and search
async function fetchData() {
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: itemsPerPage.value,
      search: searchQuery.value || null,
      admin: true
    };

    const res = await axios.get('/reviews', {params});


    reviewsData.value = res.data.data.map((i: any) => Review.fromJSON(i)) || [];
    console.log(reviewsData.value);
    totalItems.value = res.data.total || 0;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response) {
      toast.error(e.response.data?.message || "Ошибка при получении отзывов");
    } else {
      toast.error("Неизвестная ошибка");
    }
  } finally {
    isLoading.value = false;
  }
}

// Page change handler
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await fetchData();
};

// Search handler
const handleSearch = async () => {
  currentPage.value = 1; // Reset to first page when searching
  await fetchData();
};

// Clear search
const clearSearch = async () => {
  searchQuery.value = '';
  currentPage.value = 1;
  await fetchData();
};


</script>

<style scoped>
/* Добавь стили при необходимости */
</style>