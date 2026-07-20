<template>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="grid gap-3 md:grid-cols-6 grid-cols-1 items-end">
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

      <!-- Фильтр заказов по типу пользователя -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Заказы</label>
        <select
            v-model="model.user_type"
            class="w-full h-9 rounded-md border border-gray-300 px-2 text-sm bg-white"
        >
          <option value="all">Все</option>
          <option value="authorized">Авторизованные</option>
          <option value="guest">Гостевые</option>
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

      <!-- Метка (кампания) — мульти-выбор -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Метка</label>
        <MultiSelect
            :model-value="model.link_ids ?? []"
            :options="links"
            option-label="name"
            option-value="id"
            placeholder="Все"
            @update:model-value="(v: number[]) => model.link_ids = v"
        />
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
import MultiSelect from '@/components/common/MultiSelect.vue'
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
  model.value.link_ids = []
  model.value.user_type = 'all'
  model.value.from = undefined
  model.value.to = undefined
  emit('apply')
}
</script>
