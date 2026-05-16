export class UserRole {
    public id: number | null;
    public name: string | null;
    public slug: string | null;
    public description: string | null;

    constructor(data: Partial<UserRole> = {}) {
        this.id = data.id ?? null;
        this.name = data.name ?? null;
        this.slug = data.slug ?? null;
        this.description = data.description ?? null;
    }

    /**
     * Создает экземпляр UserRole из JSON-данных
     * @param json - Входные данные в формате JSON
     * @returns Новый экземпляр UserRole
     */
    public static fromJSON(json: any): UserRole {
        return new UserRole({
            id: json.id ?? null,
            name: json.name ?? null,
            slug: json.slug ?? null,
            description: json.description ?? null
        });
    }

    /**
     * Преобразует экземпляр UserRole в JSON-объект
     * @returns Объект с данными роли
     */
    public toJSON(): any {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug,
            description: this.description
        };
    }

    /**
     * Проверяет, является ли роль администратором
     */
    get isAdmin(): boolean {
        return this.slug === 'admin' || this.id === 1;
    }

    /**
     * Проверяет, есть ли основные данные роли
     */
    get hasRoleData(): boolean {
        return !!this.name || !!this.slug;
    }
}