<template>
  <div class="">

    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <div class="flex max-md:flex-col gap-2 md:items-center">
        <PromoSearch
            class="md:w-[400px]"
            :filter="paramsSearch"
            @search="handleSearch"
        />

        <select
            v-model="sortMode"
            class="h-10 rounded-md border border-input bg-background px-3 text-sm"
            title="Порядок промокодов в списке"
            @change="handleSortChange"
        >
          <option value="default">Порядок по умолчанию</option>
          <option value="name_asc">По названию: А → Я</option>
          <option value="name_desc">По названию: Я → А</option>
        </select>
      </div>

      <PromoAddModal
          :key="renderCreated"
          @created="fetchData(); renderCreated++"
      />

    </div>

    <Loader v-if="isLoading"/>

    <div v-else>
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
        <span class="text-muted-foreground">
          Выберите до 50 промокодов чекбоксами в таблице, чтобы скрыть их через поле «Аудитория».
        </span>
        <AlertDialog
            :button-name="`${selectedAreHidden ? 'Показать' : 'Скрыть'} выбранные (${selectedPromoIds.length})`"
            button-variant="outline"
            button-style="border-red-200 text-red-700 hover:bg-red-50"
            :disabled-button="selectedPromoIds.length === 0 || isHiding"
            :title="`${selectedAreHidden ? 'Показать' : 'Скрыть'} ${selectedPromoIds.length} промокодов?`"
            :description="selectedAreHidden
              ? 'У выбранных кодов аудитория станет «Все пользователи». Их снова смогут увидеть и применить покупатели.'
              : 'У выбранных кодов аудитория станет «Скрыт». Они не будут показаны или применены покупателям.'"
            @continue="toggleSelected"
        />
      </div>

      <PromoListTable
          :key="renderTable"
          :items="data ?? []"
          @deleted="handleDeleted"
          @updated="fetchData()"
          @selection-change="selectedPromoIds = $event"
      />

      <PaginationTable
          class="flex justify-end w-full"
          :total="totalItems"
          :default-page="currentPage"
          :items-per-page="itemsPerPage"
          :sibling-count="1"
          :show-edges="true"
          @current-page="currentPage = $event; fetchData()"
      />
    </div>


  </div>
</template>

<script setup lang="ts">
import {computed, ref, onMounted} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import PromoListTable from "@/components/discount/Promo/PromoListTable.vue";
import PromoAddModal from "@/components/discount/Promo/PromoAddModal.vue";
import PromoSearch from "@/components/discount/Promo/PromoSearch.vue";
import {usePromoCodeFunctions} from "@/composables/usePromoCodeFunctions";
import {PromoCode} from "@/models/PromoCode";
import AlertDialog from "@/components/dynamics/AlertDialog.vue";
import {CustomerType} from "@/constants/DiscountType";

const data = ref<PromoCode[]>();
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(50);
const isLoading = ref(true)
const isHiding = ref(false)
const selectedPromoIds = ref<number[]>([])
const renderTable = ref(1)
const renderCreated = ref(1)


const paramsSearch = ref({
  search: '',
})

// Порядок списка: по умолчанию (как раньше) или по названию промокода.
// Выбор запоминается в браузере; если localStorage недоступен — порядок по умолчанию.
type SortMode = 'default' | 'name_asc' | 'name_desc'
const SORT_STORAGE_KEY = 'promo-list-sort'
const readSortMode = (): SortMode => {
  try {
    const v = localStorage.getItem(SORT_STORAGE_KEY)
    return v === 'name_asc' || v === 'name_desc' ? v : 'default'
  } catch {
    return 'default'
  }
}
const sortMode = ref<SortMode>(readSortMode())

const sortParams = computed(() => {
  if (sortMode.value === 'name_asc') return {sort_by: 'code' as const, sort_order: 'asc' as const}
  if (sortMode.value === 'name_desc') return {sort_by: 'code' as const, sort_order: 'desc' as const}
  return {}
})

async function handleSortChange() {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, sortMode.value)
  } catch {
    // хранилище недоступно — не критично
  }
  currentPage.value = 1
  await fetchData()
}

const {getPromoCodes, hidePromoCodes, showPromoCodes} = usePromoCodeFunctions()

const selectedAreHidden = computed(() => {
  if (selectedPromoIds.value.length === 0) return false
  const selected = (data.value ?? []).filter(promo => selectedPromoIds.value.includes(promo.id!))
  return selected.length === selectedPromoIds.value.length && selected.every(promo => promo.customerType === CustomerType.HIDDEN)
})

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  isLoading.value = true
  selectedPromoIds.value = []
  data.value = await getPromoCodes({
    per_page: itemsPerPage.value,
    page: currentPage.value,
    code: paramsSearch.value.search,
    ...sortParams.value,
  })
      .then(res => {
        totalItems.value = res?.meta?.total ?? 1
        return res?.data
      })

  isLoading.value = false
  renderTable.value++
}

async function toggleSelected() {
  isHiding.value = true
  try {
    const action = selectedAreHidden.value ? showPromoCodes : hidePromoCodes
    if (await action(selectedPromoIds.value)) {
      await fetchData()
    }
  } finally {
    isHiding.value = false
  }
}


function handleDeleted(promoCode: PromoCode) {
  data.value = data.value?.filter(d => d.id !== promoCode.id)
  renderTable.value++
}


const handleSearch = async () => {
  currentPage.value = 1;
  await fetchData()
}

</script>
