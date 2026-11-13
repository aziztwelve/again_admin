import { ref } from 'vue'
import axios from 'axios'

const WHATSAPP_API_URL =process.env.VUE_APP_WHATSAPP_API_URL || 'http://localhost:3001'

// Создаём отдельный axios инстанс БЕЗ авторизации
const whatsappApi = axios.create({
    baseURL: WHATSAPP_API_URL,
    timeout: 10000,
})

// Удаляем authorization хедер для WhatsApp запросов
whatsappApi.interceptors.request.use((config) => {
    delete config.headers.Authorization
    return config
})

export const useWhatsAppFunctions = () => {
    const loading = ref(false)
    const qrCode = ref<string | null>(null)
    const isReady = ref(false)
    const pairingCode = ref<string | null>(null)

    /**
     * Получить QR code
     */
    const getQRCode = async (): Promise<{ qr: string | null; ready: boolean }> => {
        loading.value = true
        try {
            const response = await whatsappApi.get('/qr')
            qrCode.value = response.data.qr
            pairingCode.value = response.data.pairing_code ?? null
            isReady.value = response.data.ready
            return response.data
        } catch (error) {
            console.error('Failed to get QR code:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Привязка по коду вместо QR: по номеру телефона сервис возвращает код из 8 символов,
     * который вводится в WhatsApp на телефоне.
     */
    const requestPairingCode = async (phoneNumber: string): Promise<string> => {
        loading.value = true
        try {
            const response = await whatsappApi.post('/pairing-code', { phone_number: phoneNumber })
            pairingCode.value = response.data.code
            return response.data.code
        } finally {
            loading.value = false
        }
    }

    const cancelPairingCode = async (): Promise<void> => {
        pairingCode.value = null
        try {
            await whatsappApi.post('/pairing-code/cancel')
        } catch (error) {
            console.error('Failed to cancel pairing code:', error)
        }
    }

    /**
     * Проверить статус подключения
     */
    const checkStatus = async (): Promise<{ ready: boolean; hasQR: boolean }> => {
        loading.value = true
        try {
            const response = await whatsappApi.get('/status')
            isReady.value = response.data.ready
            return response.data
        } catch (error) {
            console.error('Failed to check status:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Отключить WhatsApp
     */
    const logout = async (): Promise<{ success: boolean }> => {
        loading.value = true
        try {
            const response = await whatsappApi.post('/logout')
            isReady.value = false
            qrCode.value = null
            return response.data
        } catch (error) {
            console.error('Failed to logout:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        qrCode,
        isReady,
        pairingCode,
        requestPairingCode,
        cancelPairingCode,
        getQRCode,
        checkStatus,
        logout
    }
}