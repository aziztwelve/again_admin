<template>
  <div class="space-y-2">
    <div class="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2">
      <span class="whitespace-nowrap text-sm font-medium text-gray-700">{{ title }}</span>
      <span v-if="hint" class="text-right text-xs leading-4 text-gray-500">{{ hint }}</span>
    </div>

    <Input v-model="search" :placeholder="placeholder"/>

    <div v-if="selectedItems.length" class="flex flex-wrap gap-1">
      <span
          v-for="item in selectedItems"
          :key="`sel-${item.id}`"
          class="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
      >
        {{ item.name }}
        <button type="button" class="text-gray-400 hover:text-red-500" @click="toggle(item.id)">×</button>
      </span>
    </div>

    <div class="max-h-40 overflow-y-auto rounded border divide-y">
      <label
          v-for="item in visibleItems"
          :key="`item-${item.id}`"
          class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50"
      >
        <input
            type="checkbox"
            :checked="modelValue.includes(item.id)"
            @change="toggle(item.id)"
        />
        <span>{{ item.name }}</span>
      </label>
      <div v-if="!visibleItems.length" class="px-2 py-2 text-sm text-gray-400">Ничего не найдено</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'

interface ListItem {
  id: number
  name: string
}

const props = defineProps<{
  title: string
  hint?: string
  placeholder?: string
  items: ListItem[]
  modelValue: number[]
  /** Сколько записей показывать без поиска (справочники большие). */
  limit?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const search = ref('')

const selectedItems = computed(() =>
    props.modelValue
        .map(id => props.items.find(item => item.id === id) ?? { id, name: `#${id}` }),
)

const visibleItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  const filtered = query
      ? props.items.filter(item => item.name.toLowerCase().includes(query))
      : props.items

  return filtered.slice(0, props.limit ?? 50)
})

const toggle = (id: number) => {
  const next = props.modelValue.includes(id)
      ? props.modelValue.filter(item => item !== id)
      : [...props.modelValue, id]

  emit('update:modelValue', next)
}
</script>

<style scoped></style>
