import {ref} from 'vue'
import axios, {AxiosProgressEvent} from 'axios'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'

export function useVKSettingsFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    // Получение настроек ВК
    const getVKSettings = async () => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const res = await axios.post('third-party-integrations/vk/getVKSettings')
            return res.data
        } catch (e) {
            useErrorHandler().showError(e)
        } finally {
            sending.value = false
        }
    }

    // Создание или обновление настроек ВК (один метод для обоих случаев)
    const saveVKSettings = async (params: {
        community_id: string | number
        access_token: string
        confirmation_token?: string
        api_version?: string
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const payload = {
                ...params,
            }

            const res = await axios.post('third-party-integrations/vk/configuration', payload, {
                onUploadProgress: (event: AxiosProgressEvent) => {
                    if (event.total && event.loaded != null) {
                        progress.value = Math.round((event.loaded * 100) / event.total)
                    }
                },
            })

            useSuccessHandler().showSuccess(res)
            return res.data
        } catch (e) {
            useErrorHandler().showError(e)
        } finally {
            sending.value = false
        }
    }

    // Тест подключения к ВК
    const testVKConnection = async () => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const res = await axios.post('third-party-integrations/vk/test')
            useSuccessHandler().showSuccess(res)
            return res.data
        } catch (e) {
            useErrorHandler().showError(e)
        } finally {
            sending.value = false
        }
    }

    return {
        sending,
        progress,
        getVKSettings,
        saveVKSettings,
        testVKConnection,
    }
}