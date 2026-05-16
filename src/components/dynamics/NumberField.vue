<script setup lang="ts">
import {ref, watch, computed} from 'vue'
import {Label} from '@/components/ui/label'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'

const props = defineProps({
  id: {type: String, required: true},
  modelValue: {type: Number, default: 0},
  label: {type: String, default: 'Срок Оплаты'},
  min: {type: Number, default: 0},
  max: {type: Number, default: 100},
  step: {type: Number, default: 1},
  disabled: {type: Boolean, default: false},
  required: {type: Boolean, default: false},
})

const emit = defineEmits(['update:modelValue', 'change'])

const internalValue = ref(props.modelValue)

// Валидация значения
const validatedValue = computed(() => {
  let val = internalValue.value
  if (props.min !== undefined && val < props.min) val = props.min
  if (props.max !== undefined && val > props.max) val = props.max
  return val
})

// Обновление при изменении props
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

// Обработчики изменений
const updateValue = (newValue: number) => {
  internalValue.value = newValue
  emitValue()
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = parseFloat(target.value) || 0
  updateValue(newValue)
}

const increment = () => updateValue(validatedValue.value + props.step)
const decrement = () => updateValue(validatedValue.value - props.step)

const emitValue = () => {
  emit('update:modelValue', validatedValue.value)
  emit('change', validatedValue.value)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <Label :for="id" :class="{ 'text-gray-400': disabled }">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </Label>

    <NumberField
        :id="id"
        :default-value="validatedValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        @update:modelValue="updateValue"
    >
      <NumberFieldContent>
        <NumberFieldDecrement
            @click="decrement"
            :disabled="disabled || validatedValue <= min"
        />

        <NumberFieldInput
            v-model="internalValue"
            @input="handleInput"
            :disabled="disabled"
            :required="required"
            class="text-center"
        />

        <NumberFieldIncrement
            @click="increment"
            :disabled="disabled || validatedValue >= max"
        />
      </NumberFieldContent>
    </NumberField>

    <div v-if="validatedValue !== internalValue" class="text-xs text-red-500">
      Автоматически исправлено на {{ validatedValue }} (допустимый диапазон: {{ min }} - {{ max }})
    </div>
  </div>
</template>
