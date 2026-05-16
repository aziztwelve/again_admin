import {ref} from 'vue'
import axios, {AxiosProgressEvent} from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";

export function useTelegramFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    const telegram = async (params: {
        per_page?: number,
        page?: number,
        paginate?: boolean,
        admin?: boolean,
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get('third-party-integrations/chats/telegram', {
            params: params
        })
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data
            })

            .catch(e => {
                sending.value = false
                useErrorHandler().showError(e)
            })
            .finally(() => sending.value = false)
    }


    const updateTelegramSettings = async (params: {
        token: string,
        bot_name?: string,
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {

            const res = await axios.post(
                'third-party-integrations/chats/telegram',
                params,
                {
                    // track upload progress (request → server)
                    onUploadProgress: (event: AxiosProgressEvent) => {
                        if (event.total && event.loaded != null) {
                            progress.value = Math.round((event.loaded * 100) / event.total)
                        }
                    },
                    // if you also care about the download side:
                    onDownloadProgress: (event: AxiosProgressEvent) => {
                        // e.g. merge download % into the same ref, or use a separate one
                    }
                }
            )

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
        updateTelegramSettings
    }
}
