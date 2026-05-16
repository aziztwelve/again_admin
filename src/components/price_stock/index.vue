<template>
  <div class="">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">Цены и остатки</h2>
    <div class="flex-1">
      <Tabs v-model="currentTabValue" class="w-full">
        <TabsList class="grid w-full grid-cols-3 bg-gray-100 rounded-md p-0.5 gap-0.5">
          <TabsTrigger
              value="all"
              class="data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-primary py-1 px-2 rounded-sm text-sm"
          >
            <span class="flex items-center gap-1 justify-center">
              <ListIcon class="h-3 w-3"/>
              Все
            </span>
          </TabsTrigger>
          <TabsTrigger
              value="price"
              class="data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-primary py-1 px-2 rounded-sm text-sm"
          >
            <span class="flex items-center gap-1 justify-center">
              <TagsIcon class="h-3 w-3"/>
              Цены
            </span>
          </TabsTrigger>
          <TabsTrigger
              value="stock"
              class="data-[state=active]:bg-white data-[state=active]:shadow-xs data-[state=active]:text-primary py-1 px-2 rounded-sm text-sm"
          >
            <span class="flex items-center gap-1 justify-center">
              <PackageIcon class="h-3 w-3"/>
              Остатки
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" class="mt-2">
          <List :tab="currentTabValue"/>
        </TabsContent>

        <TabsContent value="price" class="mt-2">
          <div class="border border-gray-200 rounded-md p-2 space-y-2 bg-white">
            <List :tab="currentTabValue"/>
          </div>
        </TabsContent>

        <TabsContent value="stock" class="mt-2">
          <div class="border border-gray-200 rounded-md p-2 space-y-2 bg-white">
            <List :tab="currentTabValue"/>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ref} from "vue";
import {ListIcon, TagsIcon, PackageIcon} from "lucide-vue-next";
import List from "@/components/price_stock/products/List.vue";

const currentTabValue = ref('all');
</script>

<style scoped>

</style>