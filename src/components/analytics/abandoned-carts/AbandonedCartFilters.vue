<template>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex flex-col lg:flex-row lg:items-end gap-3">
      <!-- Пресеты периода -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Период</label>
        <div class="inline-flex rounded-md border border-gray-300 overflow-hidden">
          <button
              type="button"
              class="px-3 h-9 text-sm transition-colors"
              :class="preset === '7d' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              @click="selectPreset('7d')"
          >
            7 дней
          </button>
          <button
              type="button"
              class="px-3 h-9 text-sm border-l border-gray-300 transition-colors"
              :class="preset === '30d' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              @click="selectPreset('30d')"
          >
            30 дней
          </button>
          <button
              v-for="option in monthPresets"
              :key="option.preset"
              type="button"
              class="px-3 h-9 text-sm border-l border-gray-300 transition-colors"
              :class="preset === option.preset ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              @click="selectPreset(option.preset)"
          >
            {{ option.label }}
          </button>
          <button
              type="button"
              class="px-3 h-9 text-sm border-l border-gray-300 transition-colors"
              :class="preset === 'custom' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              @click="selectPreset('custom')"
          >
            Произвольный
          </button>
        </div>
      </div>

      <!-- Произвольный диапазон -->
      <template v-if="preset === 'custom'">
        <div class="w-full lg:w-48">
          <label class="block text-xs font-medium text-gray-600 mb-1">С</label>
          <DatePicker v-model="model.date_from" placeholder="Начало"/>
        </div>
        <div class="w-full lg:w-48">
          <label class="block text-xs font-medium text-gray-600 mb-1">По</label>
          <DatePicker v-model="model.date_to" placeholder="Конец"/>
        </div>
        <Button @click="emit('apply')">Применить</Button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Button} from '@/components/ui/button'
import DatePicker from '@/components/dynamics/DatePicker.vue'
import type {AbandonedCartAnalyticsFilters, PeriodPreset} from '@/types/abandoned-cart'

const model = defineModel<AbandonedCartAnalyticsFilters>({required: true})

const emit = defineEmits<{
  (e: 'apply'): void
}>()

const preset = ref<PeriodPreset>('30d')

const monthPresets: Array<{preset: Extract<PeriodPreset, '3m' | '6m' | '12m'>; label: string; months: number}> = [
  {preset: '3m', label: '3 мес.', months: 3},
  {preset: '6m', label: '6 мес.', months: 6},
  {preset: '12m', label: '12 мес.', months: 12},
]

const toIsoDate = (d: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const applyRangeDays = (days: number) => {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  model.value.date_from = toIsoDate(from)
  model.value.date_to = toIsoDate(to)
}

const applyRangeMonths = (months: number) => {
  const to = new Date()
  const from = new Date(to)
  from.setMonth(from.getMonth() - months)
  from.setDate(from.getDate() + 1)
  model.value.date_from = toIsoDate(from)
  model.value.date_to = toIsoDate(to)
}

const selectPreset = (p: PeriodPreset) => {
  preset.value = p
  if (p === '7d') {
    applyRangeDays(7)
    emit('apply')
  } else if (p === '30d') {
    applyRangeDays(30)
    emit('apply')
  } else if (p !== 'custom') {
    const option = monthPresets.find(({preset}) => preset === p)
    if (option) {
      applyRangeMonths(option.months)
      emit('apply')
    }
  }
  // 'custom' — ждём ручного выбора дат и кнопки «Применить»
}

// Инициализируем дефолт — 30 дней.
applyRangeDays(30)
</script>
