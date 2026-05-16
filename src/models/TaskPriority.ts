// models/TaskPriority.ts
export default class TaskPriority {
    id: number | undefined;
    name: string | null | undefined;
    color: string | undefined;
    level: number | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;

    constructor() {
        this.id = undefined;
        this.name = null;
        this.color = '';
        this.level = 0;
        this.created_at = undefined;
        this.updated_at = undefined;
    }

    static fromJSON(json: any): TaskPriority {
        const p = new TaskPriority();
        p.id = json.id;
        p.name = json.name ?? null;
        p.color = json.color ?? '';
        p.level = json.level ?? 0;
        p.created_at = json.created_at;
        p.updated_at = json.updated_at;
        return p;
    }

    toJSONForCreate() {
        return {
            name: this.name,
            color: this.color,
            level: this.level,
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
        if (this.level !== undefined && (!Number.isInteger(this.level) || this.level < 0)) {
            errors.push('Level должен быть неотрицательным целым числом');
        }
        return errors;
    }

    get isValid(): boolean {
        return this.validate().length === 0;
    }
}
