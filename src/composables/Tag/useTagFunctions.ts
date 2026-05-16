import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler"
import {useSuccessHandler} from "@/composables/useSuccessHandler"
import type {
    Tag,
    CreateTagRequest,
    UpdateTagRequest,
    AttachTagsRequest,
    AttachTagRequest,
    TagStatistic
} from '@/types/tag'

export function useTagFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    // ========== CRUD Тегов ==========

    const getAllTags = async (): Promise<Tag[]> => {

        sending.value = true
        progress.value = 0

        return await axios.get('tags')
            .then(res => {
                console.log(res.data)
                return res.data
            })
            .catch(e => {
                throw e
            })
            .finally(() => sending.value = false)
    }

    const createTag = async (params: CreateTagRequest): Promise<Tag> => {
        if (sending.value) return {} as Tag

        sending.value = true
        progress.value = 0

        return await axios.post('tags', params)
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

    const updateTag = async (id: number, params: UpdateTagRequest): Promise<Tag> => {
        if (sending.value) return {} as Tag

        sending.value = true
        progress.value = 0

        return await axios.put(`tags/${id}`, params)
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
        progress.value = 0

        return await axios.delete(`tags/${id}`)
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

    const getTagStatistics = async (): Promise<TagStatistic[]> => {
        if (sending.value) return []

        sending.value = true
        progress.value = 0

        return await axios.get('tags/statistics/usage')
            .then(res => {
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    // ========== Теги Клиента ==========

    const getClientTags = async (clientId: number): Promise<Tag[]> => {
        if (sending.value) return []

        sending.value = true
        progress.value = 0

        return await axios.get(`clients/${clientId}/tags`)
            .then(res => {
                return res.data.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
            .finally(() => sending.value = false)
    }

    const syncClientTags = async (clientId: number, params: AttachTagsRequest): Promise<Tag[]> => {
        if (sending.value) return []

        sending.value = true
        progress.value = 0

        return await axios.post(`clients/${clientId}/tags/sync`, params)
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

    const attachClientTag = async (clientId: number, params: AttachTagRequest): Promise<Tag[]> => {
        if (sending.value) return []

        sending.value = true
        progress.value = 0

        return await axios.post(`clients/${clientId}/tags/attach`, params)
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

    const detachClientTag = async (clientId: number, params: AttachTagRequest): Promise<Tag[]> => {
        if (sending.value) return []

        sending.value = true
        progress.value = 0

        return await axios.post(`clients/${clientId}/tags/detach`, params)
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

    return {
        sending,
        progress,
        // CRUD
        getAllTags,
        createTag,
        updateTag,
        deleteTag,
        getTagStatistics,
        // Client Tags
        getClientTags,
        syncClientTags,
        attachClientTag,
        detachClientTag,
    }
}