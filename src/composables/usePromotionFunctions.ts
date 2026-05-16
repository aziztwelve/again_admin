import axios from "axios";
import { toast } from "vue-sonner";
import { Promotion } from "@/models/Promotion";
import { useErrorHandler } from "@/composables/useErrorHandler";
import { useSuccessHandler } from "@/composables/useSuccessHandler";
import { ref } from "vue";

interface PromotionFormData {
  name?: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  min_purchase_amount?: number | null;
  allow_promo_codes?: boolean;
  is_active?: boolean;
  priority?: number;
  max_uses?: number | null;
  trigger_product_ids?: number[];
  gift_products?: { product_id: number; quantity: number }[];
}

export function usePromotionFunctions() {
  const sending = ref(false);

  const createPromotion = async (
    params: PromotionFormData,
  ): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
    sending.value = true;

    return await axios
      .post("promotions", {
        ...params,
      })
      .then((res) => {
        useSuccessHandler().showSuccess(res);
        return { success: true };
      })
      .catch((e) => {
        const validationErrors = useErrorHandler().getValidationErrors(e);
        if (Object.keys(validationErrors).length > 0) {
          // Есть ошибки валидации - возвращаем их
          return { success: false, errors: validationErrors };
        } else {
          // Другая ошибка - показываем toast
          useErrorHandler().showError(e);
          return { success: false };
        }
      })
      .finally(() => (sending.value = false));
  };

  const updatePromotion = async (
    promotion: Promotion,
  ): Promise<{ success: boolean; data?: Promotion; errors?: Record<string, string[]> }> => {
    try {
      if (!promotion.id) {
        toast.error("ID акции не указан");
        return { success: false };
      }

      sending.value = true;

      const response = await axios.put(
        `/promotions/${promotion.id}`,
        promotion.toJSON(),
      );
      toast.success(response.data.message || "Данные акции обновлены");

      const updatedPromotion = response.data?.data
        ? Promotion.fromJSON(response.data.data)
        : null;

      return { success: true, data: updatedPromotion || undefined };
    } catch (error: any) {
      const validationErrors = useErrorHandler().getValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        // Есть ошибки валидации - возвращаем их
        return { success: false, errors: validationErrors };
      } else {
        // Другая ошибка - показываем toast
        useErrorHandler().showError(error);
        return { success: false };
      }
    } finally {
      sending.value = false;
    }
  };

  const deletePromotion = async (promotionId: number): Promise<boolean> => {
    try {
      const response = await axios.delete(`/promotions/${promotionId}`);
      useSuccessHandler().showSuccess(response);
      return true;
    } catch (error) {
      useErrorHandler().showError(error);
      return false;
    }
  };

  const getPromotions = async (params?: {
    per_page?: number;
    page?: number;
    paginate?: boolean;
    name?: string;
  }): Promise<
    | {
        data: Promotion[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }
    | undefined
  > => {
    sending.value = true;

    return await axios
      .get("promotions", {
        params: params,
      })
      .then((res) => {
        // API returns: { success: true, data: { current_page, data: [...], ... } }
        const paginationData = res.data.data;
        const dataArray = Array.isArray(paginationData?.data) 
          ? paginationData.data 
          : [];
        
        return {
          data: dataArray.map((item: any) => Promotion.fromJSON(item)),
          meta: {
            current_page: paginationData?.current_page || 1,
            last_page: paginationData?.last_page || 1,
            per_page: paginationData?.per_page || dataArray.length,
            total: paginationData?.total || dataArray.length,
          },
        };
      })
      .catch((e) => {
        useErrorHandler().showError(e);
        return undefined;
      })
      .finally(() => (sending.value = false));
  };

  const getPromotion = async (id: number): Promise<Promotion | undefined> => {
    sending.value = true;

    return await axios
      .get(`promotions/${id}`)
      .then((res) => {
        return Promotion.fromJSON(res.data.data);
      })
      .catch((e) => {
        useErrorHandler().showError(e);
        return undefined;
      })
      .finally(() => (sending.value = false));
  };

  const getProductsList = async (): Promise<any[]> => {
    try {
      const response = await axios.get("promotions/products/list");
      const data = response.data.data;
      // Проверяем что data это массив
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error) {
      useErrorHandler().showError(error);
      return [];
    }
  };

  const getPromotionStats = async (id: number): Promise<any | undefined> => {
    try {
      const response = await axios.get(`promotions/${id}/stats`);
      return response.data.data;
    } catch (error) {
      useErrorHandler().showError(error);
      return undefined;
    }
  };

  const toggleActive = async (id: number): Promise<boolean> => {
    try {
      const response = await axios.post(`promotions/${id}/toggle-active`);
      useSuccessHandler().showSuccess(response);
      return true;
    } catch (error) {
      useErrorHandler().showError(error);
      return false;
    }
  };

  return {
    sending,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getPromotions,
    getPromotion,
    getProductsList,
    getPromotionStats,
    toggleActive,
  };
}
