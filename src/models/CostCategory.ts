export class CostCategory {
    /** Уникальный идентификатор категории */
    id: number;
    /** Текстовое название категории */
    name: string;
    /** Код типа категории */
    type: string;
    /** Читаемое название типа */
    typeName: string;
    /** Описание категории */
    description: string | null;
    /** Флаг активности категории */
    isActive: boolean;

    constructor(init: {
        id: number;
        name: string;
        type: string;
        typeName?: string;
        description?: string | null;
        isActive?: boolean;
    }) {
        this.id = init.id;
        this.name = init.name;
        this.type = init.type;
        this.typeName = init.typeName ?? init.type;
        this.description = init.description ?? null;
        this.isActive = init.isActive ?? false;
    }

    /**
     * Создает экземпляр CostCategory из JSON-объекта, возвращаемого API
     */
    static fromJSON(json: any): CostCategory {
        return new CostCategory({
            id: json.id,
            name: json.name,
            type: json.type,
            // если type_name нет, используем type
            typeName: json.type_name ?? json.type,
            description: json.description ?? null,
            isActive: json.is_active ?? false,
        });
    }

    /**
     * Преобразует объект в JSON-формат для отправки на сервер
     */
    toJSON(): any {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            type_name: this.typeName,
            description: this.description,
            is_active: this.isActive,
        };
    }
}
