<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center p-8">
      <Spinner/>
    </div>

    <template v-else-if="banner">
      <!-- Шапка с информацией о баннере -->
      <div class="bg-card border rounded-lg p-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold">{{ banner.name }}</h2>
            <p class="text-sm text-muted-foreground mt-1">
              {{ banner.device_type_label }} • Создан: {{ formatDate(banner.created_at) }}
            </p>
          </div>
          <div class="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                @click="router.push('/settings/oto')"
            >
              <ArrowLeft class="w-4 h-4 mr-2"/>
              Назад
            </Button>
          </div>
        </div>

        <!-- Основные метрики -->
        <div class="grid md:grid-cols-4 gap-4 mt-6 grid-cols-1">
          <div class="bg-muted/50 rounded-lg p-4">
            <p class="text-sm text-muted-foreground">Показов</p>
            <p class=" ">{{ banner.views_count || 0 }}</p>
          </div>
          <div class="bg-muted/50 rounded-lg p-4">
            <p class="text-sm text-muted-foreground">Заявок</p>
            <p class=" ">{{ banner.submissions_count || 0 }}</p>
          </div>
          <div class="bg-muted/50 rounded-lg p-4">
            <p class="text-sm text-muted-foreground">Конверсия</p>
            <p class=" ">{{ banner.conversion_rate || 0 }}%</p>
          </div>
          <div class="bg-muted/50 rounded-lg p-4">
            <p class="text-sm text-muted-foreground">Статус</p>
            <p class=" " :class="banner.is_active ? 'text-green-600' : 'text-red-600'">
              {{ banner.status_label }}
            </p>
          </div>
        </div>
      </div>

      <!-- Табы -->
      <Tabs default-value="submissions" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="submissions">Заявки</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <!-- Заявки -->
        <TabsContent value="submissions" class="space-y-4">
          <OtoBannerSubmissionsList :banner-id="bannerId"/>
        </TabsContent>

        <!-- Аналитика -->
        <TabsContent value="analytics" class="space-y-4">
          <OtoBannerAnalytics :banner-id="bannerId"/>
        </TabsContent>

        <!-- Настройки -->
        <TabsContent value="settings" class="space-y-4">
          <div class="bg-card border rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Настройки баннера</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Заголовок:</p>
                <p class="font-medium">{{ banner.title || '-' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Подзаголовок:</p>
                <p class="font-medium">{{ banner.subtitle || '-' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Кнопка:</p>
                <p class="font-medium">{{ banner.button_enabled ? banner.button_text : 'Отключена' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Поле ввода:</p>
                <p class="font-medium">
                  {{ banner.input_field_enabled ? `${banner.input_field_type_label} (${banner.input_field_label})` : 'Отключено' }}
                </p>
              </div>
              <div>
                <p class="text-muted-foreground">Задержка показа:</p>
                <p class="font-medium">{{ banner.display_delay_seconds }} сек</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

    </template>

    <div v-else class="text-center p-8">
      <p class="text-muted-foreground">Баннер не найден</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { useOtoBanners } from '@/features/oto-banner/composables/useOtoBanners'
import type { OtoBanner } from '@/features/oto-banner/types'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-vue-next'
import OtoBannerSubmissionsList from './OtoBannerSubmissionsList.vue'
import OtoBannerAnalytics from './OtoBannerAnalytics.vue'

const route = useRoute()
const bannerId = ref<number>(Number(route.params.id))

const { getOtoBannerById } = useOtoBanners()

const banner = ref<OtoBanner | null>(null)

const loading = ref(true)

onMounted(async () => {
  await loadBanner()
})

const loadBanner = async () => {
  loading.value = true
  try {
    banner.value = await getOtoBannerById(bannerId.value) || null
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

</script>

<style scoped>

</style>