export default class TaskStatus {
    id: number | undefined;
    name: string | null | undefined;
    color: string | undefined;
    order: number | undefined;
    is_default: boolean | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;

    constructor() {
        this.id = undefined;
        this.name = null;
        this.color = '';
        this.order = 0;
        this.is_default = false;
        this.created_at = undefined;
        this.updated_at = undefined;
    }

    static fromJSON(json: any): TaskStatus {
        const status = new TaskStatus();

        status.id = json.id;
        status.name = json.name ?? null;
        status.color = json.color ?? '';
        status.order = json.order ?? 0;
        status.is_default = json.is_default ?? false;
        status.created_at = json.created_at;
        status.updated_at = json.updated_at;

        return status;
    }

    // Для создания нового статуса
    toJSONForCreate() {
        return {
            name: this.name ?? null,
            color: this.color ?? null,
            order: this.order ?? null,
            is_default: this.is_default ? 1 : 0,
        };
    }

    // Для обновления статуса
    toJSONForUpdate() {
        return {
            name: this.name,
            color: this.color,
            order: this.order,
            is_default: this.is_default,
        };
    }

    // Вспомогательные методы

    // Проверка, является ли статус статусом по умолчанию
    get isDefault(): boolean {
        return !!this.is_default;
    }

    // Получение CSS класса для цвета
    get colorClass(): string {
        return `bg-[${this.color}]`;
    }

    // Получение стиля для цвета
    get colorStyle(): string {
        return `background-color: ${this.color}`;
    }


    // Клонирование статуса
    clone(): TaskStatus {
        const cloned = new TaskStatus();
        Object.assign(cloned, this);
        cloned.id = undefined;
        cloned.created_at = undefined;
        cloned.updated_at = undefined;
        cloned.name = `${this.name} (копия)`;
        cloned.is_default = false;
        return cloned;
    }

    // Валидация статуса
    validate(): string[] {
        const errors: string[] = [];

        if (!this.name || this.name.trim() === '') {
            errors.push('Название статуса обязательно');
        }

        if (this.name && this.name.length > 255) {
            errors.push('Название статуса не должно превышать 255 символов');
        }

        if (!this.color || !/^#[0-9A-F]{6}$/i.test(this.color)) {
            errors.push('Цвет должен быть в формате HEX (#000000)');
        }

        if (this.order !== undefined && this.order < 0) {
            errors.push('Порядок не может быть отрицательным');
        }

        return errors;
    }

    // Проверка валидности
    get isValid(): boolean {
        return this.validate().length === 0;
    }
}