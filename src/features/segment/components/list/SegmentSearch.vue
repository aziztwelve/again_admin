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
import {SegmentSearchType} from "@/features/segment/types";


const props = defineProps<{
  filter: SegmentSearchType
}>();

const emits = defineEmits(["search", "clearFilters"]);

const renderFilter = ref(1)


const hasActiveFilters = computed(() => {
  const f = props.filter

  return Boolean(
      f.search || f.is_active
  )
})

const filterColumns = ref([
  {
    type: "text",
    placeholder: "Поиск...",
    field: "search",
  },
  // {
  //   label: 'Активно',
  //   type: "checkbox",
  //   field: "is_active",
  // },

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
  props.filter.is_active = false;
  renderFilter.value++
  emits("search");
}

</script>

<style scoped></style>
