import axios from "axios";
import {toast} from "vue-sonner";
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import {ref} from "vue";
import {Product} from "@/models/Product";

export interface PromoCodeProduct {
    id?: number;
    promo_code_id: number;
    product_id: number;
    created_at?: string;
    updated_at?: string;
}

export function usePromoCodeProductFunctions() {
    const sending = ref(false);

    // Создание связи
    const createPromoCodeProduct = async (params: PromoCodeProduct): Promise<boolean | undefined> => {
        sending.value = true;

        return await axios.post('promo-code-products', params)
            .then(res => {
                useSuccessHandler().showSuccess(res);
                return true;
            })
            .catch(e => {
                useErrorHandler().showError(e);
                return undefined;
            })
            .finally(() => sending.value = false);
    };

    // Обновление связи
    const updatePromoCodeProduct = async (promoCodeProduct: PromoCodeProduct): Promise<PromoCodeProduct | null> => {
        try {
            if (!promoCodeProduct.id) {
                toast.error("ID promo_code_product не указан");
                return null;
            }

            const response = await axios.put(`/promo-code-products/${promoCodeProduct.id}`, promoCodeProduct);

            useSuccessHandler().showSuccess(response);

            return response.data?.data ?? null;
        } catch (error) {
            useErrorHandler().showError(error);
            return null;
        }
    };

    // Удаление связи
    const deletePromoCodeProduct = async (id: number): Promise<boolean> => {
        try {
            const response = await axios.delete(`/promo-code-products/${id}`);
            useSuccessHandler().showSuccess(response);
            return true;
        } catch (error) {
            useErrorHandler().showError(error);
            return false;
        }
    };

    // Получение всех связей (или фильтрация по promo_code_id)
    const getPromoCodeProducts = async (params?: {
        promo_code_id?: number;
        product_id?: number;
    }): Promise<PromoCodeProduct[] | undefined> => {
        sending.value = true;

        return await axios.get('promo-code-products', {params})
            .then(res => res.data.data ?? res.data) // поддержка API без ресурса
            .catch(e => {
                useErrorHandler().showError(e);
                return undefined;
            })
            .finally(() => sending.value = false);
    };


    const getProductsByPromoCode = async (params?: {
        promo_code_id?: number;
        withVariants?: boolean;
    }): Promise<Product[] | undefined> => {
        sending.value = true;

        return await axios.get(`promo-code-products/products/${params?.promo_code_id}`, {
            params: {
                withVariants: params?.withVariants ? 1 : 0
            }
        })
            .then(res => res.data.data.map((i: any) => Product.fromJSON(i)) ?? res.data)
            .catch(e => {
                useErrorHandler().showError(e);
                return undefined;
            })
            .finally(() => sending.value = false);
    };


    return {
        createPromoCodeProduct,
        updatePromoCodeProduct,
        deletePromoCodeProduct,
        getPromoCodeProducts,
        getProductsByPromoCode,
        sending
    };
}
