<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <tr
    v-bind="$attrs"
    :class="
      cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        props.class,
      )
    "
  >
    <slot />
  </tr>
</template>
