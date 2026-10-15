import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'
import type {
    AbandonedCartAnalytics,
    AbandonedCartAnalyticsFilters,
    AbandonedCartListFilters,
    AbandonedCartRow,
    AbandonedCartDetails,
    CartRecoverySettings,
    CartMessagePreview,
    CartProductSummary,
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
        message?: string,
        subject?: string,
        format?: string,
        step?: number,
        personalMessage?: boolean,
    ): Promise<boolean> => {
        return await axios
            .post(`carts/${cartId}/remind`, cleanParams({channel, message, subject, format, step, personal_message: personalMessage}))
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return true
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return false
            })
    }

    const read = async <T>(url: string, params?: Record<string, any>): Promise<T | undefined> => {
        try { return (await axios.get(url, {params: cleanParams(params || {})})).data.data }
        catch (e) { useErrorHandler().showError(e); return undefined }
    }

    return {
        loadingAnalytics,
        loadingCarts,
        getAnalytics,
        getCarts,
        sendReminder,
        getSettings: () => read<CartRecoverySettings>('carts/settings'),
        getCartProducts: (filters: Record<string, any>) => read<Paginated<CartProductSummary>>('carts/products', filters),
        saveSettings: async (settings: CartRecoverySettings): Promise<boolean> => {
            try {
                const response = await axios.put('carts/settings', {enabled: settings.enabled, channels: settings.channels, templates: settings.templates})
                useSuccessHandler().showSuccess(response)
                return true
            } catch (e) { useErrorHandler().showError(e); return false }
        },
        previewMessage: async (data: Record<string, any>): Promise<CartMessagePreview | undefined> => {
            try { return (await axios.post('carts/preview', data)).data.data }
            catch (e) { useErrorHandler().showError(e); return undefined }
        },
        getCartDetails: async (cartId: number): Promise<AbandonedCartDetails | undefined> => {
            try {
                return (await axios.get(`carts/${cartId}`)).data.data
            } catch (e) {
                useErrorHandler().showError(e)
                return undefined
            }
        },
    }
}
