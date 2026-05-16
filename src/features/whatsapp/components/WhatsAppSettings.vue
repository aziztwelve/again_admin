<template>
  <div>
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <!--          <div class="w-8 h-8 rounded-md bg-green-600 flex items-center justify-center text-white">-->
          <!--            <MessageCircle class="w-4 h-4"/>-->
          <!--          </div>-->

          <div class="w-9 h-9">
            <img :src="assetPath('icons/conversation/whatsapp.svg')">
          </div>

          <div class="flex-1">
            <CardTitle class="text-base">WhatsApp</CardTitle>
            <CardDescription class="text-sm">Синхронизация сообщений через QR code</CardDescription>
          </div>

          <div class="flex items-center space-x-2">
            <div
                class="w-3 h-3 rounded-full"
                :class="isReady ? 'bg-green-500' : 'bg-gray-300'"
            />
            <span class="text-xs" :class="isReady ? 'text-green-600' : 'text-gray-500'">
              {{ isReady ? 'Подключено' : 'Отключено' }}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <!-- QR Code Modal/Display -->
        <div v-if="showQRModal" class="mb-6 p-4 border rounded-lg bg-gray-50">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">Отсканируй QR code</h3>
            <button
                @click="showQRModal = false"
                class="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div v-if="qrCode" class="flex flex-col items-center">
            <img :src="qrCode" alt="QR Code" class="w-64 h-64 border-2 border-gray-300 rounded"/>
            <p class="text-sm text-gray-600 mt-4 text-center">
              Открой WhatsApp на телефоне → Привязанные устройства →
              Привязать устройство и отсканируй этот код
            </p>
          </div>

          <div v-else-if="loadingQR" class="flex flex-col items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p class="text-sm text-gray-600 mt-4">Генерирую QR code...</p>
          </div>

          <div v-else class="text-center py-4 text-red-600">
            Ошибка при получении QR code
          </div>
        </div>

        <!-- Status Message -->
        <div v-if="statusMessage" class="mb-4 p-3 rounded-lg text-sm" :class="statusMessageClass">
          {{ statusMessage }}
        </div>

        <!-- Loading Progress -->
        <div v-if="loadingStatus" class="mb-4">
          <div class="h-2 bg-gray-200 rounded">
            <div class="h-2 rounded bg-green-600 animate-pulse"></div>
          </div>
          <p class="text-xs mt-1 text-gray-600">Проверяю статус...</p>
        </div>
      </CardContent>

      <div class="flex items-center md:px-7 pb-4 md:space-x-3 max-md:flex-col max-md:space-y-2">
        <Button
            @click="handleGetQR"
            :disabled="loadingQR"
            variant="default"
        >
          <span v-if="!loadingQR">Получить QR code</span>
          <span v-else>Загрузка...</span>
        </Button>

        <Button
            @click="handleLogout"
            :disabled="loadingStatus"
            variant="destructive"
            v-if="isReady"
        >
          Отключить
        </Button>

        <Button
            @click="handleCheckStatus"
            :disabled="loadingStatus"
            variant="outline"
        >
          <span v-if="!loadingStatus">Проверить статус</span>
          <span v-else>Проверка...</span>
        </Button>


      </div>
    </Card>

    <!-- Info Card -->
    <Card class="bg-green-50 border-green-200 mt-4">
      <CardHeader>
        <CardTitle class="text-sm">Как подключить WhatsApp?</CardTitle>
      </CardHeader>
      <CardContent class="text-sm text-muted-foreground space-y-2">
        <p>1. Нажми на кнопку "Получить QR code"</p>
        <p>2. Открой WhatsApp на телефоне</p>
        <p>3. Перейди в Параметры → Привязанные устройства → Привязать устройство</p>
        <p>4. Отсканируй QR code камерой телефона</p>
        <p>5. После успешного сканирования статус изменится на "Подключено"</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {useWhatsAppFunctions} from '../composables/useWhatsAppFunctions'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'
import {assetPath} from "@/utils/assetPath";

const showQRModal = ref(false)
const loadingQR = ref(false)
const loadingStatus = ref(false)
const statusMessage = ref('')

const {qrCode, isReady, getQRCode, checkStatus, logout} = useWhatsAppFunctions()
const errorHandler = useErrorHandler()
const successHandler = useSuccessHandler()

const statusMessageClass = computed(() => {
  if (isReady.value) {
    return 'bg-green-100 text-green-800 border border-green-300'
  }
  return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
})

/**
 * Получить QR code
 */
const handleGetQR = async () => {
  loadingQR.value = true
  statusMessage.value = ''
  try {
    const result = await getQRCode()

    if (result.ready) {
      statusMessage.value = '✅ WhatsApp уже подключен'
      showQRModal.value = false
    } else if (result.qr) {
      statusMessage.value = 'Отсканируй QR code для подключения'
      showQRModal.value = true
    } else {
      errorHandler.showError(new Error('Не удалось получить QR code'))
    }
  } catch (error) {
    errorHandler.showError(error)
    statusMessage.value = '❌ Ошибка при получении QR code'
  } finally {
    loadingQR.value = false
  }
}

/**
 * Проверить статус
 */
const handleCheckStatus = async () => {
  loadingStatus.value = true
  statusMessage.value = ''
  try {
    const result = await checkStatus()

    if (result.ready) {
      statusMessage.value = '✅ WhatsApp подключен успешно!'
      successHandler.showSuccess({message: 'Подключение успешно'})
    } else {
      statusMessage.value = '⏳ WhatsApp ещё не подключен. Отсканируй QR code'
    }
  } catch (error) {
    errorHandler.showError(error)
    statusMessage.value = '❌ Ошибка при проверке статуса'
  } finally {
    loadingStatus.value = false
  }
}

const handleLogout = async () => {
  loadingStatus.value = true
  try {
    await logout()
    statusMessage.value = '✅ WhatsApp отключен'
    successHandler.showSuccess({message: 'WhatsApp отключен'})
  } catch (error) {
    errorHandler.showError(error)
    statusMessage.value = '❌ Ошибка при отключении'
  } finally {
    loadingStatus.value = false
  }
}

onMounted(() => {
  handleCheckStatus()
})

</script>