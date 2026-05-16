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

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

const props = defineProps<{
  options: SelectOption[]
  modelValue: string
  placeholder?: string
  label?: string
  optionLabel?: string
}>()

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <Select
      :modelValue="modelValue"
      @update:modelValue="(value) => emit('update:modelValue', value)"
  >
    <SelectTrigger class="">
      <SelectValue :placeholder="placeholder || 'Выберите...'" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel v-if="label">{{ label }}</SelectLabel>
        <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
        >
          {{ option[optionLabel || 'label'] }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>