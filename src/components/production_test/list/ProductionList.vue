<template>
  <div class="container mx-auto mt-4">
    <div class="flex justify-between items-center flex-wrap my-4">
      <h1 class="text-2xl font-bold text-gray-800">Производственные задания</h1>
      <RouterLink to="/warehouses/production/create">
        <Button  size="sm" class="mt-2">
          <Plus class="h-4 w-4 mr-2"/>
          Создать задание
        </Button>
      </RouterLink>
    </div>

    <div>
      <ProductionTable/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button"
import {Plus} from 'lucide-vue-next'

import {Card} from "@/components/ui/card"
import TableRecipes from "@/components/warehouses/recipes/partials/TableRecipes.vue"
import {PlusIcon} from "lucide-vue-next"
import ProductionTable from "@/components/warehouses/production/partials/ProductionTable.vue";
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>