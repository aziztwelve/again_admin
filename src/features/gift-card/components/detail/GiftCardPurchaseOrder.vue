<template>
  <Card>
    <CardHeader>
      <CardTitle>Заказ покупки</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <!-- Номер заказа (кликабельный) -->
        <div>
          <p class="text-sm text-gray-600 mb-1">Номер заказа</p>
          <button
              @click="goToOrder(purchaseOrder.id)"
              class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            {{ purchaseOrder.id }}
          </button>
        </div>

        <!-- Дата создания -->
        <div>
          <p class="text-sm text-gray-600 mb-1">Дата создания</p>
          <p class="text-sm">{{ formatDate(purchaseOrder.created_at) }}</p>
        </div>

        <!-- Клиент (если есть) -->
        <template v-if="purchaseOrder.client?.profile">
          <div class="col-span-1 md:col-span-2 lg:col-span-3 border-t pt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Клиент</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Имя</p>
                <p class="text-sm">{{ purchaseOrder.client.profile.full_name || '—' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Email</p>
                <p class="text-sm">{{ purchaseOrder.client.profile.email || '—' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Телефон</p>
                <p class="text-sm">{{ purchaseOrder.client.profile.phone || '—' }}</p>
              </div>
            </div>
          </div>
        </template>

      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useDateFormat } from '@/composables/useDateFormat'
import { useRouter } from 'vue-router'

interface Props {
  purchaseOrder: {
    id: number
    order_number: string
    created_at: string
    client?: {
      id: number
      profile?: {
        full_name: string
        email: string
        phone: string
      }
    }
  }
}

defineProps<Props>()

const router = useRouter()
const { formatDateToRussian } = useDateFormat()

const formatDate = (date: string) => formatDateToRussian(date, true)

const goToOrder = (orderId: number) => {
  router.push(`/order/update/${orderId}`)
}
</script>

<style scoped>

</style>