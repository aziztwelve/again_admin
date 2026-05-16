import {ref} from 'vue'
import axios, {AxiosProgressEvent} from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";

export function useMoySkladFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    const productsSync = async (params: {
        per_page?: number,
        page?: number,
        paginate?: boolean,
        admin?: boolean,
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get('third-party-integrations/moysklad/products/sync', {
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


    const updateMoySkladSettings = async (params: {
        email: string,
        password?: string,
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            // send an actual JSON body so Axios has something to upload
            const payload = { email: params.email, password: params.password }

            const res = await axios.post(
                'third-party-integrations/moysklad/settings',
                payload,
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
        productsSync,
        updateMoySkladSettings
    }
}
