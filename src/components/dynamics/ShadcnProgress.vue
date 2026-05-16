<template>
  <div class="w-full space-y-2">
    <Progress :model-value="progress" />
    <div class="flex justify-between text-sm text-muted-foreground">
      <span>Прогресс: {{ progress }}%</span>
      <button
          v-if="!isAnimating && progress < targetProgress"
          @click="startProgress"
          class="text-primary hover:underline"
      >
        Продолжить
      </button>
      <button
          v-if="progress > 0 && progress < targetProgress"
          @click="resetProgress"
          class="text-destructive hover:underline"
      >
        Сбросить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Progress } from '@/components/ui/progress'
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  duration: { // Длительность анимации в секундах (время анимации от текущего прогресса до targetProgress)
    type: Number,
    default: 3
  },
  targetProgress: { // Целевое значение прогресса (0–100)
    type: Number,
    default: 100
  },
  autoStart: { // Автоматически запускать анимацию при монтировании
    type: Boolean,
    default: true
  }
})

const progress = ref(0)
const isAnimating = ref(false)
let animationFrame: number | null = null
let startTime = 0
let startProgressValue = 0

// Анимируем от текущего progress.value к props.targetProgress
const startProgress = () => {
  // отменяем предыдущую анимацию (если есть) и начнём новую от текущего значения
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  isAnimating.value = true
  startProgressValue = progress.value // стартуем от текущего значения
  startTime = performance.now()

  const totalDurationMs = Math.max(props.duration * 1000, 1) // мс

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const t = Math.min(elapsed / totalDurationMs, 1) // 0..1

    // интерполируем от startProgressValue до targetProgress
    const newProgress = startProgressValue + (props.targetProgress - startProgressValue) * t
    progress.value = Math.round(newProgress)

    if (t < 1 && progress.value < props.targetProgress) {
      animationFrame = requestAnimationFrame(animate)
    } else {
      isAnimating.value = false
      progress.value = props.targetProgress
      animationFrame = null
    }
  }

  animationFrame = requestAnimationFrame(animate)
}

const resetProgress = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  progress.value = 0
  isAnimating.value = false
}

// Автоматический запуск при монтировании
onMounted(() => {
  if (props.autoStart) startProgress()
})

// Теперь при изменении targetProgress — запускаем анимацию от текущего значения к новому.
// ВАЖНО: не обнуляем progress при этом — поэтому плавно увеличиваемся.
watch(() => props.targetProgress, (newVal) => {
  if (newVal > progress.value) {
    startProgress()
  } else {
    // если целевое уменьшилось — просто установим его
    progress.value = newVal
  }
})

// Очистка анимации при размонтировании
onBeforeUnmount(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>
