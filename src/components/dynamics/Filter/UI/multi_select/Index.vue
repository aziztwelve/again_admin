<template>
  <Popover>
    <PopoverTrigger as-child>
      <button type="button" class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm" :disabled="column.disabled">
        <span class="truncate">{{ selected.length ? `Выбрано: ${selected.length}` : (column.placeholder || 'Выберите...') }}</span>
        <span class="ml-2 text-muted-foreground">⌄</span>
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-72 p-2" align="start">
      <label v-for="option in column.options ?? []" :key="valueOf(option)" class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
        <input type="checkbox" :checked="selected.includes(valueOf(option))" @change="toggle(valueOf(option))">
        <span>{{ labelOf(option) }}</span>
      </label>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'

const props = defineProps<{column: Record<string, any>; filter: Record<string, any>}>()

const selected = computed(() => Array.isArray(props.filter[props.column.field]) ? props.filter[props.column.field] : [])
const valueOf = (option: any) => props.column.optionValue ? option[props.column.optionValue] : (option.value ?? option)
const labelOf = (option: any) => props.column.optionLabel ? option[props.column.optionLabel] : (option.label ?? option.value ?? option)
const toggle = (value: any) => {
  props.filter[props.column.field] = selected.value.includes(value)
    ? selected.value.filter((item: any) => item !== value)
    : [...selected.value, value]
}
</script>
