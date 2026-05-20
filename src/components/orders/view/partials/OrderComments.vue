<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Комментарий покупателя</h3>
    <p v-if="!order.notes" class="mt-2 text-sm text-gray-500">Нет комментариев</p>
    <p v-else class="mt-2 whitespace-pre-line text-sm text-gray-900">
      {{ order.notes }}
    </p>
  </section>
</template>

<script setup>
defineProps({
  order: { type: Object, required: true },
});
</script>
