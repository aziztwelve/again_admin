<!-- components/products/reviews/tab/SpamReviews.vue -->
<script setup lang="ts">
import ReviewsList from "./ReviewsList.vue";

defineProps<{
  tab: string;
  searchQuery?: string;
}>();
</script>

<template>
  <ReviewsList :tab="tab" :search-query="searchQuery"/>
</template>