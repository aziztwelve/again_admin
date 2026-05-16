<!-- components/products/reviews/tab/ReviewsList.vue -->
<script setup lang="ts">
import {ref, onMounted, watch} from "vue";
import axios from "axios";
import {toast} from "vue-sonner";
import ReviewsTable from "@/components/products/reviews/ReviewsTable.vue";
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import {Review} from "@/models/Review";

const props = defineProps<{
  tab: string;
  searchQuery?: string;
}>();

const reviewsData = ref([]);
const isLoading = ref(true);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(15);

async function fetchData() {
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: itemsPerPage.value,
      search: props.searchQuery || undefined,
      // Tab-specific filters
      published: props.tab === 'unpublished' ? false : undefined,
      manager_replied: props.tab === 'unanswered' ? false : undefined,
      spam: props.tab === 'spam' ? true : undefined,
      admin: true
    };

    const res = await axios.get('/reviews', {params});

    reviewsData.value = res.data.data.map((item: any) => Review.fromJSON(item));
    totalItems.value = res.data.total || 0;
  } catch (e: unknown) {
    handleError(e);
  } finally {
    isLoading.value = false;
  }
}

function handleError(e: unknown) {
  if (axios.isAxiosError(e) && e.response) {
    toast.error(e.response.data?.message || "Ошибка при получении отзывов");
  } else {
    toast.error("Неизвестная ошибка");
  }
}

// Page change handler
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await fetchData();
};

// Watch for tab changes
watch(() => props.tab, () => {
  currentPage.value = 1;
  fetchData();
});

// Initial fetch
onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div>
    <Loader v-if="isLoading"/>
    <ReviewsTable v-else :reviews="reviewsData" @refresh="fetchData()"/>
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