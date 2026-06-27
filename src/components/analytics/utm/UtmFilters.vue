<template>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="grid gap-3 md:grid-cols-5 grid-cols-1 items-end">
      <!-- Канал -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Канал маркетинга</label>
        <select
            v-model="model.channel_id"
            class="w-full h-9 rounded-md border border-gray-300 px-2 text-sm bg-white"
        >
          <option :value="null">Все</option>
          <option v-for="c in channels" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Тег -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Тег</label>
        <select
            v-model="model.tag_id"
            class="w-full h-9 rounded-md border border-gray-300 px-2 text-sm bg-white"
        >
          <option :value="null">Все</option>
          <option v-for="t in tags" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>

      <!-- Метка (кампания) -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Метка</label>
        <select
            v-model="model.link_id"
            class="w-full h-9 rounded-md border border-gray-300 px-2 text-sm bg-white"
        >
          <option :value="null">Все</option>
          <option v-for="l in links" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
      </div>

      <!-- Период с -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Период с</label>
        <DatePicker v-model="model.from" placeholder="Начало"/>
      </div>

      <!-- Период по -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Период по</label>
        <DatePicker v-model="model.to" placeholder="Конец"/>
      </div>
    </div>

    <div class="flex gap-2 mt-3">
      <Button @click="emit('apply')">Применить фильтры</Button>
      <Button variant="outline" @click="reset">Сбросить</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Button} from '@/components/ui/button'
import DatePicker from '@/components/dynamics/DatePicker.vue'
import type {MarketingChannel, UtmTag, UtmLink, UtmAnalyticsFilters} from '@/types/utm'

const model = defineModel<UtmAnalyticsFilters>({required: true})

defineProps<{
  channels: MarketingChannel[]
  tags: UtmTag[]
  links: UtmLink[]
}>()

const emit = defineEmits<{
  (e: 'apply'): void
}>()

const reset = () => {
  model.value.channel_id = null
  model.value.tag_id = null
  model.value.link_id = null
  model.value.from = undefined
  model.value.to = undefined
  emit('apply')
}
</script>
