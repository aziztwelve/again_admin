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
        data.value = res.data
      })
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
