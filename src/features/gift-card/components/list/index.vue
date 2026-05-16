<template>
  <div class="space-y-2">

    <div class="md:flex justify-between items-center max-md:space-y-2">
      <GiftCardSearch
          :filter="searchParams"
          @search="handleSearch"
      />
    </div>

    <GiftCardTable
        :loading="sending"
        :gift-cards="giftCards"
        :pagination="searchParams"
        @canceled-emit="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue"
import {useGiftCards} from "@/features/gift-card/composables/useGiftCards"
import type {
  GiftCard,
  GiftCardSearchParams
} from "@/features/gift-card/types"
import GiftCardTable from "@/features/gift-card/components/list/GiftCardTable.vue"
import GiftCardSearch from "@/features/gift-card/components/list/GiftCardSearch.vue"

const giftCards = ref<GiftCard[]>([])

const searchParams = ref<GiftCardSearchParams>({
  page: 1,
  per_page: 15,
  total: 0,
  search: undefined,
  status: undefined,
  type: undefined,
  date_from: undefined,
  date_to: undefined,
  sort_by: 'created_at',
  sort_order: 'desc',
})

const {getGiftCards, sending} = useGiftCards()

onMounted(async () => {
  await getData()
})

async function getData() {
  try {
    const response = await getGiftCards(searchParams.value)
    giftCards.value = response?.data ?? []
    searchParams.value.total = response?.meta.total ?? 0
  } catch (e) {
    console.error('Failed to load gift cards:', e)
  }
}

const handleCancel = async (newGiftCard: GiftCard) => {
  if (!newGiftCard.id) return

  giftCards.value = giftCards.value.map(c =>
      c.id === newGiftCard.id ? newGiftCard : c
  )
}


const handleSearch = () => {
  searchParams.value.page = 1
  getData()
}

watch(
    () => [searchParams.value.page, searchParams.value.per_page],
    () => {
      getData()
    }
)


</script>

<style scoped>

</style>