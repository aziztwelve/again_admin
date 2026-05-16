<template>
  <div class="flex items-center gap-2">
    <!-- Режим просмотра - БЕЗ ИЗМЕНЕНИЙ -->
    <div v-if="!isEditing" class="flex items-center gap-2 group">
      <div class="flex items-center gap-1.5">
        <component
            :is="getFitTypeIcon(displayFitType)"
            class="w-4 h-4 text-gray-500"
        />

        <button
            @click="startEdit"
            class="editable-text text-sm text-blue-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200 min-w-[80px] text-left"
            :disabled="isSaving"
            title="Нажмите для редактирования"
        >
          {{ getFitTypeLabel(displayFitType) }}
        </button>
      </div>

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
      <Select
          v-model="editValue"
          @update:open="handleSelectOpen"
      >
        <SelectTrigger class="h-8 w-[140px]" ref="triggerRef">
          <SelectValue placeholder="Выберите посадку" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Не указано</SelectItem>
          <SelectItem value="low">Низкая</SelectItem>
          <SelectItem value="tall">Высокая</SelectItem>
        </SelectContent>
      </Select>

      <div class="flex gap-1">
        <Button
            size="sm"
            variant="default"
            class="h-6 w-6 p-0 bg-green-600 hover:bg-green-700 text-white"
            @click="saveFitType"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Pencil,
  Check,
  X,
  Loader2,
  ArrowDown,
  ArrowUp,
} from 'lucide-vue-next'
import { useProductAttributeFunctions } from '@/composables/Product/useProductAttributeFunctions'
import { useSuccessHandler } from '@/composables/useSuccessHandler'
import { useErrorHandler } from '@/composables/useErrorHandler'

interface Props {
  productId: number
  initialFitType?: string | null
}

interface Emits {
  (e: 'updated', value: string | null): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const isEditing = ref(false)
const editValue = ref(props.initialFitType || 'none')
const isSaving = ref(false)
const triggerRef = ref() // Изменили на triggerRef

const displayFitType = ref(props.initialFitType || null)
const { updateAttributes } = useProductAttributeFunctions()
const { showSuccess } = useSuccessHandler()
const { showError } = useErrorHandler()

const getFitTypeLabel = (fitType: string | null): string => {
  if (!fitType || fitType === 'none') return 'Не указано'
  return fitType === 'low' ? 'Низкая' : 'Высокая'
}

const getFitTypeIcon = (fitType: string | null) => {
  if (!fitType || fitType === 'none') return
  return fitType === 'low' ? ArrowDown : ArrowUp
}

const startEdit = async () => {
  if (isSaving.value) return

  isEditing.value = true
  editValue.value = displayFitType.value || 'none'

  // Открываем Select программно через клик по trigger
  await nextTick()
  triggerRef.value?.$el?.click()
}

const handleSelectOpen = (open: boolean) => {
  // Можно добавить логику при открытии/закрытии если нужно
}

const saveFitType = async () => {
  const valueToSave = editValue.value === 'none' ? null : editValue.value

  if (valueToSave === displayFitType.value) {
    cancelEdit()
    return
  }

  isSaving.value = true

  try {
    const result = await updateAttributes(props.productId, {
      fit_type: valueToSave
    })

    if (result?.success) {
      displayFitType.value = valueToSave
      showSuccess(result)
      emits('updated', valueToSave)
      isEditing.value = false
    }
  } catch (error) {
    showError(error)
    editValue.value = displayFitType.value || 'none'
  } finally {
    isSaving.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editValue.value = displayFitType.value || 'none'
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