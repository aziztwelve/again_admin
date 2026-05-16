import { ref } from 'vue'
import axios from 'axios'
import { useErrorHandler } from '@/composables/useErrorHandler'
import type {
    OtoBannerAnalytics,
    OtoBannerSummaryAnalytics,
    OtoBannerChartData,
} from '../types'

export function useOtoBannerAnalytics() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Получить сводную аналитику по всем баннерам
     */
    const getSummaryAnalytics = async (): Promise<OtoBannerSummaryAnalytics | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<{ success: boolean; data: OtoBannerSummaryAnalytics }>(
            'oto-banners/analytics/summary'
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
     * Получить аналитику конкретного баннера
     */
    const getBannerAnalytics = async (
        bannerId: number | string,
        params?: { date_from?: string; date_to?: string }
    ): Promise<OtoBannerAnalytics | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<{ success: boolean; data: OtoBannerAnalytics }>(
            `oto-banners/${bannerId}/analytics`,
            { params }
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
     * Получить график по баннеру
     */
    const getBannerChart = async (
        bannerId: number | string,
        period: 'hour' | 'day' | 'month' = 'day'
    ): Promise<OtoBannerChartData | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<{ success: boolean; data: OtoBannerChartData }>(
            `oto-banners/${bannerId}/analytics/chart`,
            { params: { period } }
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
     * Экспортировать аналитику
     */
    const exportAnalytics = async (bannerId: number | string): Promise<void> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get(`oto-banners/${bannerId}/analytics/export`, {
            responseType: 'blob'
        })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `oto_banner_${bannerId}_analytics_${Date.now()}.json`)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
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

        getSummaryAnalytics,
        getBannerAnalytics,
        getBannerChart,
        exportAnalytics,
    }
}