<script lang="ts" setup>
import type {HTMLAttributes} from 'vue'
import type {DateValue} from "@internationalized/date"
import {reactiveOmit, useVModel} from '@vueuse/core'
import {
  RangeCalendarRoot,
  type RangeCalendarRootEmits,
  type RangeCalendarRootProps,
  useForwardPropsEmits,
  useDateFormatter
} from 'reka-ui'
import {createDecade, createYear, toDate} from "reka-ui/date"
import {getLocalTimeZone, today} from "@internationalized/date"
import {computed, watch} from 'vue'
import {cn} from '@/lib/utils'
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarHeader,
  RangeCalendarHeading,
  RangeCalendarNextButton,
  RangeCalendarPrevButton
} from '@/components/ui/range-calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<RangeCalendarRootProps & { class?: HTMLAttributes['class'] }>()

const emits = defineEmits<RangeCalendarRootEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const formatter = useDateFormatter("ru")

// Initialize placeholder based on modelValue or fallback to today
const getInitialPlaceholder = () => {
  if (props.modelValue?.start) {
    return props.modelValue.start
  }
  if (props.modelValue?.end) {
    return props.modelValue.end
  }
  if (props.placeholder) {
    return props.placeholder
  }
  return today(getLocalTimeZone())
}

// Create reactive placeholder that syncs with the calendar
const placeholder = useVModel(props, 'placeholder', emits, {
  defaultValue: getInitialPlaceholder(),
  passive: true,
})

// Watch for changes in modelValue to update placeholder
watch(() => props.modelValue, (newValue) => {
  if (newValue?.start && (!placeholder.value ||
      placeholder.value.year !== newValue.start.year ||
      placeholder.value.month !== newValue.start.month)) {
    placeholder.value = newValue.start
  }
}, {immediate: true})
</script>

<template>
  <RangeCalendarRoot
      v-slot="{ grid, weekDays, date }"
      :class="cn('p-3', props.class)"
      v-model:placeholder="placeholder"
      v-bind="forwarded"
  >
    <RangeCalendarHeader>
      <RangeCalendarPrevButton/>

      <RangeCalendarHeading class="flex w-full items-center justify-between gap-2 min-w-[190px] mx-2">
        <!-- Month Selector -->

        <Select
            :model-value="placeholder.month.toString()"
            @update:model-value="(v) => {
            if (!v) return;
            placeholder = placeholder.set({
              month: Number(v),
            })
          }"
        >
          <SelectTrigger aria-label="Выберите месяц" class="w-[60%]">
            <SelectValue placeholder="Выберите месяц"/>
          </SelectTrigger>
          <SelectContent class="max-h-[200px]">
            <SelectItem
                v-for="month in createYear({ dateObj: placeholder })"
                :key="month.toString()"
                :value="month.month.toString()"
            >
              {{ formatter.custom(toDate(month), {month: 'long'}) }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Year Selector -->
        <Select
            class="min-w-[200px]"
            :model-value="placeholder.year.toString()"
            @update:model-value="(v) => {
            if (!v) return;
            placeholder = placeholder.set({
              year: Number(v),
            })
          }"
        >
          <SelectTrigger aria-label="Выберите год" class="w-[40%]">
            <SelectValue placeholder="Выберите год"/>
          </SelectTrigger>
          <SelectContent class="max-h-[200px]">
            <SelectItem
                v-for="yearValue in createDecade({ dateObj: placeholder, startIndex: -10, endIndex: 10 })"
                :key="yearValue.toString()"
                :value="yearValue.year.toString()"
            >
              {{ yearValue.year }}
            </SelectItem>
          </SelectContent>
        </Select>
      </RangeCalendarHeading>

      <RangeCalendarNextButton/>
    </RangeCalendarHeader>

    <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <RangeCalendarGrid v-for="month in grid" :key="month.value.toString()">
        <RangeCalendarGridHead>
          <RangeCalendarGridRow>
            <RangeCalendarHeadCell
                v-for="day in weekDays"
                :key="day"
            >
              {{ day }}
            </RangeCalendarHeadCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridHead>
        <RangeCalendarGridBody>
          <RangeCalendarGridRow
              v-for="(weekDates, index) in month.rows"
              :key="`weekDate-${index}`"
              class="mt-2 w-full"
          >
            <RangeCalendarCell
                v-for="weekDate in weekDates"
                :key="weekDate.toString()"
                :date="weekDate"
            >
              <RangeCalendarCellTrigger
                  :day="weekDate"
                  :month="month.value"
              />
            </RangeCalendarCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridBody>
      </RangeCalendarGrid>
    </div>
  </RangeCalendarRoot>
</template>