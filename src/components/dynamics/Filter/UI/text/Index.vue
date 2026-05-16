<template>
  <Input
      type="text"
      :placeholder="column.placeholder"
      v-model="filter[column.field]"
  />
</template>

<script setup>
import {Input} from "@/components/ui/input";


const props = defineProps({
  column: Object,
  filter: Object,
});
</script>

<style scoped></style>
