import { ref } from 'vue'
import axios from 'axios'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useSuccessHandler } from '@/composables/useSuccessHandler'
import type {
    OtoBannerSubmission,
    OtoBannerSubmissionsResponse,
    OtoBannerSubmissionsParams,
} from '../types'

export function useOtoBannerSubmissions() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Получить все OTO заявки
     */
    const getAllSubmissions = async (
        params?: OtoBannerSubmissionsParams
    ): Promise<OtoBannerSubmissionsResponse | undefined> => {
        if (sending.value) return

        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).map(([key, value]) => [
                key,
                value === undefined || value === '' ? null : value
            ])
        )

        sending.value = true
        progress.value = 0

        return await axios.get<OtoBannerSubmissionsResponse>('oto-banners/submissions/all', {
            params: cleanParams
        })
            .then(res => {
                return res.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => {
                sending.value = false
            })
    }

    /**
     * Получить заявки по конкретному баннеру
     */
    const getBannerSubmissions = async (
        bannerId: number | string,
        params?: OtoBannerSubmissionsParams
    ): Promise<OtoBannerSubmissionsResponse | undefined> => {
        if (sending.value) return

        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).map(([key, value]) => [
                key,
                value === undefined || value === '' ? null : value
            ])
        )

        sending.value = true
        progress.value = 0

        return await axios.get<OtoBannerSubmissionsResponse>(
            `oto-banners/${bannerId}/submissions`,
            { params: cleanParams }
        )
            .then(res => {
                return res.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => {
                sending.value = false
            })
    }

    /**
     * Прикрепить менеджера к заявке
     */
    const attachManager = async (
        submissionId: number | string,
        managerId: number
    ): Promise<OtoBannerSubmission | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: OtoBannerSubmission }>(
            `oto-banners/submissions/${submissionId}/attach-manager`,
            { manager_id: managerId }
        )
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => {
                sending.value = false
            })
    }

    return {
        sending,
        progress,

        getAllSubmissions,
        getBannerSubmissions,
        attachManager,
    }
}