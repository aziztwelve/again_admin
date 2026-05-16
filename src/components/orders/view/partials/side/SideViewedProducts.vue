<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Просмотренные товары</h3>
    <ul v-if="products.length" class="mt-3 space-y-2 text-sm">
      <li v-for="product in products" :key="product.id" class="text-gray-900">
        {{ product.name }}
      </li>
    </ul>
    <p v-else class="mt-2 text-sm text-gray-500">Нет данных</p>
  </section>
</template>

<script setup>
defineProps({
  products: { type: Array, default: () => [] },
});
</script>
