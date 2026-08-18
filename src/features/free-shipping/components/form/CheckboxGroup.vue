<template>
  <div class="space-y-1">
    <div class="flex items-baseline justify-between">
      <span class="text-sm font-medium text-gray-700">{{ title }}</span>
      <span v-if="hint" class="text-xs text-gray-500">{{ hint }}</span>
    </div>
    <div class="flex flex-wrap gap-3 rounded border px-3 py-2">
      <label
          v-for="option in options"
          :key="option.code"
          class="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
      >
        <input
            type="checkbox"
            :checked="modelValue.includes(option.code)"
            @change="toggle(option.code)"
        />
        {{ option.label }}
      </label>
      <span v-if="!options.length" class="text-sm text-gray-400">Нет доступных значений</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FreeShippingOption } from '../../types'

const props = defineProps<{
  title: string
  hint?: string
  options: FreeShippingOption[]
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const toggle = (code: string) => {
  const next = props.modelValue.includes(code)
      ? props.modelValue.filter(item => item !== code)
      : [...props.modelValue, code]

  emit('update:modelValue', next)
}
</script>

<style scoped></style>
