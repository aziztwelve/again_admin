import {User} from "@/models/user/User";
import TaskStatus from "@/models/TaskStatus";
import TaskPriority from "@/models/TaskPriority";
import TaskLabel from "@/models/TaskLabel";

export interface TaskComment {
    id: number;
    task_id: number;
    user_id: number;
    user?: User;
    content: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface TaskHistory {
    id: number;
    task_id: number;
    user_id: number;
    user?: User;
    field: string;
    old_value?: string | null;
    new_value?: string | null;
    created_at: string;
    updated_at: string;
}

export interface TaskAttachment {
    id: number;
    task_id: number;
    user_id: number;
    user?: User;
    filename: string;
    path: string;
    mime_type: string;
    size: number;
    created_at: string;
    updated_at: string;
}

export default class Task {
    id: number | undefined;
    title: string | null | undefined;
    description: string | null | undefined;
    status_id: number | null | undefined;
    priority_id: number | null | undefined;
    creator_id: number | null | undefined;
    assignee_id: number | null | undefined;
    parent_id: number | null | undefined;
    order_id: number | null | undefined;
    due_date: string | null | undefined;
    started_at: string | null | undefined;
    completed_at: string | null | undefined;
    estimated_time: number | null | undefined; // в минутах
    spent_time: number | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;
    deleted_at: string | null | undefined;

    // Связанные модели
    status: TaskStatus | undefined;
    priority: TaskPriority | undefined;
    creator: User | undefined;
    assignee: User | undefined;
    parent: Task | undefined;
    subtasks: Task[] | undefined;
    labels: TaskLabel[] | undefined;
    label_ids: number[] | undefined;
    comments: TaskComment[] | undefined;
    history: TaskHistory[] | undefined;
    attachments: TaskAttachment[] | undefined;

    constructor() {
        this.id = undefined;
        this.title = null;
        this.description = null;
        this.status_id = null;
        this.priority_id = null;
        this.creator_id = null;
        this.assignee_id = null;
        this.parent_id = null;
        this.order_id = null;
        this.due_date = null;
        this.started_at = null;
        this.completed_at = null;
        this.estimated_time = null;
        this.spent_time = undefined;
        this.created_at = undefined;
        this.updated_at = undefined;
        this.deleted_at = null;

        // Связанные модели
        this.status = undefined;
        this.priority = undefined;
        this.creator = undefined;
        this.assignee = undefined;
        this.parent = undefined;
        this.subtasks = undefined;
        this.labels = undefined;
        this.label_ids = undefined;
        this.comments = undefined;
        this.history = undefined;
        this.attachments = undefined;
    }

    static fromJSON(json: any): Task {
        const task = new Task();

        task.id = json.id;
        task.title = json.title ?? null;
        task.description = json.description ?? null;
        task.status_id = json.status_id ?? null;
        task.priority_id = json.priority_id ?? null;
        task.creator_id = json.creator_id ?? null;
        task.assignee_id = json.assignee_id ?? null;
        task.parent_id = json.parent_id ?? null;
        task.order_id = json.order_id ?? null;
        task.due_date = json.due_date ?? null;
        task.started_at = json.started_at ?? null;
        task.completed_at = json.completed_at ?? null;
        task.estimated_time = json.estimated_time ?? null;
        task.spent_time = json.spent_time ?? 0;
        task.created_at = json.created_at;
        task.updated_at = json.updated_at;
        task.deleted_at = json.deleted_at ?? null;

        // Связанные модели
        task.status = json.status;
        task.priority = json.priority;
        task.creator = json.creator ? User.fromJSON(json.creator) : undefined;
        task.assignee = json.assignee ? User.fromJSON(json.assignee) : undefined;
        task.parent = json.parent ? Task.fromJSON(json.parent) : undefined;
        task.subtasks = json.subtasks ? json.subtasks.map((subtask: any) => Task.fromJSON(subtask)) : undefined;
        task.labels = json.labels ? json.labels.map((i: any) => TaskLabel.fromJSON(i)) : undefined;
        task.label_ids = json.labels ? json.labels.map((i: any) => i.id) : undefined;
        task.comments = json.comments ?? undefined;
        task.history = json.history ?? undefined;
        task.attachments = json.attachments ?? undefined;

        return task;
    }

    // Для создания новой задачи
    toJSONForCreate() {
        return {
            title: this.title ?? null,
            description: this.description ?? null,
            status_id: this.status_id ?? null,
            priority_id: this.priority_id ?? null,
            assignee_id: this.assignee_id ?? null,
            // parent_id: this.parent_id ?? null,
            order_id: this.order_id ?? null,
            due_date: this.due_date ?? null,
            estimated_time: this.estimated_time ?? null,
            labels: this.label_ids ?? null,
            started_at: this.started_at ?? null,
        };
    }

    // Для обновления задачи
    toJSONForUpdate() {
        return {
            title: this.title,
            description: this.description,
            status_id: this.status_id,
            priority_id: this.priority_id,
            assignee_id: this.assignee_id,
            due_date: this.due_date,
            estimated_time: this.estimated_time,
            labels: this.label_ids ?? null,
            started_at: this.started_at,
            spent_time: this.spent_time,
            completed_at: this.completed_at,
        };
    }


    // Запуск задачи
    start(): void {
        if (!this.started_at) {
            this.started_at = new Date().toISOString();
        }
    }

    // Завершение задачи
    complete(): void {
        if (!this.completed_at) {
            this.completed_at = new Date().toISOString();
        }
    }


    public toFormObject() {
        // helper: получить id из объекта или вернуть примитив/NULL
        const getId = (val: any): number | null => {
            if (val == null) return null;
            if (typeof val === 'object') return (val.id ?? null);
            return val;
        };


        // labels -> массив id или null
        let labelsIds: number[] | null = null;
        if (Array.isArray(this.labels)) {
            const mapped = this.labels
                .map((l: any) => (typeof l === 'object' ? (l.id ?? null) : l))
                .filter((id: any) => id !== null && id !== undefined)
                .map((id: any) => Number(id));
            labelsIds = mapped.length ? mapped : null;
        }

        return {
            // базовые поля (форма ожидает простые значения)
            title: this.title ?? '',
            description: this.description ?? '',

            // selects как id
            status_id: getId(this.status ?? this.status_id),
            priority_id: getId(this.priority ?? this.priority_id),
            assignee_id: getId(this.assignee ?? this.assignee_id),
            parent_id: getId(this.parent ?? this.parent_id),
            creator_id: getId(this.creator ?? this.creator_id),

            // даты для datetime-local
            started_at: this.started_at ?? undefined,
            due_date: this.due_date ?? undefined,
            completed_at: this.completed_at ?? undefined,

            // числовые поля
            estimated_time: this.estimated_time ?? null,
            spent_time: this.spent_time ?? 0,

            // labels как массив id
            labels: labelsIds,
        };
    }

}