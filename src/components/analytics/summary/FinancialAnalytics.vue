<template>
  <div class="space-y-6">
<!--    <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Финансовая аналитика</h1>-->

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Доходы -->
      <Card class="border-green-100 dark:border-green-900/50 hover:shadow-sm transition-shadow">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-medium text-green-600 dark:text-green-400">Доходы</CardTitle>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-light">582 559 ₽</span>
            <span class="text-green-500 text-sm flex items-center">
              <TrendingUp class="h-3 w-3 mr-0.5" />
              +17.5%
            </span>
          </div>
        </CardHeader>
        <CardContent class="space-y-3 pt-0">
          <div>
            <h3 class="text-sm text-muted-foreground mb-1">Основные расходы</h3>
            <p class="text-lg font-light">0 ₽</p>
          </div>

          <div class="space-y-2">
            <h4 class="text-xs text-muted-foreground">Продажи / Компенсации</h4>
            <div class="flex justify-between items-center text-sm">
              <span class="font-normal">100%</span>
              <div class="text-right">
                <p class="font-light">582 559 ₽</p>
                <p class="text-muted-foreground text-xs">0 ₽</p>
              </div>
            </div>
          </div>

          <Separator class="my-2" />

          <div class="space-y-2">
            <h4 class="text-xs text-muted-foreground">Другие расходы</h4>
            <div v-for="item in incomeItems" :key="item.name" class="flex justify-between text-sm">
              <span class="text-muted-foreground">{{ item.name }}</span>
              <span class="font-light">{{ item.value }} ₽</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Расходы -->
      <Card class="border-rose-100 dark:border-rose-900/50 hover:shadow-sm transition-shadow">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-medium text-rose-600 dark:text-rose-400">Доп. расходы</CardTitle>
          <p class="text-2xl font-light">0 ₽</p>
        </CardHeader>
        <CardContent class="space-y-2 pt-0">
          <div v-for="item in expenseItems" :key="item.name" class="flex justify-between items-center py-1 text-sm">
            <span class="text-muted-foreground">{{ item.name }}</span>
            <span class="font-light">{{ item.value }} ₽</span>
          </div>
        </CardContent>
      </Card>

      <!-- Прибыль -->
      <Card class="border-blue-100 dark:border-blue-900/50 hover:shadow-sm transition-shadow">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-medium text-blue-600 dark:text-blue-400">Прибыль</CardTitle>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-light">582 559 ₽</span>
            <span class="text-blue-500 text-sm flex items-center">
              <TrendingUp class="h-3 w-3 mr-0.5" />
              +17.5%
            </span>
          </div>
        </CardHeader>
        <CardContent class="pt-0">
          <div class="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded text-xs text-blue-600 dark:text-blue-300">
            <p>Прибыль снизилась на <span class="font-medium">123 577 ₽</span> по сравнению с предыдущим периодом</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const incomeItems = [
  { name: 'Комиссия МП', value: '0' },
  { name: 'Логистика', value: '0' },
  { name: 'Обработка товара', value: '0' },
  { name: 'Себестоимость', value: '0' },
  { name: 'Эквайринг', value: '0' }
]

const expenseItems = [
  { name: 'Маркетинг', value: '0' },
  { name: 'Штрафы', value: '0' },
  { name: 'Другое', value: '0' }
]
</script>