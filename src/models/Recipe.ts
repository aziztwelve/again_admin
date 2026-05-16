export class Recipe {
    id: number;
    name: string;
    description: string;
    outputQuantity: number;
    outputUnitId: number;
    isActive: boolean;
    instructions: string;
    productionTime: number;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;

    constructor(data: Partial<Recipe> = {}) {
        this.id = data.id || 0;
        this.name = data.name || '';
        this.description = data.description || '';
        this.outputQuantity = data.outputQuantity || 0;
        this.outputUnitId = data.outputUnitId || 0;
        this.isActive = data.isActive ?? true;
        this.instructions = data.instructions || '';
        this.productionTime = data.productionTime || 0;
        this.createdBy = data.createdBy || 0;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        this.deletedAt = data.deletedAt ? new Date(data.deletedAt) : null;
    }

    toJSON(): Record<string, any> {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            output_quantity: this.outputQuantity,
            output_unit_id: this.outputUnitId,
            is_active: this.isActive,
            instructions: this.instructions,
            production_time: this.productionTime,
            created_by: this.createdBy,
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString(),
            deleted_at: this.deletedAt?.toISOString() || null
        };
    }

    static fromAPI(data: Record<string, any>): Recipe {
        return new Recipe({
            id: data.id,
            name: data.name,
            description: data.description,
            outputQuantity: data.output_quantity,
            outputUnitId: data.output_unit_id,
            isActive: data.is_active,
            instructions: data.instructions,
            productionTime: data.production_time,
            createdBy: data.created_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            deletedAt: data.deleted_at
        });
    }
}