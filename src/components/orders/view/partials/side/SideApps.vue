<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Приложения</h3>
    <ul class="mt-3 space-y-2 text-sm">
      <li>
        <router-link
          class="text-blue-600 hover:underline"
          :to="`/order/${order.id}/cdek`"
          title="Карточка заявки СДЭК по этому заказу"
        >СДЭК</router-link>
      </li>
      <li v-for="app in otherApps" :key="app.label">
        <a class="text-blue-600 hover:underline" href="#">{{ app.label }}</a>
      </li>
    </ul>
  </section>
</template>

<script setup>
defineProps({
  order: { type: Object, required: true },
});

const otherApps = [
  { label: "Яндекс.Доставка" },
  { label: "МойСклад" },
  { label: "Почта России" },
];
</script>
