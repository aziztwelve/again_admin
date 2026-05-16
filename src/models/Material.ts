
/** Интерфейс для JSON-объекта materials, возвращаемого API */
export interface MaterialJSON {
  id: number;
  title: string;
  unit_id: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export class Material {
  id: number;
  title: string;
  /** Идентификатор единицы измерения */
  unitId: number;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(init: {
    id: number;
    title: string;
    unitId: number;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  }) {
    this.id = init.id;
    this.title = init.title;
    this.unitId = init.unitId;
    this.createdAt = init.createdAt ?? null;
    this.updatedAt = init.updatedAt ?? null;
  }

  /**
   * Создает экземпляр Material из JSON-объекта API
   */
  static fromJSON(json: MaterialJSON): Material {
    return new Material({
      id: json.id,
      title: json.title,
      unitId: json.unit_id,
      createdAt: json.created_at ? new Date(json.created_at) : null,
      updatedAt: json.updated_at ? new Date(json.updated_at) : null,
    });
  }

  /**
   * Преобразует объект в JSON-формат для отправки на сервер
   */
  toJSON(): MaterialJSON {
    return {
      id: this.id,
      title: this.title,
      unit_id: this.unitId,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }

}

