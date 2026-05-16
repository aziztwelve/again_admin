<template>
  <div class="flex items-center mb-4">
    <div class="flex justify-between space-x-2 w-full">
      <div class="flex space-x-2 w-full">
        <Input
            class="max-w-sm"
            placeholder="Поиск..."
            v-model="searchProduct"
        />
        <Button @click="handleSearch">Найти</Button>
      </div>

      <div class="flex space-x-2">
        <Button variant="outline" @click="handleExport">
          Экспорт
        </Button>
        <Button variant="outline" @click="handleImport">
          Импорт
        </Button>
      </div>
    </div>
  </div>

  <all-reviews/>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {onMounted, ref} from "vue";
import AllReviews from "@/components/products/reviews/tab/AllReviews.vue";

const searchProduct = ref('')
const isLoading = ref(true)


const handleSearch = () => {
  // Логика поиска
  console.log('Поиск:', searchProduct.value)
}

const handleExport = () => {
  // Логика экспорта данных
  console.log('Экспорт данных')
}

const handleImport = () => {
  // Логика импорта данных
  console.log('Импорт данных')
}

</script>