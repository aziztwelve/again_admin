<template>
  <div>

    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <CategorySearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />

      <CategoryAddModal
          @created="handleCreate"
      />

    </div>

    <CategoryListTable
        :items="data"
        :pagination="pagination"
        :loading="sending"
        @deleted="handleDelete"
        @updated="handleUpdate"
        @reordered="handleReorder"
        @moved="handleMove"
    />

  </div>

</template>

<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue';
import CategorySearch from "@/components/category/CategorySearch.vue";
import CategoryListTable from "@/components/category/CategoryListTable.vue";
import {useCategoryFunctions} from "@/composables/useCategoryFunctions";
import CategoryAddModal from "@/components/category/CategoryAddModal.vue";
import {Category, CategoryFilterQuery} from "@/types/category";
import {PaginationMeta} from "@/types/Types";


const data = ref<Category[]>([]);
const adminOrderStorageKey = 'again-admin-category-order'

const pagination = ref<PaginationMeta>({
  page: 1,
  per_page: 15,
  total: 0,
})

const paramsSearch = ref<CategoryFilterQuery>({
  search: undefined,
})

const {getCategories, sending} = useCategoryFunctions()

const queryParams = computed<CategoryFilterQuery>(() => ({
  ...paramsSearch.value,
  page: pagination.value.page,
  per_page: pagination.value.per_page,
}))

async function fetchData() {
  await getCategories(queryParams.value)
      .then((res) => {
        pagination.value.total = res.meta.total ?? 0
        data.value = sortForAdmin(res.data)
      })
}

const sortForAdmin = (categories: Category[]) => {
  const savedIds = JSON.parse(window.localStorage.getItem(adminOrderStorageKey) ?? '[]') as number[]
  const positions = new Map(savedIds.map((id, index) => [id, index]))
  const sort = (items: Category[]) => [...items]
      .sort((left, right) => (positions.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (positions.get(right.id) ?? Number.MAX_SAFE_INTEGER))
      .map(item => ({...item, children: item.children ? sort(item.children) : item.children}))
  return sort(categories)
}

const handleReorder = ({source, target}: {source: Category, target: Category}) => {
  const reorder = (items: Category[]): Category[] => {
    const sourceIndex = items.findIndex(item => item.id === source.id)
    const targetIndex = items.findIndex(item => item.id === target.id)
    if (sourceIndex !== -1 && targetIndex !== -1) {
      const next = [...items]
      const [item] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, item)
      return next
    }
    return items.map(item => ({...item, children: item.children ? reorder(item.children) : item.children}))
  }

  data.value = reorder(data.value)
  saveLocalOrder()
}

const handleMove = ({category, direction}: {category: Category, direction: 'up' | 'down'}) => {
  const move = (items: Category[]): Category[] => {
    const index = items.findIndex(item => item.id === category.id)
    if (index !== -1) {
      const targetIndex = index + (direction === 'up' ? -1 : 1)
      if (targetIndex < 0 || targetIndex >= items.length) return items
      const next = [...items]
      const [item] = next.splice(index, 1)
      next.splice(targetIndex, 0, item)
      return next
    }
    return items.map(item => ({...item, children: item.children ? move(item.children) : item.children}))
  }
  data.value = move(data.value)
  saveLocalOrder()
}

const saveLocalOrder = () => {
  const ids: number[] = []
  const collectIds = (items: Category[]) => items.forEach(item => {
    ids.push(item.id)
    if (item.children) collectIds(item.children)
  })
  collectIds(data.value)
  window.localStorage.setItem(adminOrderStorageKey, JSON.stringify(ids))
}

onMounted(() => {
  fetchData()
})

const handleSearch = () => {
  pagination.value.page = 1
  fetchData()
}


const handleCreate = (c: Category) => {

  data.value = [...data.value, c]

}
const handleUpdate = (c: Category) => {

  data.value = data.value.map(item => item.id == c.id ? c : item)

}
const handleDelete = (c: Category) => {

  data.value = data.value.filter(item => item.id !== c.id)

}

watch(
    () => [pagination.value.page, pagination.value.per_page],
    () => fetchData()
)

</script>
