<template>
  <DynamicsFilter
      :columns="filterColumns"
      :filter="filter"
      @search="emits('search')"
  />

</template>

<script setup>
import {ref, watch} from 'vue';
import DynamicsFilter from '@/components/dynamics/Filter/Index.vue';
import {useDebounceFn} from "@vueuse/core";

const props = defineProps({
  filter: Object,
});

const emits = defineEmits(["search"]);

const filterColumns = ref([

  {
    type: "text",
    placeholder: "Название статуса",
    field: "search",
  },

]);


const emitSearch = useDebounceFn(() => {
  emits("search")
}, 500)

watch(
    () => props.filter.search,
    () => {
      emitSearch()
    }
)

</script>

<style scoped></style>
