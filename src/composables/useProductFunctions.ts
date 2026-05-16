import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";

export function useProductFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    const getProducts = async (params: {
        per_page?: number,
        page?: number,
        paginate?: boolean,
        admin?: boolean,
        search?: string,
        is_active?: number,
        sort_by?: 'display_order' | 'created_at' | 'name' | 'price'
        sort_order?: 'asc' | 'desc'
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get('products', {
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
    const getProductsSimple = async (params: {
        per_page?: number,
        page?: number,
        search?: string,
        withVariants?: boolean,
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get('products/simple', {
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

    const getProductsById = async (productId: any, params: {
        per_page?: number,
        page?: number,
        paginate?: boolean,
        admin?: boolean,
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.get(`products/${productId}`, {
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

    const deleteProduct = async (productId: any, params: {
        per_page?: number,
        page?: number,
        paginate?: boolean,
        admin?: boolean,
    }) => {
        if (sending.value) return

        sending.value = true
        progress.value = 0

        return await axios.delete(`products/${productId}`, {
            params: params
        })
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data
            })

            .catch(e => {
                sending.value = false
                useErrorHandler().showError(e)
            })
            .finally(() => sending.value = false)
    }


    const bulkActivateProducts = async (ids: number[]) => {
        if (sending.value) return
        sending.value = true
        progress.value = 0

        return await axios.post('products/bulk-activate', {ids})
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
            })
            .finally(() => sending.value = false)
    }

    const bulkDeactivateProducts = async (ids: number[]) => {
        if (sending.value) return
        sending.value = true
        progress.value = 0

        return await axios.post('products/bulk-deactivate', {ids})
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return res.data
            })
            .catch(e => {
                useErrorHandler().showError(e)
            })
            .finally(() => sending.value = false)
    }


    return {
        sending,
        progress,
        getProducts,
        getProductsById,
        deleteProduct,
        getProductsSimple,

        bulkActivateProducts,
        bulkDeactivateProducts,

    }
}
