<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Кнопка назад -->
    <BackButton title="Назад"/>

    <!-- Loader -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader class="h-8 w-8 animate-spin"/>
    </div>

    <!-- Контент -->
    <template v-else-if="giftCard">
      <!-- Основная информация -->
      <GiftCardInfo
          :gift-card="giftCard"
      />

      <!-- Статистика использования -->
      <GiftCardUsageStats
          :usage="giftCard.usage"
          :transactions-count="giftCard.transactions?.length || 0"
      />

      <!-- Заказ покупки -->
      <GiftCardPurchaseOrder
          v-if="giftCard.purchase_order"
          :purchase-order="giftCard.purchase_order"
      />

      <!-- Транзакции -->
      <GiftCardTransactions
          :transactions="giftCard.transactions || []"
      />
    </template>

    <!-- Ошибка -->
    <div v-else class="text-center py-12">
      <p class="text-red-500">Подарочная карта не найдена</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import { useGiftCards } from '@/features/gift-card/composables/useGiftCards'
import GiftCardInfo from './GiftCardInfo.vue'
import GiftCardUsageStats from './GiftCardUsageStats.vue'
import GiftCardPurchaseOrder from './GiftCardPurchaseOrder.vue'
import GiftCardTransactions from './GiftCardTransactions.vue'
import { Loader } from 'lucide-vue-next'
import type { GiftCardDetail } from '@/features/gift-card/types'

const route = useRoute()
const router = useRouter()
const { getGiftCardById } = useGiftCards()

const giftCard = ref<GiftCardDetail | null>(null)
const loading = ref(false)

// Загрузка подарочной карты
const loadGiftCard = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    if (!id) {
      await router.push('/gift-cards')
      return
    }

    const data = await getGiftCardById(id)
    giftCard.value = data ?? null
  } catch (error) {
    console.error('Failed to load gift card:', error)
    giftCard.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadGiftCard()
})
</script>

<style scoped>

</style>