<template>
  <div class="relative">
    <!-- Hidden file input -->
    <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        :multiple="multiple"
        class="hidden"
        @change="handleFileSelect"
    />

    <!-- Button -->
    <Button
        type="button"
        variant="ghost"
        size="icon"
        :disabled="disabled"
        @click="openFilePicker"
        class="h-8 w-8"
        :title="title"
    >
      <Paperclip class="h-5 w-5"/>
    </Button>

    <!-- Error tooltip -->
    <Transition name="fade">
      <div
          v-if="error"
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-destructive text-destructive-foreground text-xs rounded-lg whitespace-nowrap shadow-lg z-50"
      >
        {{ error }}
        <div
            class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-destructive"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {Button} from '@/components/ui/button'
import {Paperclip} from 'lucide-vue-next'
import {
  validateFile,
  getAttachmentTypeFromMime,
  MAX_FILES_COUNT,
  ALLOWED_FILE_TYPES,
  createImagePreview,
  PendingFile
} from '@/types/conversation'

interface Props {
  disabled?: boolean
  multiple?: boolean
  maxFiles?: number
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  multiple: true,
  maxFiles: MAX_FILES_COUNT,
  title: 'Прикрепить файл (JPG, PNG, MP3, WAV, OGG, M4A)'
})

const emit = defineEmits<{
  filesSelected: [files: PendingFile[]]
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement>()
const error = ref<string>('')

// Accepted file types для input
const acceptedTypes = computed(() => {
  return ALLOWED_FILE_TYPES.join(',')
})

// Открыть диалог выбора файлов
const openFilePicker = () => {
  if (props.disabled) return
  fileInput.value?.click()
}

// Обработка выбора файлов
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  // Сбрасываем ошибку
  error.value = ''

  if (files.length === 0) return

  // Проверка количества файлов
  if (files.length > props.maxFiles) {
    showError(`Максимум ${props.maxFiles} файлов за раз`)
    resetInput()
    return
  }

  // Валидация и обработка каждого файла
  const pendingFiles: PendingFile[] = []

  for (const file of files) {
    // Валидация файла
    const validation = validateFile(file)
    if (!validation.valid) {
      showError(validation.error || 'Ошибка валидации файла')
      resetInput()
      return
    }

    // Создаем preview для изображений
    let preview: string | undefined
    if (file.type.startsWith('image/')) {
      try {
        preview = await createImagePreview(file)
      } catch (e) {
        console.error('Ошибка создания превью:', e)
      }
    }

    // Формируем объект PendingFile
    const pendingFile: PendingFile = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: file,
      preview: preview,
      type: getAttachmentTypeFromMime(file.type),
      size: file.size,
      name: file.name,
      uploadProgress: 0
    }

    pendingFiles.push(pendingFile)
  }

  // Отправляем файлы родителю
  emit('filesSelected', pendingFiles)

  // Сбрасываем input
  resetInput()
}

// Показать ошибку
const showError = (message: string) => {
  error.value = message
  emit('error', message)

  // Автоматически скрыть через 3 секунды
  setTimeout(() => {
    error.value = ''
  }, 3000)
}

// Сбросить input
const resetInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>