<template>
  <ModalWithProgressBar
      :sending="sending"
      :target-progress="progress"
  />

  <div class="space-y-6 p-6 max-w-4xl mx-auto">
    <div>
      <h1 class="text-2xl font-bold">Настройки Аналитики</h1>
      <p class="text-muted-foreground">Управление счетчиками и системами аналитики</p>
    </div>

    <Separator/>

    <!-- Яндекс.Метрика -->
    <Card class="md:min-w-[600px]">
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div
              class="w-10 h-10 rounded-md bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
            </svg>
          </div>

          <div class="flex-1 flex justify-between items-center">
            <div>
              <CardTitle>Яндекс.Метрика</CardTitle>
              <CardDescription>Счетчик: {{ settings.yandex_metrika_id || 'Не настроено' }}</CardDescription>
            </div>
            <div
                v-if="settings.yandex_metrika_enabled"
                class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"
            >
              Активна
            </div>
            <div
                v-else
                class="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
            >
              Неактивна
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AnalyticsForm
            :form-data="settings"
            submit-button-name="Сохранить настройки"
            @submit-form="handleSave"
        />
      </CardContent>
    </Card>

    <!-- Превью кода (если включено) -->
    <Card v-if="settings.yandex_metrika_enabled && settings.yandex_metrika_id" class="md:min-w-[600px]">
      <CardHeader>
        <CardTitle>Код счетчика для установки</CardTitle>
        <CardDescription>
          Этот код будет автоматически добавлен на все страницы вашего сайта
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre class="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm"><code>{{ generatedCode }}</code></pre>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AnalyticsForm from '@/components/integrations/analytics/AnalyticsForm.vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAnalyticsFunctions } from '@/composables/Settings/Analytics/useAnalyticsFunctions'
import ModalWithProgressBar from '@/components/dynamics/ModalWithProgressBar.vue'
import { defaultYandexMetrikaSettings, YandexMetrikaSettings } from '@/types/settings/YandexMetrikaSettings'

const settings = ref<YandexMetrikaSettings>({ ...defaultYandexMetrikaSettings })

const { progress, sending, getAnalyticsSettings, updateYandexMetrika } = useAnalyticsFunctions()

onMounted(async () => {
  settings.value = await getAnalyticsSettings()
})

const handleSave = async () => {
  const success = await updateYandexMetrika(settings.value)
  if (success) {
    // Обновляем настройки после успешного сохранения
    settings.value = await getAnalyticsSettings()
  }
}

// Генерация превью кода
const generatedCode = computed(() => {
  if (!settings.value.yandex_metrika_id) return ''

  const options = []
  if (settings.value.yandex_metrika_clickmap) options.push('clickmap:true')
  if (settings.value.yandex_metrika_tracklinks) options.push('trackLinks:true')
  if (settings.value.yandex_metrika_accurateTrackBounce) options.push('accurateTrackBounce:true')
  if (settings.value.yandex_metrika_webvisor) options.push('webvisor:true')

  return `<!-- Yandex.Metrika counter -->
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(${settings.value.yandex_metrika_id}, "init", {
        ${options.join(',\n        ')}
   });
<\/script>
<noscript><div><img src="https://mc.yandex.ru/watch/${settings.value.yandex_metrika_id}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->`
})
</script>