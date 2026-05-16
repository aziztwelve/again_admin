import { ref } from 'vue'
import axios from 'axios'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useSuccessHandler } from '@/composables/useSuccessHandler'
import type {
    OtoBanner,
    OtoBannerListItem,
    OtoBannerListResponse,
    OtoBannerDetailResponse,
    OtoBannerSearchParams,
} from '../types'

export function useOtoBanners() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Получить список баннеров с пагинацией
     */
    const getOtoBanners = async (params?: OtoBannerSearchParams): Promise<OtoBannerListResponse | undefined> => {
        if (sending.value) return

        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).map(([key, value]) => [
                key,
                value === undefined || value === '' ? null : value
            ])
        )

        sending.value = true
        progress.value = 0

        return await axios.get<OtoBannerListResponse>('oto-banners', { params: cleanParams })
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
     * Получить баннер по ID
     */
    const getOtoBannerById = async (bannerId: number | string): Promise<OtoBanner | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<OtoBannerDetailResponse>(`oto-banners/${bannerId}`)
            .then(res => {
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

    /**
     * Создать новый баннер
     */
    const createOtoBanner = async (data: FormData): Promise<OtoBanner | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: OtoBanner }>(
            'oto-banners',
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
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

    /**
     * Обновить баннер
     */
    const updateOtoBanner = async (
        bannerId: number | string,
        data: FormData
    ): Promise<OtoBanner | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        // Laravel не поддерживает PUT с multipart/form-data напрямую
        // Используем POST с _method=PUT
        data.append('_method', 'PUT')

        return await axios.post<{ success: boolean; message: string; data: OtoBanner }>(
            `oto-banners/${bannerId}`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
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

    /**
     * Удалить баннер
     */
    const deleteOtoBanner = async (bannerId: number | string): Promise<void> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.delete<{ success: boolean; message: string }>(`oto-banners/${bannerId}`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
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
     * Дублировать баннер
     */
    const duplicateOtoBanner = async (bannerId: number | string): Promise<OtoBanner | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: OtoBanner }>(
            `oto-banners/${bannerId}/duplicate`
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

    /**
     * Переключить статус баннера
     */
    const toggleOtoBannerStatus = async (bannerId: number | string): Promise<OtoBanner | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: OtoBanner }>(
            `oto-banners/${bannerId}/toggle-status`
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

        // CRUD
        getOtoBanners,
        getOtoBannerById,
        createOtoBanner,
        updateOtoBanner,
        deleteOtoBanner,

        // Управление
        duplicateOtoBanner,
        toggleOtoBannerStatus,
    }
}