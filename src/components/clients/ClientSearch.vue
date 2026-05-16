<template>
  <div class="md:flex md:space-x-2 max-md:space-y-2 max-md:w-full">
    <DynamicsFilter
        :key="renderFilter"
        :columns="filterColumns"
        :filter="filter"
        @search="emits('search')"
    />
    <Button
        v-if="hasActiveFilters"
        variant="outline"
        @click="clearFilter"
    >
      <X/>
    </Button>
  </div>

</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import DynamicsFilter from '@/components/dynamics/Filter/Index.vue';
import {useDebounceFn} from "@vueuse/core";
import {Button} from "@/components/ui/button";
import {X} from "lucide-vue-next"


const props = defineProps<{
  filter: {
    search: string,
    birth_date: {
      start: undefined,
      end: undefined,
    }
  },
}>();

const emits = defineEmits(["search", "clearFilters"]);

const renderFilter = ref(1)


const hasActiveFilters = computed(() => {
  const f = props.filter

  return Boolean(
      f.search || f.birth_date.start || f.birth_date.end
  )
})

const filterColumns = ref([
  {
    type: "text",
    placeholder: "Поиск по email или имени клиента...",
    field: "search",
  },
  {
    type: "date_range",
    placeholder: "Дата рождения: с ... по ...",
    field: "birth_date",
  }

]);


const debounce = useDebounceFn(() => {
  emits("search");
}, 500)


watch(
    () => props.filter.search,
    () => {
      debounce()
    }
)


const clearFilter = () => {
  props.filter.search = "";
  props.filter.birth_date.start = undefined
  props.filter.birth_date.end = undefined
  renderFilter.value++
  emits("search");
}

</script>

<style scoped></style>
