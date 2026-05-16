<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { defineProps, defineEmits, computed } from 'vue'

interface Option {
  label: string
  value: string
  id: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
  orientation?: 'vertical' | 'horizontal'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const onChange = (value: string) => {
  emit('update:modelValue', value)
}

const wrapperClass = computed(() => {
  return props.orientation === 'horizontal'
      ? 'flex flex-row space-x-4'
      : 'flex flex-col space-y-2'
})
</script>

<template>
  <RadioGroup :model-value="modelValue" @update:modelValue="onChange">
    <div :class="wrapperClass">
      <div
          v-for="option in options"
          :key="option.id"
          class="flex items-center space-x-2"
      >
        <RadioGroupItem :id="option.id" :value="option.value" />
        <Label :for="option.id">{{ option.label }}</Label>
      </div>
    </div>
  </RadioGroup>
</template>
