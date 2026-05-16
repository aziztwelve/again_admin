<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
          variant="outline"
          :class="cn(
          'w-full justify-start text-left font-normal',
          !localDate && 'text-muted-foreground'
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4"/>
        <template v-if="localDate">
          {{ displayValue }}
        </template>
        <template v-else>
          {{ column.placeholder || 'Выберите дату' }}
        </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar
          v-model="localDate"
          initial-focus
          locale="ru-RU"
      />
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import {ref, watch, computed} from 'vue'
import {Popover, PopoverTrigger, PopoverContent} from '@/components/ui/popover'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {CalendarIcon} from 'lucide-vue-next'
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  parseDate,
  fromDate,
  toCalendarDate,
} from '@internationalized/date'
import {cn} from '@/lib/utils'

const props = defineProps({
  column: Object,
  filter: Object
})

const df = new DateFormatter('ru-RU', {
  dateStyle: 'long'
})

/**
 * Парсит различные форматы входящих дат
 */
const parseInputDate = (date: string | Date | DateValue | null): DateValue | null => {
  if (!date) return null
  try {
    // Уже DateValue
    if (typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date) {
      return toCalendarDate(date as DateValue)
    }
    // JS Date объект
    if (date instanceof Date) {
      return fromDate(date, getLocalTimeZone())
    }
    // Строковый ввод
    if (typeof date === 'string') {
      let iso = date.trim()

      // Поддержка формата "30.07.2025 04:21"
      if (/^\d{2}\.\d{2}\.\d{4}( \d{2}:\d{2})?$/.test(iso)) {
        const [datePart, timePart = '00:00'] = iso.split(' ')
        const [day, month, year] = datePart.split('.').map(Number)
        const [hours, minutes] = timePart.split(':').map(Number)
        const jsDate = new Date(year, month - 1, day, hours, minutes)
        if (!isNaN(jsDate.getTime())) {
          return fromDate(jsDate, getLocalTimeZone())
        }
      }

      // Обрезаем микросекунды до миллисекунд
      iso = iso.replace(/\.(\d{3})\d*Z$/, '.$1Z')

      // ISO формат
      const jsDate = new Date(iso)
      if (!isNaN(jsDate.getTime())) {
        return fromDate(jsDate, getLocalTimeZone())
      }

      // Fallback: "YYYY-MM-DD"
      const datePart = iso.split('T')[0]
      return parseDate(datePart)
    }

  } catch (e) {
    console.warn('Could not parse date:', date, e)
  }
  return null
}

// локальный ref для даты
const localDate = ref<DateValue | null>(null)

// инициализация из filter
if (props.filter[props.column.field]) {
  localDate.value = parseInputDate(props.filter[props.column.field])
}

// отображаемое значение
const displayValue = computed(() => {
  if (!localDate.value) return props.column.placeholder || 'Выберите дату'
  const date = new Date(
      localDate.value.year,
      localDate.value.month - 1,
      localDate.value.day
  )
  return df.format(date)
})

// форматирование для бэкенда
const formatForBackend = (date: DateValue | null): string => {
  if (!date) return ''
  const year = date.year
  const month = String(date.month).padStart(2, '0')
  const day = String(date.day).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// следим за изменениями и обновляем filter
watch(
    localDate,
    (date) => {
      if (date) {
        props.filter[props.column.field] = formatForBackend(date)
      } else {
        props.filter[props.column.field] = ''
      }
    },
    {immediate: true}
)

// следим за изменениями в filter извне
watch(
    () => props.filter[props.column.field],
    (newValue) => {
      if (!newValue) {
        localDate.value = null
      } else if (formatForBackend(localDate.value) !== newValue) {
        localDate.value = parseInputDate(newValue)
      }
    }
)
</script>