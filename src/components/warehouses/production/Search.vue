<template>
  <DynamicsFilter
      :columns="filterColumns"
      :filter="filter"
      @search="emits('search')"
  />
</template>

<script setup>
const props = defineProps({
  filter: Object,
});
const emits = defineEmits(["search"]);

const filterColumns = ref([
  {
    type: "text",
    placeholder: "Поиск...",
    field: "search",
  },
]);
</script>

<style scoped></style>
