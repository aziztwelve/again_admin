<template>
  <div class="mx-auto py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl text-gray-800">Техкарты</h1>
      <RouterLink to="/warehouses/recipes/create">
        <Button class="gap-2">
          <PlusIcon class="h-4 w-4" />
          Создать
        </Button>
      </RouterLink>
    </div>

    <div>
      <TableRecipes />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button"
import TableRecipes from "@/components/warehouses/recipes/partials/TableRecipes.vue"
import { PlusIcon } from "lucide-vue-next"
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>