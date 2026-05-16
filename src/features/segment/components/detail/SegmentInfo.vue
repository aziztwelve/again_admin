<template>
  <Card>
    <CardHeader class="flex flex-row items-start justify-between">
      <div class="flex-1">
        <CardTitle class="text-2xl">{{ segment.name }}</CardTitle>
        <CardDescription v-if="segment.description" class="mt-2">
          {{ segment.description }}
        </CardDescription>
      </div>
    </CardHeader>

    <CardContent>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Статус -->
        <div>
          <p class="text-sm text-gray-600">Статус</p>
          <Badge :variant="segment.is_active ? 'destructive' : 'secondary'">
            {{ segment.is_active ? 'Активен' : 'Неактивен' }}
          </Badge>
        </div>

        <!-- Частота пересчёта -->
        <div>
          <p class="text-sm text-gray-600">Пересчёт</p>
          <p class="text-xs">
            {{ segment.recalculate_frequency === 'on_view' ? 'Авто' : 'Вручную' }}
          </p>
        </div>

        <!-- Количество клиентов -->
        <div>
          <p class="text-sm text-gray-600">Клиентов</p>
          <p class=" font-bold text-blue-600">
            {{ segment.clients_count || 0 }}
          </p>
        </div>

        <!-- Количество промокодов -->
        <div>
          <p class="text-sm text-gray-600">Промокодов</p>
          <p class=" font-bold">
            {{ segment.promo_codes_count || 0 }}
          </p>
        </div>

        <!-- Дата создания -->
        <div>
          <p class="text-sm text-gray-600">Создан</p>
          <p class="text-xs">{{ segment.created_at }}</p>
        </div>

        <!-- Последний пересчёт -->
        <div>
          <p class="text-sm text-gray-600">Последний пересчёт</p>
          <p class="text-xs">
            {{ segment.last_recalculated_at ? segment.last_recalculated_at : '—' }}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {useDateFormat} from '@/composables/useDateFormat'
import {SegmentDetail} from '@/features/segment/types'

interface Props {
  segment: SegmentDetail
}

defineProps<Props>()

const emit = defineEmits(['edit', 'delete', 'toggle-active', 'recalculate'])

const {formatDateToRussian} = useDateFormat()
</script>