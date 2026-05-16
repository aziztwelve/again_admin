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
import { computed, ref, watch } from 'vue'
import DynamicsFilter from '@/components/dynamics/Filter/Index.vue'
import { useDebounceFn } from "@vueuse/core"
import { Button } from "@/components/ui/button"
import { X } from "lucide-vue-next"
import type { OtoBannerSearchParams } from "@/features/oto-banner/types"
import {
  OTO_BANNER_STATUS_OPTIONS,
  OTO_BANNER_DEVICE_TYPE_OPTIONS
} from "@/features/oto-banner/types"

const props = defineProps<{
  filter: OtoBannerSearchParams
}>()

const emits = defineEmits<{
  (e: 'search'): void
  (e: 'clearFilters'): void
}>()
const renderFilter = ref(1)

const hasActiveFilters = computed(() => {
  const f = props.filter

  return Boolean(
      f.search ||
      f.status ||
      f.device_type ||
      f.date_from ||
      f.date_to
  )
})

const filterColumns = ref([
  {
    type: "text",
    placeholder: "Поиск по названию баннера...",
    field: "search",
  },
  {
    type: "select",
    placeholder: "Статус",
    field: "status",
    options: OTO_BANNER_STATUS_OPTIONS,
    optionValue: 'value',
    optionLabel: 'label',
  },
  {
    type: "select",
    placeholder: "Тип устройства",
    field: "device_type",
    options: OTO_BANNER_DEVICE_TYPE_OPTIONS,
    optionValue: 'value',
    optionLabel: 'label',
  },
  // {
  //   type: "date_range",
  //   placeholder: "Выберите период",
  //   field: "datePicker",
  // },
])

const debounce = useDebounceFn(() => {
  emits("search")
}, 500)

watch(
    () => props.filter.search,
    () => {
      debounce()
    }
)

const clearFilter = () => {
  props.filter.search = undefined
  props.filter.status = undefined
  props.filter.device_type = undefined
  props.filter.date_from = undefined
  props.filter.date_to = undefined
  renderFilter.value++
  emits("search")
}
</script>

<style scoped>

</style>