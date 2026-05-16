import axios from "axios";
import {toast} from "vue-sonner";
import {PromoCode} from "@/models/PromoCode";
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import {ref} from "vue";


export function usePromoCodeFunctions() {

    const sending = ref(false);

    const createPromoCode = async (params: FormData): Promise<boolean | undefined> => {
        sending.value = true;

        return await axios.post('promo-codes', params)
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

    const updatePromoCode = async (promo: PromoCode): Promise<PromoCode | null> => {
        try {
            if (!promo.id) {
                toast.error("ID промокода не указан");
                return null;
            }


            const formData = promo.toFormData();
            formData.append('_method', 'PUT');

            const response = await axios.post(`/promo-codes/${promo.id}`, formData, {
                headers: {'Content-Type': 'multipart/form-data'}
            });

            useSuccessHandler().showSuccess(response);

            return response.data?.data ? PromoCode.fromJSON(response.data.data) : null;
        } catch (error) {
            useErrorHandler().showError(error);
            return null;
        }
    };

    const deletePromoCode = async (promoId: number): Promise<boolean> => {
        try {
            const response = await axios.delete(`/promo-codes/${promoId}`);
            useSuccessHandler().showSuccess(response);
            return true;
        } catch (error) {
            useErrorHandler().showError(error);
            return false;
        }
    };

    const getPromoCodes = async (params: {
        id?: number | string;
        per_page?: number;
        page?: number;
        code?: string;
        is_active?: boolean;
    }): Promise<{
        data: PromoCode[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    } | undefined> => {
        sending.value = true;

        return await axios.get('promo-codes', {params})
            .then(res => {
                return {
                    data: res.data.data.map((item: any) => PromoCode.fromJSON(item)),
                    meta: res.data?.meta
                };
            })
            .catch(e => {
                useErrorHandler().showError(e);
                return undefined;
            })
            .finally(() => sending.value = false);
    };

    return {
        createPromoCode,
        updatePromoCode,
        deletePromoCode,
        getPromoCodes,
        sending
    };
}
