import { ref } from 'vue'
import axios from 'axios'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useSuccessHandler } from '@/composables/useSuccessHandler'
import type {
    FreeShippingOptions,
    FreeShippingProductOption,
    FreeShippingRule,
    FreeShippingRuleForm,
    FreeShippingRuleListResponse,
} from '../types'

/**
 * API правил бесплатной доставки (Настройки → Бесплатная доставка).
 * Бэкенд: /api/free-shipping-rules — см. lara_admin/docs/tasks/free-shipping.md
 */
export function useFreeShippingRules() {
    const sending = ref(false)

    const getRules = async (params?: Record<string, unknown>): Promise<FreeShippingRuleListResponse | undefined> => {
        sending.value = true

        return await axios.get<FreeShippingRuleListResponse>('free-shipping-rules', { params })
            .then(res => res.data)
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => {
                sending.value = false
            })
    }

    const getOptions = async (): Promise<FreeShippingOptions | undefined> => {
        return await axios.get<FreeShippingOptions & { success: boolean }>('free-shipping-rules/options')
            .then(res => res.data)
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
    }

    /** Поиск товаров для мультивыбора. `ids` подтягивает уже выбранные. */
    const searchProducts = async (search: string, ids: number[] = []): Promise<FreeShippingProductOption[]> => {
        return await axios.get<{ success: boolean; data: FreeShippingProductOption[] }>('free-shipping-rules/products', {
            params: { search, ids },
        })
            .then(res => res.data.data ?? [])
            .catch(e => {
                useErrorHandler().showError(e)
                return []
            })
    }

    const createRule = async (payload: FreeShippingRuleForm): Promise<FreeShippingRule | undefined> => {
        sending.value = true

        return await axios.post<{ success: boolean; data: FreeShippingRule; message: string }>('free-shipping-rules', payload)
            .then(res => {
                useSuccessHandler().showSuccess(res.data, 'Правило создано')
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

    const updateRule = async (id: number, payload: FreeShippingRuleForm): Promise<FreeShippingRule | undefined> => {
        sending.value = true

        return await axios.put<{ success: boolean; data: FreeShippingRule; message: string }>(`free-shipping-rules/${id}`, payload)
            .then(res => {
                useSuccessHandler().showSuccess(res.data, 'Правило обновлено')
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

    const deleteRule = async (id: number): Promise<void> => {
        sending.value = true

        await axios.delete(`free-shipping-rules/${id}`)
            .then(() => {
                useSuccessHandler().showSuccess(null, 'Правило удалено')
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => {
                sending.value = false
            })
    }

    const toggleRule = async (id: number): Promise<boolean | undefined> => {
        return await axios.post<{ success: boolean; data: { id: number; is_active: boolean } }>(`free-shipping-rules/${id}/toggle`)
            .then(res => res.data.data.is_active)
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
    }

    return {
        sending,
        getRules,
        getOptions,
        searchProducts,
        createRule,
        updateRule,
        deleteRule,
        toggleRule,
    }
}
