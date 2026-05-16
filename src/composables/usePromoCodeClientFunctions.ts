import axios from "axios";
import {toast} from "vue-sonner";
import {PromoCodeClient} from "@/models/PromoCodeClient";
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import {ref} from "vue";

export function usePromoCodeClientFunctions() {

    const sending = ref(false);

    const createPromoCodeClient = async (params: {
        promo_code_id: string | number;
        client_id: string | number;
    }): Promise<PromoCodeClient | null> => {
        sending.value = true;
        try {
            const response = await axios.post('promo-code-clients', params, {
                headers: {'Content-Type': 'multipart/form-data'}
            });
            useSuccessHandler().showSuccess(response);
            return response.data?.data ? PromoCodeClient.fromJSON(response.data.data) : null;
        } catch (error) {
            useErrorHandler().showError(error);
            return null;
        } finally {
            sending.value = false;
        }
    };

    const getPromoCodeClients = async (params: {
        promo_code_id?: number;
        client_id?: number;
        active_only?: boolean;
        promo_code?: string;
        client_search?: string;
        sort_by?: string;
        sort_direction?: 'asc' | 'desc';
        per_page?: number;
        page?: number;
    }): Promise<{
        data: PromoCodeClient[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    } | undefined> => {
        sending.value = true;
        try {
            const response = await axios.get('promo-code-clients', {params});
            return {
                data: response.data.data.map((item: any) => PromoCodeClient.fromJSON(item)),
                meta: response.data.meta
            };
        } catch (error) {
            useErrorHandler().showError(error);
            return undefined;
        } finally {
            sending.value = false;
        }
    };

    const deletePromoCodeClient = async (promoCodeClientId: number): Promise<boolean> => {
        sending.value = true;
        try {
            const response = await axios.delete(`promo-code-clients/${promoCodeClientId}`);
            useSuccessHandler().showSuccess(response);
            return true;
        } catch (error) {
            useErrorHandler().showError(error);
            return false;
        } finally {
            sending.value = false;
        }
    };

    return {
        createPromoCodeClient,
        getPromoCodeClients,
        deletePromoCodeClient,
        sending
    };
}
