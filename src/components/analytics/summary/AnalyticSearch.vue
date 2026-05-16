<template>

  <div class="md:flex md:space-x-2 max-md:space-y-2">
    <DynamicsFilter
        class="md:max-w-md"
        :key="renderFilter"
        :columns="filterColumns"
        :filter="props.filter"
        @search="emits('search')"
    />

    <Button
        class="max-md:w-full"
        v-if="hasActiveFilters"
        variant="outline"
        @click="resetFilters"
    >
      <X/>
    </Button>
  </div>

</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue';
import DynamicsFilter from '@/components/dynamics/Filter/Index.vue';
import Button from '@/components/ui/button/Button.vue';
import {X} from "lucide-vue-next";

const props = defineProps<{
  filter: {
    datePicker: {
      start: string | undefined,
      end: string | undefined,
    }
  }
}>()

const emits = defineEmits(["search", "resetFilters"]);

const renderFilter = ref(1)

const hasActiveFilters = computed(() => {
  return !!props.filter.datePicker.start || !!props.filter.datePicker.end
})

const filterColumns = ref([


  {
    type: "date_range",
    placeholder: "Выберите период",
    field: "datePicker",
  },


]);


const resetFilters = () => {
  props.filter.datePicker.start = undefined;
  props.filter.datePicker.end = undefined;
  emits('search')
  renderFilter.value++
}
</script>

<style scoped></style>
