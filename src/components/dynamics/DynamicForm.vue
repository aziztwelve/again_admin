<template>
  <form class="space-y-4" @submit.prevent="emit('submitForm')">
    <div v-for="(row, rowIndex) in groupedFields" :key="rowIndex" class="grid gap-2"
         :class="`md:grid-cols-${row.length}`">
      <div v-for="field in row" :key="field.name" class="space-y-1 max-w-full overflow-hidden p-1">
        <Label :for="field.name">
          {{ field.component != 'checkbox' && field.component != 'emitButton' ? field.label : '' }}
          <span v-if="field.required" class="text-red-500">*</span>
        </Label>

        <!-- Текстовое поле -->
        <Input
            v-if="field.component === 'text' && field.type !== 'file'"
            :id="field.name"
            :type="field.type || 'text'"
            v-model="formData[field.name]"
            :placeholder="field.placeholder || ''"
            :required="field.required"
            :disabled="field.disabled ?? false"
        />

        <!-- Поле загрузки файла -->
        <div
            v-else-if="field.component === 'text' && field.type === 'file'"
            class="max-w-full max-h-full overflow-hidden"
        >
          <Input
              :id="field.name"
              type="file"
              :accept="field.accept || '*/*'"
              :required="field.required"
              @change="onFileChange($event, field.name)"
              class="cursor-pointer"
          />

          <div class="max-w-full max-h-full overflow-hidden mt-3 rounded"
               v-if="field.cropperShow && previewImages[field.name]">
            <ImageCropper
                class="max-w-full max-h-full object-contain"
                :src="previewImages[field.name]"
                :aspect-ratio="field.cropperAspectRatio"
                @update:file="onCroppedFile(field.name, $event)"
            />
          </div>

          <div class="max-w-full max-h-full overflow-hidden pt-3 rounded"
               v-else-if="field.cropperAvatar && previewImages[field.name]">
            <AvatarCropper
                class="max-w-full max-h-full object-contain"
                :src="previewImages[field.name]"
                @update:file="onCroppedFile(field.name, $event)"
            />
          </div>

          <div class="relative max-w-full max-h-full overflow-hidden mt-3 rounded border border-gray-300"
               v-else-if="previewImages[field.name]">
            <ImagePreview :file="formData[field.name]"/>
            <button
                type="button"
                @click="removeImage(field.name)"
                class="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 transition"
                aria-label="Удалить изображение"
            >
              <X class="w-5 h-5 text-red-600"/>
            </button>
          </div>
        </div>

        <!-- Текстовая область -->
        <Textarea
            v-else-if="field.component === 'textarea'"
            :id="field.name"
            v-model="formData[field.name]"
            :placeholder="field.placeholder || ''"
            :rows="field.rows || 3"
            :required="field.required"
        />

        <Select
            v-else-if="field.component == 'select'"
            :key="field.name"
            v-model="formData[field.name]"
            :options="field.options"
            :option-label="field.optionLabel"
            :option-value="field.optionValue"
            :placeholder="field.placeholder"
            :required="field.required"
            :disabled="field.disabled"
        />

        <MultiSelect
            v-else-if="field.component == 'multiSelect'"
            :key="field?.name"
            v-model="formData[field.name]"
            :options="field.options"
            :option-label="field.optionLabel"
            :option-value="field.optionValue"
            :placeholder="field.placeholder"
            :required="field.required"
            :disabled="field.disabled"
            title=""
        />

        <DatePicker
            v-else-if="field.component == 'date'"
            :key="field.name ?? 0"
            v-model="formData[field.name]"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
        />

        <div class="flex items-center space-x-2"
             v-else-if="field.component == 'checkbox'"
        >
          <Checkbox :id="field.name" v-model="formData[field.name]"/>
          <label
              for="terms"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {{ field.label }}
          </label>
        </div>

        <div v-else-if="field.component == 'color'">
          <ColorPicker
              :colors="field.colors"
              v-model="formData[field.name]"
          />
        </div>

        <div
            class="w-full min-w-0 pb-1"
            v-else-if="field.component == 'enyComponentSlot'">
          <slot name="enyComponentSlot"></slot>
        </div>

        <p v-if="errors[field.name]" class="text-sm text-red-500">
          {{ errors[field.name] }}
        </p>
        <p v-if="field.description" class="text-sm text-gray-400">
          {{ field.description }}
        </p>
      </div>
    </div>

    <Button
        v-if="showSubmitButton"
        type="submit"
        class="mt-4 w-full"
        variant="secondary"
    >
      {{ submitButtonText }}
    </Button>
  </form>
</template>

<script setup lang="ts">
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {Label} from '@/components/ui/label'
import {computed, ref} from 'vue'
import Select from "@/components/dynamics/Dropdown/Select.vue";
import MultiSelect from "@/components/dynamics/Dropdown/MultiSelect.vue";
import {FormDynamicFieldType} from "@/types/form";
import {Button} from "@/components/ui/button";
import DatePicker from "@/components/dynamics/DatePicker.vue";
import {Checkbox} from '@/components/ui/checkbox'
import ImageCropper from "@/components/dynamics/ImageCropper.vue";
import ImagePreview from "@/components/dynamics/ImagePreview.vue";
import {X} from 'lucide-vue-next';
import AvatarCropper from "@/components/dynamics/cropper/AvatarCropper.vue";
import ColorPicker from "@/components/dynamics/color/ColorPicker.vue";

interface Props {
  fields: (FormDynamicFieldType)[]
  modelValue: Record<string, any>
  errors?: Record<string, string>
  showSubmitButton?: boolean
  submitButtonText?: string
}

const props = withDefaults(
    defineProps<Props>(), {
      errors: () => ({}),
    })

const emit = defineEmits(['update:modelValue', 'submitForm', 'emitButton']);

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Group fields into rows (arrays of fields)
const groupedFields = computed(() => {
  return props.fields.map(field => Array.isArray(field) ? field : [field])
})

// Изменяем на объект для хранения превью каждого файла отдельно
const previewImages = ref<Record<string, string | null>>({})

const onFileChange = (event: Event, fieldName: string) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  if (file) {
    formData.value[fieldName] = file
    previewImages.value[fieldName] = URL.createObjectURL(file)
  }
}

const onCroppedFile = (fieldName: string, file: File) => {
  formData.value[fieldName] = file
}

const removeImage = (fieldName: string) => {
  formData.value[fieldName] = null
  if (previewImages.value[fieldName]) {
    URL.revokeObjectURL(previewImages.value[fieldName]!)
    previewImages.value[fieldName] = null
  }
}
</script>
