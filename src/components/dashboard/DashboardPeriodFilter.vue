<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button
        v-for="preset in presets"
        :key="preset.code"
        :variant="preset.code === activePreset ? 'default' : 'outline'"
        size="sm"
        @click="applyPreset(preset.code)"
    >
      {{ preset.label }}
    </Button>

    <Popover v-model:open="popoverOpen">
      <PopoverTrigger as-child>
        <Button
            :variant="activePreset === 'custom' ? 'default' : 'outline'"
            size="sm"
            class="gap-2"
            @click="onOpenCustom"
        >
          <CalendarIcon class="h-4 w-4"/>
          <span v-if="activePreset === 'custom' && modelValue.from && modelValue.to">
            {{ formatRange(modelValue.from, modelValue.to) }}
          </span>
          <span v-else>Свой период…</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[320px] p-4" align="end">
        <div class="space-y-3">
          <div class="text-sm font-semibold text-gray-800">Выберите период</div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-gray-600">С (начало)</label>
              <input
                  type="date"
                  v-model="draftFrom"
                  :max="draftTo || today"
                  class="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-medium text-gray-600">По (конец)</label>
              <input
                  type="date"
                  v-model="draftTo"
                  :min="draftFrom || undefined"
                  :max="today"
                  class="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <p v-if="draftError" class="text-xs text-red-600">{{ draftError }}</p>
          <p v-else-if="draftFrom && draftTo" class="text-xs text-gray-500">
            {{ formatRange(draftFrom, draftTo) }} · {{ draftDays }} {{ pluralDays(draftDays) }}
          </p>
          <p v-else class="text-xs text-gray-400">Укажите обе даты, затем нажмите «Применить».</p>

          <div class="flex items-center justify-between pt-1">
            <Button variant="ghost" size="sm" @click="resetDraft">Сбросить</Button>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" @click="popoverOpen = false">Отмена</Button>
              <Button size="sm" :disabled="!canApply" @click="applyCustom">Применить</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, computed} from 'vue'
import {CalendarIcon} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Popover, PopoverTrigger, PopoverContent} from '@/components/ui/popover'

export type PeriodCode = 'day' | '3days' | 'week' | 'month' | 'year' | '2years' | 'all' | 'custom'

export interface PeriodRange {
  from: string | null // YYYY-MM-DD, null при preset='all'
  to: string | null
  preset: PeriodCode
}

const props = defineProps<{
  modelValue: PeriodRange
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: PeriodRange): void
}>()

const presets: { code: Exclude<PeriodCode, 'custom'>; label: string; days?: number }[] = [
  {code: 'day', label: 'День', days: 1},
  {code: '3days', label: '3 дня', days: 3},
  {code: 'week', label: 'Неделя', days: 7},
  {code: 'month', label: 'Месяц', days: 30},
  {code: 'year', label: 'Год', days: 365},
  {code: '2years', label: '2 года', days: 730},
  {code: 'all', label: 'Всё время'},
]

const activePreset = computed(() => props.modelValue.preset)

const formatBackend = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const today = formatBackend(new Date())

const applyPreset = (code: Exclude<PeriodCode, 'custom'>) => {
  if (code === 'all') {
    emit('update:modelValue', {from: null, to: null, preset: 'all'})
    return
  }
  const preset = presets.find(p => p.code === code)
  if (!preset || !preset.days) return
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - (preset.days - 1))
  emit('update:modelValue', {from: formatBackend(from), to: formatBackend(to), preset: code})
}

// Custom popover — локальный черновик, применяем только по кнопке.
const popoverOpen = ref(false)
const draftFrom = ref<string>('')
const draftTo = ref<string>('')

const onOpenCustom = () => {
  // Инициализируем черновик текущим выбранным диапазоном (если он осмысленный).
  draftFrom.value = props.modelValue.from ?? ''
  draftTo.value = props.modelValue.to ?? ''
}

// Если период изменился извне (клик по пресету), обновим черновик, чтобы при
// следующем открытии popover'а он показывал актуальные даты.
watch(
    () => [props.modelValue.from, props.modelValue.to] as const,
    ([from, to]) => {
      if (!popoverOpen.value) {
        draftFrom.value = from ?? ''
        draftTo.value = to ?? ''
      }
    }
)

const draftError = computed<string>(() => {
  if (!draftFrom.value || !draftTo.value) return ''
  if (draftFrom.value > draftTo.value) return 'Начальная дата позже конечной'
  if (draftTo.value > today) return 'Конечная дата не может быть в будущем'
  return ''
})

const draftDays = computed<number>(() => {
  if (!draftFrom.value || !draftTo.value) return 0
  const a = new Date(draftFrom.value).getTime()
  const b = new Date(draftTo.value).getTime()
  return Math.round((b - a) / 86400000) + 1
})

const canApply = computed<boolean>(() => !!draftFrom.value && !!draftTo.value && !draftError.value)

const applyCustom = () => {
  if (!canApply.value) return
  emit('update:modelValue', {from: draftFrom.value, to: draftTo.value, preset: 'custom'})
  popoverOpen.value = false
}

const resetDraft = () => {
  draftFrom.value = ''
  draftTo.value = ''
}

const pluralDays = (n: number): string => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
  return 'дней'
}

const formatRange = (from: string, to: string): string => {
  const fmt = (s: string) => {
    const [y, m, d] = s.split('-')
    return `${d}.${m}.${y}`
  }
  return `${fmt(from)} — ${fmt(to)}`
}
</script>
