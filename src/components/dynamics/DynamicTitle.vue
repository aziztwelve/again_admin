<template>
  <div class="inline-block">
    <span
        :class="[
        textClasses[variant],
        sizeClasses[size],
        'font-medium p-1 transition-colors'
      ]"
    >
      {{ title }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Заголовок текста */
  title: string
  /** Цветовая тема */
  variant?: 'default' | 'primary' | 'muted'
  /** Размер текста */
  size?: 'sm' | 'base' | 'xl' | '2xl'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'xl'
})

const textClasses = {
  default: 'text-gray-900 dark:text-gray-100',
  primary: 'text-primary-600 dark:text-primary-400',
  muted: 'text-gray-500 dark:text-gray-400'
}

const sizeClasses = {
  sm: 'text-sm',
  base: 'text-base',
  xl: 'text-xl',
  '2xl': 'text-2xl'
}

// 💡 Вычисляем объединённый класс
const computedClasses = computed(() => {
  return [
    textClasses[props.variant],
    sizeClasses[props.size],
    'font-medium p-1 transition-colors'
  ].join(' ')
})
</script>

<style scoped>
/* Плавное изменение цвета при переключении темы */
span {
  transition: color 0.2s ease;
}
</style>
