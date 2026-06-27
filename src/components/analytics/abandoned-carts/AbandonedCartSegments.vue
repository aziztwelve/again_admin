<template>
  <div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
    <h3 class="text-base font-semibold text-gray-800 mb-4">Гости и зарегистрированные</h3>

    <div class="grid gap-4 sm:grid-cols-2 grid-cols-1">
      <div
          v-for="row in rows"
          :key="row.key"
          class="rounded-lg border border-gray-100 p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{background: row.color}"></span>
            {{ row.label }}
          </span>
          <span class="text-lg font-semibold text-gray-800">{{ row.seg.rate }}%</span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div class="text-gray-400">Брошенные</div>
            <div class="font-medium text-gray-800">{{ formatInt(row.seg.abandoned) }} шт.</div>
          </div>
          <div>
            <div class="text-gray-400">Заказы</div>
            <div class="font-medium text-gray-800">{{ formatInt(row.seg.ordered) }} шт.</div>
          </div>
          <div>
            <div class="text-gray-400">Упущено</div>
            <div class="font-medium text-gray-800">{{ formatMoney(row.seg.lost_revenue) }}</div>
          </div>
          <div>
            <div class="text-gray-400">Оборот</div>
            <div class="font-medium text-gray-800">{{ formatMoney(row.seg.revenue) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {AbandonedCartSegments} from '@/types/abandoned-cart'

const props = defineProps<{
  segments: AbandonedCartSegments
}>()

const rows = computed(() => [
  {key: 'guest', label: 'Гости', color: '#F59E0B', seg: props.segments.guest},
  {key: 'registered', label: 'Зарегистрированные', color: '#3B82F6', seg: props.segments.registered},
])

const formatInt = (v: number) => (v ?? 0).toLocaleString('ru-RU')

const formatMoney = (v: number) =>
    (v ?? 0).toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + ' ₽'
</script>
