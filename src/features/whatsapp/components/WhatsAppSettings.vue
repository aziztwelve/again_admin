<template>
  <div>
    <Card>
      <CardHeader>
        <div class="flex items-center space-x-3">
          <!--          <div class="w-8 h-8 rounded-md bg-green-600 flex items-center justify-center text-white">-->
          <!--            <MessageCircle class="w-4 h-4"/>-->
          <!--          </div>-->

          <div class="w-9 h-9">
            <img :src="assetPath('icons/chat/whatsapp.svg')">
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
                @click="closeQR"
                class="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div v-if="qrCode" class="flex flex-col items-center">
            <img :src="qrCode" alt="QR Code" class="w-64 h-64 border-2 border-gray-300 rounded"/>
            <p class="text-sm text-gray-600 mt-4 text-center">
              Открой WhatsApp на телефоне → Связанные устройства →
              Привязать устройство и отсканируй этот код
            </p>
            <p class="text-xs text-gray-500 mt-2 text-center">
              Код обновляется автоматически каждые ~20 секунд (не минут) — сканируй тот, что сейчас на экране.
              Окно закроется само, когда телефон подключится.
            </p>
          </div>

          <div v-else-if="loadingQR" class="flex flex-col items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p class="text-sm text-gray-600 mt-4">Генерирую QR code...</p>
          </div>

          <div v-else class="text-center py-4 text-gray-600">
            Ждём новый QR code от WhatsApp… (он появится автоматически)
          </div>
        </div>

        <!-- Привязка по коду (вместо QR) -->
        <div class="mb-6 p-4 border rounded-lg">
          <h3 class="font-semibold text-sm mb-1">Или привязать по коду (без QR)</h3>
          <p class="text-xs text-gray-600 mb-3">
            Введи номер телефона, на котором WhatsApp, получи код и введи его в WhatsApp на телефоне:
            Связанные устройства → Привязать устройство → «Связать по номеру телефона».
            Обычно WhatsApp ещё присылает уведомление — можно открыть его.
          </p>

          <div v-if="!pairingOpen" class="flex flex-col sm:flex-row gap-2">
            <input
                v-model="pairingPhone"
                type="tel"
                inputmode="numeric"
                placeholder="Номер с кодом страны, например 79991234567"
                class="flex-1 border rounded-md px-3 py-2 text-sm"
                @keyup.enter="handleGetPairingCode"
            />
            <Button @click="handleGetPairingCode" :disabled="pairingLoading || isReady" variant="outline">
              <span v-if="!pairingLoading">Получить код</span>
              <span v-else>Запрашиваю...</span>
            </Button>
          </div>

          <div v-else class="flex flex-col items-center py-2">
            <p class="text-sm text-gray-600 mb-2">Введи этот код в WhatsApp на телефоне:</p>
            <div v-if="pairingCode" class="text-3xl font-mono font-bold tracking-widest text-green-700 select-all">
              {{ formattedPairingCode }}
            </div>
            <div v-else class="text-sm text-gray-500">Ждём код от WhatsApp…</div>
            <p class="text-xs text-gray-500 mt-3 text-center">
              Код меняется примерно раз в 3 минуты, это окно обновляет его само и закроется после подключения.
            </p>
            <button class="text-xs text-gray-500 underline mt-2" @click="closePairing">Отмена</button>
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
        <CardDescription class="text-xs">
          Есть два способа, результат одинаковый. Если QR не получается, используй привязку по номеру телефона.
        </CardDescription>
      </CardHeader>
      <CardContent class="text-sm text-muted-foreground">
        <Tabs v-model="infoTab">
          <TabsList>
            <TabsTrigger value="phone">По номеру телефона</TabsTrigger>
            <TabsTrigger value="qr">По QR-коду</TabsTrigger>
          </TabsList>

          <TabsContent value="phone" class="space-y-3 pt-3">
            <ol class="list-decimal pl-5 space-y-2">
              <li>
                В блоке «Или привязать по коду (без QR)» введи номер телефона, на котором установлен WhatsApp:
                <b>с кодом страны, только цифры</b>, без «+», пробелов и скобок.
                Например, для номера +7 (999) 123-45-67 пиши <b>79991234567</b>.
                Номер должен совпадать с номером WhatsApp на телефоне.
              </li>
              <li>Нажми «Получить код». Появится код из 8 символов, например <b>ABCD-EFGH</b>.</li>
              <li>
                На телефоне открой WhatsApp. Android: ⋮ Меню → Связанные устройства → Привязать устройство.
                iPhone: Настройки → Связанные устройства → Привязать устройство.
                (Иногда WhatsApp сам присылает уведомление «Попытка привязать устройство», его тоже можно открыть.)
              </li>
              <li>
                На экране с камерой внизу нажми <b>«Связать по номеру телефона»</b> и введи код с экрана админки.
              </li>
              <li>
                Подожди до 2 минут и ничего не нажимай: окно с кодом закроется само, а статус сменится на «Подключено».
              </li>
            </ol>
            <p class="text-xs">
              Код действует недолго и обновляется примерно раз в 3 минуты: вводи тот, что виден на экране сейчас.
              Телефон должен быть в сети (Wi-Fi или мобильный интернет).
            </p>
          </TabsContent>

          <TabsContent value="qr" class="space-y-3 pt-3">
            <ol class="list-decimal pl-5 space-y-2">
              <li>Нажми кнопку «Получить QR code».</li>
              <li>На телефоне открой WhatsApp (на том номере, который подключаем).</li>
              <li>
                Android: ⋮ Меню → Связанные устройства → Привязать устройство.
                iPhone: Настройки → Связанные устройства → Привязать устройство.
              </li>
              <li>
                Наведи камеру на QR-код на экране админки. Он обновляется сам каждые ~20 секунд (не минут):
                сканируй тот, что виден сейчас.
              </li>
              <li>
                Подожди до 2 минут: после подключения окно с QR закроется само, а статус сменится на «Подключено».
              </li>
            </ol>
          </TabsContent>
        </Tabs>

        <div class="mt-4 pt-3 border-t border-green-200 space-y-2">
          <p class="font-medium text-gray-700">Если не получается</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              <b>«Не удалось связать устройство»</b> — код или QR устарел. Возьми новый и повтори.
              Привязка может занимать до пары минут, это нормально.
            </li>
            <li>
              <b>«Невозможно связать новые устройства. Повторите попытку позже»</b> — WhatsApp временно ограничил
              привязку для этого номера (бывает после нескольких попыток подряд). Подожди не меньше суток
              и не пробуй в это время: каждая попытка может продлить ограничение.
            </li>
            <li>
              Не нажимай «Отключить» без необходимости: каждая новая привязка увеличивает риск такого ограничения.
              После подключения сессия сохраняется, даже если сервис перезапустят.
            </li>
            <li>
              Пока WhatsApp не подключён, отправить сообщение из «Диалогов» нельзя: админка покажет ошибку.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount, watch} from 'vue'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {useWhatsAppFunctions} from '../composables/useWhatsAppFunctions'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'
