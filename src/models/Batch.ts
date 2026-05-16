export class Batch {
    base_batch_number: string | null;
    completed_datetime: string | null;
    notes: string | null;
    performers: Array<{
        id: number;
        email: string;
        first_name: string;
        last_name: string;
    }> | null;
    planned_end_datetime: string | null;
    planned_quantity: number | null;
    planned_start_datetime: string | null;
    started_datetime: string | null;
    status: string | null;

    constructor() {
        // Инициализация всех свойств null
        this.base_batch_number = null;
        this.completed_datetime = null;
        this.notes = null;
        this.performers = null;
        this.planned_end_datetime = null;
        this.planned_quantity = null;
        this.planned_start_datetime = null;
        this.started_datetime = null;
        this.status = null;
    }

    /**
     * Создает экземпляр Batch из JSON-данных
     */
    static fromJSON(json: any): Batch {
        const batch = new Batch();

        if (!json) return batch;

        batch.base_batch_number = json.base_batch_number || null;
        batch.completed_datetime = json.completed_datetime || null;
        batch.notes = json.notes || null;

        // Обработка исполнителей
        if (Array.isArray(json.performers)) {
            batch.performers = json.performers.map((performer: any) => ({
                id: performer.id || 0,
                email: performer.email || '',
                first_name: performer.first_name || '',
                last_name: performer.last_name || ''
            }));
        } else {
            batch.performers = null;
        }

        batch.planned_end_datetime = json.planned_end_datetime || null;
        batch.planned_quantity = json.planned_quantity || null;
        batch.planned_start_datetime = json.planned_start_datetime || null;
        batch.started_datetime = json.started_datetime || null;
        batch.status = json.status || null;

        return batch;
    }

    /**
     * Конвертирует объект в JSON-подобную структуру
     */
    toJSON(): any {
        return {
            base_batch_number: this.base_batch_number,
            completed_datetime: this.completed_datetime,
            notes: this.notes,
            performers: this.performers,
            planned_end_datetime: this.planned_end_datetime,
            planned_quantity: this.planned_quantity,
            planned_start_datetime: this.planned_start_datetime,
            started_datetime: this.started_datetime,
            status: this.status
        };
    }

    /**
     * Получает полное имя исполнителей
     */
    getPerformersNames(): string {
        if (!this.performers || this.performers.length === 0) return 'Нет исполнителей';
        return this.performers.map(p => `${p.first_name} ${p.last_name}`).join(', ');
    }

    /**
     * Проверяет, является ли статус "В процессе"
     */
    isInProgress(): boolean {
        return this.status === 'in_progress';
    }

    /**
     * Проверяет, является ли статус "Завершено"
     */
    isCompleted(): boolean {
        return this.status === 'completed';
    }
}