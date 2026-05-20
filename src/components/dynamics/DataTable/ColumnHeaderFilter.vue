<template>
  <div class="flex items-center gap-1">
    <span class="whitespace-nowrap">{{ label }}</span>

    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <button
            type="button"
            class="p-1 -m-1 rounded hover:bg-gray-200 transition-colors"
            :class="active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'"
            :title="active ? 'Фильтр активен — нажмите, чтобы изменить' : 'Фильтровать'"
            @click.stop
        >
          <FilterIcon class="h-3.5 w-3.5"/>
          <span
              v-if="active"
              class="absolute -mt-3 ml-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-600"
              aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
          align="start"
          :class="[
            'p-3 space-y-2 normal-case font-normal text-foreground',
            // Календарь шире обычного select/text-фильтра — даём ему авто-ширину.
            column.type === 'date_range' && column.inline ? 'w-auto' : 'w-72',
          ]"
          @click.stop
      >
        <div class="text-xs font-medium text-muted-foreground">
          Фильтр: {{ label }}
        </div>

        <DynamicsFilterColumn :column="column" :filter="filter"/>

        <div class="flex items-center justify-between gap-2 pt-1">
          <Button
              type="button"
              variant="ghost"
              size="sm"
              :disabled="!active"
              @click="onClear"
          >
            Сбросить
          </Button>
          <Button
              type="button"
              size="sm"
              @click="onApply"
          >
            Применить
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {Filter as FilterIcon} from 'lucide-vue-next';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Button} from '@/components/ui/button';
import DynamicsFilterColumn from '@/components/dynamics/Filter/Column.vue';

const props = defineProps<{
  /** Текст заголовка столбца */
  label: string;
  /**
   * Конфиг колонки в формате DynamicsFilter:
   * { type: 'select' | 'text' | 'date_range' | 'date' | 'checkbox' | 'number_range', field, options?, ... }
   */
  column: Record<string, any>;
  /**
   * Общий объект searchParams со всеми фильтрами листинга. Виджет фильтра
   * пишет туда напрямую (двусторонне).
   */
  filter: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'apply'): void;
  (e: 'clear'): void;
}>();

const open = ref(false);

/**
 * Активность фильтра в этом столбце — по факту наличия значения в одном
 * из связанных полей filter[...]. Для разных типов виджетов поле(я) разные.
 */
const active = computed<boolean>(() => {
  const f = props.filter;
  const c = props.column;

  if (c.type === 'date_range') {
    const v = f[c.field];
    return !!(v && (v.start || v.end));
  }

  if (c.type === 'number_range') {
    const from = f[c.fieldFrom || `min_${c.field}`];
    const to = f[c.fieldTo || `max_${c.field}`];
    return (from !== undefined && from !== '' && from !== null)
        || (to !== undefined && to !== '' && to !== null);
  }

  const v = f[c.field];
  return v !== undefined && v !== '' && v !== null;
});

const fieldsToClear = computed<string[]>(() => {
  const c = props.column;
  if (c.type === 'date_range') return [c.field];
  if (c.type === 'number_range') return [c.fieldFrom || `min_${c.field}`, c.fieldTo || `max_${c.field}`];
  return [c.field];
});

const onApply = () => {
  open.value = false;
  emit('apply');
};

const onClear = () => {
  for (const f of fieldsToClear.value) {
    if (props.column.type === 'date_range') {
      props.filter[f] = {start: '', end: ''};
    } else {
      props.filter[f] = '';
    }
  }
  open.value = false;
  emit('clear');
};
</script>

<style scoped>
</style>
