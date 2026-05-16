<template>
  <div class="">
    <div class="flex justify-between items-center my-2">
      <h2 class="text-lg font-semibold text-gray-800">Отзывы</h2>

      <!-- Добавляем кнопку экспорта -->
      <ReviewsExport />
    </div>

    <div class="flex-1">
      <Tabs v-model="currentTabValue" class="w-full">
        <TabsList class="flex justify-around bg-gray-100 rounded-md p-0.5 gap-0.5">
          <TabsTrigger value="all"
                       class="w-full data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-primary py-1 px-2 rounded-sm text-sm"
          >
            <span class="flex items-center gap-1 justify-center">Все</span>
          </TabsTrigger>
          <TabsTrigger value="unpublished"
                       class="w-full data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-primary py-1 px-2 rounded-sm text-sm"
          >
            <span class="flex items-center gap-1 justify-center">Не опубликован</span>
          </TabsTrigger>
          <TabsTrigger value="unanswered"
                       class="w-full data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-primary py-1 px-2 rounded-sm text-sm"
          >
            <span class="flex items-center gap-1 justify-center">Не отвечен</span>
          </TabsTrigger>
          <TabsTrigger value="spam"
                       class="w-full data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-primary py-1 px-2 rounded-sm text-sm"
          >
            <span class="flex items-center gap-1 justify-center">Спам</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" class="mt-2">
          <div class="border border-gray-200 rounded-md p-2 space-y-2 bg-white">
            <AllReviews :tab="currentTabValue" :search-query="searchQuery"/>
          </div>
        </TabsContent>

        <TabsContent value="unpublished" class="mt-2">
          <div class="border border-gray-200 rounded-md p-2 space-y-2 bg-white">
            <UnpublishedReviews :tab="currentTabValue" :search-query="searchQuery"/>
          </div>
        </TabsContent>

        <TabsContent value="unanswered" class="mt-2">
          <div class="border border-gray-200 rounded-md p-2 space-y-2 bg-white">
            <UnansweredReviews :tab="currentTabValue" :search-query="searchQuery"/>
          </div>
        </TabsContent>

        <TabsContent value="spam" class="mt-2">
          <div class="border border-gray-200 rounded-md p-2 space-y-2 bg-white">
            <SpamReviews :tab="currentTabValue" :search-query="searchQuery"/>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ref} from "vue";
import AllReviews from "@/components/products/reviews/tab/AllReviews.vue";
import UnpublishedReviews from "@/components/products/reviews/tab/UnpublishedReviews.vue";
import UnansweredReviews from "@/components/products/reviews/tab/UnansweredReviews.vue";
import SpamReviews from "@/components/products/reviews/tab/SpamReviews.vue";
import ReviewsExport from "@/components/products/reviews/Export.vue"; // Добавь импорт

const currentTabValue = ref('all');
const reviewsEnabled = ref(true);
const searchQuery = ref('');
</script>