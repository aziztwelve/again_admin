// composables/useTaskLabelFunctions.ts
import {ref} from 'vue'
import axios from 'axios'
import TaskLabel from '@/models/TaskLabel'
import {useErrorHandler} from '@/composables/useErrorHandler'
import {useSuccessHandler} from '@/composables/useSuccessHandler'

interface TaskLabelFilters {
    search?: string;
    page?: number;
    per_page?: number;
}

interface TaskLabelsResponse {
    labels: TaskLabel[];
    meta?: {
        page: number;
        per_page: number;
        total: number;
    };
}

interface CreateTaskLabelData {
    name: string;
    slug?: string;
    color?: string;
}

interface UpdateTaskLabelData {
    name?: string;
    slug?: string;
    color?: string;
}

export function useTaskLabelFunctions() {
    const sending = ref(false)

    const getTaskLabels = async (filters: TaskLabelFilters = {}): Promise<TaskLabelsResponse | null> => {
        sending.value = true
        return axios.get('task-labels', {params: filters})
            .then(res => {
                const items = res.data.labels ?? res.data
                const labels: TaskLabel[] = (items || []).map((it: any) => TaskLabel.fromJSON(it))
                return {labels, meta: res.data.meta || undefined}
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const getTaskLabelById = async (id: number | string): Promise<TaskLabel | null> => {
        sending.value = true
        return axios.get(`task-labels/${id}`)
            .then(res => TaskLabel.fromJSON(res.data.label ?? res.data))
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const createTaskLabel = async (data: CreateTaskLabelData): Promise<TaskLabel | null> => {
        sending.value = true
        return axios.post('task-labels', data)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return TaskLabel.fromJSON(res.data.label ?? res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const updateTaskLabel = async (id: number | string, data: UpdateTaskLabelData): Promise<TaskLabel | null> => {
        sending.value = true
        return axios.put(`task-labels/${id}`, data)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return TaskLabel.fromJSON(res.data.label ?? res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const deleteTaskLabel = async (id: number | string): Promise<boolean> => {
        sending.value = true
        return axios.delete(`task-labels/${id}`)
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
        getTaskLabels,
        getTaskLabelById,
        createTaskLabel,
        updateTaskLabel,
        deleteTaskLabel,
    }
}
