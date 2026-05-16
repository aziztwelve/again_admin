<script setup lang="ts">

import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";

const props = defineProps({
  column: {
    type: Object,
    required: true,
  },
  filter: {
    type: Object,
    required: true,
  },
});

</script>

<template>
  <div class="flex items-center space-x-2">
    <Checkbox :id="filter[column.field] ?? 1" v-model="filter[column.field]"/>
    <label
        v-if="column?.label"
        for="terms"
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ column.label }}
    </label>
  </div>
</template>

<style scoped>

</style>