import {ref} from 'vue'
import axios, {AxiosProgressEvent} from 'axios'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'

export function useUserProfileFunctions() {
    const sending = ref(false)
    const progress = ref(0)
    const onProgress = ref()

    const updateUserProfileImage = async (
        file: File | null,
        profileId?: number | string,
    ) => {
        if (!file) return null

        try {
            const fd = new FormData()
            fd.append('image', file)

            if (profileId && profileId !== '') {
                fd.append('user_id', String(profileId))
            }

            const url = `/users/update-profile/image`

            const res = await axios.post(url, fd, {
                headers: {'Content-Type': 'multipart/form-data'},
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total && onProgress.value) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        onProgress.value(percent)
                    }
                },
            })

            useSuccessHandler().showSuccess(res)

            return res.data.user ?? res.data
        } catch (e: any) {
            useErrorHandler().showError(e)
            console.error('Error uploading profile image:', e)
        }
    }

    return {
        sending,
        progress,
        onProgress,
        updateUserProfileImage,
    }
}
