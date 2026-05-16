import axios from "axios";
import {toast} from "vue-sonner";
import {Batch} from "@/models/Batch"; // Предполагается, что у вас есть модель Batch

interface BatchParams {
    [key: string]: any; // Динамические параметры для запросов
}

export function useProductionFunctions() {
    const apiUrl = '/production/batches'; // Базовый URL для API

    /**
     * Создание нового производственного задания
     */
    const createBatch = async (data: BatchParams): Promise<Batch | null> => {
        try {
            const response = await axios.post(`${apiUrl}`, data);
            toast.success(response.data.message || "Производственное задание успешно создано");
            return response.data?.data ? Batch.fromJSON(response.data.data) : null;
        } catch (error) {
            handleError(error, "Ошибка при создании задания");
            return null;
        }
    };

    /**
     * Получение списка производственных заданий
     */
    const getBatches = async (params: BatchParams = {}): Promise<{ batches: Batch[], total: number } | null> => {
        try {
            const response = await axios.get(`${apiUrl}`, {params});
            return {
                batches: response.data.data.map((item: any) => Batch.fromJSON(item)),
                total: response.data.total
            };
        } catch (error) {
            handleError(error, "Ошибка при загрузке заданий");
            return null;
        }
    };

    /**
     * Обновление производственного задания
     */
    const updateBatch = async (id: number, data: BatchParams): Promise<Batch | null> => {
        try {
            const response = await axios.put(`${apiUrl}/${id}`, data);
            toast.success(response.data.message || "Задание успешно обновлено");
            return response.data?.data ? Batch.fromJSON(response.data.data) : null;
        } catch (error) {
            handleError(error, "Ошибка при обновлении задания");
            return null;
        }
    };

    /**
     * Завершение производственного задания
     */
    const completeBatch = async (params: BatchParams = {}): Promise<boolean> => {
        try {
            const response = await axios.put(`${apiUrl}/complete`, null, {params});
            toast.success(response.data.message || "Задание успешно завершено");
            return true
            // if (response.data.status){
            //     toast.success(response.data.message || "Задание успешно завершено");
            //     return true
            // }
            // return false
            // return response.data?.data ? Batch.fromJSON(response.data.data) : null;
        } catch (error) {
            handleError(error, "Ошибка при завершении задания");
            return false;
        }
    };

    /**
     * Отмена производственного задания
     */
    const cancelBatch = async (params: BatchParams = {}): Promise<Batch | null> => {
        try {
            const response = await axios.put(`${apiUrl}/cancel`, null, {params});
            toast.success(response.data.message || "Задание успешно отменено");
            return response.data?.data ? Batch.fromJSON(response.data.data) : null;
        } catch (error) {
            handleError(error, "Ошибка при отмене задания");
            return null;
        }
    };
    const cancelBatchAllBatch = async (params: BatchParams = {}): Promise<Batch | null> => {
        try {
            const response = await axios.put(`${apiUrl}/cancel/all-batch`, null, {params});
            toast.success(response.data.message || "Задание успешно отменено");
            return response.data?.data ? Batch.fromJSON(response.data.data) : null;
        } catch (error) {
            handleError(error, "Ошибка при отмене задания");
            return null;
        }
    };

    /**
     * Получение одного производственного задания
     */
    const getBatch = async (id: number, params: BatchParams = {}): Promise<Batch | null> => {
        try {
            const response = await axios.get(`${apiUrl}/${id}`, {params});
            return response.data?.data ? Batch.fromJSON(response.data.data) : null;
        } catch (error) {
            handleError(error, "Ошибка при загрузке задания");
            return null;
        }
    };

    /**
     * Удаление производственного задания
     */
    const deleteBatch = async (id: number): Promise<boolean> => {
        try {
            await axios.delete(`${apiUrl}/${id}`);
            toast.success("Задание успешно удалено");
            return true;
        } catch (error) {
            handleError(error, "Ошибка при удалении задания");
            return false;
        }
    };

    /**
     * Обработчик ошибок
     */
    const handleError = (error: unknown, defaultMessage: string) => {
        if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || error.response?.data?.error || defaultMessage);
            console.error("API Error:", error.response?.data);
        } else {
            toast.error(defaultMessage);
            console.error("Unknown Error:", error);
        }
    };

    return {
        createBatch,
        getBatches,
        getBatch,
        updateBatch,
        completeBatch,
        cancelBatch,
        deleteBatch,
        cancelBatchAllBatch
    };
}