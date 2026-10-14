import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'
import type {
    AbandonedCartAnalytics,
    AbandonedCartAnalyticsFilters,
    AbandonedCartListFilters,
    AbandonedCartRow,
    Paginated,
} from '@/types/abandoned-cart'

/**
 * Функционал раздела «Брошенные корзины» (Аналитика → Брошенные корзины).
 * Бэкенд: GET /carts (список), GET /carts/analytics (метрики).
 * См. lara_admin/docs/tasks/abandoned-cart.md
 */
export function useAbandonedCartFunctions() {
    const loadingAnalytics = ref(false)
    const loadingCarts = ref(false)

    // Чистим пустые/null параметры, чтобы не слать ?status=
    const cleanParams = (filters: Record<string, any>): Record<string, any> => {
        const params: Record<string, any> = {}
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value
            }
        })
        return params
    }

    const getAnalytics = async (
        filters: AbandonedCartAnalyticsFilters = {},
    ): Promise<AbandonedCartAnalytics | undefined> => {
        loadingAnalytics.value = true
        return await axios
            .get('carts/analytics', {params: cleanParams(filters)})
            .then(res => res.data.data as AbandonedCartAnalytics)
            .catch(e => {
                useErrorHandler().showError(e)
                return undefined
            })
            .finally(() => (loadingAnalytics.value = false))
    }

    const getCarts = async (
        filters: AbandonedCartListFilters = {},
    ): Promise<Paginated<AbandonedCartRow> | undefined> => {
        loadingCarts.value = true
        return await axios
            .get('carts', {params: cleanParams(filters)})
            .then(res => res.data.data as Paginated<AbandonedCartRow>)
            .catch(e => {
                useErrorHandler().showError(e)
                return undefined
            })
            .finally(() => (loadingCarts.value = false))
    }

    // Ручная отправка напоминания по корзине (шаг F).
    const sendReminder = async (
        cartId: number,
        channel?: string,
    ): Promise<boolean> => {
        return await axios
            .post(`carts/${cartId}/remind`, channel ? {channel} : {})
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return true
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return false
            })
    }

    return {
        loadingAnalytics,
        loadingCarts,
        getAnalytics,
        getCarts,
        sendReminder,
    }
}
