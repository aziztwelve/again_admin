import axios from "axios";
import {toast} from "vue-sonner";
import {PromoCode} from "@/models/PromoCode";
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import {ref} from "vue";
import {PromoCodeUsage} from "@/models/PromoCodeUsage";


export function usePromoCodeUsage() {

    const sending = ref(false);

    const getPromoCodeStatistics = async (params: {
        per_page?: number;
        page?: number;
        promoCodeId: string | number;
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

        return await axios.get(`promo-code-usage/promo-code/${params.promoCodeId}/statistics`, {params})
            .then(res => {
                return {
                    data: res.data.data,
                    meta: res.data?.meta ?? {}
                };
            })
            .catch(e => {
                useErrorHandler().showError(e);
                return undefined;
            })
            .finally(() => sending.value = false);
    };

    const getPromoCodeUsageDetails = async (params: {
        per_page?: number;
        page?: number;
        promoCodeId: string | number;
        date_from?: string | null;
        date_to?: string | null;
        order_status?: string | null;
        payment_status?: string | null;
    }): Promise<{
        data: PromoCodeUsage[];
        meta: {
            page: number;
            per_page: number;
            total: number;
        };
        summary: {
            total_salse: number;
            total_discounts: number;
        }
    } | undefined> => {
        sending.value = true;

        return await axios.get(`promo-code-usage/promo-code/${params.promoCodeId}/details`, {params})
            .then(res => {
                return {
                    data: res.data.data.map((i: any) => PromoCodeUsage.fromJSON(i)),
                    meta: {
                        page: res.data?.meta?.current_page ?? 1,
                        per_page: res.data?.meta?.per_page ?? 10,
                        total: res.data?.meta?.total ?? 0,
                    },
                    summary: {
                        total_salse: res.data?.summary?.total_salse,
                        total_discounts: res.data?.summary?.total_discounts
                    }
                };
            })
            .catch(e => {
                useErrorHandler().showError(e);
                return undefined;
            })
            .finally(() => sending.value = false);
    };

    return {
        getPromoCodeStatistics,
        getPromoCodeUsageDetails,
        sending
    };
}
