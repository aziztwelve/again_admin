<template>
  <section class="rounded-lg border bg-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        <h2 class="font-semibold text-gray-900">{{ title }}</h2>
        <p class="text-sm text-gray-500">Перетащите категории и сохраните порядок.</p>
      </div>
      <button
          class="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="saving || !changed"
          @click="save"
      >
        {{ saving ? 'Сохранение...' : 'Сохранить порядок' }}
      </button>
    </div>

    <div v-if="loading" class="text-sm text-gray-500">Загрузка порядка...</div>
    <div v-else-if="groups.length === 0" class="text-sm text-gray-500">
      Нет категорий для сортировки.
    </div>
    <div v-else class="space-y-4">
      <div v-for="(group, groupIndex) in groups" :key="groupKey(group, groupIndex)">
        <h3 class="mb-2 text-sm font-medium text-gray-700">{{ group.parent_name }}</h3>
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
import {onMounted, ref, computed} from 'vue'
import {useCategoryFunctions} from '@/composables/useCategoryFunctions'

type OrderType = 'menu' | 'home_banner'
type OrderCategory = {id: number, name: string, parent_id: number | null, order: number}
type OrderGroup = {parent_id: number | null, parent_name: string, categories: OrderCategory[]}

const props = defineProps<{
  type: OrderType,
  title: string,
}>()

const groups = ref<OrderGroup[]>([])
const loading = ref(true)
const saving = ref(false)
const changed = ref(false)
const dragged = ref<{groupIndex: number, categoryIndex: number} | null>(null)
const {getOrderOptions, reorderCategories} = useCategoryFunctions()

const groupKey = (group: OrderGroup, index: number) => `${group.parent_id ?? 'root'}-${index}`

const load = async () => {
  loading.value = true
  try {
    groups.value = (await getOrderOptions(props.type)).data ?? []
    changed.value = false
  } finally {
    loading.value = false
  }
}

const startDrag = (groupIndex: number, categoryIndex: number, event: DragEvent) => {
  dragged.value = {groupIndex, categoryIndex}
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const drop = (targetGroupIndex: number, targetCategoryIndex: number) => {
  if (!dragged.value || dragged.value.groupIndex !== targetGroupIndex) return

  const group = groups.value[targetGroupIndex]
  const [category] = group.categories.splice(dragged.value.categoryIndex, 1)
  group.categories.splice(targetCategoryIndex, 0, category)
  dragged.value = null
  changed.value = true
}

const payload = computed(() => ({
  type: props.type,
  groups: groups.value.map(group => ({
    parent_id: group.parent_id,
    category_ids: group.categories.map(category => category.id),
  })),
}))

const save = async () => {
  saving.value = true
  try {
    await reorderCategories(payload.value)
    changed.value = false
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
