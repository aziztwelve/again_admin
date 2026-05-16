import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler"

export interface StatusItem {
    value: string
    label: string
    color: string
}

export interface StatusesResponse {
    order_statuses: Record<string, StatusItem>
    payment_statuses: Record<string, StatusItem>
    contact_request_statuses: Record<string, StatusItem>
}

const cachedStatuses = ref<StatusesResponse | null>(null)
const sending = ref(false)
const progress = ref(0)

export function useStatusFunctions() {

    const getAllStatuses = async (forceRefresh = false): Promise<StatusesResponse | undefined> => {
        if (cachedStatuses.value && !forceRefresh) {
            return cachedStatuses.value
        }

        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get('/public/statuses')
            .then(res => {
                cachedStatuses.value = res.data.data
                return res.data.data
            })
            .catch(e => {
                sending.value = false
                useErrorHandler().showError(e)
            })
            .finally(() => sending.value = false)
    }

    const getStatus = (type: 'order' | 'payment' | 'contactRequest', value: string): StatusItem | undefined => {
        if (!cachedStatuses.value) {
            console.warn('Статусы ещё не загружены!')
            return undefined
        }

        const statuses = type === 'order'
            ? cachedStatuses.value.order_statuses
            : type === 'payment'
                ? cachedStatuses.value.payment_statuses
                : cachedStatuses.value.contact_request_statuses

        return statuses[value]
    }

    const getStatuses = (type: 'order' | 'payment' | 'contactRequest'): StatusItem[] => {

        if (!cachedStatuses.value) return []

        const res = type === 'order'
            ? Object.values(cachedStatuses.value.order_statuses)
            : type === 'payment'
                ? Object.values(cachedStatuses.value.payment_statuses)
                : Object.values(cachedStatuses.value.contact_request_statuses)

        console.log(res)
        return res

    }

    const clearCache = () => {
        cachedStatuses.value = null
    }

    return {
        sending,
        progress,
        cachedStatuses,
        getAllStatuses,
        getStatuses,
        getStatus,
        clearCache,
    }
}