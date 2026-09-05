<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Приложения</h3>
    <ul class="mt-3 space-y-2 text-sm">
      <li>
        <a
          v-if="cdekLink"
          class="text-blue-600 hover:underline"
          :href="cdekLink"
          target="_blank"
          rel="noopener noreferrer"
        >СДЭК</a>
        <span
          v-else
          class="cursor-default text-gray-400"
          title="Ссылка появится после создания заявки СДЭК"
        >СДЭК</span>
      </li>
      <li v-for="app in otherApps" :key="app.label">
        <a class="text-blue-600 hover:underline" href="#">{{ app.label }}</a>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  order: { type: Object, required: true },
});

const CDEK_APP_BASE = "https://insales.cdek.ru/order";
const CDEK_SHOP = "myshop-cgw22.myinsales.ru";
const CDEK_INSALES_ID = "5577456";
const CDEK_USER_ID = "5966772";

const cdekNumber = computed(
  () =>
    props.order?.cdek_order?.cdek_number
    || props.order?.cdekOrder?.cdek_number
    || props.order?.delivery_data?.cdek_number
    || null,
);

const cdekLink = computed(() =>
  cdekNumber.value
    ? `${CDEK_APP_BASE}/${cdekNumber.value}?shop=${CDEK_SHOP}&insales_id=${CDEK_INSALES_ID}&user_id=${CDEK_USER_ID}`
    : null,
);

const otherApps = [
  { label: "Яндекс.Доставка" },
  { label: "МойСклад" },
  { label: "Почта России" },
];
</script>
