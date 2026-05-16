<template>
  <Card>
    <CardContent class="p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-500">{{ label }}</p>
          <p class="mt-2   ">{{ displayValue }}</p>
          <p v-if="description" class="mt-1 text-sm text-gray-400">
            {{ description }}
          </p>
        </div>

        <div
            v-if="icon"
            class="flex h-6 w-6 items-center justify-center rounded-full"
            :class="iconBgClass"
        >
          <component
              :is="iconComponent"
              :class="iconClass"
              class="h-4 w-4"
          />
        </div>
      </div>

      <!-- Прогресс-бар (опционально) -->
      <div v-if="progress !== undefined" class="mt-4">
        <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
              class="h-full transition-all duration-300"
              :class="progressClass"
              :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <!-- Изменение (опционально) -->
      <div v-if="change !== undefined" class="mt-3 flex items-center text-sm">
        <component
            :is="change >= 0 ? TrendingUp : TrendingDown"
            :class="change >= 0 ? 'text-green-500' : 'text-red-500'"
            class="h-4 w-4 mr-1"
        />
        <span class="font-medium" :class="change >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ Math.abs(change) }}%
        </span>
        <span class="ml-1 text-gray-500">vs прошлый период</span>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Star,
  Target,
  Activity,
  CreditCard,
  RussianRuble
} from 'lucide-vue-next'

interface Props {
  label: string
  value: string | number
  description?: string
  icon?: 'users' | 'dollar' | 'trending-up' | 'trending-down' | 'shopping-cart' | 'package' | 'star' | 'target' | 'activity' | 'credit-card' | 'ruble'
  iconColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'pink' | 'gray'
  progress?: number // 0-100
  change?: number // Процент изменения (положительный или отрицательный)
  isCurrency?: boolean // Автоматически добавлять ₽
  suffix?: string // Кастомный суффикс (например: 'шт', 'чел')
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'blue',
  isCurrency: false,
})

const displayValue = computed(() => {
  let formatted: string

  // Форматирование числа
  if (typeof props.value === 'number') {
    formatted = props.value.toLocaleString('ru-RU')
  } else {
    formatted = props.value
  }

  // Добавление суффикса
  if (props.suffix) {
    return `${formatted} ${props.suffix}`
  }

  // Автоматическое добавление ₽
  if (props.isCurrency && typeof props.value === 'number') {
    return `${formatted} ₽`
  }

  return formatted
})

const iconComponent = computed(() => {
  const iconMap = {
    'users': Users,
    'dollar': DollarSign,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    'shopping-cart': ShoppingCart,
    'package': Package,
    'star': Star,
    'target': Target,
    'activity': Activity,
    'credit-card': CreditCard,
    'ruble': RussianRuble
  }
  return props.icon ? iconMap[props.icon] : null
})

const iconBgClass = computed(() => {
  const colorMap = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    pink: 'bg-pink-100',
    gray: 'bg-gray-100',
  }
  return colorMap[props.iconColor]
})

const iconClass = computed(() => {
  const colorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    pink: 'text-pink-600',
    gray: 'text-gray-600',
  }
  return colorMap[props.iconColor]
})

const progressClass = computed(() => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500',
  }
  return colorMap[props.iconColor]
})
</script>