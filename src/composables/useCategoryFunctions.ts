import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import {
    CategoryListResponse,
    CategoryFilterQuery,
    CategoryFormData,
    categoryToFormData,
    CategoryCreateResponse, CategoryUpdateResponse
} from "@/types/category";

export function useCategoryFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    const getCategories = async (params: CategoryFilterQuery): Promise<CategoryListResponse> => {

        sending.value = true
        progress.value = 0

        return await axios.get('categories', {
            params: params
        })
            .then(res => {
                return res.data
            })
            .catch(e => {
                sending.value = false
                useErrorHandler().showError(e)
            })
            .finally(() => sending.value = false)
    }

    const getProductsByCategory = async (params: {
        category_id: number | string,
        per_page?: number,
        page?: number,
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get(`categories/products`, {
            params: params
        })
            .then(res => {
                return res.data
            })
            .catch(e => {
                sending.value = false
                useErrorHandler().showError(e)
            })
            .finally(() => sending.value = false)
    }

    const getOrderOptions = async (type: 'menu' | 'home_banner') => {
        return await axios.get('categories/order-options', {params: {type}})
            .then(res => res.data)
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
    }

    const reorderCategories = async (payload: {
        type: 'menu' | 'home_banner',
        groups: Array<{parent_id: number | null, category_ids: number[]}>,
    }) => {
        return await axios.post('categories/reorder', payload)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
                throw e
            })
    }

    const deleteCategory = async (id: number) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.delete(`categories/${id}`,)
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

    const createCategory = async (params: CategoryFormData): Promise<CategoryCreateResponse> => {

        sending.value = true
        progress.value = 0

        const formData = categoryToFormData(params)

        return await axios.post('categories', formData)
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

    const updateCategory = async (categoryId: number | string, params: CategoryFormData): Promise<CategoryUpdateResponse> => {

        sending.value = true
        progress.value = 0

        const formData = categoryToFormData(params)

        formData.append('_method', 'PUT')

        return await axios.post(`categories/${categoryId}`, formData)
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


    return {
        sending,
        progress,
        getCategories,
        getProductsByCategory,
        getOrderOptions,
        reorderCategories,
        deleteCategory,
        createCategory,
        updateCategory,
    }
}
