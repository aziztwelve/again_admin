import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import TaskStatus from "@/models/TaskStatus";

interface TaskStatusFilters {
    search?: string;
    page?: number;
    per_page?: number;
}


interface CreateTaskStatusData {
    name: string;
    color?: string | null;
    order?: number | null;
    is_default?: boolean;
}

interface UpdateTaskStatusData {
    name?: string;
    color?: string;
    order?: number;
    is_default?: boolean;
}


export function useTaskStatusFunctions() {
    const sending = ref(false)

    const getTaskStatuses = async (filters: TaskStatusFilters = {}): Promise<{
        statuses: TaskStatus[],
        meta: object | undefined
    } | null> => {
        sending.value = true

        return await axios.get('task-statuses', {params: filters})
            .then(res => {
                const statuses: TaskStatus[] = res.data.statuses?.map((item: any) => TaskStatus.fromJSON(item)) ||
                    res.data.map((item: any) => TaskStatus.fromJSON(item))


                return {
                    statuses,
                    meta: res.data.meta || undefined
                }
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const getTaskStatusById = async (id: number | string): Promise<TaskStatus | null> => {
        sending.value = true
        return await axios.get(`task-statuses/${id}`)
            .then(res => TaskStatus.fromJSON(res.data.status || res.data))
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const createTaskStatus = async (statusData: CreateTaskStatusData): Promise<TaskStatus | null> => {
        sending.value = true
        return await axios.post('task-statuses', statusData)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return TaskStatus.fromJSON(res.data.status || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const updateTaskStatus = async (id: number | string, statusData: UpdateTaskStatusData): Promise<TaskStatus | null> => {
        sending.value = true
        return await axios.put(`task-statuses/${id}`, statusData)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return TaskStatus.fromJSON(res.data.status || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const deleteTaskStatus = async (id: number | string): Promise<boolean> => {
        sending.value = true
        return await axios.delete(`task-statuses/${id}`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return true
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return false
            })
            .finally(() => sending.value = false)
    }


    return {
        sending,

        // Основные CRUD операции
        getTaskStatuses,
        getTaskStatusById,
        createTaskStatus,
        updateTaskStatus,
        deleteTaskStatus,

    }
}