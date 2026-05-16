<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center p-4">
      <Spinner/>
    </div>

    <template v-else-if="analytics">
      <div class="bg-card border rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Детальная аналитика</h3>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Всего показов</p>
            <p class=" ">{{ analytics.views }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Всего заявок</p>
            <p class=" ">{{ analytics.submissions }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Конверсия</p>
            <p class=" ">{{ analytics.conversion_rate }}%</p>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center p-8 text-muted-foreground">
      Нет данных для отображения
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOtoBannerAnalytics } from '@/features/oto-banner/composables/useOtoBannerAnalytics'
import { OtoBannerAnalytics } from '@/features/oto-banner/types'
import { Spinner } from '@/components/ui/spinner'

interface Props {
  bannerId: number
}

const props = defineProps<Props>()

const { getBannerAnalytics } = useOtoBannerAnalytics()

const analytics = ref<OtoBannerAnalytics | null>(null)
const loading = ref(true)

onMounted(async () => {
  await loadAnalytics()
})

const loadAnalytics = async () => {
  loading.value = true
  try {
    analytics.value = await getBannerAnalytics(props.bannerId) || null
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

</script>