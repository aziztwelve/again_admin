<template>
  <section class="mb-4 rounded-lg border bg-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        <h2 class="font-semibold text-gray-900">Порядок категорий в админке</h2>
        <p class="text-sm text-gray-500">Порядок сохраняется только в этом браузере и не влияет на витрину.</p>
      </div>
      <button
          class="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!changed"
          @click="save"
      >
        Сохранить порядок
      </button>
    </div>

    <div v-if="groups.length === 0" class="text-sm text-gray-500">Нет категорий для сортировки.</div>
    <div v-else class="grid gap-4 xl:grid-cols-2">
      <div v-for="(group, groupIndex) in groups" :key="group.key">
        <h3 class="mb-2 text-sm font-medium text-gray-700">{{ group.name }}</h3>
        <div class="space-y-1">
          <div
              v-for="(category, categoryIndex) in group.categories"
              :key="category.id"
              draggable="true"
              class="flex cursor-grab items-center gap-3 rounded-md border bg-gray-50 px-3 py-2 active:cursor-grabbing"
              :class="{'border-blue-400 bg-blue-50': dragged?.groupIndex === groupIndex && dragged.categoryIndex === categoryIndex}"
              @dragstart="startDrag(groupIndex, categoryIndex, $event)"
              @dragover.prevent
              @drop.prevent="drop(groupIndex, categoryIndex)"
              @dragend="dragged = null"
          >
            <span class="w-6 text-center text-sm font-semibold text-gray-400">{{ categoryIndex + 1 }}</span>
            <span class="flex-1 text-sm text-gray-900">{{ category.name }}</span>
            <span class="text-xs text-gray-400">↕</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import type {Category} from '@/types/category'

type Group = {key: string, name: string, categories: Category[]}

const STORAGE_KEY = 'again-admin-category-order'
const props = defineProps<{categories: Category[]}>()
const groups = ref<Group[]>([])
const changed = ref(false)
const dragged = ref<{groupIndex: number, categoryIndex: number} | null>(null)

const savedOrder = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as number[]
  } catch {
    return []
  }
}

const sortBySavedOrder = (categories: Category[], order: number[]) => {
  const positions = new Map(order.map((id, index) => [id, index]))
  return [...categories].sort((a, b) => (positions.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (positions.get(b.id) ?? Number.MAX_SAFE_INTEGER))
}

const load = () => {
  const order = savedOrder()
  const roots = sortBySavedOrder(props.categories, order)
  groups.value = [
    {key: 'root', name: 'Основные категории', categories: roots},
    ...roots
        .filter(category => category.children?.length)
        .map(category => ({
          key: `children-${category.id}`,
          name: category.name,
          categories: sortBySavedOrder(category.children ?? [], order),
        })),
  ]
  changed.value = false
}

const startDrag = (groupIndex: number, categoryIndex: number, event: DragEvent) => {
  dragged.value = {groupIndex, categoryIndex}
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const drop = (targetGroupIndex: number, targetCategoryIndex: number) => {
  if (!dragged.value || dragged.value.groupIndex !== targetGroupIndex) return
  const group = groups.value[targetGroupIndex]
  const [category] = group.categories.splice(dragged.value.categoryIndex, 1)
  group.categories.splice(targetCategoryIndex, 0, category)
  dragged.value = null
  changed.value = true
}

const save = () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups.value.flatMap(group => group.categories.map(category => category.id))))
  changed.value = false
}

watch(() => props.categories, load, {immediate: true})
</script>
