<template>
  <div class="avatar-cropper w-full">
    <div class="relative w-full" >
      <Cropper
          ref="cropper"
          :src="src"
          :stencil-props="{
          aspectRatio: 1,
          movable: true,
          resizable: true,
        }"
          :resize-image="{ preserveRatio: true }"
          @change="onChange"
      />

      <!-- Круглая маска поверх, пользователю визуально видно круг -->
      <div class="overlay-mask pointer-events-none"></div>
    </div>

    <!-- превью круговой картинки (если есть) -->
    <div v-if="previewDataUrl" class="mt-4 flex items-center gap-4">
      <div class="flex-shrink-0">
        <img :src="previewDataUrl" alt="avatar preview" class="w-28 h-28 rounded-full object-cover border" />
      </div>
      <div class="text-sm text-gray-600">
        <div class="font-medium">Превью аватара</div>
        <div class="text-xs mt-1">Формат: {{ outputFormat }} · Имя файла: {{ fileName }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  src: { type: String, required: true }, // исходное изображение (url/base64)
  autoEmit: { type: Boolean, default: true }, // автоматически эмитить файл при каждом изменении
  outputFormat: { type: String, default: 'image/png' }, // 'image/png' или 'image/jpeg'
  fileName: { type: String, default: 'avatar.png' },
  backgroundFill: { type: String, default: null },
  showPreview: { type: Boolean, default: true },
})

const emit = defineEmits(['update:file', 'update:preview']) // preview optional

const cropper = ref<any>(null)
const previewDataUrl = ref<string | null>(null)

// Функция — превращает квадратный canvas в круговой canvas и возвращает Blob
async function makeCircularBlob(sourceCanvas: HTMLCanvasElement | null): Promise<Blob | null> {
  if (!sourceCanvas) return null

  // берем минимальную сторону и делаем квадрат
  const size = Math.min(sourceCanvas.width, sourceCanvas.height)
  const outCanvas = document.createElement('canvas')
  outCanvas.width = size
  outCanvas.height = size
  const ctx = outCanvas.getContext('2d')
  if (!ctx) return null

  // Опционально заливка фона (например, для jpeg)
  if (props.backgroundFill) {
    ctx.fillStyle = props.backgroundFill
    ctx.fillRect(0, 0, size, size)
  } else {
    // прозрачный фон по умолчанию (png)
    ctx.clearRect(0, 0, size, size)
  }

  // Создадим круглый клип
  ctx.save()
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.clip()

  // Рассчитаем позицию, чтобы центрировать исходный canvas (если он не квадратный)
  const sx = Math.max(0, Math.floor((sourceCanvas.width - size) / 2))
  const sy = Math.max(0, Math.floor((sourceCanvas.height - size) / 2))

  ctx.drawImage(sourceCanvas, sx, sy, size, size, 0, 0, size, size)
  ctx.restore()

  return new Promise((resolve) => {
    // Для jpeg нельзя сохранять прозрачность — будем экспортировать в нужном формате
    outCanvas.toBlob((blob) => {
      resolve(blob)
    }, props.outputFormat)
  })
}

// Обработчик события change от Cropper
const onChange = async ({ canvas }: { canvas?: HTMLCanvasElement | null }) => {
  if (!canvas) return

  // Преобразуем в круг и получим Blob
  const blob = await makeCircularBlob(canvas)
  if (!blob) return

  // Создаём File
  const ext = props.outputFormat === 'image/png' ? 'png' : 'jpg'
  const finalName = props.fileName || `avatar.${ext}`
  const file = new File([blob], finalName, { type: props.outputFormat })

  // Создаем preview (dataURL) если нужно
  if (props.showPreview) {
    const reader = new FileReader()
    reader.onload = () => {
      previewDataUrl.value = reader.result as string
      emit('update:preview', previewDataUrl.value)
    }
    reader.readAsDataURL(file)
  }

  // Автоматически эмитим файл
  if (props.autoEmit) {
    emit('update:file', file)
  }
}

</script>

<style scoped>

</style>
