<template>
  <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
    <h3 class="text-sm font-semibold text-gray-900">Источник</h3>
    <dl class="mt-3 space-y-2 text-sm">
      <div v-for="(value, key) in entries" :key="key">
        <dt class="text-xs uppercase text-gray-500">{{ key }}</dt>
        <dd class="break-all text-gray-900">{{ value || "—" }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  source: { type: Object, default: () => ({}) },
});

const entries = computed(() => ({
  utm_source: props.source?.utm_source,
  utm_medium: props.source?.utm_medium,
  utm_campaign: props.source?.utm_campaign,
  utm_content: props.source?.utm_content,
  utm_term: props.source?.utm_term,
  ip_address: props.source?.ip_address,
}));
</script>
