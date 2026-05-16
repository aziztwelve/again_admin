<template>
  <div class="space-y-4 p-4">
    <div>
      <h1 class="text-xl font-semibold">Настройки email-рассылок</h1>
      <p class="text-sm text-muted-foreground">Интеграция для email-маркетинга</p>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center text-white">
            <Mail class="w-4 h-4"/>
          </div>

          <div class="flex-1">
            <CardTitle class="text-base">SMTP</CardTitle>
            <CardDescription class="text-sm">Подключение через SMTP-сервер</CardDescription>
          </div>

          <div class="flex items-center space-x-2">
            <Switch v-model="emailEnabled"/>

          </div>
        </div>
      </CardHeader>

      <CardContent :class="{ 'opacity-50 pointer-events-none': !emailEnabled }">
        <div class="mb-3" v-if="sending">
          <div class="h-2 bg-gray-200 rounded">
            <div class="h-2 rounded" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="text-xs mt-1">Прогресс: {{ progress }}%</p>
        </div>

        <DynamicForm
            v-model="emailForm"
            :fields="fields"
            submit-button-text="Сохранить"
            :show-submit-button="false"
            @submit-form="onSave"
        />
      </CardContent>


      <div class="flex items-center px-7 pb-2 space-x-3">
        <Button :disabled="sending" @click="onSave" v-if="emailEnabled">Сохранить</Button>
        <Button :disabled="sending" variant="outline" @click="onSendTestMail">
          Отправить тест
        </Button>
      </div>

    </Card>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Switch} from '@/components/ui/switch'
import DynamicForm from '@/components/dynamics/DynamicForm.vue'
import {Mail} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import MailSettings from '@/models/MailSettings' // <-- путь к модели
import {useMailSettingsFunctions} from '@/composables/useMailSettingsFunctions' // <-- путь к composable
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'

const emailEnabled = ref(true)
const sending = ref(false)
const progress = ref(0)

// форма — plain object, совместимая с DynamicForm
const emailForm = ref<any>({
  mailer: 'smtp',
  host: '',
  port: 465,
  username: '',
  password: '',
  encryption: 'tls',
  from_address: '',
  notification_email: '',
  created_at: undefined,
  updated_at: undefined,
})

const fields = [
  [
    {name: 'host', component: 'text', label: 'SMTP Host', required: true},
    {name: 'port', component: 'text', type: 'number', label: 'Port', required: true},
  ],
  [
    {name: 'imap_host', component: 'text', label: 'IMAP Host', required: false},
    {name: 'imap_port', component: 'text', type: 'number', label: 'IMAP Port', required: false},
  ],
  [
    {name: 'username', component: 'text', label: 'Логин (email)', required: true},
    {name: 'password', component: 'text', type: 'password', label: 'Пароль', required: true},
  ],
  [
    {name: 'from_address', component: 'text', label: 'Email отправителя', required: true},

    {name: 'mailer', component: 'text', label: 'Mailer', required: false},
  ],

  {name: 'notification_email', component: 'text', type: 'email', label: 'Корпоративный email', placeholder: 'Пример: help@again8.ru', required: false},


]

// composable
const {getMailSettings, updateMailSettings, sendTestMail} = useMailSettingsFunctions()
const errorHandler = useErrorHandler()
const successHandler = useSuccessHandler()

// загрузка существующих настроек
const loadSettings = async () => {
  sending.value = true
  progress.value = 0
  try {
    const res = await getMailSettings()
    // composable возвращает res.data (ответ сервера). Ожидаем { success: true, data: {...} }
    if (res && res.success && res.data) {
      const ms = MailSettings.fromJSON(res.data)
      // переносим в plain object, чтобы DynamicForm работал корректно
      emailForm.value = {
        mailer: ms.mailer ?? 'smtp',
        host: ms.host ?? '',
        port: ms.port ?? 465,
        imap_host: ms.imap_host ?? '',
        imap_port: ms.imap_port ?? 993,
        username: ms.username ?? '',
        password: ms.password ?? '',
        encryption: ms.encryption ?? 'tls',
        from_address: ms.from_address ?? '',
        notification_email: ms.notification_email ?? '',
      }
      // включаем/выключаем интеграцию по наличию host и username (можно подправить логику)
      emailEnabled.value = !!emailForm.value.host && !!emailForm.value.username
    } else {
      // если настроек нет — оставляем значения по умолчанию
    }
  } catch (e) {
    errorHandler.showError(e)
  } finally {
    sending.value = false
  }
}

onMounted(loadSettings)

// сохранение настроек
const onSave = async () => {
  if (sending.value) return
  sending.value = true
  progress.value = 0

  try {
    // создаём экземпляр модели, чтобы воспользоваться toJSONForUpdate()
    const ms = MailSettings.fromJSON(emailForm.value)
    const payload = ms.toJSONForUpdate()
    // composable сам показывает успех/ошибку, но мы можем дополнительно показать
    const res = await updateMailSettings(payload)
    if (res && res.success) {
      successHandler.showSuccess(res)
      // при успешном сохранении обновим локальную форму (например created_at)
      if (res.data) {
        const newMs = MailSettings.fromJSON(res.data)
        emailForm.value = {...emailForm.value, created_at: newMs.created_at, updated_at: newMs.updated_at}
      }
    }
  } catch (e) {
    errorHandler.showError(e)
  } finally {
    sending.value = false
  }
}

// отправка тестового письма
const onSendTestMail = async () => {
  if (sending.value) return
  sending.value = true
  progress.value = 0

  try {
    const email = emailForm.value.from_address || emailForm.value.username
    if (!email) {
      throw new Error('Не указан email для теста')
    }
    const res = await sendTestMail(email)
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

<style scoped>
/* опционально: стили прогресс-бара */
</style>
