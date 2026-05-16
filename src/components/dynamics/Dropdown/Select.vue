<template>
  <div>
    <Label v-if="title" class="text-xs">{{ title }}</Label>
    <Select
        :disabled="props.disabled"
        :modelValue="modelValue"
        @update:modelValue="handleUpdate"
    >
      <SelectTrigger
          class="relative"
          :class="{
          'border-red-400 ring-2 ring-red-400/20 focus:ring-red-400': showError
        }"
      >
        <SelectValue :placeholder="placeholder || 'Выберите...'"/>
        <button
            v-if="modelValue"
            @pointerdown.stop
            @mousedown.stop
            @click.stop="clearSelection"
            class="absolute right-8 h-full flex items-center text-muted-foreground hover:text-foreground transition-colors"
            type="button"
            :disabled="disabled"
        >
          <X class="h-4 w-4"/>
        </button>
      </SelectTrigger>
      <SelectContent>
        <div
            v-if="searchable"
            class="sticky top-0 z-10 -mx-1 -mt-1 mb-1 border-b bg-popover p-2"
            @pointerdown.stop
        >
          <Input
              v-model="searchQuery"
              :placeholder="searchPlaceholder || 'Поиск...'"
              class="h-8"
              type="text"
              @keydown.stop
          />
        </div>
        <SelectGroup>
          <SelectLabel v-if="label">{{ label }}</SelectLabel>
          <SelectItem
              v-for="(option, index) in filteredOptions"
              :key="option.value ?? index"
              :value="option[optionValue ?? 'label']"
              :disabled="option.disabled"
          >
            <span class="flex items-center gap-2 text-xs">
              <!-- Рендер иконки -->
              <component
                  v-if="option.icon && typeof option.icon !== 'string'"
                  class="w-4 h-4"
                  :is="option.icon"
                  :class="option.styleIcon"/>

              <span v-else-if="option.icon" class="text-base">{{ option.icon }}</span>

              {{ option[optionLabel ?? 'label'] }}
            </span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <!-- Скрытый input для HTML5 валидации -->
    <input
        v-if="props.required"
        ref="hiddenInput"
        :value="modelValue || ''"
        :required="props.required"
        tabindex="-1"
        style="position: absolute; opacity: 0; pointer-events: none; height: 1px; width: 1px; left: -9999px;"
        @invalid="handleInvalid"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'

interface SelectOption {
  value?: string
  label?: string
  disabled?: boolean
  icon?: object | string
  styleIcon?: string
  [key: string]: any
}

const props = defineProps<{
  options: SelectOption[]
  modelValue: string | number | undefined
  placeholder?: string
  label?: string
  optionLabel?: string
  optionValue?: string
  disabled?: boolean
  required?: boolean
  title?: string
  searchable?: boolean
  searchPlaceholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const showError = ref(false)
const hiddenInput = ref<HTMLInputElement>()
const searchQuery = ref('')

const handleUpdate = (value: any) => {
  // Убираем ошибку при выборе значения
  if (showError.value) {
    showError.value = false
  }
  emit('update:modelValue', value)
}

const clearSelection = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  emit('update:modelValue', '')
}

const filteredOptions = computed(() => {
  if (!props.searchable) return props.options
  const q = (searchQuery.value || '').toLowerCase()
  if (!q) return props.options
  return (props.options || []).filter((opt: any) => {
    const labelKey = props.optionLabel ?? 'label'
    const valueKey = props.optionValue ?? 'value'
    const label = String(opt?.[labelKey] ?? '').toLowerCase()
    const value = String(opt?.[valueKey] ?? '').toLowerCase()
    return label.includes(q) || value.includes(q)
  })
})

// Обработчик HTML5 валидации
const handleInvalid = (e: Event) => {
  e.preventDefault()
  showError.value = true
}

// Слушаем submit события на всех родительских формах
const handleFormSubmit = (e: Event) => {
  const form = e.target as HTMLFormElement
  const selectElement = hiddenInput.value

  if (selectElement && form.contains(selectElement)) {
    if (props.required && !props.modelValue) {
      showError.value = true
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }
}

// Подключаем глобальные обработчики
onMounted(() => {
  // Слушаем submit на всем документе для перехвата отправки форм
  document.addEventListener('submit', handleFormSubmit, true)
})

onUnmounted(() => {
  document.removeEventListener('submit', handleFormSubmit, true)
})
</script>