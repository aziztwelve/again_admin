<template>
  <div class="rounded-md border border-gray-200 flex items-center">
    <div class="text-gray-700 text-sm p-2">
      <span class="font-medium">{{ title }}</span>
      <span class="text-blue-600 font-semibold ml-1">{{ usePriceFormatter().formatPrice(props.total) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">

import {usePriceFormatter} from "@/composables/usePriceFormatter";

const props = defineProps({
  title: String,
  total: String | Number
})

</script>

<style scoped>

</style>
