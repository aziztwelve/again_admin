// models/TaskLabel.ts
export default class TaskLabel {
    id: number | undefined;
    name: string | null | undefined;
    color: string | undefined;
    tasks_count: string | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;

    constructor() {
        this.id = undefined;
        this.name = null;
        this.color = '';
        this.tasks_count = undefined;
        this.created_at = undefined;
        this.updated_at = undefined;
    }

    static fromJSON(json: any): TaskLabel {
        const l = new TaskLabel();
        l.id = json.id;
        l.name = json.name ?? null;
        l.color = json.color ?? '';
        l.tasks_count = json.tasks_count ?? 0;
        l.created_at = json.created_at;
        l.updated_at = json.updated_at;
        return l;
    }

    toJSONForCreate() {
        return {
            name: this.name,
            color: this.color,
        };
    }

    toJSONForUpdate() {
        return this.toJSONForCreate();
    }


    validate(): string[] {
        const errors: string[] = [];
        if (!this.name || this.name.trim() === '') {
            errors.push('Название обязательно');
        }
        if (this.name && this.name.length > 255) {
            errors.push('Название не должно превышать 255 символов');
        }
        if (!this.color || !/^#[0-9A-F]{6}$/i.test(this.color)) {
            errors.push('Цвет должен быть в формате HEX (#000000)');
        }
        return errors;
    }

    get isValid(): boolean {
        return this.validate().length === 0;
    }
}
