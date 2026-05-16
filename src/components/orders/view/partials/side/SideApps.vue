<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Приложения</h3>
    <ul class="mt-3 space-y-2 text-sm">
      <li v-for="app in apps" :key="app.label">
        <a class="text-blue-600 hover:underline" href="#">{{ app.label }}</a>
      </li>
    </ul>
  </section>
</template>

<script setup>
defineProps({
  order: { type: Object, required: true },
});

const apps = [
  { label: "СДЭК" },
  { label: "Яндекс.Доставка" },
  { label: "МойСклад" },
];
</script>
