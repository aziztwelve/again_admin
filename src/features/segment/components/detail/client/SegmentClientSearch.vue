<template>
  <div class="md:flex md:space-x-2 max-md:space-y-2 md:w-[400px] max-md:w-full">

    <DynamicsFilter
        :columns="filterColumns"
        :filter="filter"
        :show-button="false"
        @search="emits('search')"
    />

    <Button
        v-if="hasActiveFilters"
        variant="outline"
        @click="props.filter.search = ''"
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
import {FilterSegmentClientsParams} from "@/features/segment/types";

interface SegmentClientSearch {
  filter: FilterSegmentClientsParams
}

const props = defineProps<SegmentClientSearch>();

const emits = defineEmits(["search", "clearFilters"]);


const hasActiveFilters = computed(() => {
  const f = props.filter

  return Boolean(
      f.search
  )
})

const filterColumns = ref([
  {
    type: "text",
    placeholder: "Поиск...",
    field: "search",
  },
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

</script>

<style scoped></style>
