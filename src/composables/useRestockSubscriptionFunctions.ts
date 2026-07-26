import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import {PaginationMeta} from "@/types/Types";

export interface RestockSubscription {
    id: number
    product_id: number
    product_variant_id: number | null
    client_id: number | null
    name: string | null
    email: string
    phone: string | null
    status: 'pending' | 'notified'
    notified_at: string | null
    source: string | null
    manager_comment?: string | null
    created_at: string
    product?: { id: number, name: string, slug: string, stock_quantity: number }
    color_ids?: number[] | null
    colors?: Array<{ id: number, name: string, code: string }>
    variant?: { id: number, name: string } | null
    client?: any
    history?: Array<{ id: number, action: string, description: string, created_at: string, user?: { id: number, name: string } | null }>
}

export function useRestockSubscriptionFunctions() {
    const sending = ref(false)

    const getRestockSubscriptions = async (params: {
        product_id?: number | string,
        status?: string,
        per_page?: number,
        page?: number,
        search?: string,
        date_from?: string,
        date_to?: string,
    }): Promise<{ subscriptions: RestockSubscription[], meta: PaginationMeta } | null> => {
        sending.value = true

        return await axios.get('restock-subscriptions', {params})
            .then(res => ({
                subscriptions: res.data.data as RestockSubscription[],
                meta: {
                    page: res.data?.meta?.page,
                    per_page: res.data?.meta?.per_page,
                    total: res.data?.meta?.total,
                }
            }))
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const getCount = async (productId?: number | string): Promise<number> => {
        return await axios.get('restock-subscriptions/count', {
            params: productId ? {product_id: productId} : {}
        })
            .then(res => res.data.count ?? 0)
            .catch(e => {
                useErrorHandler().showError(e)
                return 0
            })
    }

    const deleteRestockSubscription = async (id: number | string): Promise<boolean> => {
        sending.value = true
        return await axios.delete(`restock-subscriptions/${id}`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return true
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return false
            })
            .finally(() => sending.value = false)
    }

    const getRestockSubscription = async (id: number | string): Promise<RestockSubscription | null> => {
        return await axios.get(`restock-subscriptions/${id}`)
            .then(res => res.data.data as RestockSubscription)
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
    }

    const updateRestockSubscription = async (id: number | string, payload: { manager_comment: string | null }): Promise<RestockSubscription | null> => {
        sending.value = true
        return await axios.put(`restock-subscriptions/${id}`, payload)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data as RestockSubscription
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    return {
        sending,
        getRestockSubscriptions,
        getCount,
        deleteRestockSubscription,
        getRestockSubscription,
        updateRestockSubscription,
    }
}
