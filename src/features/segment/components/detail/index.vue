<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Кнопка назад -->
    <BackButton title="Назад"/>

    <!-- Loader -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader class="h-8 w-8 animate-spin"/>
    </div>

    <!-- Контент -->
    <template v-else-if="segment">
      <!-- Информация о сегменте -->
      <SegmentInfo
          :segment="segment"
      />

      <!--       Условия сегмента -->
      <SegmentConditions
          v-if="segment.conditions"
          :conditions="segment.conditions"
      />

      <!--      Статистика-->
      <SegmentStatistics
          v-if="segment.statistics"
          :statistics="segment.statistics"
      />

      <!--      Промокоды-->
      <SegmentPromoCodes
          :segment-id="segment.id"
          :promo-codes="segment.promo_codes || []"
          @updated="loadSegment();"
      />

      <!--      Клиенты-->
      <SegmentClients
          :segment-id="segment.id"
          :segment="segment"
          @updated="loadSegment()"
      />
    </template>

    <!-- Ошибка -->
    <div v-else class="text-center py-12">
      <p class="text-red-500">Сегмент не найден</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import {useSegments} from '@/features/segment/composables/useSegments'
import SegmentInfo from './SegmentInfo.vue'
import SegmentConditions from './SegmentConditions.vue'
import SegmentStatistics from './SegmentStatistics.vue'
import SegmentPromoCodes from './promo-code/SegmentPromoCodes.vue'
import SegmentClients from './client/SegmentClients.vue'
import {Loader} from 'lucide-vue-next'
import {SegmentDetail} from '@/features/segment/types'

const route = useRoute()
const router = useRouter()
const {getSegmentById} = useSegments()

const segment = ref<SegmentDetail | null>(null)
const loading = ref(false)


// Загрузка сегмента
const loadSegment = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    if (!id) {
      router.push('/segments')
      return
    }

    const data = await getSegmentById(id)
    segment.value = data ?? null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSegment()
})
</script>