<template>
  <!-- Превью -->
  <div v-if="imageSrc" class="max-w-full max-h-[300px] overflow-hidden rounded cursor-pointer overflow-y-auto" @click="isOpen = true">
    <img :src="imageSrc" alt="preview" class="object-contain w-full h-full"/>
  </div>
  <div v-else class="text-gray-400">Изображение не выбрано</div>

  <!-- Полноэкранный просмотр -->
  <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      @click.self="isOpen = false"
  >
    <button
        class="absolute top-4 right-4 text-white text-3xl hover:text-red-500"
        @click="isOpen = false"
    >
      ×
    </button>
    <img :src="imageSrc" alt="full" class="max-w-full max-h-full object-contain"/>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  file: [File, String, null],
})

const imageSrc = ref<string | null>(null)
const isOpen = ref(false)

watch(() => props.file, (newVal) => {
  if (!newVal) {
    imageSrc.value = null
    return
  }
  if (typeof newVal === 'string') {
    imageSrc.value = newVal
  } else if (newVal instanceof File) {
    imageSrc.value = URL.createObjectURL(newVal)
  }
}, { immediate: true })
</script>
