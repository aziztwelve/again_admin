<template>
  <div class="w-full md:flex justify-between ">

    <DynamicsFilter
        class="max-w-md w-full"
        :columns="[filterColumns[2]]"
        :filter="filter"
        @search="emits('search'); renderSearch++"
    />

    <div class="flex gap-2 max-md:my-2">
      <DynamicsFilterModalWithFilter
          :columns="filterColumns.filter((_ , index ) => index !== 2)"
          :filter="filter"
          @search="emits('search'); renderSearch++"
      />

      <Button
          v-if="hasActiveFilters"
          variant="outline"
          @click="emits('clearFilters'); renderSearch++"
      >
        <X/>
      </Button>
    </div>

  </div>
</template>

<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {computed, ref, watch} from 'vue'
import DynamicsFilter from "@/components/dynamics/Filter/Index.vue"
import DynamicsFilterModalWithFilter from "@/components/dynamics/Filter/ModalWithFilter.vue"
import {useDebounceFn} from "@vueuse/core";
import {X} from "lucide-vue-next"


const props = defineProps<{
  filter: {
    search: string,
    status: string,
    priority: string,
    assignee: string,
    label: string,
    dueDate: string,
    overdue: boolean,
  },
  statuses?: Array<{ id: number, name: string }>,
  priorities?: Array<{ id: number, name: string }>,
  users?: Array<{ id: number, name: string }>,
  labels?: Array<{ id: number, name: string }>
}>();

const emits = defineEmits(["search", "clearFilters"]);

const renderSearch = ref(1)

const hasActiveFilters = computed(() => {
  const f = props.filter

  return Boolean(
      f.search ||
      f.status ||
      f.priority ||
      f.assignee ||
      f.label ||
      f.dueDate ||
      f.overdue
  )
})


const filterColumns = computed(() => [

  {
    type: "checkbox",
    label: "Просроченные задачи",
    field: "overdue",
  },
  {
    type: "date",
    placeholder: "Выберите дату выполнения",
    field: "dueDate",
  },

  {
    type: "text",
    placeholder: "Поиск по названию или описанию...",
    field: "search",
  },

  {
    type: "select",
    placeholder: "Выберите статус...",
    field: "status",
    options: props.statuses || [],
    optionLabel: 'name',
    optionValue: 'id'
  },
  {
    type: "select",
    placeholder: "Выберите приоритет...",
    field: "priority",
    options: props.priorities || [],
    optionLabel: 'name',
    optionValue: 'id'
  },
  {
    type: "select",
    placeholder: "Выберите исполнителя...",
    field: "assignee",
    options: props.users || [],
    optionLabel: 'name',
    optionValue: 'id'
  },
  {
    type: "select",
    placeholder: "Выберите метку...",
    field: "label",
    options: props.labels || [],
    optionLabel: 'name',
    optionValue: 'id'
  }
]);


const debounce = useDebounceFn(() => {
  emits('search')
}, 500)


watch(() => props.filter?.search, () => {
  debounce()
})

</script>

<style scoped></style>