<template>
  <Select
      v-model="filter[column.field]"
      :required="column.required"
      :disabled="column.disabled"
  >
    <SelectTrigger class="relative">
      <SelectValue :placeholder="column.placeholder || 'Выберите...'"/>
      <button
          v-if="filter[column.field]"
          @pointerdown.stop
          @mousedown.stop
          @click.stop="clearSelection"
          class="absolute right-8 h-full flex items-center text-muted-foreground hover:text-foreground transition-colors"
          type="button"
      >
        <X class="h-4 w-4"/>
      </button>
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel v-if="column.label">{{ column.label }}</SelectLabel>
        <SelectItem
            v-for="(option, index) in column.options"
            :key="index"
            :value="option[column.optionValue ?? 'name']"
            :disabled="option.disabled"
        >
          {{ option[column.optionLabel ?? 'label'] }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {X} from 'lucide-vue-next'
import type {PropType} from 'vue'



interface TypeColumnSelect {
  options: any[]
  placeholder?: string
  label?: string
  field: any
  optionLabel?: string
  optionValue?: number | string
  disabled: boolean
  required: boolean
}


const props = defineProps({
  column: {
    type: Object as PropType<TypeColumnSelect>,
    required: true, // или false
    default: () => ({
      options: [],
      modelValue: '',
      placeholder: '',
      label: '',
      field: 'select',
      optionLabel: '',
      optionValue: '',
      disabled: false,
      required: false
    })
  },
  filter: {
    type: Object,
    default: {},
  }
})


const clearSelection = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  props.filter[props.column.field] = ''
  // emit('update:modelValue', '')
}
</script>
