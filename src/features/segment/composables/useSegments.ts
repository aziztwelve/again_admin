// features/segment/composables/useSegments.ts

import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'
import {
    Segment,
    SegmentClient,
    SegmentStatistics,
    CreateSegmentRequest,
    UpdateSegmentRequest,
    AttachClientsRequest,
    AttachPromoCodesRequest,
    FilterSegmentClientsParams,
    ExportSegmentParams,
    SegmentListResponse,
    SegmentClientsResponse, SegmentDetail,
} from '../types'

export function useSegments() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Получить список сегментов с пагинацией
     */
    const getSegments = async (params?: {
        search?: string
        is_active?: boolean
        per_page?: number
        page?: number
        sort_by?: string
        sort_direction?: 'asc' | 'desc'
    }): Promise<SegmentListResponse | undefined> => {
        if (sending.value) return


        // Очистка параметров
        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).map(([key, value]) => [
                key,
                value === undefined || value === '' ? null : value
            ])
        )

        sending.value = true
        progress.value = 0

        return await axios.get<SegmentListResponse>('segments', {
            params: cleanParams
        })
            .then(res => {
                return res.data // Возвращаем { data: Segment[], meta: PaginationMeta }
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
     * Получить сегмент по ID
     */
    const getSegmentById = async (segmentId: number | string): Promise<SegmentDetail | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<{ success: boolean; data: SegmentDetail }>(`segments/${segmentId}`)
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
     * Создать новый сегмент
     */
    const createSegment = async (data: CreateSegmentRequest): Promise<Segment | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: Segment }>('segments', data)
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
     * Обновить сегмент
     */
    const updateSegment = async (
        segmentId: number | string,
        data: UpdateSegmentRequest
    ): Promise<Segment | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.put<{ success: boolean; message: string; data: Segment }>(
            `segments/${segmentId}`,
            data
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
     * Удалить сегмент
     */
    const deleteSegment = async (segmentId: number | string): Promise<void> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.delete<{ success: boolean; message: string }>(`segments/${segmentId}`)
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
     * Переключить активность сегмента
     */
    const toggleActive = async (segmentId: number | string): Promise<{ is_active: boolean } | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: { is_active: boolean } }>(
            `segments/${segmentId}/toggle-active`
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
     * Пересчитать клиентов сегмента
     */
    const recalculateSegment = async (segmentId: number | string): Promise<any> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: any }>(
            `segments/${segmentId}/recalculate`
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
     * Получить клиентов сегмента с пагинацией
     */
    const getSegmentClients = async (
        segmentId: number | string,
        params?: FilterSegmentClientsParams
    ): Promise<SegmentClientsResponse | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<SegmentClientsResponse>(`segments/${segmentId}/clients`, {params})
            .then(res => {
                return res.data // Возвращаем { data: SegmentClient[], meta: PaginationMeta }
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => {
                sending.value = false
            })
    }
    const getSegmentAvailableClients = async (
        segmentId: number | string,
        params?: FilterSegmentClientsParams
    ): Promise<SegmentClientsResponse | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<SegmentClientsResponse>(`segments/${segmentId}/available-clients`, {params})
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
     * Добавить клиентов в сегмент
     */
    const attachClients = async (
        segmentId: number | string,
        data: AttachClientsRequest
    ): Promise<any> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: any }>(
            `segments/${segmentId}/clients`,
            data
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
     * Удалить клиентов из сегмента
     */
    const detachClients = async (
        segmentId: number | string,
        data: AttachClientsRequest
    ): Promise<any> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.delete<{ success: boolean; message: string; data: any }>(
            `segments/${segmentId}/clients`,
            {data}
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
     * Прикрепить промокоды к сегменту
     */
    const attachPromoCodes = async (
        segmentId: number | string,
        data: AttachPromoCodesRequest
    ): Promise<any> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: any }>(
            `segments/${segmentId}/promo-codes`,
            data
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
     * Открепить промокоды от сегмента
     */
    const detachPromoCodes = async (
        segmentId: number | string,
        data: AttachPromoCodesRequest
    ): Promise<any> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.delete<{ success: boolean; message: string; data: any }>(
            `segments/${segmentId}/promo-codes`,
            {data}
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
     * Получить статистику сегмента
     */
    const getSegmentStatistics = async (segmentId: number | string): Promise<SegmentStatistics | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<{ success: boolean; data: SegmentStatistics }>(
            `segments/${segmentId}/statistics`
        )
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
     * Экспортировать сегмент в CSV
     */
    const exportSegment = async (
        segmentId: number | string,
        params?: ExportSegmentParams
    ): Promise<void> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get(`segments/${segmentId}/export`, {
            params,
            responseType: 'blob'
        })
            .then(res => {
                // Создаём ссылку для скачивания файла
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `segment_${segmentId}_${Date.now()}.csv`)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)

                useSuccessHandler().showSuccess({data: {message: 'Экспорт успешно выполнен'}})
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
     * Получить предпросмотр экспорта
     */
    const getExportPreview = async (
        segmentId: number | string,
        params?: ExportSegmentParams
    ): Promise<any> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<{ success: boolean; data: any }>(
            `segments/${segmentId}/export-preview`,
            {params}
        )
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

    return {
        sending,
        progress,

        // CRUD
        getSegments,
        getSegmentById,
        createSegment,
        updateSegment,
        deleteSegment,

        // Управление
        toggleActive,
        recalculateSegment,

        // Клиенты
        getSegmentClients,
        getSegmentAvailableClients,
        attachClients,
        detachClients,

        // Промокоды
        attachPromoCodes,
        detachPromoCodes,

        // Статистика и экспорт
        getSegmentStatistics,
        exportSegment,
        getExportPreview,
    }
}