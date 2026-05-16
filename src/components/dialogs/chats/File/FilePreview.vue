<template>
  <Transition name="slide-up">
    <div
        v-if="files.length > 0"
        class="border-t bg-muted/30 px-2 py-2"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-muted-foreground font-medium">
          Файлов: {{ files.length }}
        </span>
        <Button
            variant="ghost"
            size="sm"
            class="h-6 text-xs text-destructive hover:text-destructive"
            @click="emit('clearAll')"
        >
          Очистить все
        </Button>
      </div>

      <!-- Files list -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <div
            v-for="file in files"
            :key="file.id"
            class="relative flex-shrink-0"
        >
          <!-- Image preview -->
          <div
              v-if="file.type === 'image' && file.preview"
              class="relative w-16 h-16 rounded-md overflow-hidden bg-muted border"
          >
            <img
                :src="file.preview"
                :alt="file.name"
                class="w-full h-full object-cover"
            />

            <!-- Remove button -->
            <button
                type="button"
                class="absolute top-1 right-1 w-5 h-5 rounded-full p-0 bg-destructive text-white flex items-center justify-center z-10 hover:bg-destructive/90 transition-colors"
                @click.stop="handleRemove(file.id)"
            >
              <X class="w-3 h-3 pointer-events-none" />
            </button>

            <!-- Upload progress -->
            <div
                v-if="file.uploadProgress !== undefined && file.uploadProgress < 100"
                class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <!-- <span class="text-white text-xs font-medium">{{ file.uploadProgress }}%</span> -->
            </div>

            <!-- Error overlay -->
            <div
                v-if="file.error"
                class="absolute inset-0 bg-destructive/80 flex items-center justify-center pointer-events-none"
                :title="file.error"
            >
              <AlertCircle class="w-5 h-5 text-white"/>
            </div>
          </div>

          <!-- Audio/File preview -->
          <div
              v-else
              class="relative w-16 h-16 rounded-md bg-muted border flex flex-col items-center justify-center p-1"
          >
            <!-- Icon -->
            <div class="mb-1">
              <!-- Audio icon -->
              <Music
                  v-if="file.type === 'audio'"
                  class="w-6 h-6 text-blue-500"
              />

              <!-- File icon -->
              <FileText
                  v-else
                  class="w-6 h-6 text-muted-foreground"
              />
            </div>

            <!-- File name (truncated) -->
            <span class="text-[0.6rem] text-muted-foreground text-center line-clamp-1 w-full px-1">
              {{ truncateFileName(file.name, 8) }}
            </span>

            <!-- Remove button -->
            <Button
                variant="destructive"
                size="icon"
                @click="emit('remove', file.id); console.log(4545)"
                class="absolute top-1 right-1 w-5 h-5 rounded-full p-0"
            >
              <X class="w-3 h-3"/>
            </Button>

            <!-- Upload progress -->
            <div
                v-if="file.uploadProgress !== undefined && file.uploadProgress < 100"
                class="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md"
            >
              <span class="text-white text-xs font-medium">{{ file.uploadProgress }}%</span>
            </div>

            <!-- Error overlay -->
            <div
                v-if="file.error"
                class="absolute inset-0 bg-destructive/80 flex items-center justify-center rounded-md"
                :title="file.error"
            >
              <AlertCircle class="w-5 h-5 text-white"/>
            </div>
          </div>

          <!-- File size -->
          <div class="text-[0.6rem] text-muted-foreground text-center mt-1">
            {{ formatFileSize(file.size) }}
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div
          v-if="hasErrors"
          class="mt-2 text-xs text-destructive flex items-start gap-1"
      >
        <AlertCircle class="w-3 h-3 flex-shrink-0 mt-0.5"/>
        <span>Некоторые файлы не были загружены</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {Button} from '@/components/ui/button'
import {X, AlertCircle, Music, FileText} from 'lucide-vue-next'
import type {PendingFile} from '@/types/conversation'
import {formatFileSize} from '@/types/conversation'

interface Props {
  files: PendingFile[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [id: string]
  clearAll: []
}>()



const handleRemove = (id: string) => {
  emit('remove', id)
}

// Проверка наличия ошибок
const hasErrors = computed(() => {
  return props.files.some(file => file.error)
})

// Обрезать имя файла
const truncateFileName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) return name

  const extension = name.split('.').pop() || ''
  const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
  const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 3)

  return `${truncated}...${extension}`
}
</script>

<style scoped>
/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  height: 4px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
</style>