import axios from "axios";
import {toast} from "vue-sonner";
import {Discount} from "@/models/Discount";
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import {ref} from "vue";
import {DiscountValueType} from "@/constants/DiscountType";

interface DiscountFormData {
    name?: string;
    type?: DiscountValueType;
    value?: number;
    discount_type?: DiscountValueType;
    starts_at?: string;
    ends_at?: string;
    priority?: number | null;
    is_active?: boolean;
    categories?: number[] | null;
    products?: number[] | null;
}

export function useDiscountFunctions() {

    const sending = ref(false)

    const createDiscount = async (params: DiscountFormData): Promise<boolean | undefined> => {

        sending.value = true

        return await axios.post('discounts', {
            ...params
        })
            .then(res => {


                useSuccessHandler().showSuccess(res)
                return true
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return undefined
            })
            .finally(() => sending.value = false)
    }


    const updateDiscount = async (discount: Discount): Promise<Discount | null> => {
        try {
            if (!discount.id) {
                toast.error("ID скидки не указан");
                return null;
            }

            const response = await axios.put(`/discounts/${discount.id}`, discount);
            toast.success(response.data.message || "Данные скидки обновлены");

            return response.data?.discount ? Discount.fromJSON(response.data.discount) : null;
        } catch (error) {
            useErrorHandler().showError(error)
            return null;
        }
    };

    const deleteDiscount = async (discountId: number): Promise<boolean> => {
        try {
            const response = await axios.delete(`/discounts/${discountId}`);
            useSuccessHandler().showSuccess(response)
            return true
        } catch (error) {
            useErrorHandler().showError(error)
            return false
        }
    };

    const getDiscounts = async (params: {
        id?: number | string,
        per_page?: number,
        page?: number,
        paginate?: boolean,
        name?: string,
    }): Promise<{
        data: Discount[];
        meta: {
            current_page: number,
            last_page: number,
            per_page: number,
            total: number,
        };
    } | undefined> => {

        sending.value = true

        return await axios.get('discounts', {
            params: params
        })
            .then(res => {
                return {
                    data: res.data.data.map((item: any) => Discount.fromJSON(item)),
                    meta: res.data.meta
                }
            })
            .catch(e => {
                sending.value = false
                useErrorHandler().showError(e)
                return undefined
            })
            .finally(() => sending.value = false)
    }


    return {
        createDiscount,
        updateDiscount,
        deleteDiscount,
        getDiscounts,
        sending
        // getDiscount,
    };
}