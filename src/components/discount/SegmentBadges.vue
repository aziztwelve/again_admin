<template>
  <span v-if="!segments.length" class="text-gray-400">—</span>
  <span v-else class="flex flex-wrap gap-1">
    <RouterLink
        v-for="segment in segments"
        :key="segment.id"
        :to="`/segments/${segment.id}`"
        :title="segment.isActive ? 'Открыть сегмент' : 'Сегмент выключен — промо по нему сейчас не действует'"
        class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors"
        :class="segment.isActive
          ? 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
          : 'border-gray-200 bg-gray-50 text-gray-400 line-through hover:bg-gray-100'"
        @click.stop
    >
      {{ segment.name }}
    </RouterLink>
  </span>
</template>

<script setup lang="ts">
import {PropType} from "vue";
import {RouterLink} from "vue-router";
import {PromoSegment} from "@/models/PromoSegment";

/**
 * Сегменты клиентов, к которым привязан промокод или акция (колонка «Сегмент» в списках
 * «Скидки и промокоды»). Пустой список — промо доступно всем: показываем прочерк.
 */
defineProps({
  segments: {
    type: Array as PropType<PromoSegment[]>,
    default: () => [],
  },
});
</script>
