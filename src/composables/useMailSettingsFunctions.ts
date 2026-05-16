import { ref } from 'vue'
import axios, { AxiosProgressEvent } from 'axios'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useSuccessHandler } from '@/composables/useSuccessHandler'

export function useMailSettingsFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    // Получение настроек почты
    const getMailSettings = async () => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const res = await axios.post('third-party-integrations/mail/getMailSettings')
            // useSuccessHandler().showSuccess(res)
            return res.data
        } catch (e) {
            useErrorHandler().showError(e)
        } finally {
            sending.value = false
        }
    }

    // Обновление настроек почты
    const updateMailSettings = async (params: {
        mailer?: string
        host: string
        port: number
        username: string
        password: string
        encryption?: string
        from_address?: string
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const payload = {
                ...params,
            }

            const res = await axios.post('third-party-integrations/mail/configuration', payload, {
                onUploadProgress: (event: AxiosProgressEvent) => {
                    if (event.total && event.loaded != null) {
                        progress.value = Math.round((event.loaded * 100) / event.total)
                    }
                },
                onDownloadProgress: (event: AxiosProgressEvent) => {
                    // можно добавить обработку прогресса загрузки, если нужно
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

    // Отправка тестового письма
    const sendTestMail = async (email: string) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const res = await axios.get('third-party-integrations/mail/test', {
                params: { email },
            })

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
        getMailSettings,
        updateMailSettings,
        sendTestMail,
    }
}
