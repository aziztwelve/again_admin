<script lang="ts" setup>
import { ref } from "vue"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Option {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: string
  label?: string
  options: Option[]
  buttonText?: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

function updateValue(value: string) {
  emit("update:modelValue", value)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        {{ buttonText || "Open" }}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <DropdownMenuLabel>{{ label }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup
          :model-value="modelValue"
          @update:model-value="updateValue"
      >
        <DropdownMenuRadioItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
        >
          {{ option.label }}
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
