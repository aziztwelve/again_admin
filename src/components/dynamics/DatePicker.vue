<script setup lang="ts">
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {PopoverClose} from 'reka-ui'
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  parseDate,
  fromDate,
  toCalendarDate,
} from '@internationalized/date'
import {CalendarIcon, X as ClearIcon} from 'lucide-vue-next'
import {computed, PropType, watch} from 'vue'

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
  disabled: Boolean,
  clearable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const df = new DateFormatter('ru-RU', {
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

      // ✅ Поддержка формата "30.07.2025 04:21"
      if (/^\d{2}\.\d{2}\.\d{4}( \d{2}:\d{2})?$/.test(iso)) {
        const [datePart, timePart = '00:00'] = iso.split(' ')
        const [day, month, year] = datePart.split('.').map(Number)
        const [hours, minutes] = timePart.split(':').map(Number)
        const jsDate = new Date(year, month - 1, day, hours, minutes)
        if (!isNaN(jsDate.getTime())) {
          return fromDate(jsDate, getLocalTimeZone())
        }
      }

      // Обрезаем микросекунды до миллисекунд (например, ".000000Z" -> ".000Z")
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

const internalValue = computed<DateValue | null>({
  get() {
    return parseInputDate(props.modelValue)
  },
  set(newValue) {
    if (!newValue) {
      emit('update:modelValue', null)
      return
    }
    // build a JS Date so we can zero-pad everything
    const js = new Date(newValue.year, newValue.month - 1, newValue.day)
    const pad = (n: number, len = 2) => n.toString().padStart(len, '0')
    const iso = `${js.getFullYear()}-${pad(js.getMonth() + 1)}-${pad(js.getDate())}` +
        `T${pad(js.getHours())}:${pad(js.getMinutes())}` +
        `:${pad(js.getSeconds())}.${pad(js.getMilliseconds(), 3)}Z`
    emit('update:modelValue', iso)
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

const clear = (e?: Event) => {
  e?.preventDefault()
  e?.stopPropagation()
  emit('update:modelValue', null)
}


watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        internalValue.value = parseInputDate(val)
      } else {
        internalValue.value = null
      }
    },
    {immediate: true}
)

</script>

<template>
  <div class="relative w-full">
    <Popover>
      <PopoverTrigger as-child>
        <Button
            variant="outline"
            :class="cn(
            'w-full justify-start text-left font-normal',
            !internalValue && 'text-muted-foreground',
            clearable && internalValue && !disabled && 'pr-9'
          )"
        >
          <CalendarIcon class="mr-2 h-4 w-4"/>
          {{ displayValue }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0">
        <Calendar
            :disabled="disabled"
            v-model="internalValue"
            initial-focus
            locale="ru-RU"
        />
        <div class="flex items-center justify-between gap-2 border-t p-2">
          <Button
              v-if="clearable"
              variant="ghost"
              size="sm"
              :disabled="disabled || !internalValue"
              @click="clear"
          >
            Сбросить
          </Button>
          <span v-else></span>
          <PopoverClose as-child>
            <Button size="sm">Применить</Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
    <button
        v-if="clearable && internalValue && !disabled"
        type="button"
        :title="'Очистить'"
        class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
        @mousedown.stop.prevent
        @click="clear"
    >
      <ClearIcon class="h-4 w-4"/>
    </button>
  </div>
</template>
