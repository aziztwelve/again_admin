<template>
  <Select
      multiple
      :modelValue="modelValue"
      @update:modelValue="handleValueChange"
      :disabled="disabled"
  >
    <SelectTrigger class="w-full">
      <SelectValue :placeholder="placeholder || 'Выберите...'">
        {{ modelValue?.length > 0 ? `Выбрано: ${modelValue?.length}` : placeholder }}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <div class="max-h-60 overflow-y-auto">
        <SelectItem
            v-for="(option, index) in options"
            :key="index"
            :value="getOptionValue(option)"
            :disabled="option.disabled"
            :required="required"
        >
          <div class="flex items-center gap-2">
            <span
                class="flex h-4 w-4 items-center justify-center rounded-sm border"
                :class="{
                'bg-primary border-primary': isSelected(option),
                'border-border': !isSelected(option),
              }"
            >
              <Check v-if="isSelected(option)" class="h-3 w-3 text-primary-foreground"/>
            </span>
            {{ getOptionLabel(option) }}
          </div>
        </SelectItem>
      </div>
    </SelectContent>
  </Select>
</template>


<script setup lang="ts">
import {Check} from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


const props = withDefaults(
    defineProps<{
      options: any[]
      modelValue: any[]
      placeholder?: string
      optionLabel?: string // Поле для отображения текста
      optionValue?: string // Поле для значения
      disabled?: boolean,
      required?: boolean,
    }>(),
    {
      required: false,
    }
)

const emit = defineEmits(['update:modelValue'])

const handleValueChange = (values: any[]) => {
  emit('update:modelValue', values)
}

// Получаем значение для отображения
const getOptionLabel = (option: any) => {
  return props.optionLabel ? option[props.optionLabel] : option.label ?? option.value ?? option
}

// Получаем значение для модели
const getOptionValue = (option: any) => {
  return props.optionValue ? option[props.optionValue] : option.value ?? option
}

// Проверяем, выбрана ли опция
const isSelected = (option: any) => {
  const value = getOptionValue(option)
  return props.modelValue?.includes(value)
}
</script>

