import { ref } from 'vue'
import axios, { AxiosProgressEvent } from 'axios'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useSuccessHandler } from '@/composables/useSuccessHandler'
import {
    YandexMetrikaSettings,
    createYandexMetrikaSettings,
    defaultYandexMetrikaSettings
} from '@/types/settings/YandexMetrikaSettings'

export function useAnalyticsFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Получить все настройки аналитики
     */
    const getAnalyticsSettings = async (): Promise<YandexMetrikaSettings> => {
        if (sending.value) return defaultYandexMetrikaSettings

        sending.value = true

        try {
            const res = await axios.get('third-party-integrations/settings/analytics')

            if (res.data?.success && res.data?.data) {
                return createYandexMetrikaSettings(res.data.data)
            }

            return defaultYandexMetrikaSettings
        } catch (e) {
            useErrorHandler().showError(e)
            return defaultYandexMetrikaSettings
        } finally {
            sending.value = false
        }
    }

    /**
     * Обновить настройки Яндекс.Метрики
     */
    const updateYandexMetrika = async (settings: YandexMetrikaSettings): Promise<boolean> => {
        if (sending.value) return false

        sending.value = true
        progress.value = 0

        try {
            const res = await axios.post(
                'third-party-integrations/settings/analytics/yandex-metrika',
                settings,
                {
                    onUploadProgress: (event: AxiosProgressEvent) => {
                        if (event.total && event.loaded != null) {
                            progress.value = Math.round((event.loaded * 100) / event.total)
                        }
                    }
                }
            )

            if (res.data?.success) {
                useSuccessHandler().showSuccess(res)
                return true
            }

            return false
        } catch (e) {
            useErrorHandler().showError(e)
            return false
        } finally {
            sending.value = false
            progress.value = 0
        }
    }

    return {
        sending,
        progress,
        getAnalyticsSettings,
        updateYandexMetrika
    }
}