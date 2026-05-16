<template>
  <div class="flex flex-col gap-2 w-full">
    <div class="flex max-md:flex-col gap-2 w-full">
      <div class="flex items-center gap-2 w-full">
        <Input
            type="text"
            placeholder="Введите Штрих-код вручную"
            v-model="barcodeValue"
            @input="handleInput"
            class="flex-1"
            pattern="[A-Za-z0-9]+"
        />
      </div>

      <div class="flex items-center gap-2 min-w-[120px]">
        <DynamicsDropdownSelect
            v-model="selectedLength"
            :options="barcodeOptions"
            label="Длина штрихкода"
            option-label="label"
        />
      </div>
    </div>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, computed} from 'vue'
import {Input} from "@/components/ui/input"
import type {Product} from "~/services/Product";

const props = defineProps<{
  modelValue: Product
}>()

const emit = defineEmits(['update:modelValue'])

const barcodeValue = ref(props.modelValue.barcode || '')
const selectedLength = ref(props.modelValue.barcode_length || '3')
const error = ref('')

const minBarcodeLength = 3
const maxBarcodeLength = 13
const barcodeLengths = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

const barcodeOptions = computed(() => [
  ...barcodeLengths.map(length => ({
    value: String(length),
    label: `${length} символов`
  }))
])

const handleInput = (event) => {
  barcodeValue.value = event.target.value.replace(/[^A-Z0-9]/g, '').toUpperCase()
  validateBarcode()
  updateModel()
}

const validateBarcode = () => {
  if (!barcodeValue.value) {
    error.value = ""
    return
  }

  const barcodeStr = barcodeValue.value.toString()
  if (barcodeStr.length < minBarcodeLength) {
    error.value = `Штрих-код должен содержать минимум ${minBarcodeLength} символа`
  } else if (barcodeStr.length > maxBarcodeLength) {
    error.value = `Штрих-код должен содержать максимум ${maxBarcodeLength} символов`
  } else {
    error.value = ""
  }
}

const updateModel = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    barcode: barcodeValue.value,
    barcodeLength: barcodeValue.value ? null : selectedLength.value,
    barcodeError: error.value
  })
}

watch(selectedLength, (newVal) => {
  barcodeValue.value = ''
  updateModel()
})

defineExpose({
  validate: validateBarcode
})
</script>
