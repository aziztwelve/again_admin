import {ref} from 'vue'
import axios from 'axios'
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";
import Task from "@/models/Task";
import {User} from "@/models/user/User";
import TaskStatus from "@/models/TaskStatus";
import TaskPriority from "@/models/TaskPriority";
import TaskLabel from "@/models/TaskLabel";

interface TaskFilters {
    search?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    label?: string;
    dueDate?: string;
    page?: number;
    per_page?: number;
}

interface TasksResponse {
    tasks: Task[];
    statuses: TaskStatus[];
    priorities: TaskPriority[];
    labels: TaskLabel[];
    users: User[];
    filters: TaskFilters;
    meta?: {
        page: number;
        per_page: number;
        total: number;
    };
}

interface CreateTaskData {
    title: string;
    description?: string;
    status_id: number;
    priority_id: number;
    assignee_id?: number;
    parent_id?: number | string;
    due_date?: string;
    estimated_time?: number;
    labels?: number[];
}

interface UpdateTaskData {
    title?: string;
    description?: string;
    status_id?: number;
    priority_id?: number;
    assignee_id?: number;
    due_date?: string;
    estimated_time?: number;
    spent_time?: number;
    started_at?: string;
    completed_at?: string;
    labels?: number[];
}

export function useTaskFunctions() {
    const sending = ref(false)

    const getTasks = async (filters: TaskFilters = {}): Promise<TasksResponse | null> => {
        sending.value = true

        return await axios.get('tasks', {params: filters})
            .then(res => {
                const tasks: Task[] = res.data.tasks.map((item: any) => Task.fromJSON(item))

                return {
                    tasks,
                    statuses: res.data.statuses || [],
                    priorities: res.data.priorities || [],
                    labels: res.data.labels || [],
                    users: res.data.users || [],
                    filters: res.data.filters || {},
                    meta: res.data.meta || undefined
                }
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const getTaskById = async (id: number | string): Promise<Task | null> => {
        sending.value = true
        return await axios.get(`tasks/${id}`)
            .then(res => Task.fromJSON(res.data.task || res.data))
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const createTask = async (taskData: CreateTaskData): Promise<Task | null> => {
        sending.value = true
        return await axios.post('tasks', taskData)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return Task.fromJSON(res.data.task || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const updateTask = async (id: number | string, taskData: UpdateTaskData): Promise<Task | null> => {
        sending.value = true
        return await axios.put(`tasks/${id}`, taskData)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return Task.fromJSON(res.data.task || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }


    const deleteTask = async (id: number | string): Promise<boolean> => {
        sending.value = true
        return await axios.delete(`tasks/${id}`)
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

    // Специальные методы для управления статусом задач

    const startTask = async (id: number | string): Promise<Task | null> => {
        sending.value = true
        return await axios.patch(`tasks/${id}/start`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return Task.fromJSON(res.data.task || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const completeTask = async (id: number | string): Promise<Task | null> => {
        sending.value = true
        return await axios.post(`tasks/${id}/complete`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return Task.fromJSON(res.data.task || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const reopenTask = async (id: number | string): Promise<Task | null> => {
        sending.value = true
        return await axios.patch(`tasks/${id}/reopen`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return Task.fromJSON(res.data.task || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    // Методы для работы со временем

    const addTimeToTask = async (id: number | string, minutes: number, comment?: string): Promise<Task | null> => {
        sending.value = true
        return await axios.patch(`tasks/${id}/add-time`, {
            minutes,
            comment
        })
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return Task.fromJSON(res.data.task || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    // Методы для работы с комментариями

    const addComment = async (taskId: number | string, content: string): Promise<boolean> => {
        sending.value = true
        return await axios.post(`tasks/${taskId}/comments`, {content})
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

    const updateComment = async (taskId: number | string, commentId: number | string, content: string): Promise<boolean> => {
        sending.value = true
        return await axios.patch(`tasks/${taskId}/comments/${commentId}`, {content})
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

    const deleteComment = async (taskId: number | string, commentId: number | string): Promise<boolean> => {
        sending.value = true
        return await axios.delete(`tasks/${taskId}/comments/${commentId}`)
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

    // Методы для работы с метками

    const assignLabels = async (taskId: number | string, labelIds: number[]): Promise<Task | null> => {
        sending.value = true
        return await axios.patch(`tasks/${taskId}/labels`, {labels: labelIds})
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return Task.fromJSON(res.data.task || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    // Методы для работы с подзадачами

    const getSubtasks = async (parentId: number | string): Promise<Task[] | null> => {
        sending.value = true
        return await axios.get(`tasks/${parentId}/subtasks`)
            .then(res => {
                const subtasks: Task[] = res.data.subtasks?.map((item: any) => Task.fromJSON(item)) || []
                return subtasks
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const createSubtask = async (parentId: number | string, taskData: CreateTaskData): Promise<Task | null> => {
        const subtaskData = {...taskData, parent_id: parentId}
        return await createTask(subtaskData)
    }

    // Методы для работы с вложениями

    const uploadAttachment = async (taskId: number | string, file: File): Promise<boolean> => {
        sending.value = true
        const formData = new FormData()
        formData.append('file', file)

        return await axios.post(`tasks/${taskId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
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

    const deleteAttachment = async (taskId: number | string, attachmentId: number | string): Promise<boolean> => {
        sending.value = true
        return await axios.delete(`tasks/${taskId}/attachments/${attachmentId}`)
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

    // Вспомогательные методы

    const getTaskStatistics = async (): Promise<any | null> => {
        sending.value = true
        return await axios.get('tasks/statistics')
            .then(res => res.data)
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    const duplicateTask = async (id: number | string): Promise<Task | null> => {
        sending.value = true
        return await axios.post(`tasks/${id}/duplicate`)
            .then(res => {
                useSuccessHandler().showSuccess(res)
                return Task.fromJSON(res.data.task || res.data)
            })
            .catch(e => {
                useErrorHandler().showError(e)
                return null
            })
            .finally(() => sending.value = false)
    }

    return {
        sending,

        // Основные CRUD операции
        getTasks,
        getTaskById,
        createTask,
        updateTask,
        deleteTask,

        // Управление статусом
        startTask,
        completeTask,
        reopenTask,

        // Работа со временем
        addTimeToTask,

        // Работа с комментариями
        addComment,
        updateComment,
        deleteComment,

        // Работа с метками
        assignLabels,

        // Работа с подзадачами
        getSubtasks,
        createSubtask,

        // Работа с вложениями
        uploadAttachment,
        deleteAttachment,

        // Дополнительные методы
        getTaskStatistics,
        duplicateTask
    }
}