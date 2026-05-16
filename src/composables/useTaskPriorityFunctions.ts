// composables/useTaskPriorityFunctions.ts
import {ref} from 'vue'
import axios from 'axios'
import TaskPriority from '@/models/TaskPriority'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'

interface TaskPriorityFilters {
    search?: string;
    page?: number;
    per_page?: number;
}

interface TaskPrioritiesResponse {
    priorities: TaskPriority[];
    meta?: {
        page: number;
        per_page: number;
        total: number;
    };
}

interface CreateTaskPriorityData {
    name: string;
    slug?: string;
    color?: string;
    level?: number;
}

interface UpdateTaskPriorityData {
    name?: string;
    slug?: string;
    color?: string;
    level?: number;
}

export function useTaskPriorityFunctions() {
    const sending = ref(false)

    const getTaskPriorities = async (filters: TaskPriorityFilters = {}): Promise<TaskPrioritiesResponse | null> => {
        sending.value = true
        return axios.get('task-priorities', {params: filters})
            .then(res => {

                const items = res.data.priorities ?? res.data

                const priorities: TaskPriority[] = (items || []).map((it: any) => TaskPriority.fromJSON(it))
                return {
                    priorities,
                    meta: res.data.meta || undefined
                }
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const getTaskPriorityById = async (id: number | string): Promise<TaskPriority | null> => {
        sending.value = true
        return axios.get(`task-priorities/${id}`)
            .then(res => TaskPriority.fromJSON(res.data.priority ?? res.data))
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const createTaskPriority = async (data: CreateTaskPriorityData): Promise<TaskPriority | null> => {
        sending.value = true
        return axios.post('task-priorities', data)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return TaskPriority.fromJSON(res.data.priority ?? res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const updateTaskPriority = async (id: number | string, data: UpdateTaskPriorityData): Promise<TaskPriority | null> => {
        sending.value = true
        return axios.put(`task-priorities/${id}`, data)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return TaskPriority.fromJSON(res.data.priority ?? res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const deleteTaskPriority = async (id: number | string): Promise<boolean> => {
        sending.value = true
        return axios.delete(`task-priorities/${id}`)
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
        getTaskPriorities,
        getTaskPriorityById,
        createTaskPriority,
        updateTaskPriority,
        deleteTaskPriority,
    }
}
