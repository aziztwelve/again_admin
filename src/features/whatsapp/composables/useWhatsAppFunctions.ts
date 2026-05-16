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

    /**
     * Получить QR code
     */
    const getQRCode = async (): Promise<{ qr: string | null; ready: boolean }> => {
        loading.value = true
        try {
            const response = await whatsappApi.get('/qr')
            qrCode.value = response.data.qr
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
        getQRCode,
        checkStatus,
        logout
    }
}