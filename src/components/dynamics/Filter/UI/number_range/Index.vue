<template>
  <div class="flex items-center gap-2">
    <Input
        type="number"
        :placeholder="column.placeholderFrom || 'от'"
        v-model="from"
        min="0"
        class="w-1/2"
    />
    <span class="text-muted-foreground text-sm">—</span>
    <Input
        type="number"
        :placeholder="column.placeholderTo || 'до'"
        v-model="to"
        min="0"
        class="w-1/2"
    />
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {Input} from '@/components/ui/input';

const props = defineProps({
  column: {
    type: Object,
    required: true,
  },
  filter: {
    type: Object,
    required: true,
  },
});

// Поля в общем фильтре. По умолчанию хранится так:
//   filter[fieldFrom] = '...'   filter[fieldTo] = '...'
// Если не заданы — деривируем из column.field: min_<field> / max_<field>.
const fieldFrom = computed(() => props.column.fieldFrom || `min_${props.column.field}`);
const fieldTo = computed(() => props.column.fieldTo || `max_${props.column.field}`);

const from = computed({
  get: () => props.filter[fieldFrom.value] ?? '',
  set: (v) => {
    props.filter[fieldFrom.value] = v === '' || v === null ? '' : v;
  },
});

const to = computed({
  get: () => props.filter[fieldTo.value] ?? '',
  set: (v) => {
    props.filter[fieldTo.value] = v === '' || v === null ? '' : v;
  },
});
</script>

<style scoped></style>
