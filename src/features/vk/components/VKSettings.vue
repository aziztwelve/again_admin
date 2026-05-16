<template>
  <div class="">


    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
            <MessageCircle class="w-4 h-4"/>
          </div>

          <div class="flex-1">
            <CardTitle class="text-base">ВКонтакте API</CardTitle>
            <CardDescription class="text-sm">Синхронизация сообщений через webhook</CardDescription>
          </div>

          <div class="flex items-center space-x-2">
            <Switch v-model="vkEnabled"/>
          </div>
        </div>
      </CardHeader>

      <CardContent :class="{ 'opacity-50 pointer-events-none': !vkEnabled }">
        <div class="mb-3" v-if="sending">
          <div class="h-2 bg-gray-200 rounded">
            <div class="h-2 rounded bg-blue-600" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="text-xs mt-1">Прогресс: {{ progress }}%</p>
        </div>

        <DynamicForm
            v-model="vkForm"
            :fields="fields"
            submit-button-text="Сохранить"
            :show-submit-button="false"
            @submit-form="onSave"
        />
      </CardContent>

      <div class="flex items-center px-7 pb-2 space-x-3">
        <Button :disabled="sending" @click="onSave" v-if="vkEnabled">Сохранить</Button>
      </div>

    </Card>

    <!-- Справка -->
    <Card v-if="vkEnabled" class="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle class="text-sm">Как получить токен ВК?</CardTitle>
      </CardHeader>
      <CardContent class="text-sm text-muted-foreground space-y-2">
        <p>1. Перейди в настройки сообщества ВК → API → Access Tokens</p>
        <p>2. Создай токен с правом на управление сообщениями</p>
        <p>3. Скопируй токен и вставь выше</p>
        <p>4. ID сообщества можно найти в URL сообщества (после id=)</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Switch} from '@/components/ui/switch'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import {MessageCircle} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {useVKSettingsFunctions} from '@/features/vk/composables/useVKSettingsFunctions'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'

const vkEnabled = ref(false)
const sending = ref(false)
const progress = ref(0)

const vkForm = ref<any>({
  community_id: '',
  access_token: '',
  confirmation_token: '',
  api_version: '5.131',
})

const fields = [
  [
    {name: 'community_id', component: 'text', label: 'ID сообщества ВК', required: true, placeholder: 'Например: 123456789'},
    {name: 'access_token', component: 'text', type: 'password', label: 'Access Token', required: true},
  ],
  [
    {name: 'confirmation_token', component: 'text', label: 'Confirmation Token', required: false, placeholder: 'Заполнится автоматически'},
    {name: 'api_version', component: 'text', label: 'Версия API', required: true},
  ],
]

const {getVKSettings, saveVKSettings, testVKConnection} = useVKSettingsFunctions()
const errorHandler = useErrorHandler()
const successHandler = useSuccessHandler()

// Загрузка существующих настроек
const loadSettings = async () => {
  sending.value = true
  progress.value = 0
  try {
    const res = await getVKSettings()
    if (res && res.success && res.data) {
      vkForm.value = {
        community_id: res.data.community_id || '',
        access_token: res.data.access_token || '',
        confirmation_token: res.data.confirmation_token || '',
        api_version: res.data.api_version || '5.131',
      }
      vkEnabled.value = !!vkForm.value.community_id && !!vkForm.value.access_token
    }
  } catch (e) {
    errorHandler.showError(e)
  } finally {
    sending.value = false
  }
}

onMounted(loadSettings)

// Сохранение настроек
const onSave = async () => {
  if (sending.value) return
  if (!vkForm.value.community_id || !vkForm.value.access_token) {
    errorHandler.showError(new Error('Заполни ID сообщества и Access Token'))
    return
  }

  sending.value = true
  progress.value = 0

  try {
    const res = await saveVKSettings(vkForm.value)
    if (res && res.success) {
      successHandler.showSuccess(res)
    }
  } catch (e) {
    errorHandler.showError(e)
  } finally {
    sending.value = false
  }
}

// Проверка подключения
const onTest = async () => {
  if (sending.value) return
  sending.value = true
  progress.value = 0

  try {
    const res = await testVKConnection()
    if (res && res.success) {
      successHandler.showSuccess(res)
    }
  } catch (e) {
    errorHandler.showError(e)
  } finally {
    sending.value = false
  }
}
</script>