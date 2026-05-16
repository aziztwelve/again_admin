import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";

export function useProductOrderFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    /**
     * Пакетное обновление порядка товаров
     * POST /api/admin/products/order/bulk-update
     */
    const bulkUpdateOrders = async (orders: Record<number, number>) => {
        if (sending.value) return
        sending.value = true
        progress.value = 0

        try {
            const response = await axios.post('products/order/bulk-update', {
                orders // { productId: newOrder, ... }
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
     * Инициализировать порядок для всех товаров (один раз!)
     * POST /api/admin/products/order/initialize
     */
    const initializeOrders = async () => {
        if (sending.value) return
        sending.value = true
        progress.value = 0

        try {
            const response = await axios.post('products/order/initialize')
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
     * Обновить порядок одного товара
     * POST /api/admin/products/{id}/order
     */
    const updateProductOrder = async (productId: number, displayOrder: number) => {
        if (sending.value) return
        sending.value = true
        progress.value = 0

        try {
            const response = await axios.post(`products/order/${productId}/order`, {
                display_order: displayOrder
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
     * Получить список товаров с их порядком
     * GET /api/admin/products/order/list
     */
    const getOrderedProducts = async (perPage: number = 25) => {
        if (sending.value) return
        sending.value = true
        progress.value = 0

        try {
            const response = await axios.get('products/order/list', {
                params: { per_page: perPage }
            })
            return response.data
        } catch (error) {
            useErrorHandler().showError(error)
            throw error
        } finally {
            sending.value = false
        }
    }

    /**
     * Получить максимальный порядок
     * GET /api/admin/products/order/max
     */
    const getMaxOrder = async () => {
        try {
            const response = await axios.get('products/order/max')
            return response.data
        } catch (error) {
            useErrorHandler().showError(error)
            throw error
        }
    }

    /**
     * Перестроить порядок товаров (выравнивание)
     * POST /api/admin/products/order/rebuild
     */
    const rebuildOrders = async () => {
        if (sending.value) return
        sending.value = true
        progress.value = 0

        try {
            const response = await axios.post('products/order/rebuild')
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
        bulkUpdateOrders,
        initializeOrders,
        updateProductOrder,
        getOrderedProducts,
        getMaxOrder,
        rebuildOrders
    }
}