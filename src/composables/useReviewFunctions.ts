import axios from "axios";
import {toast} from "vue-sonner";

export function useReviewFunctions() {

    const getAllReviews = async () => {
        try {
            const response = await axios.get(`/reviews`);

            return response.data
        } catch (e: any) {
            toast.error(
                e.response?.data?.message || "Произошла ошибка при получении отзывов"
            );
            return [];
        }
    };

    const getReviewsByStatus = async (status = 'approved') => {
        try {
            const response = await axios.get(`/reviews`, {
                params: {status}
            });

            if (response.data.status) {
                return response.data.reviews;
            } else {
                toast.error(response.data.message || "Не удалось получить отзывы по статусу");
                return [];
            }

        } catch (e: any) {
            toast.error(
                e.response?.data?.message || "Ошибка при получении отзывов по статусу"
            );
            return [];
        }
    };

    return {
        getAllReviews,
        getReviewsByStatus
    };
}
