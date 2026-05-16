export class UserPermission {
    public id: number | null;
    public name: string | null;
    public slug: string | null;
    public description: string | null;

    constructor(data: Partial<UserPermission> = {}) {
        this.id = data.id ?? null;
        this.name = data.name ?? null;
        this.slug = data.slug ?? null;
        this.description = data.description ?? null;
    }

    /**
     * Создает экземпляр UserPermission из JSON-данных
     * @param json - Входные данные в формате JSON
     * @returns Новый экземпляр UserPermission
     */
    public static fromJSON(json: any): UserPermission {
        return new UserPermission({
            id: json.id ?? null,
            name: json.name ?? null,
            slug: json.slug ?? null,
            description: json.description ?? null
        });
    }

    /**
     * Преобразует экземпляр UserPermission в JSON-объект
     * @returns Объект с данными разрешения
     */
    public toJSON(): Record<string, any> {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug,
            description: this.description
        };
    }

    /**
     * Проверяет, является ли разрешение валидным (имеет хотя бы name или slug)
     */
    public isValid(): boolean {
        return this.name !== null || this.slug !== null;
    }

    /**
     * Проверяет, соответствует ли разрешение заданному slug или name
     * @param permission - Имя или slug разрешения для проверки
     */
    public matches(permission: string): boolean {
        return this.slug === permission || this.name === permission;
    }

    /**
     * Создает копию объекта UserPermission
     */
    public clone(): UserPermission {
        return new UserPermission({
            id: this.id,
            name: this.name,
            slug: this.slug,
            description: this.description
        });
    }
}