import {assetPath} from "@/utils/assetPath";

const infoTab = ref('phone')
const showQRModal = ref(false)
const loadingQR = ref(false)
const loadingStatus = ref(false)
const statusMessage = ref('')

const {qrCode, isReady, pairingCode, getQRCode, requestPairingCode, cancelPairingCode, checkStatus, logout} = useWhatsAppFunctions()
const errorHandler = useErrorHandler()
const successHandler = useSuccessHandler()

const statusMessageClass = computed(() => {
  if (isReady.value) {
    return 'bg-green-100 text-green-800 border border-green-300'
  }
  return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
})

// WhatsApp меняет QR каждые ~20 секунд: если показать картинку один раз,
// к моменту сканирования она уже недействительна, и телефон пишет
// «Не удалось связать устройство». Поэтому, пока окно с QR открыто, код
// и статус опрашиваются, а окно закрывается само после подключения.
const QR_POLL_MS = 2500
let qrPollTimer: ReturnType<typeof setInterval> | null = null
let qrPollBusy = false

const stopQRPolling = () => {
  if (qrPollTimer) {
    clearInterval(qrPollTimer)
    qrPollTimer = null
  }
}

const pollQR = async () => {
  if (qrPollBusy) return
  qrPollBusy = true
  try {
    const result = await getQRCode()
    if (result.ready) {
      stopQRPolling()
      showQRModal.value = false
      pairingOpen.value = false
      statusMessage.value = '✅ WhatsApp подключен успешно!'
      successHandler.showSuccess({message: 'WhatsApp подключен'})
    }
  } catch (error) {
    // Разовый сбой сети не должен закрывать окно — следующий опрос повторит запрос.
    console.error('WhatsApp QR poll failed:', error)
  } finally {
    qrPollBusy = false
  }
}

const startQRPolling = () => {
  stopQRPolling()
  qrPollTimer = setInterval(pollQR, QR_POLL_MS)
}

const closeQR = () => {
  showQRModal.value = false
}

// Привязка по коду: номер → код из 8 символов → ввод в WhatsApp на телефоне.
const pairingPhone = ref('')
const pairingLoading = ref(false)
const pairingOpen = ref(false)

const formattedPairingCode = computed(() => {
  const code = pairingCode.value ?? ''
  return code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code
})

const handleGetPairingCode = async () => {
  const digits = pairingPhone.value.replace(/\D+/g, '')
  if (!/^\d{10,15}$/.test(digits)) {
    errorHandler.showError(new Error('Введи номер в международном формате, только цифры, например 79991234567'))
    return
  }

  pairingLoading.value = true
  statusMessage.value = ''
  try {
    await requestPairingCode(digits)
    showQRModal.value = false
    pairingOpen.value = true
    statusMessage.value = 'Введи код в WhatsApp на телефоне'
  } catch (error: any) {
    // Сервис отвечает понятным текстом в поле error
    errorHandler.showError(new Error(error?.response?.data?.error || 'Не удалось получить код'))
  } finally {
    pairingLoading.value = false
  }
}

const closePairing = async () => {
  pairingOpen.value = false
  await cancelPairingCode()
}

// Опрос нужен, пока открыто окно с QR или с кодом
watch([showQRModal, pairingOpen], ([qrOpen, codeOpen]) => {
  if (qrOpen || codeOpen) {
    startQRPolling()
  } else {
    stopQRPolling()
  }
})

onBeforeUnmount(stopQRPolling)

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