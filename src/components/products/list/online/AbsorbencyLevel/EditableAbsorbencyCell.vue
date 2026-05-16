<template>
  <div class="flex items-center gap-2">
    <!-- Режим просмотра -->
    <div v-if="!isEditing" class="flex items-center gap-2 group">
      <!-- Капли (визуальное отображение) -->


      <!-- Число капель -->
      <button
          @click="startEdit"
          class="editable-text text-sm text-blue-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200 min-w-[40px] text-center"
          :disabled="isSaving"
          title="Нажмите для редактирования"
      >
        {{ displayAbsorbency }}
      </button>

      <!-- Кнопка редактирования (только при ховере) -->
      <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
            size="sm"
            variant="ghost"
            class="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
            @click="startEdit"
            title="Редактировать"
        >
          <Pencil class="w-3 h-3" />
        </Button>
      </div>
    </div>

    <!-- Режим редактирования -->
    <div v-else class="flex items-center gap-2 animate-in fade-in duration-200">
      <Input
          v-model.number="editValue"
          type="number"
          min="0"
          max="6"
          class="w-16 h-8 text-center font-medium shadow-sm focus:ring-2"
          @keydown.enter="saveAbsorbency"
          @keydown.escape="cancelEdit"
          @blur="handleBlur"
          ref="inputRef"
      />

      <div class="flex gap-1">
        <Button
            size="sm"
            variant="default"
            class="h-6 w-6 p-0 bg-green-600 hover:bg-green-700 text-white"
            @click="saveAbsorbency"
            :disabled="isSaving"
            title="Сохранить"
        >
          <Check class="w-3 h-3" />
        </Button>

        <Button
            size="sm"
            variant="outline"
            class="h-6 w-6 p-0 border-gray-300 hover:bg-gray-50"
            @click="cancelEdit"
            :disabled="isSaving"
            title="Отмена"
        >
          <X class="w-3 h-3" />
        </Button>
      </div>

      <Loader2 v-if="isSaving" class="w-3 h-3 animate-spin text-blue-600" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Check, X, Loader2 } from 'lucide-vue-next'
import { useProductAttributeFunctions } from '@/composables/Product/useProductAttributeFunctions'
import { useSuccessHandler } from '@/composables/useSuccessHandler'
import { useErrorHandler } from '@/composables/useErrorHandler'

interface Props {
  productId: number
  initialAbsorbency: number
}

interface Emits {
  (e: 'updated', value: number): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const isEditing = ref(false)
const editValue = ref(props.initialAbsorbency)
const isSaving = ref(false)
const inputRef = ref<InstanceType<typeof Input>>()

const displayAbsorbency = ref(props.initialAbsorbency)
const { updateAbsorbency } = useProductAttributeFunctions()
const { showSuccess } = useSuccessHandler()
const { showError } = useErrorHandler()

const startEdit = async () => {
  if (isSaving.value) return

  isEditing.value = true
  editValue.value = displayAbsorbency.value

  await nextTick()
  inputRef.value?.$el?.focus()
  inputRef.value?.$el?.select()
}

const saveAbsorbency = async () => {
  if (editValue.value === displayAbsorbency.value) {
    cancelEdit()
    return
  }

  isSaving.value = true

  try {
    const result = await updateAbsorbency(props.productId, editValue.value)

    if (result?.success) {
      displayAbsorbency.value = editValue.value
      showSuccess(result)
      emits('updated', editValue.value)
      isEditing.value = false
    }
  } catch (error) {
    showError(error)
    editValue.value = displayAbsorbency.value
  } finally {
    isSaving.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editValue.value = displayAbsorbency.value
}

const handleBlur = (event: FocusEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement
  if (relatedTarget?.closest('.flex.gap-1')) {
    return
  }

  setTimeout(() => {
    if (isEditing.value && !isSaving.value) {
      cancelEdit()
    }
  }, 100)
}
</script>

<style scoped>
.editable-text {
  user-select: none;
  outline: none;
}

.editable-text:focus-visible {
  @apply outline-2 outline-blue-500 outline-offset-2;
}

.editable-text:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.animate-in {
  animation-duration: 200ms;
}

.fade-in {
  animation-name: fadeIn;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>