import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler"
import {useSuccessHandler} from "@/composables/useSuccessHandler"
import {ApiResponse, BulkUpdateAttributesPayload, ProductAttributes} from "@/types/products";


export function useProductAttributeFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Обновить впитываемость товара
     * POST /api/products/attributes/{id}/absorbency
     */
    const updateAbsorbency = async (productId: number, absorbencyLevel: number): Promise<ApiResponse | undefined> => {
        // Валидация на фронте
        if (absorbencyLevel < 0 || absorbencyLevel > 6) {
            useErrorHandler().showError({
                response: {
                    data: {message: 'Впитываемость должна быть от 0 до 6'}
                }
            })
            return
        }

        if (sending.value) return
        sending.value = true
        progress.value = 0

        try {
            const response = await axios.post(`/products/attributes/${productId}/absorbency`, {
                absorbency_level: absorbencyLevel
            })
            useSuccessHandler().showSuccess(response)
            return response.data
        } catch (error) {
            useErrorHandler().showError(error)
            throw error
        } finally {
            sending.value = false
        }
    }

    /**
     * Обновить несколько атрибутов одного товара
     * POST /api/products/attributes/{id}
     */
    const updateAttributes = async (
        productId: number,
        attributes: ProductAttributes
    ): Promise<ApiResponse> => {
        sending.value = true

        return await axios.post(`products/attributes/${productId}`, attributes)
            .then(res => {
                return res.data
            })
            .catch(error => {
                throw error
            })
            .finally(() => sending.value = false)
    }

    /**
     * Массовое обновление атрибутов для нескольких товаров
     * POST /api/products/attributes/bulk/update
     */
    const bulkUpdateAttributes = async (
        payload: BulkUpdateAttributesPayload
    ): Promise<ApiResponse> => {
        if (sending.value) return Promise.reject('Request already in progress')

        sending.value = true
        progress.value = 0

        try {
            const response = await axios.post('/products/attributes/bulk/update', payload)
            useSuccessHandler().showSuccess(response)
            return response.data
        } catch (error) {
            useErrorHandler().showError(error)
            throw error
        } finally {
            sending.value = false
        }
    }

    return {
        sending,
        progress,
        updateAbsorbency,
        updateAttributes,
        bulkUpdateAttributes
    }
}

