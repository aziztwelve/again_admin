<template>
  <Card>
    <CardHeader class="flex flex-row items-start justify-between">
      <div class="flex-1">
        <CardTitle class="text-2xl">Подарочная карта {{ giftCard.code }}</CardTitle>
        <CardDescription v-if="giftCard.delivery.message" class="mt-2">
          {{ giftCard.delivery.message }}
        </CardDescription>
      </div>
      <Badge :variant="getStatusVariant(giftCard.status)">
        {{ getStatusLabel(giftCard.status) }}
      </Badge>
    </CardHeader>

    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <!-- Основные данные -->
        <div>
          <p class="text-sm text-gray-600 mb-1">Номинал</p>
          <p class="text-lg font-bold">{{ formatPrice(giftCard.nominal) }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-600 mb-1">Баланс</p>
          <p class="text-lg font-bold" :class="Number(giftCard.balance) > 0 ? 'text-green-600' : 'text-gray-400'">
            {{ formatPrice(giftCard.balance) }}
          </p>
        </div>

        <div>
          <p class="text-sm text-gray-600 mb-1">Тип карты</p>
          <p class="text-sm">{{ getTypeLabel(giftCard.type) }}</p>
        </div>

        <!-- Отправитель -->
        <div class="col-span-1 md:col-span-2 lg:col-span-3 border-t pt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Отправитель</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Имя</p>
              <p class="text-sm">{{ giftCard.sender.name || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Email</p>
              <p class="text-sm">{{ giftCard.sender.email || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Телефон</p>
              <p class="text-sm">{{ giftCard.sender.phone || '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Получатель -->
        <div class="col-span-1 md:col-span-2 lg:col-span-3 border-t pt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Получатель</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Имя</p>
              <p class="text-sm">{{ giftCard.recipient.name || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Email</p>
              <p class="text-sm">{{ giftCard.recipient.email || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Телефон</p>
              <p class="text-sm">{{ giftCard.recipient.phone || '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Доставка -->
        <div class="col-span-1 md:col-span-2 lg:col-span-3 border-t pt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Доставка</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Канал доставки</p>
              <p class="text-sm">{{ getChannelLabel(giftCard.delivery.channel) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Дата отправки</p>
              <p class="text-sm">{{ giftCard.delivery.sent_at ? formatDate(giftCard.delivery.sent_at) : '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Дата доставки</p>
              <p class="text-sm">{{ giftCard.delivery.delivered_at ? formatDate(giftCard.delivery.delivered_at) : '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Даты -->
        <div class="col-span-1 md:col-span-2 lg:col-span-3 border-t pt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Даты</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Создана</p>
              <p class="text-sm">{{ formatDate(giftCard.created_at) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">Обновлена</p>
              <p class="text-sm">{{ formatDate(giftCard.updated_at) }}</p>
            </div>
            <div v-if="giftCard.delivery.scheduled_at">
              <p class="text-sm text-gray-600 mb-1">Запланирована</p>
              <p class="text-sm">{{ formatDate(giftCard.delivery.scheduled_at) }}</p>
            </div>
          </div>
        </div>

      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDateFormat } from '@/composables/useDateFormat'
import { usePriceFormatter } from '@/composables/usePriceFormatter'
import type { GiftCardDetail } from '@/features/gift-card/types'

interface Props {
  giftCard: GiftCardDetail
}

defineProps<Props>()

const { formatDateToRussian } = useDateFormat()
const { formatPrice } = usePriceFormatter()

const formatDate = (date: string) => formatDateToRussian(date, true)

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    inactive: 'Неактивна',
    active: 'Активна',
    used: 'Использована',
    cancelled: 'Аннулирована',
  }
  return labels[status] || status
}

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    inactive: 'secondary',
    active: 'default',
    used: 'outline',
    cancelled: 'destructive',
  }
  return variants[status] || 'default'
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    electronic: 'Электронная',
    plastic: 'Пластиковая',
  }
  return labels[type] || type
}

const getChannelLabel = (channel: string | null): string => {
  if (!channel) return '—'

  const labels: Record<string, string> = {
    email: 'Email',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
  }
  return labels[channel] || channel
}
</script>

<style scoped>

</style>