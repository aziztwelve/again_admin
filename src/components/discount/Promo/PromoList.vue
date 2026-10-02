<template>
  <div class="">

    <div class="flex max-md:flex-col justify-between mb-2 max-md:space-y-2">
      <PromoSearch
          class="md:w-[400px]"
          :filter="paramsSearch"
          @search="handleSearch"
      />

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
            :button-name="`Скрыть выбранные (${selectedPromoIds.length})`"
            button-variant="outline"
            button-style="border-red-200 text-red-700 hover:bg-red-50"
            :disabled-button="selectedPromoIds.length === 0 || isHiding"
            :title="`Скрыть ${selectedPromoIds.length} промокодов?`"
            description="У выбранных кодов аудитория станет «Скрыть промокод». Они не будут показаны или применены покупателям."
            @continue="hideSelected"
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
import {ref, onMounted} from 'vue';
import PaginationTable from "@/components/PaginationTable.vue";
import Loader from "@/components/common/Loader.vue";
import PromoListTable from "@/components/discount/Promo/PromoListTable.vue";
import PromoAddModal from "@/components/discount/Promo/PromoAddModal.vue";
import PromoSearch from "@/components/discount/Promo/PromoSearch.vue";
import {usePromoCodeFunctions} from "@/composables/usePromoCodeFunctions";
import {PromoCode} from "@/models/PromoCode";
import AlertDialog from "@/components/dynamics/AlertDialog.vue";

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

const {getPromoCodes, hidePromoCodes} = usePromoCodeFunctions()

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
  })
      .then(res => {
        totalItems.value = res?.meta?.total ?? 1
        return res?.data
      })

  isLoading.value = false
  renderTable.value++
}

async function hideSelected() {
  isHiding.value = true
  try {
    if (await hidePromoCodes(selectedPromoIds.value)) {
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
