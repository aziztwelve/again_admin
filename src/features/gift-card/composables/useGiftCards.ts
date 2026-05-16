// features/gift-card/composables/useGiftCards.ts

import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'
import {
    GiftCard,
    GiftCardDetail,
    GiftCardStatistics,
    GiftCardListResponse,
    GetGiftCardsParams,
    CancelGiftCardRequest,
    ResendGiftCardRequest,
    ExportGiftCardsParams, prepareResendGiftCardRequest,
} from '../types'

export function useGiftCards() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Получить список подарочных карт с пагинацией
     */
    const getGiftCards = async (params?: GetGiftCardsParams): Promise<GiftCardListResponse | undefined> => {
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

        return await axios.get<GiftCardListResponse>('gift-cards', {
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
     * Получить подарочную карту по ID
     */
    const getGiftCardById = async (giftCardId: number | string): Promise<GiftCardDetail | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<{ success: boolean; data: GiftCardDetail }>(`gift-cards/${giftCardId}`)
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
     * Аннулировать подарочную карту
     */
    const cancelGiftCard = async (
        giftCardId: number | string,
        data: CancelGiftCardRequest
    ): Promise<GiftCard | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.post<{ success: boolean; message: string; data: GiftCard }>(
            `gift-cards/${giftCardId}/cancel`,
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
     * Переотправить подарочную карту
     */
    const resendGiftCard = async (
        giftCardId: number | string,
        data: ResendGiftCardRequest
    ): Promise<void> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        const formData = prepareResendGiftCardRequest(data)

        return await axios.post<{
            success: boolean;
            message: string
        }>(
            `gift-cards/${giftCardId}/resend`,
            formData
        )
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
     * Получить статистику по подарочным картам
     */
    const getGiftCardStatistics = async (): Promise<GiftCardStatistics | undefined> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get<{ success: boolean; data: GiftCardStatistics }>('gift-cards/statistics')
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
     * Экспортировать подарочные карты в CSV
     */
    const exportGiftCards = async (params?: ExportGiftCardsParams): Promise<void> => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get('gift-cards/export', {
            params,
            responseType: 'blob'
        })
            .then(res => {
                // Создаём ссылку для скачивания файла
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `gift_cards_${Date.now()}.csv`)
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

    return {
        sending,
        progress,

        // Основные методы
        getGiftCards,
        getGiftCardById,

        // Действия с картами
        cancelGiftCard,
        resendGiftCard,

        // Статистика и экспорт
        getGiftCardStatistics,
        exportGiftCards,
    }
}