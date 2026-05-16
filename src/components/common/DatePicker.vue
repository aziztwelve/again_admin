<script setup lang="ts">
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  parseDate,
  fromDate,
  toCalendarDate,
  toDate
} from '@internationalized/date'
import {CalendarIcon} from 'lucide-vue-next'
import {computed, PropType} from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Date, Object] as PropType<string | Date | DateValue | null>,
    default: null
  },
  placeholder: {
    type: String,
    default: 'Выберите дату'
  },
  locale: {
    type: String,
    default: 'ru-RU'
  },
})

const emit = defineEmits(['update:modelValue'])

const df = new DateFormatter(props.locale, {
  dateStyle: 'long'
})

/**
 * Parses various incoming date formats, including ISO with microseconds and Z
 */
const parseInputDate = (date: string | Date | DateValue | null): DateValue | null => {
  if (!date) return null
  try {
    // Already DateValue
    if (typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date) {
      return toCalendarDate(date as DateValue)
    }
    // JS Date object
    if (date instanceof Date) {
      return fromDate(date, getLocalTimeZone())
    }
    // String input
    if (typeof date === 'string') {
      let iso = date.trim()
      // Strip microseconds to milliseconds precision if needed
      // e.g. "2025-04-29T18:05:31.000000Z" -> "2025-04-29T18:05:31.000Z"
      iso = iso.replace(/\.(\d{3})\d*Z$/, '.$1Z')

      // Try native ISO parsing
      const jsDate = new Date(iso)
      if (!isNaN(jsDate.getTime())) {
        return fromDate(jsDate, getLocalTimeZone())
      }
      // Fallback: simple YYYY-MM-DD
      const datePart = iso.split('T')[0]
      return parseDate(datePart)
    }
  } catch (e) {
    console.warn('Could not parse date:', date, e)
  }
  return null
}

const internalValue = computed<DateValue | null>({
  get() {
    return parseInputDate(props.modelValue)
  },
  set(newValue) {
    if (!newValue) {
      emit('update:modelValue', null)
      return
    }
    // Construct local JS Date
    const jsDate = new Date(
        newValue.year,
        newValue.month - 1,
        newValue.day
    )
    // Format as ISO without timezone offset
    const pad = (num: number, len = 2) => num.toString().padStart(len, '0')
    const y = jsDate.getFullYear()
    const m = pad(jsDate.getMonth() + 1)
    const d = pad(jsDate.getDate())
    const hh = pad(jsDate.getHours())
    const mm = pad(jsDate.getMinutes())
    const ss = pad(jsDate.getSeconds())
    const ms = pad(jsDate.getMilliseconds(), 3)
    const formatted = `${y}-${m}-${d}T${hh}:${mm}:${ss}.${ms}Z`
    emit('update:modelValue', formatted)
  }
})

const displayValue = computed(() => {
  if (!internalValue.value) return props.placeholder
  const date = new Date(
      internalValue.value.year,
      internalValue.value.month - 1,
      internalValue.value.day
  )
  return df.format(date)
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
          variant="outline"
          :class="cn(
          'w-full justify-start text-left font-normal',
          !internalValue && 'text-muted-foreground'
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4"/>
        {{ displayValue }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar v-model="internalValue" initial-focus/>
    </PopoverContent>
  </Popover>
</template>
