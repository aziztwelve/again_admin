import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler"
import {useSuccessHandler} from "@/composables/useSuccessHandler"
import type {
    MarketingChannel,
    UtmTag,
    UtmLink,
    CreateMarketingChannelRequest,
    UpdateMarketingChannelRequest,
    CreateUtmTagRequest,
    UpdateUtmTagRequest,
    CreateUtmLinkRequest,
    UpdateUtmLinkRequest,
    UtmAnalyticsResponse,
    UtmAnalyticsFilters,
} from '@/types/utm'

/**
 * Функционал UTM-меток: CRUD каналов/тегов/меток + аналитика.
 * Бэкенд: /api/utm/* и /api/analytics/utm (см. lara_admin/docs/tasks/utm-tracking.md).
 */
export function useUtmFunctions() {
    const sending = ref(false)

    // ========== Каналы маркетинга ==========

    const getChannels = async (): Promise<MarketingChannel[]> => {
        return await axios.get('utm/marketing-channels')
            // Бэк использует JsonResource::withoutWrapping() — index отдаёт ГОЛЫЙ
            // массив (без обёртки { data: [...] }). Поддерживаем оба варианта.
            .then(res => res.data?.data ?? res.data ?? [])
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
    }

    const createChannel = async (params: CreateMarketingChannelRequest): Promise<MarketingChannel> => {
        if (sending.value) return {} as MarketingChannel
        sending.value = true
        return await axios.post('utm/marketing-channels', params)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    const updateChannel = async (id: number, params: UpdateMarketingChannelRequest): Promise<MarketingChannel> => {
        if (sending.value) return {} as MarketingChannel
        sending.value = true
        return await axios.put(`utm/marketing-channels/${id}`, params)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    const deleteChannel = async (id: number): Promise<void> => {
        if (sending.value) return
        sending.value = true
        return await axios.delete(`utm/marketing-channels/${id}`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    // ========== Теги ==========

    const getTags = async (): Promise<UtmTag[]> => {
        return await axios.get('utm/tags')
            .then(res => res.data?.data ?? res.data ?? [])
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
    }

    const createTag = async (params: CreateUtmTagRequest): Promise<UtmTag> => {
        if (sending.value) return {} as UtmTag
        sending.value = true
        return await axios.post('utm/tags', params)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    const updateTag = async (id: number, params: UpdateUtmTagRequest): Promise<UtmTag> => {
        if (sending.value) return {} as UtmTag
        sending.value = true
        return await axios.put(`utm/tags/${id}`, params)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    const deleteTag = async (id: number): Promise<void> => {
        if (sending.value) return
        sending.value = true
        return await axios.delete(`utm/tags/${id}`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    // ========== UTM-метки ==========

    const getLinks = async (): Promise<UtmLink[]> => {
        return await axios.get('utm/links')
            .then(res => res.data?.data ?? res.data ?? [])
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
    }

    const createLink = async (params: CreateUtmLinkRequest): Promise<UtmLink> => {
        if (sending.value) return {} as UtmLink
        sending.value = true
        return await axios.post('utm/links', params)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    const updateLink = async (id: number, params: UpdateUtmLinkRequest): Promise<UtmLink> => {
        if (sending.value) return {} as UtmLink
        sending.value = true
        return await axios.put(`utm/links/${id}`, params)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    // Точечное переключение активности метки. Без общего sending-guard: тумблеры
    // разных строк должны работать независимо (иначе клик во время другого запроса
    // тихо теряется). Параллельность на строку гасится флагом в компоненте.
    const setLinkActive = async (id: number, isActive: boolean): Promise<UtmLink> => {
        return await axios.put(`utm/links/${id}`, {is_active: isActive})
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
    }

    const deleteLink = async (id: number): Promise<void> => {
        if (sending.value) return
        sending.value = true
        return await axios.delete(`utm/links/${id}`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    // ========== Аналитика ==========

    const getAnalytics = async (filters: UtmAnalyticsFilters = {}): Promise<UtmAnalyticsResponse | undefined> => {
        // Чистим пустые/null параметры, чтобы не слать ?channel_id=
        const params: Record<string, any> = {}
        Object.entries(filters).forEach(([key, value]) => {
            // Пустой массив меток (link_ids) не шлём — иначе бэк вернёт пусто.
            if (Array.isArray(value)) {
                if (value.length) params[key] = value
                return
            }
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value
            }
        })

        return await axios.get('analytics/utm', {params})
            .then(res => res.data as UtmAnalyticsResponse)
            .catch(e => {
                useErrorHandler().showError(e)
                return undefined
            })
    }

    return {
        sending,
        // channels
        getChannels,
        createChannel,
        updateChannel,
        deleteChannel,
        // tags
        getTags,
        createTag,
        updateTag,
        deleteTag,
        // links
        getLinks,
        createLink,
        updateLink,
        setLinkActive,
        deleteLink,
        // analytics
        getAnalytics,
    }
}
