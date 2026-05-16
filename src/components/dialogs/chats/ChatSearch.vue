<template>
  <div class="w-full flex items-center gap-1">
    <DynamicsFilter
        :key="renderFilter"
        :columns="filterColumns"
        :filter="filter"
        :show-button="false"
        @search="emits('search')"
    />
    <Button
        class="pt-1 "
        size="xs"
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
import {ConversationSearchType} from "@/types/conversation";

const props = defineProps<{
  filter: ConversationSearchType
}>();

const emits = defineEmits(["search", "clearFilters"]);

const renderFilter = ref(1)


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


const clearFilter = () => {
  props.filter.search = "";
  renderFilter.value++
  emits("search");
}

</script>

<style scoped></style>
